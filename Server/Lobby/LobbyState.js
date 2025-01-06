class LobbyState {
    constructor(ruleset) {
        this.ships = [[], []];
        for (let i = 0; i < ruleset.team_size; i++) {
            this.ships[0].push(new ShipState());
            this.ships[1].push(new ShipState());
        }
    }
}

class BanState {
    constructor(pick_phase) {
        this.locked = false;
        this.pick_phase = pick_phase;
        this.item_id = -1;
    }
}

class ShipState {
    constructor(pick_phase) {
        this.locked = false;
        this.pick_phase = pick_phase;

        this.ship_id = 0;
        this.guns = [];
    }
}
