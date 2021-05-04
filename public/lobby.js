// var lobby_init_data = {
//   "ruleset": {
//     "round_time": 30,
//     "team_size": 2,
//     "timeline": [
//       "Waiting for lobby start",
//       "T2S1 ship-ban", 
//       "T1S1 ship-ban", 
//       "T1S1 ship-gun-pick", 
//       "T2S1 ship-gun-pick",
//       "T2S2 gun-ban",
//       "T1S2 gun-ban",
//       "T1S2 ship-gun-pick", 
//       "T2S2 ship-gun-pick"]
//   },
//   "names": ["name1", "name2", "name3", "name4"]
// }

// var lobby_state = {
//   "timer": 25,
//   "phase": 6,
//   "ships": [
//     [0, [0, 1, 2, 3]],
//     [1, [4, 3, 2, 1, 0]],
//     [1, [0, 1, 2, 3, 4]],
//     [0, [3, 2, 1, 0]],
//   ],
//   "ship_bans": [0, 1],
//   "gun_bans": [4, 1]
// }

// var user_token = "123";
// var user_role = { "role": "pilot", "ship": 2 };

var lobby_ships = [];
var lobby_phases = [];
// var lobby_initialized

// function parseTimelineArg(timelineStr){
//   const commandFunctions
// }

// function timelineArgToString(){
//   const command_dict = {
//     0: "ship-gun-pick",
//     1: "ship-ban"
//   };

// }

function targetToIdx(target){
  if (target == undefined) return -1;
  // T1S1 -> 0. T2S1 -> 1. T1S2 -> 2
  let i1 = target.charAt(1);
  let i2 = target.charAt(3);

  if (!/\d/.test(i1)) return -1;
  if (!/\d/.test(i2)) return -1;

  let i = 2 * (i2-1);
  if (i1 == 2) i += 1;
  return i;
}

function initializeLobby(ruleset) {
  lobby_ships = [];
  lobby_phases = [];


  console.log(`Initializing lobby ${JSON.stringify(ruleset)}`)
  for (let i = 0; i < ruleset.team_size; i++) {

    let red_ship = document.createElement('div', { is: 'lobby-ship-item' });
    let blue_ship = document.createElement('div', { is: 'lobby-ship-item' });
    // red_ship.name = lobby_init_data.names[2 * i];
    // blue_ship.name = lobby_init_data.names[2 * i + 1];
    red_ship.setIsMine(false);
    blue_ship.setIsMine(false);
    red_ship.setStatus('');
    blue_ship.setStatus('');
    lobby_ships.push(red_ship);
    lobby_ships.push(blue_ship);
    document.getElementById("lobbyRedTeam").appendChild(red_ship);
    document.getElementById("lobbyBlueTeam").appendChild(blue_ship);
  }
  if (user_role >= 0) lobby_ships[user_role].setIsMine(true);
  // else lobby_ships[user_role.ship].setIsMine(false);

  document.getElementById('lobbyStatus').innerHTML = '';
  for (let i = 0; i < ruleset.timeline.length; i++) {
    let li = document.createElement('li');
    // li.classList.add('')
    li.textContent = ruleset.timeline[i];
    lobby_phases.push(li)
    document.getElementById('lobbyStatus').append(li);
  }


  // setInterval();
  requestLobbyUpdate();
}

function requestLobbyUpdate(){
  console.log(`Requesting state update ${current_lobby_id}, ${user_token}`);
  httpxPostRequest("/lobby_state", { "lobby_id": current_lobby_id, "user_token": user_token }, (response, status) => {
    if (status == 200){
      console.log(`State update recieved ${response}`);
      response = JSON.parse(response);
      updateLobbyState(response, active_ruleset);
      setTimeout(() => requestLobbyUpdate(active_ruleset), 1000);
    }
    else {
      console.log(`${response}`);
    }
  });
}

