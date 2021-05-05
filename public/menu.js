// var test_ruleset = {
//   "round_time": 5,
//   "team_size": 2,
//   "timeline": [
//           "Waiting for pilots to join",
//           "Waiting for lobby start",
//           "T1S1 ship-ban",
//           "pause",
//           // "T1S1 ship-ban",
//           // "T1S1 ship-ban",
//           // "T1S1 ship-ban",
//           "T1S1 ship-ban",
//           "T1S1 ship-gun-pick", 
//           "T1S1 gun-ban",
//           "T1S1 gun-ban",
//           "T1S1 gun-ban",
//           "T1S1 gun-ban",
//           "T1S1 gun-ban",
//           "T2S1 gun-ban",
//           "T2S1 ship-gun-pick",
//           "T1S2 ship-gun-pick", 
//           "T2S2 ship-gun-pick"
//         ],
//   "password": "",
//   "moderated": false
// };

var timeline_presets = {
  "testing": [
    "Waiting for pilots to join",
    // "Waiting for lobby start",
    // "T1S1 ship-ban",
    // "pause",
    // "T1S1 ship-ban",
    // "T1S1 ship-ban",
    // "T1S1 ship-ban",
    "T1S1 ship-ban",
    "T1S1 gun-ban",
    "T1S1 ship-gun-pick", 
    // "T1S1 gun-ban",
    // "T1S1 gun-ban",
    // "T1S1 gun-ban",
    // "T1S1 gun-ban",
    // "T1S1 gun-ban",
    // "T2S1 gun-ban",
    "T2S1 ship-gun-pick",
    "T1S2 ship-gun-pick", 
    "T2S2 ship-gun-pick"
  ],
  "Fyre": [
    "Waiting for pilots to join",
    "Waiting for lobby start",
    "T1S1 ship-ban",
    "T2S1 ship-ban",
    "T1S1 ship-gun-pick",
    "T2S1 ship-gun-pick",
    "T2S1 gun-ban",
    "T1S1 gun-ban",
    "T1S2 ship-gun-pick",
    "T2S2 ship-gun-pick"
  ]
}

var current_lobby_id;
var user_token;
var user_role;
var active_ruleset;

function loadRuleset(){
  let team_size = parseInt(document.getElementById('nShipsInput').value);
  let round_time = parseInt(document.getElementById('roundTimeInput').value);
  let timeline;
  // Parse custom timeline.

  let timeline_selection = document.getElementById('timelineSelection').value;
  if (timeline_selection != 'Custom'){
    timeline = timeline_presets[timeline_selection];
  }
  else {
    let timeline_string = document.getElementById('timelineInput').value;
    console.log(timeline_string);
    timeline = timeline_string.split('\n');
  }
  let password = document.getElementById('lobbyPwdInput').value;
  console.log(JSON.stringify(timeline));
  return {
    "round_time": round_time,
    "team_size": team_size,
    "timeline": timeline,
    "moderated": false,
    "password": password
  }
}

function initializeMenu() {

  document.getElementById('timelineInput').value = timeline_presets[document.getElementById('timelineSelection').value].join('\n');

  document.getElementById('timelineSelection').addEventListener('change', event => {
    if (event.target.value != "Custom"){
      document.getElementById('timelineInput').value = timeline_presets[event.target.value].join('\n');
      document.getElementById('timelineInput').disabled = true;
    }
    else {
      document.getElementById('timelineInput').disabled = false;

    }
  })

  window.onclick = function (event) {
    if (event.target == document.getElementById("lobbyJoinModal")) {
      closeJoinModal();
    }
  }

  // Lobby creation
  document.getElementById("createLobbyBtn").addEventListener('click', event => {
    event.target.disabled = true;
    createLobby(loadRuleset());
    loadRuleset();
  });
  // Lobby join
  document.getElementById("joinLobbyBtn").addEventListener('click', event => {
    event.target.disabled = true;
    let lobby_id = document.getElementById('lobbyIdInput').value;
    let password = document.getElementById('joinLobbyPassword').value;
    joinLobby1(lobby_id, password);
  });

  document.getElementById("join2Btn").addEventListener('click', event => {
    event.target.disabled = true;
    let name = document.getElementById("joinNameInput").value;
    let role = document.getElementById("joinTeamInput").value;
    joinLobby2(name, role);
  });
}

function openJoinModal(lobby_name){
  document.getElementById("lobbyJoinModal").style.display = "block";
  document.getElementById("modalLobbyName").textContent = lobby_name;
}

function closeJoinModal(){
  document.getElementById("lobbyJoinModal").style.display = "none";
}

function joinLobby1(lobby_id, password) {
  console.log(`Attempting to join_1 lobby ${lobby_id} ${password}`);
  httpxPostRequest("/join_lobby_1", { "lobby_id": lobby_id, "password": password }, (response, status) => {
    if (status == 200){
      response = JSON.parse(response);
      console.log(`Join_1 OK ${response.lobby_id}`);
      current_lobby_id = response.lobby_id;
      openJoinModal(response.lobby_id);
    }
    else {
      console.log(`${response}`);
    }
  });
}

function joinLobby2(name, role) {
  console.log(`Attempting to join_2 lobby ${current_lobby_id} ${name} ${role}`);
  httpxPostRequest("/join_lobby_2", { "lobby_id": current_lobby_id, "username": name, "role": role }, (response, status) => {
    if (status == 200){
      response = JSON.parse(response);
      console.log(`Join_2 OK ${JSON.stringify(response)}`);
      user_token = response.token;
      active_ruleset = response.ruleset;
      user_role = response.role;
      closeJoinModal();
      initializeLobby(active_ruleset);
      document.getElementById("lobbyScreen").style.display = "block";
    }
    else {
      console.log(`${response}`);
    }
  });
}


function createLobby(ruleset) {
  console.log("Requesting lobby creation.");
  httpxPostRequest("/create_lobby", { "ruleset": ruleset }, (response, status) => {
    if (status == 200){
      response = JSON.parse(response);
      console.log(`Lobby created ${response.lobby_id}`);
      joinLobby1(response.lobby_id, ruleset.password);
    }
    else {
      console.log(`${response}`);
    }
  });
}