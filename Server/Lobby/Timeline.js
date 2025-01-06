import TimelinePhases from "./TimelinePhases.js";

function CreateLobbyTimeline(ruleset) {
    
    return phases;
}

class LobbyTimeline {
    constructor(ruleset) {

        // Load the timeline phases from the text.
        const phases = [];

        // Insert extra wait phases.
        if (ruleset.moderated) {
            phases.push(new TimelinePhases.WaitingForModerator(0));
        }
        phases.push(new TimelinePhases.WaitingForPilots(phases.length));

        const timeline_text = ruleset.timeline_text;
        const lines = timeline_text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const timeline_phase = TimelinePhases.LoadPhaseFromText(lines[i], phases.length);
            phases.push(timeline_phase);
        }

        this.timeline = phases;
        this.active_phase = 0;
    }

    getPhase() {
        return this.timeline[this.phase]
    }

    getPhaseTimer() {
        return this.timeline_times[this.phase]
    }

    stepPhase() {
        if (this.phase < this.timeline.length) {
            this.phase += 1;
        }
    }

    getPicks() {
        // Return a list specifying when picks will occur and who executes them.

    }

    getBans() {
        // Return a list specifying when bans will occur and who executes them.
        const bans = [];
        for (const phase of self.timeline) {
            if (phase instanceof TimelinePhases.GunBan)
        }

    }

    timelineCheck(role, command, target_phase) {
        // Returns:
        //  0 role+command is current phase
        // >0 role+command is future phase
        // <0 role+command is past phase
        let timelineStr;
        if (role >= 0) {
            timelineStr = `T${role % 2 == 0 ? "1" : "2"}S${(role - (role % 2)) / 2 + 1} ${command}`;
        }
        else {
            timelineStr = command;
        }

        if (target_phase == undefined) target_phase = this.timeline.indexOf(timelineStr);
        if (this.timeline[target_phase] != timelineStr) return -1;

        return target_phase - this.phase;
    }

    commandCount(query_command, target_phase = this.timeline.length) {
        // Return the number of times the command occurs in the timeline before phase.
        let endIdx = Math.min(target_phase, this.timeline.length);
        let count = 0;
        for (let i = 0; i < endIdx; i++) {
            let [target, command] = this.timeline[i].split(' ');
            if (command == undefined) command = target;
            if (command == query_command) count++;
        }
        return count;
    }
}

export default { LobbyTimeline }