function updateLobbyState(lobbyStateData, ruleset) {
  // Set ships
  for (let i = 0; i < lobby_ships.length; i++) {
    // TODO: only update selection if not my ship
    lobby_ships[i].setShip(lobbyStateData.ships[i][0]);
    lobby_ships[i].setGuns(lobbyStateData.ships[i][1]);
    lobby_ships[i].name = lobbyStateData.names[i];
    lobby_ships[i].setStatus('');
    lobby_ships[i].setPicking(false);
  }

  let shipBanIdx = 0;
  let gunBanIdx = 0;

  document.getElementById('shipBans').innerHTML = "";
  document.getElementById('gunBans').innerHTML = "";
  document.getElementById('lobbyBottomSpace').innerHTML = "";

  // Update from timeline
  for (let i=0; i<ruleset.timeline.length; i++){
    let timelineArgs = ruleset.timeline[i].split(" ");
    let shipIdx = targetToIdx(timelineArgs[0]);
    if (shipIdx != -1) command = timelineArgs.slice(1).join(" ");
    else command = timelineArgs.join(" ");

    if (lobbyStateData.phase > i){
      if (command == "ship-gun-pick") {
        lobby_ships[shipIdx].setStatus('locked');
        lobby_ships[shipIdx].setInteractive(false);
      }
      if (command == "ship-ban"){
        let img = document.createElement('img');
        img.src = ships[lobbyStateData.ship_bans[shipBanIdx++]].img;
        img.classList.add(shipIdx % 2 != 0 ? "blue" : "red");
        document.getElementById('shipBans').appendChild(img);
      }
      if (command == "gun-ban"){
        let img = document.createElement('img');
        img.src = light_guns[lobbyStateData.gun_bans[gunBanIdx++]].img;
        img.classList.add(shipIdx % 2 != 0 ? "blue" : "red");
        document.getElementById('gunBans').appendChild(img);
      }
    }
    if (lobbyStateData.phase == i && shipIdx != -1){
      lobby_ships[shipIdx].setPicking(true);
      if (command == "ship-gun-pick") lobby_ships[shipIdx].setStatus('PICKING SHIP AND GUNS');
      if (command == "ship-ban") lobby_ships[shipIdx].setStatus('BANNING SHIP');

      // Someone currently banning gun
      if (command == "gun-ban") {
        lobby_ships[shipIdx].setStatus('BANNING GUN');

        let banElem = document.createElement('div', { is: 'lobby-ban-element' });
        banElem.setBanType('gun');
        banElem.setInteractive(shipIdx == user_role);
        
        // TODO: only update selection if not my ship
        let gunIdx = lobbyStateData.gun_bans[gunBanIdx++];
        banElem.dropdown.selectItem(light_guns[gunIdx].name, light_guns[gunIdx].img, gunIdx);

        document.getElementById('lobbyBottomSpace').append(banElem);
      }
      if (command == "ship-ban"){
        lobby_ships[shipIdx].setStatus('BANNING SHIP');
        let banElem = document.createElement('div', { is: 'lobby-ban-element' });
        banElem.setBanType('ship');
        banElem.setInteractive(shipIdx == user_role);
        
        // TODO: only update selection if not my ship
        let idx = lobbyStateData.ship_bans[shipBanIdx++];
        banElem.dropdown.selectItem(ships[idx].name, ships[idx].img, idx);
        document.getElementById('lobbyBottomSpace').append(banElem);

      }
    }

    // Update displayed timeline
    lobby_phases[i].classList.remove('done');
    lobby_phases[i].classList.remove('active');
    if (lobbyStateData.phase > i) 
      lobby_phases[i].classList.add('done');
    else if (lobbyStateData.phase == i) 
      lobby_phases[i].classList.add('active');
  }

}

function postLoadout(loadoutArray){
  console.log(`Posting loadout ${JSON.stringify(loadoutArray)}`);
  httpxPostRequest("/loadout_change", { "lobby_id": current_lobby_id, "user_token": user_token, "loadout": loadoutArray}, (response, status) => {
    if (status == 200){
      console.log(`Loadout posted ${response}`);
    }
    else {
      console.log(`${response}`);
    }
  });
}
