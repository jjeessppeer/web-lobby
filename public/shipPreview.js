// Matrix math for drawing.
function transformPoint(matrix, x, y) {
    return [matrix.a * x + matrix.c * y + matrix.e, matrix.b * x + matrix.d * y + matrix.f];
}

function getXScale(matrix) {
    return matrix.a;
}

function scaleMatrix(matrix, scale) {
    matrix[0] *= scale;
    matrix[4] *= scale;
    return matrix;
}

function translateMatrix(matrix, x, y) {
    matrix[2] += x * matrix[0];
    matrix[5] += y * matrix[4];
}

function getInvertedMatrix(m) {
    let m2 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    m2[0] = m[4] * m[8] - m[5] * m[7];
    m2[1] = -(m[1] * m[8] - m[2] * m[7]);
    m2[2] = m[1] * m[5] - m[2] * m[4];
    m2[3] = -(m[3] * m[8] - m[5] * m[6]);
    m2[4] = m[0] * m[8] - m[2] * m[6];
    m2[5] = -(m[0] * m[5] - m[2] * m[3]);
    m2[6] = m[3] * m[7] - m[4] * m[6];
    m2[7] = -(m[0] * m[7] - m[1] * m[6]);
    m2[8] = m[0] * m[4] - m[1] * m[3];

    let det = m[0] * m2[0] + m[1] * m2[3] + m[2] * m[6];
    m2 = m2.map(x => x / det);

    return m2;
}

function resetMatrix(matrix) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;

    matrix[3] = 0;
    matrix[4] = 1;
    matrix[5] = 0;

    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
}

function applyMatrix(ctx, matrix) {
    ctx.setTransform(matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5]);
}

function transformPointMatrix(x, y, matrix) {
    return [matrix[0] * x + matrix[1] * y + matrix[2], matrix[3] * x + matrix[4] * y + matrix[5]];
}

function zoomMatrixAround(matrix, x, y, zoom) {
    [x, y] = transformPointMatrix(x, y, getInvertedMatrix(matrix));
    // this.translate(x, y);
    translateMatrix(matrix, x, y);
    // this.scale(factor,factor);
    scaleMatrix(matrix, zoom);
    // this.translate(-x, -y);
    translateMatrix(matrix, -x, -y);


    // [x, y] = transformPoint(x, y, this.getTransform().invertSelf());
    // this.translate(x, y);
    // this.scale(factor,factor);
    // this.translate(-x, -y);
}


CanvasRenderingContext2D.prototype.zoomAround = function (x, y, factor) {
    [x, y] = transformPoint(x, y, this.getTransform().invertSelf());
    this.translate(x, y);
    this.scale(factor, factor);
    this.translate(-x, -y);
}

function loadImages(files, onAllLoaded) {
    var numLoading = files.length;
    const onload = () => --numLoading === 0 && onAllLoaded();
    const images = [];
    for (let i = 0; i < files.length; ++i) {
        const img = new Image;
        images.push(img);
        img.src = files[i];
        img.onload = onload;
    }
    return images;
}


function drawShipPreview(canvas, ship, guns) {
    let ship_name = ships[ship].name;
    let gun_names = [];
    guns.forEach(element => {
        let gun_name = light_guns[element].name;
        gun_names.push(gun_name);
    });
    
    let gun_positions = [];
    // 

    let image_srcs = [`images/gundecks/${ship_name}.png`];
    gun_names.forEach(element => {
        image_srcs.push(`images/guns/${element}.jpg`);
    });

    let images = loadImages(image_srcs, () => {
        redrawCanvas(canvas, images, ships[ship].gun_positions);
    });


    
}

function redrawCanvas(canvas, images, gun_positions){
    let ctx = canvas.getContext("2d");
    var transform = [
        1, 0, 0, 
        0, 1, 0,
        0, 0, 1];

    // let shipcenter_y;

    let max_y, min_y;
    if (gun_positions.length > 0) max_y = min_y = gun_positions[0][1];
    else {
        min_y = 0
        max_y = images[0].height;
    }
    gun_positions.forEach(point => {
        max_y = Math.max(max_y, point[1]);
        min_y = Math.min(min_y, point[1]);
    });
    let shipcenter_x = images[0].width/2;
    let shipcenter_y = (max_y + min_y) / 2;

    resetMatrix(transform);
    // translateMatrix(transform, canvas.width/2 - images[0].width/2, canvas.height/2 - images[0].height/2);
    translateMatrix(transform, canvas.width/2 - shipcenter_x, canvas.height/2 - shipcenter_y);
    zoomMatrixAround(transform, canvas.width/2, canvas.height/2, 0.6);
    applyMatrix(ctx, transform);
    

    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw ship image 
    ctx.globalAlpha = 1;
    ctx.drawImage(images[0], 0, 0);

    // Draw guns
    for(let i=1; i<images.length; i++){
        let [cx, cy] = gun_positions[i-1];
        let width = 60;

        ctx.drawImage(images[i], cx-width/2, cy-width/2, width, width);

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "24px Arial";
        ctx.textAlign = "center"; 
        ctx.fillText(i, cx+20, cy+8+18);
    }
}