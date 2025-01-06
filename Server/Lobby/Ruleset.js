class LobbyRuleset {
    static LoadLobbyRuleset(json) {
        // Assert valid ruleset.
        assert('ruleset' in req.body);
        let ruleset = req.body.ruleset;
        assert('round_time' in ruleset);
        assert(Number.isInteger(ruleset.round_time));

        assert('team_size' in ruleset);
        assert(Number.isInteger(ruleset.team_size));

        assert('password' in ruleset);
        assert(typeof ruleset.password == "string");
        assert(ruleset.password.length < 50);

        assert('moderated' in ruleset);
        assert(typeof ruleset.moderated == "boolean");

        assert('allow_duplicate_ships' in ruleset);
        assert(typeof ruleset.allow_duplicate_ships == "boolean");


        assert('timeline' in ruleset);
        assert(Array.isArray(ruleset.timeline));
        assert(ruleset.timeline.length < 100);
        const allowed_commands = ['ship-ban', 'gun-ban', 'ship-gun-pick', 'pause'];
        // const allowed_special_commands = ['Waiting for pilots to join', 'Waiting for lobby start', 'Waiting for moderator start', 'moderator-start'];

        for (let i = 1; i < ruleset.timeline.length; i++) {
            // if (ruleset.timeline[i] == "Waiting for pilots to join") continue;
            // if (ruleset.timeline[i] == "Waiting for lobby start") continue;
            // if (allowed_special_commands.includes(ruleset.timeline[i])) continue;

            let [target, command] = ruleset.timeline[i].split(' ');
            if (command == undefined) {
                command = target;
                target = undefined;
            }
            if (target != undefined) {
                assert(target.charAt(0) == 'T');
                assert(target.charAt(2) == 'S');
                assert(/\d/.test(target.charAt(1)));
                assert(/\d/.test(target.charAt(3)));
            }
            assert(allowed_commands.includes(command));
        }

        assert('timeline_times' in ruleset);
        assert(Array.isArray(ruleset.timeline_times));
        assert(ruleset.timeline_times.length == ruleset.timeline.length);
        for (let i = 1; i < ruleset.timeline_times; i++) {
            assert(Number.isInteger(ruleset.timeline_times[i]));
        }

        // Create ruleset object.
        return new LobbyRuleset(timeline, timeline_times, round_time, team_size, password, moderated, allow_duplicate_ships);
    }

    constructor(rules_json) {
        this.timeline_text = rules_json.timeline;
        this.default_round_time = rules_json.default_round_time;
        this.team_size = rules_json.team_size;
        this.password = rules_json.password;
        this.allow_duplicate_ships = rules_json.allow_duplicate_ships;
        this.moderated = rules_json.moderated;
    }
}

export default { LobbyRuleset }