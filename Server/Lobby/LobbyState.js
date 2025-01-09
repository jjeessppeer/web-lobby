import TimelinePhases from "./TimelinePhases.js";
import game_data from "./../gameData.js";

class LobbyState {
    // Data structure for lobby state. Contains things mutable by users.

    constructor(timeline) {
        this.states = [];

        // Construct initial state based on lobby timeline 
        this.loadFromTimeline(timeline);
    }

    loadFromTimeline(timeline) {
        // Load initial state from timeline.
        // TODO: Validate if state is ok. Check that all ships will be picked once.
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
        for (const state in this.states) {
            if (state.phase != phase) continue;
            state.locked = true;
        }

    }

    getAllStatesLocked(phase) {
        // Return true if all states are locked in specified phase.
        // Returns false if some states are unlocked or if no relevant states exist.
        let all_locked = true;
        let count = 0;
        for (const state in this.states) {
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

    getBannedShips(include_picked = false) {
        // Get a list of banned ships (only locked bans count).
        return [0];

    }

    getBannedGuns() {
        // Get a list of banned guns (only locked bans count).
        return [0, 1, 2];
    }

    legalizeShipPicks() {
        for (const state of this.states) {
            if (!(state instanceof ShipPick)) continue;
            this.legalizeShipPick(state);
        }
    }

    setShipPick(phase, loadout, team_idx, ship_idx) {
        // Set a ship pick to the specified loadout.

        // Find and clone correct state.
        const state_idx = this.states.findIndex(
            s => (s instanceof ShipPick && s.team_idx == team_idx && s.ship_idx == ship_idx));
        if (this.states[state_idx].locked) return;
        
        const cloned_pick = structuredClone(this.states[state_idx]);
        
        // Update pick state to new loadout.
        if (!(loadout.ship_id in game_data.ships)) return;
        cloned_pick.ship_id = loadout.ship_id;
        for (let i = 0; i < game_data.ships[loadout.ship_id].guns.length; i++) {
            if (!(loadout.guns[i] in game_data.guns)) return;
            cloned_pick.guns[i] = loadout.guns[i];
        }
        this.legalizeShipPick(cloned_pick);

        // Replace old state.
        this.states[state_idx] = cloned_pick;
    }

    setGunBan(phase, gun_id, team_idx, ship_idx) {
        const state_idx = this.states.findIndex(
            s => (s instanceof GunBan && s.team_idx == team_idx && s.ship_idx == ship_idx));
        const gun_ban = this.states[state_idx]

        // Return if ban is locked or wrong phase.
        if (gun_ban.locked || gun_ban.phase != phase) return;
        
        // Return on invalid gun id.
        if (!(gun_id in game_data.guns)) return;
        
        gun_ban.gun_id = Number(gun_id);
    }

    setShipBan(phase, ship_id, team_idx, ship_idx) {
        const state_idx = this.states.findIndex(
            s => (s instanceof ShipBan && s.team_idx == team_idx && s.ship_idx == ship_idx));
        const ship_ban = this.states[state_idx]

        // Return if ban is locked or wrong phase.
        if (ship_ban.locked || ship_ban.phase != phase) return;
        
        // Return on invalid gun id.
        if (!(ship_id in game_data.ships)) return;
        
        ship_ban.ship_id = Number(ship_id);
    }

    legalizeShipPick(ship_pick) {
        // Update a ship pick to conform by active restrictions.

        const ship_bans = this.getBannedShips();
        const gun_bans = this.getBannedGuns();

        // Find first allowed gun and ship for default option. 
        let default_light_gun = -1;
        let default_heavy_gun = -1;
        let default_ship = -1;

        for (const gun_id in game_data.guns) {
            if (!gun_bans.includes(Number(gun_id)) && game_data.guns[gun_id].gun_type == 'LIGHT') {
                default_light_gun = gun_id;
                break;
            }
        }
        for (const gun_id in game_data.guns) {
            if (!gun_bans.includes(Number(gun_id)) && game_data.guns[gun_id].gun_type == 'HEAVY') {
                default_heavy_gun = gun_id;
                break;
            }
        }
        for (const ship_id in game_data.ships) {
            if (!ship_bans.includes(Number(ship_id))) {
                default_ship = ship_id;
                break;
            }
        }

        // Replace banned ship.
        if (ship_bans.includes(ship_pick.ship_id) ||
            !(ship_pick.ship_id in game_data.ships)) {
            ship_pick.ship_id = default_ship;
        }

        // Replace banned or invalid size guns.
        const ship_item = game_data.ships[ship_pick.ship_id];
        for (let i = 0; i < ship_item.guns.length; i++) {
            const gun_id = ship_pick.guns[i];
            const gun_item = game_data.guns[gun_id];
            if (
                gun_bans.includes(gun_id) ||
                !(gun_id in game_data.guns) ||
                ship_item.guns[i] != gun_item.gun_type
            ) {
                if (ship_item.guns[i] == 'HEAVY')
                    ship_pick.guns[i] = default_heavy_gun
                else
                    ship_pick.guns[i] = default_light_gun
            }
        }
    }
}

class ShipPick {
    constructor(phase, team, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team_idx = team;
        this.ship_idx = ship_idx;

        this.ship_id = -1;
        this.guns = [-1, 0, 0, 0, 0, 0];
    }
}

class GunBan {
    constructor(phase, team_idx, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team_idx = team_idx;
        this.ship_idx = ship_idx;

        this.gun_id = -1;
    }
}

class ShipBan {
    constructor(phase, team, ship_idx) {
        this.locked = false;
        this.phase = phase;
        this.team_idx = team;
        this.ship_idx = ship_idx;

        this.item_id = -1;
    }
}

export default { LobbyState };