// Là où toutes les données d'un joueur sont stockées
class Player {
    constructor(socketId, playerConfig, playerData) {
        this.socketId = socketId;
        this.playerConfig = playerConfig;
        this.playerData = playerData;
    }
}

module.exports = Player;