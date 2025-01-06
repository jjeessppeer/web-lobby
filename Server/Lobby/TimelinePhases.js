const teamship_rgx = /^T([1-2])S([1-9])$/;
const time_rgx = /^([0-9]+)$/

function LoadPhaseFromText(text, phase) {
    // Load a lobby phase object from a line of text.
    const args = text.split(" ");
    const command = args.shift();

    // Load the phase time. Default -1.
    let time = -1;
    if (args.length > 0) {
        const time_match = args[args.length - 1].match(time_rgx);
        if (time_match) time = Number(time_match[1]);
    }
    

    // Construct and return the phase object.
    if (command == "ship-pick") {
        const user_list = MultiUserPhase.LoadUserList(args);
        return new ShipPick(phase, time, user_list);
    }
    if (command == "ship-ban") {
        const user_list = MultiUserPhase.LoadUserList(args);
        return new ShipBan(phase, time, user_list);
    }
    if (command == "pause") {
        return new Pause(phase, time);
    }

    throw Error("Invalid lobby phase.");
}

class BaseTimelinePhase {
    // Base class for timeline phase. Not used on itself.
    constructor(phase) {
        this.phase = phase;
    }
}

class TimedPhase extends BaseTimelinePhase {
    constructor(phase, time) {
        super(phase);
        this.time = time;
    }

}

class MultiUserPhase extends TimedPhase {
    // Base class for phase for phase with one or more users.
    static LoadUserList(args) {
        const user_list = [];
        for (const arg of args) {
            const match = arg.match(teamship_rgx);
            if (!match) continue;
            const teamIdx = Number(match[1]) - 1;
            const shipIdx = Number(match[2]) - 1;
            user_list.push({
                team: teamIdx,
                ship: shipIdx
            });
        }
        return user_list;
    }

    constructor(phase, time, users) {
        super(phase, time)
        this.users = users;
    }
}

class WaitingForPilots extends BaseTimelinePhase {}
class WaitingForModerator extends BaseTimelinePhase {}
class Pause extends TimedPhase {}
class ShipPick extends MultiUserPhase {}
class GunBan extends MultiUserPhase {}
class ShipBan extends MultiUserPhase {}

export default { LoadPhaseFromText, WaitingForPilots, WaitingForModerator, Pause, ShipPick, GunBan, ShipBan, TimedPhase };
