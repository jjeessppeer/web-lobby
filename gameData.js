var ships = {
  '0': {
    name: "Unknown",
    img: "images/ships/Unknown.jpg",
    guns: []
  },
  '1': {
    name: "Goldfish",
    img: "images/ships/Goldfish.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"]
  },
  '2': {
    name: "Junker",
    img: "images/ships/Junker.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  '3': {
    name: "Squid",
    img: "images/ships/Squid.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT"]
  },
  '4': {
    name: "Galleon",
    img: "images/ships/Galleon.jpg",
    guns: ["HEAVY", "HEAVY", "HEAVY", "HEAVY", "LIGHT", "LIGHT"]
  },
  '5': {
    name: "Spire",
    img: "images/ships/Spire.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"]
  },
  '6': {
    name: "Pyramidion",
    img: "images/ships/Pyramidion.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  '7': {
    name: "Mobula",
    img: "images/ships/Mobula.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  '8': {
    name: 'Magnate',
    img: "images/ships/Magnate.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  '9': {
    name: 'Crusader',
    img: "images/ships/Crusader.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT", "LIGHT"]
  },
  '10': {
    name: 'Judgement',
    img: "images/ships/Judgement.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT"]
  },
  '11': {
    name: 'Corsair',
    img: "images/ships/Corsair.jpg",
    guns: ["HEAVY", "HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT"]
  },
  '12': {
    name: 'Shrike',
    img: "images/ships/Shrike.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT"]
  },
  '13': {
    name: 'Stormbreaker',
    img: "images/ships/Stormbreaker.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"]
  }
};

var light_guns = {
  '0': {
    name: "Artemis",
    img: "images/guns/Artemis.jpg",
    gun_type: "LIGHT"
  },
  '1': {
    name: "Light Flak",
    img: "images/guns/Light Flak.jpg",
    gun_type: "LIGHT"
  },
  '2': {
    name: "Gatling",
    img: "images/guns/Gatling.jpg",
    gun_type: "LIGHT"
  },
  '3': {
    name: "Flamethrower",
    img: "images/guns/Flamethrower.jpg",
    gun_type: "LIGHT"
  },
  '4': {
    name: "Light Carronade",
    img: "images/guns/Light Carronade.jpg",
    gun_type: "LIGHT"
  },
  '5': {
    name: "Harpoon",
    img: "images/guns/Harpoon.jpg",
    gun_type: "LIGHT"
  },
  '6': {
    name: "Flare",
    img: "images/guns/Flare.jpg",
    gun_type: "LIGHT"
  },
  '7': {
    name: "Mercury",
    img: "images/guns/Mercury.jpg",
    gun_type: "LIGHT"
  },
  '8': {
    name: "Mortar",
    img: "images/guns/Mortar.jpg",
    gun_type: "LIGHT"
  },
  '9': {
    name: "Banshee",
    img: "images/guns/Banshee.jpg",
    gun_type: "LIGHT"
  },
  '10': {
    name: "Mine",
    img: "images/guns/Mine.jpg",
    gun_type: "LIGHT"
  },
  '11': {
    name: "Hades",
    img: "images/guns/Hades.jpg",
    gun_type: "LIGHT"
  },
  '12': {
    name: "Tempest [Mk. S]",
    img: "images/guns/Tempest [Mk. S].jpg",
    gun_type: "LIGHT"
  },
  '13': {
    name: "Aten Lens Array [Mk. S]",
    img: "images/guns/Aten Lens Array [Mk. S].jpg",
    gun_type: "LIGHT"
  },
  '14':{  
    name: "Heavy Flak Mk. I",
    img: "images/guns/Heavy Flak Mk. I.jpg",
    gun_type: "HEAVY"
  },
  '15': {
    name: "Hwacha",
    img: "images/guns/Hwacha.jpg",
    gun_type: "HEAVY"
  },
  '16': {
    name: "Heavy Carronade",
    img: "images/guns/Heavy Carronade.jpg",
    gun_type: "HEAVY"
  },
  '17':{  
    name: "Lumberjack",
    img: "images/guns/Lumberjack.jpg",
    gun_type: "HEAVY"
  },
  '18':{  
    name: "Minotaur",
    img: "images/guns/Minotaur.jpg",
    gun_type: "HEAVY"
  },
  '19':{  
    name: "Heavy Flak Mk. II",
    img: "images/guns/Heavy Flak Mk. II.jpg",
    gun_type: "HEAVY"
  },
  '20':{  
    name: "Nemesis",
    img: "images/guns/Nemesis.jpg",
    gun_type: "HEAVY"
  },
  '21':{  
    name: "Detonator [Mk. S]",
    img: "images/guns/Detonator [Mk. S].jpg",
    gun_type: "HEAVY"
  }
};

exports.ships = ships;
exports.guns = light_guns;