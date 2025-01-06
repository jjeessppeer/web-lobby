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

let l = new Lobby.Lobby(r, "123");
console.log(util.inspect(l, {showHidden: false, depth: null, colors: true}))
