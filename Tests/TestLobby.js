import Ruleset from "./../Server/Lobby/Ruleset.js";
import Timeline from "./../Server/Lobby/Timeline.js"
import Lobby from "./../Server/Lobby/Lobby.js"
import util from 'util';

const rules_json_2 = {
    timeline:
`ship-ban T1S1 T1S2 30
ship-ban T1S2 30
ship-pick T1S1 60
ship-pick T2S1 60`,
    default_round_time: 30,
    team_size: 2,
    password: "",
    allow_duplicate_ships: true,
    moderated: false
}

let r = new Ruleset.LobbyRuleset(rules_json_2);
let t = new Timeline.LobbyTimeline(r);
// console.log(util.inspect(t, {showHidden: false, depth: null, colors: true}))

let lobby = new Lobby.Lobby(r, "123");
console.log(util.inspect(lobby, {showHidden: false, depth: null, colors: true}));


lobby.update();

console.log("Adding pilots...");
let t1 = lobby.addMember(0, "pilot 0")
lobby.addMember(3, "pilot 3")
lobby.addMember(2, "pilot 2")
lobby.addMember(1, "pilot 1")


setInterval(() => {
    lobby.update();
    // console.log(l.state);
    // console.log(lobby.timer);
    // console.log(lobby.timeline.getPhase());
    console.log(util.inspect(lobby.getLobbyData(t1), {showHidden: false, depth: null, colors: true}))
}, 1000);
