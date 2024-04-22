function checkCode(value) {
    if (value === "12345") {
        document.getElementById('codeInput').style.display = 'none';
        window.startPhaserGame(); // Startet das Phaser-Spiel
    }
}