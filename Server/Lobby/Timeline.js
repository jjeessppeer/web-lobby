import TimelinePhases from "./TimelinePhases.js";


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

    length() {
        return this.timeline.length;
    }

    getPhase() {
        // Return active timeline phase
        return this.timeline[this.phase]
    }

    stepPhase() {
        // Go to next timeline phase.
        if (this.phase < this.timeline.length) {
            this.phase += 1;
        }
    }

    getPhaseTimer() {
        // Return start timer for current phase.
        const phase = this.getPhase();
        if (phase instanceof TimelinePhases.TimedPhase)
            return phase.time;
        return -1;
    }

    getTimelineEventList() {
        // Return a list specifying when events happen and who executes them.
        
        return events;
    }
}

export default { LobbyTimeline }