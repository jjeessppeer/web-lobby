var ships = {
  '0': {
    name: "Unknown",
    img: "images/ships/Unknown.jpg",
    guns: [],
    gun_positions: []
  },
  '1': {
    name: "Goldfish",
    img: "images/ships/Goldfish.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[133, 425], [212, 552], [52, 557], [98, 728]]
  },
  '2': {
    name: "Junker",
    img: "images/ships/Junker.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[91, 105], [128, 302], [51, 302], [154, 374], [28, 374]]
  },
  '3': {
    name: "Squid",
    img: "images/ships/Squid.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[105, 148], [198, 312], [106, 424]]
  },
  '4': {
    name: "Galleon",
    img: "images/ships/Galleon.jpg",
    guns: ["HEAVY", "HEAVY", "HEAVY", "HEAVY", "LIGHT", "LIGHT"],
    gun_positions: [[172, 276], [70, 276], [192, 380], [51, 380], [34, 405], [120, 590]]
  },
  '5': {
    name: "Spire",
    img: "images/ships/Spire.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[198, 247], [145, 268], [107, 285], [279, 315]]
  },
  '6': {
    name: "Pyramidion",
    img: "images/ships/Pyramidion.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[173, 275], [54, 275], [45, 426], [62, 521]]
  },
  '7': {
    name: "Mobula",
    img: "images/ships/Mobula.jpg",
    guns: ["LIGHT", "LIGHT", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[415, 100], [135, 100], [275, 105], [472, 184], [79, 184]]
  },
  '8': {
    name: 'Magnate',
    img: "images/ships/Magnate.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[349, 505], [186, 505], [305, 357], [231, 356], [326, 455], [209, 455]]
  },
  '9': {
    name: 'Crusader',
    img: "images/ships/Crusader.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[193, 150], [44, 150], [184, 240], [53, 240], [205, 323], [34, 323]]
  },
  '10': {
    name: 'Judgement',
    img: "images/ships/Judgement.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[158, 267], [158, 529], [228, 215], [90, 215], [158, 466]]
  },
  '11': {
    name: 'Corsair',
    img: "images/ships/Corsair.jpg",
    guns: ["HEAVY", "HEAVY", "HEAVY", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[169, 157], [266, 310], [71, 310], [263, 244], [75, 244], [169, 441]]
  },
  '12': {
    name: 'Shrike',
    img: "images/ships/Shrike.jpg",
    guns: ["HEAVY", "HEAVY", "LIGHT", "LIGHT"],
    gun_positions: [[185, 320], [90, 320], [155, 240], [115, 240]]
  },
  '13': {
    name: 'Stormbreaker',
    img: "images/ships/Stormbreaker.jpg",
    guns: ["HEAVY", "LIGHT", "LIGHT", "LIGHT"],
    gun_positions: [[200, 212], [90, 150], [80, 255], [50, 300]]
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