var express = require('express');
const crypto = require('crypto');
var fs = require('fs');
var http = require('http');
// var https = require('https');

// var bodyParser = require("body-parser");
var requestIp = require('request-ip');
const assert = require('assert');

const logOpts = {
  fileNamePattern:'log-<DATE>.log',
  logDirectory:'logs',
  timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS',
  dateFormat:'YYYY.MM.DD'
}
const log = require('simple-node-logger').createRollingFileLogger(logOpts);
var app = express()


// class Member {
//   constructor(token, ip, name){
//     this.token = token;
//     this.ip = ip;
//     this.name = name;
//     this.role = 'spectator';
//     this.ship = -1;
//   }
// }
// var test_ruleset = {
//   "round_time": 30,
//   "team_size": 2,
//   "timeline": [
//     "Waiting for lobby start",
//     "T1S1 gun-ban"
//   ],
//   "password": "123",
//   "moderated": false
// };


function closeLobby(lobby_id, interval_id){
  clearInterval(interval_id);
  delete lobbies[lobby_id];
}

function cleanLobbies(){
  // remove old unused lobbies.
  // console.log("Cleaning up lobbies.");
}

function verifyLobbyRequest(body){
  assert('lobby_id' in body);
  assert('user_token' in body);
  assert('target_phase' in body);
  assert(body.lobby_id in lobbies);
  assert(body.user_token in lobbies[body.lobby_id].members);
  assert(Number.isInteger(body.target_phase));
}

setInterval(cleanLobbies, 1000);


class Lobby {
    constructor(timeline, round_time, team_size, password, moderated=false){
        this.timeline = timeline;
        this.round_time = round_time;
        this.team_size = team_size;
        this.password = password;

        this.ruleset = {
          "round_time": round_time,
          "team_size": team_size,
          "timeline": timeline,
          "password": password,
          "moderated": moderated
        };

        this.phase = 0;
        this.paused = true;
        this.lastUsed = Date.now();
        this.phaseStartTime = Date.now();
        this.timer = this.round_time;

        do {
          this.lobby_id = crypto.randomBytes(4).toString('hex');
        } while (this.lobby_id in lobbies);

        console.log(`creating lobby ${this.lobby_id}`)

        this.members = {};
        this.pilots = {};
        this.ships = {};

        this.gun_bans = [];
        this.ship_bans = [];

        for (let i=0; i<this.commandCount('gun-ban', this.timeline.length); i++){
          this.gun_bans.push(0);
        }
        for (let i=0; i<this.commandCount('ship-ban', this.timeline.length); i++){
          this.ship_bans.push(0);
        }

        this.intervalId = setInterval(() => this.update(), 1000);
    }

    update(){
      // if (this.phase == 0 && Object.keys(this.pilots).length == this.team_size*2) {
      if (this.phase == 0) {
        this.phase = 1;
        this.phaseStartTime = Date.now();
      }
      if (this.phase >= 1){
        let time = Date.now();
        if (time - this.phaseStartTime > this.round_time*1000){
          this.stepPhase();
        }
        this.timer = this.round_time - (time - this.phaseStartTime)/1000;
      } 
    }

    stepPhase(){
      this.phase += 1;
      this.phaseStartTime = Date.now();
      this.timer = this.round_time;
    }



    addMember(role, name){
      let user_token;
      do {
        user_token = crypto.randomBytes(4).toString('hex');
      } while (user_token in this.members);

      // Roles
      // >= 0 pilot
      // -1 t1 crew
      // -2 t2 crew
      // -3 spectator
      // -4 moderator
      // Check if role is taken.
      if (role >= 0){
        for (const [token, member] of Object.entries(this.members)) {
          if (member.role == role) return false;
        }
      }
      
      this.members[user_token] = {
        "token": user_token,
        "role": role,
        "name": name
      };
      if (role >= 0){
        this.pilots[role] = this.members[user_token];
        this.ships[role] = [1, [1, 1, 1, 1, 1]];
      }

      return user_token;
    }

    // isLocked(role){
    //   let timelineStr = `T${role%2==0 ? "1" : "2"}S${(role - (role%2)) / 2 + 1} ship-gun-pick`;
    //   let lockPhase = this.timeline.indexOf(timelineStr);
    //   return this.phase > lockPhase;
    // }

    timelineCheck(role, command, target_phase){
      // 0 is current phase
      // >0 is future phase
      // <0 is past phase
      let timelineStr = `T${role%2==0 ? "1" : "2"}S${(role - (role%2)) / 2 + 1} ${command}`;
      if (this.timeline[target_phase] != timelineStr) return -1;

      // let targetPhase = this.timeline.indexOf(timelineStr);
      return target_phase - this.phase;
    }

