const io = require('../servers').io;
const checkForOrbCollisions = require('./checkCollisions').checkForOrbCollisions;
const checkForPlayerCollisions = require('./checkCollisions').checkForPlayerCollisions;

const Player = require('./classes/Player');
const PlayerData = require('./classes/PlayerData');
const PlayerConfig = require('./classes/PlayerConfig');
const Orb = require('./classes/Orb');
let orbs = [];
let players = [];
let settings = {
    defaultOrbs: 5000,
    defaultSpeed: 5,
    defaultSize: 25,

    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000
}

initGame();

// Envoyer un message tout les 60 fps
setInterval(() => {
    // console.log('tock');
    if (players.length > 0) {
        io.to('game').emit('tock', {
            players
        });
    }
}, 1000 / 60);

io.sockets.on('connect', (socket) => {
    let player = {};
    player.tickSent = false;
    // Un joueur se connecte
    socket.on('init', (data) => {
        // Le joueur rejoint le jeu
        socket.join('game');
        //Création du joueur avec ses données
        let playerConfig = new PlayerConfig(settings);
        let playerData = new PlayerData(data.playerName, settings);
        player = new Player(socket.id, playerConfig, playerData);

        // Envoie un message avec ses coordonnées 60 fois par seconde
        setInterval(() => {

            if (player.tickSent) {
                socket.emit('tickTock', {
                    playerX: player.playerData.locX,
                    playerY: player.playerData.locY,
                });
                player.tickSent = false;
            }
        }, 1000 / 60);

        socket.emit('initReturn', {
            orbs
        });
        players.push(playerData);
    });

    // Le client a envoyé son tick, cela signifie que nous savons dans quelle direction déplacer le socket/joueur
    socket.on('tick', (data) => {
        player.tickSent = true;
        if (data.xVector && data.yVector) {
            speed = player.playerConfig.speed;
            // Mets à jour le playerConfig avec sa nouvelle direction

            xV = player.playerConfig.xVector = data.xVector;
            yV = player.playerConfig.yVector = data.yVector;
            //Ralentir qu'on arrive sur les murs
            if ((player.playerData.locX < 5 && player.playerData.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)) {
                player.playerData.locY -= speed * yV;
            } else if ((player.playerData.locY < 5 && yV > 0) || (player.playerData.locY > settings.worldHeight) && (yV < 0)) {
                player.playerData.locX += speed * xV;
            } else {
                player.playerData.locX += speed * xV;
                player.playerData.locY -= speed * yV;
            }
            player.tickSent = true;
            // Collision avec la nourriture
            let capturedOrb = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);
            capturedOrb.then((data) => {
                // S'il y a collison
                // envoie à tout les joueurs qu'il y a une collision
                const orbData = {
                    orbIndex: data,
                    newOrb: orbs[data]
                }

                // Transmet l'information que le leaderboard a changé
                io.sockets.emit('updateLeaderBoard', getLeaderBoard());
                io.sockets.emit('orbSwitch', orbData);
            }).catch(() => {
                //Si on catch quelque chose il n'y a pas de collisons
            });

            // Collision avec un joueur
            let playerDeath = checkForPlayerCollisions(player.playerData, player.playerConfig, players, player.socketId);
            playerDeath.then((data) => {

                // Transmet que le leaderBoard a changé
                io.sockets.emit('updateLeaderBoard', getLeaderBoard());
                // Transmet l'information qu'un joueur est mort
                io.sockets.emit('playerDeath', data);

            }).catch(() => {

            })
        }
    });
    socket.on('disconnect', (data) => {
        //envoyer l'info qu'un joueur s'est déconnecté
        if (player.playerData) {
            players.forEach((curPlayer, i) => {
                if (curPlayer.uid == player.playerData.uid) {
                    players.splice(i, 1);
                    io.sockets.emit('updateLeaderBoard', getLeaderBoard());
                }
            });

        }
    });
});

function getLeaderBoard() {
    //Tri des joueurs par ordre décroissant sur leurs scores
    players.sort((a, b) => {
        return b.score - a.score;
    });
    let leaderBoard = players.map((curPlayer) => {
        return {
            name: curPlayer.name,
            score: curPlayer.score
        }
    });
    return leaderBoard;
}

//Initialisation du jeu
function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

module.exports = io;