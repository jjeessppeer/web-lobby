
var lobby_ships = [];
var lobby_phases = [];

var timer_start = Date.now();
var timer_time = -1;

var current_phase;

var banned_ships = [];
var banned_guns = [];

function updateLocal(){
  let time_passed = Math.round((Date.now() - timer_start)/1000);
  let time_left = Math.max(timer_time - time_passed, 0);
  document.getElementById('lobbyTimer').textContent = `${Math.floor(time_left/60)}:${time_left%60}`;
}

function updateBans(){
  // if (user_role < 0) return;
  // let shipElement = lobby_ships[user_role];

  // let allowedShips = [];
  // for (let i=0; i<ships.length; i++){
  //   if (banned_ships.includes(i)) continue;
  //   allowedShips.push(ships[i]);
  // }
  // shipElement.shipDropdown.setContent(allowedShips);
}

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

  let gunBanElem = document.createElement('div', { is: 'lobby-ban-element' });
  gunBanElem.setBanType('gun');
  gunBanElem.setInteractive(false);
  gunBanElem.id = "gunBanElem";
  gunBanElem.style.display = "none";
  document.getElementById('lobbyBanDiv').append(gunBanElem);

  let shipBanElem = document.createElement('div', { is: 'lobby-ban-element' });
  shipBanElem.setBanType('ship');
  shipBanElem.setInteractive(false);
  shipBanElem.id = "shipBanElem";
  shipBanElem.style.display = "none";
  document.getElementById('lobbyBanDiv').append(shipBanElem);

  document.querySelector('#lobbyIdentifier > span').textContent = current_lobby_id;
  // setInterval();
  setInterval(updateLocal, 200);
  requestLobbyUpdate();
}

function requestLobbyUpdate(){
  // console.log(`Requesting state update ${current_lobby_id}, ${user_token}`);
  httpxPostRequest("/lobby_state", { "lobby_id": current_lobby_id, "user_token": user_token }, (response, status) => {
    if (status == 200){
      // console.log(`State update recieved ${response}`);
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

  current_phase = lobbyStateData.phase;
  banned_ships = [];
  banned_guns = [];

  // Update timer
  document.getElementById('lobbyTimer').textContent = `${Math.floor(lobbyStateData.timer/60)}:${lobbyStateData.timer%60}`;
  timer_time = lobbyStateData.timer;
  timer_start = Date.now();


  let shipBanIdx = 0;
  let gunBanIdx = 0;

  document.getElementById('shipBans').innerHTML = "";
  document.getElementById('gunBans').innerHTML = "";
  // document.getElementById('lobbyBanDiv').innerHTML = "";
  document.getElementById('gunBanElem').style.display = "none";
  document.getElementById('shipBanElem').style.display = "none";


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
        let shipBan = lobbyStateData.ship_bans[shipBanIdx++];
        if (shipBan != -1){
          banned_ships.push(shipBan);
          let img = document.createElement('img');
          img.src = ships[shipBan].img;
          img.classList.add(shipIdx % 2 != 0 ? "blue" : "red");
          document.getElementById('shipBans').appendChild(img);
        }
      }
      if (command == "gun-ban"){
        let gunBan = lobbyStateData.gun_bans[gunBanIdx++];
        if (gunBan != -1){
          banned_guns.push(gunBan);
          let img = document.createElement('img');
          img.src = light_guns[gunBan].img;
          img.classList.add(shipIdx % 2 != 0 ? "blue" : "red");
          document.getElementById('gunBans').appendChild(img);
        }
      }
    }
    if (lobbyStateData.phase == i && shipIdx != -1){
      lobby_ships[shipIdx].setPicking(true);
      if (command == "ship-gun-pick") lobby_ships[shipIdx].setStatus('PICKING SHIP AND GUNS');
      if (command == "ship-ban") lobby_ships[shipIdx].setStatus('BANNING SHIP');

      // Someone currently banning gun
      if (command == "gun-ban") {
        lobby_ships[shipIdx].setStatus('BANNING GUN');
        let gunBanElem = document.getElementById('gunBanElem');
        gunBanElem.style.display = "block";
        gunBanElem.setInteractive(shipIdx == user_role);
        let gunIdx = lobbyStateData.gun_bans[gunBanIdx++];
        gunBanElem.dropdown.selectItem(light_guns[gunIdx].name, light_guns[gunIdx].img, gunIdx);
      }
      else{
        document.getElementById('gunBanElem').style.display = "none";
      }
      if (command == "ship-ban") {
        lobby_ships[shipIdx].setStatus('BANNING SHIP');
        let shipBanElem = document.getElementById('shipBanElem');
        shipBanElem.style.display = "block";
        shipBanElem.setInteractive(shipIdx == user_role);
        let shipItemIdx = lobbyStateData.ship_bans[shipBanIdx++];
        shipBanElem.dropdown.selectItem(ships[shipItemIdx].name, ships[shipItemIdx].img, shipItemIdx);
      }
      else{
        document.getElementById('shipBanElem').style.display = "none";
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
  
  updateBans();

}

function postLoadout(loadoutArray){
  // console.log(`Posting loadout ${JSON.stringify(loadoutArray)}`);
  let timelineStr = `T${user_role%2==0 ? "1" : "2"}S${(user_role - (user_role%2)) / 2 + 1} ship-gun-pick`;
  let target_phase = active_ruleset.timeline.indexOf(timelineStr);
  httpxPostRequest("/loadout_change", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": target_phase, "loadout": loadoutArray}, (response, status) => { });
}

function lockLoadout(){
  // let timelineStr = `T${user_role%2==0 ? "1" : "2"}S${(user_role - (user_role%2)) / 2 + 1} ship-gun-pick`;
  // let target_phase = active_ruleset.timeline.indexOf(timelineStr);
  httpxPostRequest("/lock_loadout", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": current_phase}, (response, status) => {});
}

function postGunBan(gun){
  httpxPostRequest("/ban_gun", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": current_phase, "gun": gun}, (response, status) => {});
}

function postShipBan(ship){
  httpxPostRequest("/ban_ship", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": current_phase, "ship": ship}, (response, status) => {});
}

function postBanLock(){
  httpxPostRequest("/lock_ban", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": current_phase}, (response, status) => {});
}

function postBanSkip(){
  httpxPostRequest("/skip_ban", { "lobby_id": current_lobby_id, "user_token": user_token, "target_phase": current_phase}, (response, status) => {});

}