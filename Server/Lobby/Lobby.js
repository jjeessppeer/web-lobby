import Timeline from "./Timeline.js"
import TimelinePhases from "./TimelinePhases.js";
import LobbyState from "./LobbyState.js";
import crypto from "crypto";

const TIMER_GRACE_TIME = 2000;


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


        this.state.legalizeShipPicks();

        // If lobby is not paused decrement timer
        if (!this.paused) {
            this.timer -= delta;
        }

        // Go to next phase if timer ran out or all states are locked.
        if ((!this.paused && this.timer <= -TIMER_GRACE_TIME) ||
            this.state.getAllStatesLocked(this.timeline.active_phase)) {
            this.startNextPhase();
        }
        
        

    }

    startNextPhase() {
        
        this.state.lockPhase(this.timeline.active_phase);
        this.timeline.stepPhase();
        let lobby_phase = this.timeline.getPhase();
   
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

    

    updateLoadout(loadout, user_token, target_phase) {
        loadout[0] = String(loadout[0]);
        loadout[1] = loadout[1].map(String);

        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;
        // if (this.isLocked(shipIdx)) return;
        if (this.timelineCheck(shipIdx, 'ship-gun-pick', target_phase) < 0) return;
        loadout = this.legalizeLoadout(loadout[0], loadout[1]);
        // if (!this.loadoutAllowed(loadout[0], loadout[1])) return;
        let ship = String(loadout[0]);
        if (!(ship in gameData.ships)) return;
        let guns = [];

        for (let i = 0; i < gameData.ships[ship].guns.length; i++) {
            let gun = loadout[1][i];
            if (!(gun in gameData.guns)) return;
            guns.push(String(gun));
        }
        this.ships[shipIdx] = [ship, guns];
    }

    lockLoadout(user_token, target_phase) {
        // Confirm the active loadout phase.
        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;
        if (this.timelineCheck(shipIdx, 'ship-gun-pick', target_phase) != 0) return;
        this.stepPhase();
    }

    updateGunBan(user_token, target_phase, gun) {
        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;
        if (this.timelineCheck(shipIdx, 'gun-ban', target_phase) != 0) return;
        if (gun == 0) return;
        let banIdx = this.commandCount('gun-ban', target_phase);
        this.gun_ban_previews[banIdx] = String(gun);
    }

    updateShipBan(user_token, target_phase, ship) {
        // Update ban preview selection.
        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;
        if (this.timelineCheck(shipIdx, 'ship-ban', target_phase) != 0) return;
        if (ship == 0) return;
        let banIdx = this.commandCount('ship-ban', target_phase);
        this.ship_ban_previews[banIdx] = String(ship);
    }

    lockBan(user_token, target_phase, timed_out = false) {
        // Ban timed out, lock null item.

        // Confirm the currently active ban.
        let shipIdx = this.members[user_token].role;
        if (shipIdx < 0) return;

        let isShipBan = this.timelineCheck(shipIdx, 'ship-ban', target_phase) == 0;
        let isGunBan = this.timelineCheck(shipIdx, 'gun-ban', target_phase) == 0;
        if (!isShipBan && !isGunBan) return;

        if (isShipBan) {
            let banIdx = this.commandCount('ship-ban', target_phase);
            this.ship_bans.push(this.ship_ban_previews[banIdx]);
        }
        if (isGunBan) {
            let banIdx = this.commandCount('gun-ban', target_phase);
            this.gun_bans.push(this.gun_ban_previews[banIdx]);
        }
        this.stepPhase();
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

    pauseTimer(user_token, target_phase) {
        let role = this.members[user_token].role;
        if (role != -4) return;
        this.paused = true;
    }

    unpauseTimer(user_token, target_phase) {
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
        for (let i = 0; i < 2 * this.team_size; i++) {
            if (i in this.pilots) names.push(this.pilots[i].name);
            else names.push("NOT JOINED");
        }
        return names;
    }

    getShipList(role) {
        // Return the loadouts as viewed by specified role.
        let ships = [];

        // // Spectator or moderator gets full info.
        // if (role == -3 || role == -4){
        //   for (let i = 0; i < 2 * this.team_size; i++) {
        //     if (i in this.ships) ships.push(this.ships[i]);
        //     else ships.push([0, []]);
        //   }
        //   return ships;
        // }

        // Spectators see only locked/picking ships
        if (role == -3 || role == -4) {
            for (let i = 0; i < 2 * this.team_size; i++) {
                if (i in this.ships) {
                    if (this.timelineCheck(i, 'ship-gun-pick') <= 0) {
                        ships.push(this.ships[i]);
                    }
                    else {
                        ships.push([0, []]);
                    }
                }
                else {
                    ships.push([0, []]);
                }
            }
            return ships;
        }


        let team = Math.abs(role % 2);

        // Teams gets team info + locked/picking ships
        for (let i = 0; i < 2 * this.team_size; i++) {
            if (i in this.ships) {
                if (i % 2 == team) {
                    ships.push(this.ships[i]);
                }
                else if (this.timelineCheck(i, 'ship-gun-pick') <= 0) {
                    ships.push(this.ships[i]);
                }
                else {
                    ships.push([0, []]);
                }
            }
            else {
                ships.push([0, []]);
            }
        }

        return ships;
    }

    getShipBans() {
        let shipBans = [];
        let count = 0;
        for (let i = 0; i < this.ship_bans.length; i++) {
            shipBans.push(this.ship_bans[i]);
        }
        for (let i = this.ship_bans.length; i < this.ship_ban_previews.length; i++) {
            shipBans.push(this.ship_ban_previews[i]);
        }
        return shipBans;
    }

    getGunBans() {
        let shipBans = [];
        let count = 0;
        for (let i = 0; i < this.gun_bans.length; i++) {
            shipBans.push(this.gun_bans[i]);
        }
        for (let i = this.gun_bans.length; i < this.gun_ban_previews.length; i++) {
            shipBans.push(this.gun_ban_previews[i]);
        }
        return shipBans;
    }

    getPickedShips() {
        let picked_ships = [];
        for (let i = 0; i < 2 * this.team_size; i++) {
            if (!(i in this.ships)) continue;
            // Only check locked ships.
            if (this.timelineCheck(i, 'ship-gun-pick') >= 0) continue;
            picked_ships.push(this.ships[i][0]);
        }
        return picked_ships;
    }

    lobbyState(user_token) {
        let user_role = this.members[user_token].role;
        //TODO: only send enemy loadout when locked or picking.
        return {
            "timer": Math.floor(this.timer),
            "paused": this.paused,
            "phase": this.phase,
            "ships": this.getShipList(user_role),
            "picked_ships": this.getPickedShips(),
            "ship_bans": this.getShipBans(),
            "gun_bans": this.getGunBans(),
            "names": this.getNameList()
        };
    }
}


export default { Lobby };