let socket = io.connect('http://localhost:3000');

// Quand on click sur le bouton start
function init() {
    //On commence par dessiner 
    draw();

    socket.emit('init', {
        playerName: player.name
    })
}

socket.on('initReturn', (data) => {

    orbs = data.orbs;
    setInterval(() => {
        if (player.xVector) {
            socket.emit('tick', {
                xVector: player.xVector,
                yVector: player.yVector
            });
        }

    }, 1000 / 60);
});

socket.on('tock', (data) => {

    players = data.players
});

socket.on('tickTock', (data) => {
    player.locX = data.playerX,
        player.locY = data.playerY
});

socket.on('orbSwitch', (data) => {

    orbs.splice(data.orbIndex, 1, data.newOrb);
});

socket.on('updateLeaderBoard', (data) => {

    document.querySelector('.leader-board').innerHTML = "";
    data.forEach((curPlayer) => {
        document.querySelector('.leader-board').innerHTML += `
    <li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>
    `
    });
});

socket.on('playerDeath', (data) => {
    console.log(`a été tué: ${data.died.name}`);
    console.log(`Le tueur: ${data.killedBy.name}`);
    document.querySelector('#game-message').innerHTML = `${data.died.name} a été tué ${data.killedBy.name}`;
    $('#game-message').css({
        'background-color': '#00e6e6',
        'opacity': 1
    });
    $('#game-message').show();
    $('#game-message').fadeOut(5000);
});