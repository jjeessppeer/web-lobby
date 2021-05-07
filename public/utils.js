function arraysEqual(arr1, arr2){
  if (arr1.length != arr2.length) return false;
  for (let i=0; i<arr1.length; i++){
    if (arr1[i] != arr2[i]) return false;
  }
  return true;
}


function httpxPostRequest(url, data, callback = null, timeout_callback = null) {
  let xhttp = new XMLHttpRequest();
  xhttp.timeout = 10000;
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // xhttp.onreadystatechange = callback;
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && callback != null && xhttp.status == 200) {
      callback(xhttp.response, xhttp.status);
    }
    else if (xhttp.readyState == 4 && xhttp.status == 400){
      console.log(xhttp);
      console.log(xhttp.response);
      alert(xhttp.response + "\n" + "Refresh page to reset.");
    }
  }
  // xhttp.ontimeout = timeout_callback;
  // xhttp.ontimeout = () => {
  //   if (xhttp.readyState == 4 && callback != null) {
  //     alert(xhttp.status + ": " + xhttp.response);
  //   }
  // };
  xhttp.send(JSON.stringify(data));
}

function httpxGetRequest(url, callback = null, timeout_callback = null) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", url);
  xhttp.timeout = 10000;
  // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.onload = callback;
  xhttp.ontimeout = timeout_callback;
  xhttp.send();
}