    commandCount(query_command, target_phase){
      // Return the number of times the command occurs in the timeline before phase.
      let endIdx = Math.min(target_phase, this.timeline.length);
      let count = 0;
      for (let i=0; i<endIdx; i++){
        let [target, command] = this.timeline[i].split(' ');
        if (command == query_command) count++;
      }
      return count;
    }

    updateLoadout(loadout, user_token, target_phase){
      let shipIdx = this.members[user_token].role;
      if (shipIdx < 0) return;
      // if (this.isLocked(shipIdx)) return;
      if (this.timelineCheck(shipIdx, 'ship-gun-pick', target_phase) < 0) return;
      this.ships[shipIdx] = [loadout[0], loadout[1]];
    }

    lockLoadout(user_token, target_phase){
      let shipIdx = this.members[user_token].role;
      if (shipIdx < 0) return;
      if (this.timelineCheck(shipIdx, 'ship-gun-pick', target_phase) != 0) return;
      this.stepPhase();
    }

    updateGunBan(user_token, target_phase, gun){
      let shipIdx = this.members[user_token].role;
      if (shipIdx < 0) return;
      if (this.timelineCheck(shipIdx, 'gun-ban', target_phase) != 0) return;
      let banIdx = this.commandCount('gun-ban', target_phase);
      this.gun_bans[banIdx] = gun;
    }

    updateShipBan(user_token, target_phase, ship){
      let shipIdx = this.members[user_token].role;
      if (shipIdx < 0) return;
      if (this.timelineCheck(shipIdx, 'ship-ban', target_phase) != 0) return;
      let banIdx = this.commandCount('ship-ban', target_phase);
      this.ship_bans[banIdx] = ship;
    }

    lockBan(user_token, target_phase){
      let shipIdx = this.members[user_token].role;
      if (shipIdx < 0) return;
      if (this.timelineCheck(shipIdx, 'ship-ban', target_phase) != 0 && 
          this.timelineCheck(shipIdx, 'gun-ban', target_phase) != 0) return;
      this.stepPhase();
    }

    skipGunBan(user_token, target_phase){

    }

    skipShipBan(user_token, target_phase){

    }



    getNameList(){
      let names = [];
      for (let i=0; i<2*this.team_size; i++){
        if (i in this.pilots) names.push(this.pilots[i].name);
        else names.push("NOT JOINED"); 
      }
      return names;
    }

    getShipList(){
      let ships = [];
      for (let i=0; i<2*this.team_size; i++){
        if (i in this.ships) ships.push(this.ships[i]);
        else ships.push([0, [0, 0, 0, 0]]); 
      }
      return ships;
    }

    lobbyState(){
        return {
          "timer": Math.floor(this.timer),
          "phase": this.phase,
          "ships": this.getShipList(),
          "ship_bans": this.ship_bans,
          "gun_bans": this.gun_bans,
          "names": this.getNameList()
        };
    }
}

var lobbies = {};

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static('public'));


app.get('/lobbyb', function(req, res){
  let ip = requestIp.getClientIp(req);
  log.info(ip, " ping.");
  res.status(200).sendFile(__dirname + "/public/lobby.html");
//   res.status(200).send("OK");
});

app.post('/create_lobby', function(req, res){
  try{
    assert('ruleset' in req.body);
    let ruleset = req.body.ruleset;
    assert('round_time' in ruleset);
    assert(Number.isInteger(ruleset.round_time));

    assert('team_size' in ruleset);
    assert(Number.isInteger(ruleset.team_size));

    assert('password' in ruleset);
    assert(typeof ruleset.password == "string");
    assert(ruleset.password.length < 50);

    assert('moderated' in ruleset);
    assert(typeof ruleset.moderated == "boolean");

    assert('timeline' in ruleset);
    assert(Array.isArray(ruleset.timeline));
    assert(ruleset.timeline.length < 100);
    const allowed_commands = ['ship-ban', 'gun-ban', 'ship-gun-pick'];

    for (let i=1; i<ruleset.timeline.length; i++){
      if (ruleset.timeline[i] == "Waiting for pilots to join") continue;
      if (ruleset.timeline[i] == "Waiting for lobby start") continue;
      let [target, command] = ruleset.timeline[i].split(' ');
      assert(target.charAt(0) == 'T');
      assert(target.charAt(2) == 'S');
      assert(/\d/.test(target.charAt(1)));
      assert(/\d/.test(target.charAt(3)));
      assert(allowed_commands.includes(command));
    }
  }
  catch{
    res.status(400).send("Invalid lobby creation parameters.");
    return;
  }
  let lobby = new Lobby(req.body.ruleset.timeline, req.body.ruleset.round_time, req.body.ruleset.team_size, req.body.ruleset.password);
  lobbies[lobby.lobby_id] = lobby;
  console.log("Created lobby " + lobby.lobby_id);
  res.status(200).json({
      "lobby_id": lobby.lobby_id
  });
});

