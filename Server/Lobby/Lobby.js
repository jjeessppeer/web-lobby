import Timeline from "./Timeline.js"
import TimelinePhases from "./TimelinePhases.js";
import LobbyState from "./LobbyState.js";
import crypto from "crypto";

const TIMER_GRACE_TIME = 2000;
const MAX_MEMBERS = 20;

class Lobby {
    constructor(ruleset, lobby_id) {
        this.lobby_id = lobby_id;
        this.ruleset = ruleset;
        this.timeline = new Timeline.LobbyTimeline(ruleset);

        // Initialize lobby timing
        this.creation_time = Date.now();
        this.last_update_time = Date.now();
        this.paused = true;
        this.timer = this.timeline.getPhaseTimer();

        // Initialize lobby users.
        this.members = {};
        this.pilots = {};
        this.moderator_token = undefined;

        // Initialize lobby state.
        this.state = new LobbyState.LobbyState(this.timeline);
        console.log(JSON.stringify(this.state));

    }

    update() {
        let time = Date.now();
        let delta = (time - this.lastUpdateTime) / 1000.0;
        this.lastUpdateTime = time;

        const lobby_phase = this.timeline.getPhase();
        const phase_idx = this.timeline.active_phase;

        // Make ships conform to restrictions.
        this.state.legalizeShipPicks();

        // If lobby is not paused decrement timer
        if (!this.paused) {
            this.timer -= delta;
        }

        // Go to next phase if timer ran out or all states are locked.
        if ((!this.paused && this.timer != undefined && this.timer <= -TIMER_GRACE_TIME) ||
            this.state.getAllStatesLocked(phase_idx)) {
            this.startNextPhase();
        }
    }

    startNextPhase() {
        // Go to the next phase in the lobby timeline.
        this.state.lockPhase(this.timeline.active_phase);
        this.timeline.stepPhase();
        let lobby_phase = this.timeline.getPhase();
        this.timer = lobby_phase.time;
   
        if (lobby_phase instanceof TimelinePhases.WaitingForPilots || 
            lobby_phase instanceof TimelinePhases.WaitingForModerator) {
            this.paused = true;
        }
        else {
            this.paused = false;
        }
    }

    addMember(role, name) {
        if (Object.keys(this.members).length >= MAX_MEMBERS) return false;

        // Generate a unique user token.
        let user_token;
        do {
            user_token = crypto.randomBytes(4).toString('hex');
        } while (user_token in this.members);

        // Roles
        // >= 0 pilot
        // -1 t2 crew
        // -2 t1 crew
        // -3 spectator
        // -4 moderator

        // Check if pilot slot is available.
        if (role >= 0) {
            for (const [token, member] of Object.entries(this.members)) {
                if (member.role == role) return false;
            }
        }

        // Check if moderator slot is available.
        if (role == -4) {
            if (!this.moderated || this.moderator_token != undefined) return false;
            this.moderator_token = user_token;
        }

        this.members[user_token] = {
            "token": user_token,
            "role": role,
            "name": name
        };

        if (role >= 0) {
            this.pilots[role] = this.members[user_token];
        }

        return user_token;
    }

    updateShipPick(loadout, user_token) {
        // Check if user is authorized to make this change.
        if (!(user_token in this.members)) return false;
        const pilot_idx = this.members[user_token].role;
        if (pilot_idx < 0) return false;

        const ship_idx = pilot_idx % this.ruleset.team_size;
        const team_idx = Math.floor(pilot_idx / this.ruleset.team_size);
        this.state.setShipPick(this.timeline.getPhase(), loadout, team_idx, ship_idx);
    }

    updateGunBan(user_token, gun_id, lock = false) {
        if (!(user_token in this.members)) return false;
        const pilot_idx = this.members[user_token].role;
        if (pilot_idx < 0) return false;

        const ship_idx = pilot_idx % this.ruleset.team_size;
        const team_idx = Math.floor(pilot_idx / this.ruleset.team_size);
        this.state.setGunBan(this.timeline.getPhase(), gun_id, team_idx, ship_idx)
    }

    updateShipBan(user_token, ship_id, lock = false) {
        if (!(user_token in this.members)) return false;
        const pilot_idx = this.members[user_token].role;
        if (pilot_idx < 0) return false;

        const ship_idx = pilot_idx % this.ruleset.team_size;
        const team_idx = Math.floor(pilot_idx / this.ruleset.team_size);
        this.state.setShipBan(this.timeline.getPhase(), ship_id, team_idx, ship_idx)
    }

    skipBan(user_token, target_phase) {
        // Skip the currently active ban phase
        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;

        let isGunBan = this.timelineCheck(shipIdx, 'gun-ban', target_phase) == 0;
        let isShipBan = this.timelineCheck(shipIdx, 'ship-ban', target_phase) == 0;
        if (!isGunBan && !isShipBan) return;

        let command = isGunBan ? 'gun-ban' : 'ship-ban';
        let banIdx = this.commandCount(command, target_phase);
        if (isGunBan) this.gun_bans[banIdx] = '-1';
        else this.ship_bans[banIdx] = '-1';

        this.stepPhase();
    }

    pauseTimer(user_token) {
        let role = this.members[user_token].role;
        if (role != -4) return;
        this.paused = true;
    }

    unpauseTimer(user_token) {
        let role = this.members[user_token].role;
        if (role != -4) return;
        this.paused = false;
    }

    skipPhase(user_token, target_phase) {
        let role = this.members[user_token].role;
        if (role != -4 || this.phase != target_phase) return;
        this.stepPhase();
    }

    getNameList() {
        // Return array of pilot names
        let names = [];
        for (let i = 0; i < 2 * this.ruleset.team_size; i++) {
            if (i in this.pilots) names.push(this.pilots[i].name);
        }
        return names;
    }

    getLobbyState(user_token) {
        // Return the lobby state from the perspective of the user.
        if (!(user_token in this.members)) return false;
        const role = this.members[user_token].role;
        
        // Get the team of the user.
        let team_idx;
        if (role == -4 || role == -3) team_idx = -1;
        else if (role == -1) team_idx = 0;
        else if (role == -2) team_idx = 1;
        else if (role >= 0) team_idx = Math.floor(role / this.ruleset.team_size);
        else return;

        return this.state.getObfuscated(team_idx);
    }

    getLobbyData(user_token) {
        // Return the full lobby data needed for the frontend.
        if (!(user_token in this.members)) return false;
        return JSON.stringify({
            "timer": Math.floor(this.timer),
            "paused": this.paused,
            "phase": this.timeline.active_phase,
            "timeline": this.timeline,
            "state": this.getLobbyState(user_token),
            "names": this.getNameList()
        });
    }

    getTimeline(user_token) {
        if (!(user_token in this.members)) return false;
        return this.timeline;
    }
}


export default { Lobby };