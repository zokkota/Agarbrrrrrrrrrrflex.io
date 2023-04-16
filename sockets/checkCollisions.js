const Orb = require('./classes/Orb')
const io = require('../servers').io;

function checkForOrbCollisions(pData, pConfig, orbs, settings) {
    return new Promise((resolve, reject) => {
        //Collisions nourritures
        orbs.forEach((orb, i) => {

            // Test si le joueur est assez proche de la nourriture
            if (pData.locX + pData.radius + orb.radius > orb.locX &&
                pData.locX < orb.locX + pData.radius + orb.radius &&
                pData.locY + pData.radius + orb.radius > orb.locY &&
                pData.locY < orb.locY + pData.radius + orb.radius) {
                //distance entre 2 points
                distance = Math.sqrt(
                    ((pData.locX - orb.locX) * (pData.locX - orb.locX)) +
                    ((pData.locY - orb.locY) * (pData.locY - orb.locY))
                );
                if (distance < pData.radius + orb.radius) {
                    //Si la distance est inférieure au rayon du joueur + celle de la nourriture alors il y a collision
                    pData.score += 1;
                    pData.orbsAbsorbed += 1;

                    if (pConfig.zoom > 1) {
                        pConfig.zoom -= .001;
                    }
                    pData.radius += 0.25;
                    if (pConfig.speed <= 0.055) {
                        pConfig.speed = 5;
                    } else if (pConfig.speed > 0.055) {
                        pConfig.speed -= 0.005;
                    }
                    //Garde la nourriture à jour pour les autres joueurs
                    orbs.splice(i, 1, new Orb(settings))
                        // Valide qu'il y a une collison
                    resolve(i)
                }
            }
        });
        // Si on arrive ca veut dire qu'il n'y a pas de collision
        reject()
    });
}

function checkForPlayerCollisions(pData, pConfig, players, playerId) {
    return new Promise((resolve, reject) => {
        //Collisions de joueurs
        players.forEach((curPlayer, i) => {
                if (curPlayer.uid != playerId) {

                    let pLocx = curPlayer.locX
                    let pLocy = curPlayer.locY
                    let pR = curPlayer.radius
                        // Test si les joueurs sont assez proches pour éviter de tester 2 joueurs complétements à l'opposé
                    if (pData.locX + pData.radius + pR > pLocx &&
                        pData.locX < pLocx + pData.radius + pR &&
                        pData.locY + pData.radius + pR > pLocy &&
                        pData.locY < pLocy + pData.radius + pR) {
                        //Distance entre 2 points
                        distance = Math.sqrt(
                            ((pData.locX - pLocx) * (pData.locX - pLocx)) +
                            ((pData.locY - pLocy) * (pData.locY - pLocy))
                        );
                        if (distance < pData.radius + pR) {
                            if (pData.radius > pR) {
                                // Si le joueur est plus gros alors il le mange
                                let collisionData = updateScores(pData, curPlayer);
                                if (pConfig.zoom > 1) {
                                    pConfig.zoom -= (pR * 0.25) * .001;
                                }
                                players.splice(i, 1);
                                resolve(collisionData);
                                //Valide la collison

                            }

                        }
                    }
                }
            })
            // Pas de collsion
        reject();
    });
}

function updateScores(killer, killed) {
    killer.score += (killed.score + 10);
    killer.playersAbsorbed += 1;
    killed.alive = false;
    killer.radius += (killed.radius * 0.25)
    return {
        died: killed,
        killedBy: killer,
    }
}

module.exports = { checkForOrbCollisions, checkForPlayerCollisions }