function draw() {

    // Remet la translation à zéro
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Clear la frame d'avant
    context.clearRect(0, 0, canvas.width, canvas.height);

    // console.log(player.locX, player.locY);

    // fixe la caméra au dessus du joueur au centre de l'écran
    const camX = -player.locX + canvas.width / 2;
    const camY = -player.locY + canvas.height / 2;
    // Permet d'avoir l'impression reste au centre
    context.translate(camX, camY);

    players.forEach((p) => {
        context.beginPath();
        context.fillStyle = p.color;
        context.arc(p.locX, p.locY, p.radius, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = 3;
        context.font = `${p.score / 2}px`;
        context.textAlign = `center`;
        context.fillStyle = 'black';
        context.fillText(p.name, p.locX, p.locY);
        context.strokeStyle = p.colorStroke;
        context.stroke();
    });


    orbs.forEach((orb) => {
        context.beginPath();
        context.fillStyle = orb.color;
        context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
        context.fill();
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', (event) => {
    event.preventDefault();
    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    //Savoir dans quel angle on se trouve
    const angleDeg = Math.atan2(mousePosition.y - (canvas.height / 2), mousePosition.x - (canvas.width / 2)) * 180 / Math.PI;
    if (angleDeg >= 0 && angleDeg < 90) {

        xVector = 1 - (angleDeg / 90);
        yVector = -(angleDeg / 90);
    } else if (angleDeg >= 90 && angleDeg <= 180) {

        xVector = -(angleDeg - 90) / 90;
        yVector = -(1 - ((angleDeg - 90) / 90));
    } else if (angleDeg >= -180 && angleDeg < -90) {

        xVector = (angleDeg + 90) / 90;
        yVector = (1 + ((angleDeg + 90) / 90));
    } else if (angleDeg < 0 && angleDeg >= -90) {

        xVector = (angleDeg + 90) / 90;
        yVector = (1 - ((angleDeg + 90) / 90));
    }

    player.xVector = xVector;
    player.yVector = yVector;

});