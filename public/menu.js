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
  "example": [
    "T1S1 ship-ban 20",
    "T1S1 gun-ban 30",
    "T1S1 ship-gun-pick 45", 
    "T1S1 ship-ban 60",
    "pause 15",
    "T1S1 gun-ban",
    "T2S1 ship-gun-pick",
    "T1S2 ship-gun-pick", 
    "T2S2 ship-gun-pick",
    "pause 15",
  ],
  "Mini (2v2)": [
    // "Waiting for pilots to join",
    // "Waiting for lobby start",
    "T1S1 ship-ban 30",
    "T2S1 ship-ban 30",
    "T1S1 ship-gun-pick 60",
    "T2S1 ship-gun-pick 60",
    "T2S1 gun-ban 30",
    "T1S1 gun-ban 30",
    "T1S2 ship-gun-pick 60",
    "T2S2 ship-gun-pick 60"
  ]
}

var current_lobby_id;
var user_token;
var user_role;
var active_ruleset;

function loadRuleset(){
  let team_size = parseInt(document.getElementById('nShipsInput').value);
  let round_time = parseInt(document.getElementById('roundTimeInput').value);
  // Parse custom timeline.

  let timeline_selection = document.getElementById('timelineSelection').value;
  let timeline_string;
  if (timeline_selection != 'Custom'){
    timeline_string = timeline_presets[timeline_selection].join('\n');
  }
  else {
    timeline_string = document.getElementById('timelineInput').value;
  }
  
  let timeline = timeline_string.split('\n');
  let timeline_times = [];
  for (let i=0; i<timeline.length; i++){
    let args = timeline[i].split(' ');
    let lastArg = args[args.length - 1];
    if (/^\d+$/.test(lastArg)) {
      timeline_times.push(parseInt(lastArg));
      args = args.slice(0, args.length-1);
    }
    else timeline_times.push(round_time);
    timeline[i] =  args.join(' ');
  }
  let password = document.getElementById('lobbyPwdInput').value;

  let moderated = document.getElementById('moderatedInput').checked;
  let allow_duplicate_ships = document.getElementById('duplicateShipsCheck').checked;

  return {
    "round_time": round_time,
    "team_size": team_size,
    "timeline": timeline,
    "timeline_times": timeline_times,
    "moderated": moderated,
    "password": password,
    "allow_duplicate_ships": allow_duplicate_ships
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
  });

  // window.onclick = function (event) {
  //   if (event.target == document.getElementById("lobbyJoinModal")) {
  //     closeJoinModal();
  //   }
  // }

  // Lobby creation
  document.getElementById("createLobbyBtn").addEventListener('click', event => {
    event.target.disabled = true;
    createLobby(loadRuleset());
    loadRuleset();
  });
  // Lobby join
  document.getElementById("joinLobbyBtn").addEventListener('click', event => {
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
  
  document.getElementById('joinLobbyBtn').disabled = true;
  httpxPostRequest("/join_lobby_1", { "lobby_id": lobby_id, "password": password }, 
    (response, status) => {
      response = JSON.parse(response);
      console.log(`Join_1 OK ${response.lobby_id}`);
      current_lobby_id = response.lobby_id;
      openJoinModal(response.lobby_id);
    },
    (response) => {
      document.getElementById('joinLobbyBtn').disabled = false;
      // if (response == "Lobby with ID does not exist.")
      alert(response);
    });
}

function joinLobby2(name, role) {
  console.log(`Attempting to join_2 lobby ${current_lobby_id} ${name} ${role}`);

  document.getElementById("join2Btn").disabled = true;
  httpxPostRequest("/join_lobby_2", { "lobby_id": current_lobby_id, "username": name, "role": role }, 
    (response, status) => {
      response = JSON.parse(response);
      console.log(`Join_2 OK ${JSON.stringify(response)}`);
      user_token = response.token;
      active_ruleset = response.ruleset;
      user_role = response.role;
      closeJoinModal();
      initializeLobby(active_ruleset);
      document.getElementById("lobbyScreen").style.display = "block";
      document.getElementById("startScreen").style.display = "none";
    },
    (response) => {
      document.getElementById("join2Btn").disabled = false;
      alert(response);
    });
}


function createLobby(ruleset) {
  console.log("Requesting lobby creation.");
  httpxPostRequest("/create_lobby", { "ruleset": ruleset }, (response, status) => {
    response = JSON.parse(response);
    console.log(`Lobby created ${response.lobby_id}`);
    joinLobby1(response.lobby_id, ruleset.password);
  });
}