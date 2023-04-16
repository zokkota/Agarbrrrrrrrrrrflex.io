// Les données que les autres joueurs n'ont pas besoin de savoir
class PlayerConfig {
    constructor(settings) {
        this.xVector = 0;
        this.yVector = 0;
        this.speed = settings.defaultSpeed;
        this.zoom = settings.defaultZoom;
    }
}

module.exports = PlayerConfig;