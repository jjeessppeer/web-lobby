var ships = {
  0: {
    name: "Unknown",
    img: "images/ships/Unknown.jpg",
    guns: []
  },
  1: {
    name: "Pyramidion",
    img: "images/ships/Pyramidion.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  2: {
    name: "Junker",
    img: "images/ships/Junker.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  }
};

var light_guns = {
  0: {
    name: "Artemis",
    img: "images/guns/Artemis.jpg",
    type: "LIGHT"
  },
  1: {
    name: "Gatling",
    img: "images/guns/Gatling.jpg",
    type: "LIGHT"
  },
  2: {
    name: "Banshee",
    img: "images/guns/Banshee.jpg",
    type: "LIGHT"
  },
  3: {
    name: "Flamethrower",
    img: "images/guns/Flamethrower.jpg",
    type: "LIGHT"
  },
  4: {
    name: "Flare",
    img: "images/guns/Flare.jpg",
    type: "LIGHT"
  },
  5: {
    name: "Hades",
    img: "images/guns/Hades.jpg",
    type: "LIGHT"
  },
  6: {
    name: "Harpoon",
    img: "images/guns/Artemis.jpg",
    type: "LIGHT"
  },
  7: {
    name: "Light Carronade",
    img: "images/guns/Light Carronade.jpg",
    type: "LIGHT"
  }

};

exports.ships = ships;
exports.guns = light_guns;