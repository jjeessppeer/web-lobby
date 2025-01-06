
class LobbyManager {
    constructor() {
        this.lobbies = {};

    }

    createLobby(creation_request) {
        // Load lobby ruleset
        // Create lobby
        
        let lobby_id;
        do {
            lobby_id = crypto.randomBytes(4).toString('hex');
        } while (this.lobby_id in lobbies);

        console.log(`Creating lobby ${this.lobby_id}`)

    }

    removeLobby(lobby_id) {
        clearInterval(lobbies[lobby_id].intervalId);
        delete lobbies[lobby_id];
        console.log(`Removed lobby ${lobby_id}`);
    }

    cleanLobbies() {
        let time = Date.now();
        for (const [token, lobby] of Object.entries(lobbies)) {
            let lobby_age = (time - lobby.creation_time) / 1000;
            if (lobby_age > LOBBY_LIFETIME) {
                removeLobby(token);
            }
        }

    }
}