app.post('/join_lobby_1', function(req, res){
  try {
    assert('lobby_id' in req.body);
    assert('password' in req.body);
  }
  catch{
    res.status(400).send("Failed to join lobby.");
    return;
  }
  let lobby_id = req.body.lobby_id;
  if (!(lobby_id in lobbies)){
    res.status(400).send('Lobby with ID does not exist.');
    return;
  }
  let lobby = lobbies[lobby_id];
  console.log(lobby.password);
  console.log(req.body.password);
  if (lobby.password != req.body.password) {
    res.status(400).send('Invalid password.');
    return;
  }

  // TODO: return open roles.
  res.status(200).json({
    "lobby_id": lobby_id,
    "phase": lobbies[lobby_id].phase
  });
});

app.post('/join_lobby_2', function(req, res){
  try {
    assert('lobby_id' in req.body);
    assert('username' in req.body);
    assert('role' in req.body);
    assert(req.body.lobby_id in lobbies);
  }
  catch{
    res.status(400).send("Failed to join lobby: Bad request.");
    return;
  }

  let lobby = lobbies[req.body.lobby_id];
  let token = lobby.addMember(req.body.role, req.body.username);

  if (!token) {
    res.status(400).send("Failed to join lobby: Role already taken.")
  }

  res.status(200).json({
    "token": token,
    "lobby_id": lobby.lobby_id,
    "ruleset": lobby.ruleset,
    "role": req.body.role
  });
});

app.post('/lobby_state', function(req, res){
  try {
    assert('lobby_id' in req.body);
    assert('user_token' in req.body);
    assert(req.body.lobby_id in lobbies);
    assert(req.body.user_token in lobbies[req.body.lobby_id].members);
  }
  catch {
    res.status(400).send("Invalid lobby or credentials.");
    return;
  }
  let lobby = lobbies[req.body.lobby_id];

  res.status(200).json(lobby.lobbyState());
});

// Start HTTP server
var httpServer = http.createServer(app);
httpServer.listen(80);

app.post('/loadout_change', function(req, res){
  try {
    verifyLobbyRequest(req.body);

    assert('loadout' in req.body);
    assert(Array.isArray(req.body.loadout));
    assert(Number.isInteger(req.body.loadout[0]));
    assert(Array.isArray(req.body.loadout[1]));
    for (let i=0; i<req.body.loadout[1].length; i++){
      assert(Number.isInteger(req.body.loadout[1][i]));
    }
  }
  catch {
    res.status(400).send();
    return;
  }

  lobbies[req.body.lobby_id].updateLoadout(req.body.loadout, req.body.user_token, req.body.target_phase);

  res.status(200).send("Loadout updated");
});

app.post('/lock_loadout', function(req, res){
  try{
    verifyLobbyRequest(req.body);
  }
  catch{
    res.status(400).send();
    return;
  }

  lobbies[req.body.lobby_id].lockLoadout(req.body.user_token, req.body.target_phase);

  res.status(200).send("Loadout locked.");
});

app.post('/ban_ship', function(req, res){
  try{
    verifyLobbyRequest(req.body);
    assert('ship' in req.body);
    assert(Number.isInteger(req.body.ship));
  }
  catch{
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].updateShipBan(req.body.user_token, req.body.target_phase, req.body.ship);
  res.status(200).send("Gun ban updated");
});

app.post('/ban_gun', function(req, res){
  try{
    verifyLobbyRequest(req.body);
    assert('gun' in req.body);
    assert(Number.isInteger(req.body.gun));
  }
  catch{
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].updateGunBan(req.body.user_token, req.body.target_phase, req.body.gun);
  res.status(200).send("Gun ban updated");
});

app.post('/lock_ban', function(req, res){
  try{
    verifyLobbyRequest(req.body);
  }
  catch{
    res.status(400).send();
    return;
  }
  // lobbies[req.body.lobby_id].updateGunBan(req.body.user_token, req.body.target_phase, req.body.gun);
  lobbies[req.body.lobby_id].lockBan(req.body.user_token, req.body.target_phase);

});