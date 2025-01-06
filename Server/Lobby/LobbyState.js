import TimelinePhases from "./TimelinePhases.js";

class LobbyState {
    constructor(timeline) {
        this.ship_picks = [];
        this.gun_bans = [];
        this.ship_bans = [];

        this.states = [];

        // Construct initial state based on lobby timeline 
        this.loadFromTimeline(timeline);
    }

    loadFromTimeline(timeline) {
        // Load initial state from timeline.
        // TODO: this is all ugly as hell. Redo timeline data format for easier extraction.
        for (const phase of timeline.timeline) {
            if (!(
                phase instanceof TimelinePhases.GunBan ||
                phase instanceof TimelinePhases.ShipBan ||
                phase instanceof TimelinePhases.ShipPick
            )) continue; // Only these phases affect lobby state.

            for (const user of phase.users) {
                if (phase instanceof TimelinePhases.GunBan) {
                    // this.gun_bans.push(new GunBan(phase.phase, user.team, user.ship))
                    this.states.push(new GunBan(phase.phase, user.team, user.ship))
                }
                if (phase instanceof TimelinePhases.ShipBan) {
                    // this.ship_bans.push(new ShipBan(phase.phase, user.team, user.ship))
                    this.states.push(new ShipBan(phase.phase, user.team, user.ship))
                    
                }
                if (phase instanceof TimelinePhases.ShipPick) {
                    // this.ship_picks.push(new ShipPick(phase.phase, user.team, user.ship))
                    this.states.push(new ShipPick(phase.phase, user.team, user.ship))
                }
            }

        }
    }

    lockPhase(phase) {
        // Lock all states in specified phase.
        for (const state in states) {
            if (state.phase != phase) continue;
            state.locked = true;
        }

    }

    getAllStatesLocked(phase) {
        // Return true if all states are locked in specified phase.
        // Returns false if some states are unlocked or if no relevant states exist.
        let all_locked = true;
        let count = 0;
        for (const state in states) {
            if (state.phase != phase) continue;
            count++;
            if (!state.locked) {
                all_locked = false;
                break;
            }
        }
        if (count == 0) return false;
        return all_locked;

    }

    getObfuscated(team_perspective) {
        // Return the lobby state from the perspective of a team.
        return this;
    }

    getBannedShips() {
        // Get a list of banned ships (only locked bans count).

    }

    getBannedGuns() {
        // Get a list of banned guns (only locked bans count).

    }
}

class ShipPick {
    constructor(phase, team, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team = team;
        this.ship_idx = ship_idx;

        this.ship_id = 0;
        this.guns = [];
    }
}

class GunBan {
    constructor(phase, team, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team = team;
        this.ship_idx = ship_idx;

        this.item_id = -1;
    }
}

class ShipBan {
    constructor(phase, team, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team = team;
        this.ship_idx = ship_idx;

        this.item_id = -1;
    }
}

export default { LobbyState };