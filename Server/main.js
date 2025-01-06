var express = require('express');
const crypto = require('crypto');
var fs = require('fs');
var http = require('http');
const gameData = require('./gameData.js');
// var https = require('https');

// var bodyParser = require("body-parser");
var requestIp = require('request-ip');
const assert = require('assert');

var app = express()

const LOBBY_LIFETIME = 1800; // Seconds until lobby is deleted.
const MAX_LOBBIES = 100; // Maximum amount of simultaneus lobbies.
const MAX_MEMBERS = 50; // Maximum amount of members per lobby.
const TIMER_GRACE_TIME = 3; // Seconds of extra time when timer hits 0.


setInterval(cleanLobbies, 5000);

function verifyLobbyRequest(body) {
  try {
    assert('lobby_id' in body);
    assert('user_token' in body);
    assert('target_phase' in body);
    assert(body.lobby_id in lobbies);
    assert(body.user_token in lobbies[body.lobby_id].members);
    assert(Number.isInteger(body.target_phase));
  }
  catch (error){
    console.log(error);
    throw error;
  }
}


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static('public'));

app.post('/create_lobby', function (req, res) {

  if (Object.keys(lobbies).length >= MAX_LOBBIES){
    res.status(400).send("Too many currently active lobbies. Wait until some are closed.");
    return;
  }
  let lobby = new Lobby(
    req.body.ruleset.timeline,
    req.body.ruleset.timeline_times,
    req.body.ruleset.round_time, 
    req.body.ruleset.team_size, 
    req.body.ruleset.password, 
    req.body.ruleset.moderated,
    req.body.ruleset.allow_duplicate_ships);
  lobbies[lobby.lobby_id] = lobby;
  console.log(`Created lobby ${lobby.lobby_id} ${Object.keys(lobbies).length}/${MAX_LOBBIES}`);
  res.status(200).json({
    "lobby_id": lobby.lobby_id
  });
});

app.post('/join_lobby_1', function (req, res) {
  try {
    assert('lobby_id' in req.body);
    assert('password' in req.body);
  }
  catch {
    res.status(400).send("Failed to join lobby.");
    return;
  }
  let lobby_id = req.body.lobby_id;
  if (!(lobby_id in lobbies)) {
    res.status(400).send('Lobby with ID does not exist.');
    return;
  }
  let lobby = lobbies[lobby_id];
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

app.post('/join_lobby_2', function (req, res) {
  try {
    assert('lobby_id' in req.body);
    assert('username' in req.body);
    assert('role' in req.body);
    assert(req.body.lobby_id in lobbies);
  }
  catch {
    res.status(400).send("Failed to join lobby: Bad request.");
    return;
  }

  let lobby = lobbies[req.body.lobby_id];
  let token = lobby.addMember(req.body.role, req.body.username);

  if (!token) {
    res.status(400).send("Failed to join lobby: Requested role unavailable.");
    return;
  }

  res.status(200).json({
    "token": token,
    "lobby_id": lobby.lobby_id,
    "ruleset": lobby.ruleset,
    "role": req.body.role
  });
});

app.post('/lobby_state', function (req, res) {
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

  res.status(200).json(lobby.lobbyState(req.body.user_token));
});

// Start HTTP server
var httpServer = http.createServer(app);
httpServer.listen(80);

app.post('/loadout_change', function (req, res) {
  try {
    verifyLobbyRequest(req.body);

    assert('loadout' in req.body);
    assert(Array.isArray(req.body.loadout));
    assert(Number.isInteger(req.body.loadout[0]));
    assert(Array.isArray(req.body.loadout[1]));
    for (let i = 0; i < req.body.loadout[1].length; i++) {
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

app.post('/lock_loadout', function (req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }

  lobbies[req.body.lobby_id].lockLoadout(req.body.user_token, req.body.target_phase);

  res.status(200).send("Loadout locked.");
});

app.post('/ban_ship', function (req, res) {
  try {
    verifyLobbyRequest(req.body);
    assert('ship' in req.body);
    assert(Number.isInteger(req.body.ship));
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].updateShipBan(req.body.user_token, req.body.target_phase, req.body.ship);
  res.status(200).send("Gun ban updated");
});

app.post('/ban_gun', function (req, res) {
  try {
    verifyLobbyRequest(req.body);
    assert('gun' in req.body);
    assert(Number.isInteger(req.body.gun));
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].updateGunBan(req.body.user_token, req.body.target_phase, req.body.gun);
  res.status(200).send("Gun ban updated");
});

app.post('/lock_ban', function (req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }
  // lobbies[req.body.lobby_id].updateGunBan(req.body.user_token, req.body.target_phase, req.body.gun);
  lobbies[req.body.lobby_id].lockBan(req.body.user_token, req.body.target_phase);
});

app.post('/skip_ban', function (req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].skipBan(req.body.user_token, req.body.target_phase);
});

app.post('/moderator_pause', function(req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].pauseTimer(req.body.user_token, req.body.target_phase);
  res.status(200).send();
});

app.post('/moderator_unpause', function(req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].unpauseTimer(req.body.user_token, req.body.target_phase);
  res.status(200).send();
});

app.post('/moderator_skip', function(req, res) {
  try {
    verifyLobbyRequest(req.body);
  }
  catch {
    res.status(400).send();
    return;
  }
  lobbies[req.body.lobby_id].skipPhase(req.body.user_token, req.body.target_phase);
  res.status(200).send();
});