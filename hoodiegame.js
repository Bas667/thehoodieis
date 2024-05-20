
function startPhaserGame() {
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 448,
        parent: 'game',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            key: 'main',
            preload: preload,
            create: create,
            update: update
        }
    };
    var game = new Phaser.Game(config);
    var player;
    var cursors;
    var text;
    var score = 0; // Initialisiere die Score-Variable korrekt.
    var coins = [];
    var gameEnd = false;
    var gamePreEnd = false;
    var gameOverText;
    gameStart = false;
    gameProcessed = false;
    var startTimer; // Variable für den Start-Countdown
    var startTimerText; // Text-Element für die Anzeige des Start-Countdowns
    var maxCoins = 20; // Maximale Anzahl von Münzen

    function preload() {
        // Rauchtextur laden
        this.load.image('smoke', 'assets/smoke.png');
        this.load.image('coin', 'assets/hoodie2.png');
        this.load.image('background', 'assets/bg_448x9000_pxl.png');
        //this.load.atlas('player', 'assets/player.png', 'assets/player.json');
        this.load.image('coinParticle', 'assets/hoodie2.png');
        this.load.spritesheet('player', 'assets/Biker_run_72_pxl.png', { frameWidth: 72, frameHeight: 72 });
        this.load.image('example', 'assets/hoodie2.png');



    }

    function create() {

        // Erstelle ein Sprite aus dem geladenen Bild
        var test = this.add.sprite(100, 100, 'example');

        // Tween für eine einfache Flip-Animation
        this.tweens.add({
            targets: test,
            scaleX: -1,  // Horizontales Flippen
            duration: 1000,  // Dauer in Millisekunden
            yoyo: true,  // Hin- und Zurück-Animation
            repeat: -1  // Unendliche Wiederholung
        });


        // Einfacher Hintergrund setzen
        this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Setze die Grenzen der Kamera
        this.physics.world.setBounds(0, 0, 9000, 448); // Ersetzen Sie 600x2000 durch die tatsächliche Größe Ihres Hintergrundbildes
        this.cameras.main.setBounds(0, 0, 9000, 448); // Ersetzen Sie 2000x2000 durch die tatsächliche Größe Ihres Hintergrundbildes

        // Spieler erstellen
        player = this.physics.add.sprite(100, 200, 'player');
        player.setCollideWorldBounds(true);
        player.body.setGravityY(1000); // nur auf den Spieler anwenden

        // Initialisiere das Gitter für die Münzenplatzierung
        const coinSize = 32;
        const gridSize = coinSize * 3;
        const cols = Math.floor(9000 / gridSize); // 9000 ist die Breite deines Spielfeldes
        const rows = Math.floor(448 / gridSize); // 448 ist die Höhe deines Spielfeldes
        let grid = Array.from({ length: cols }, () => Array(rows).fill(false));

        // Platzierung der Münzen
        placeCoins.call(this, grid, cols, rows, gridSize);


        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),  // Start- und Endframe
            frameRate: 8,  // Geschwindigkeit, mit der die Frames wechseln
            repeat: -1
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 'p1_stand' }],
            frameRate: 10,
        });

        // make the camera follow the player
        this.cameras.main.startFollow(player, true);

        // Grenzen für die Münzen setzen
        /*
        var maxCoins = 20; // Maximale Anzahl von Münzen
        
        var maxX = 7000; // Maximale X-Koordinate, abhängig von der Spielfeldbreite
        var maxY = 400; // Maximale Y-Koordinate, abhängig von der Spielfeldhöhe

        // Erzeuge zufällige Positionen und füge Coins hinzu
        for (var i = 0; i < maxCoins; i++) {
            var x = Phaser.Math.Between(500, maxX);
            var y = Phaser.Math.Between(50, maxY);
            var coin = this.physics.add.sprite(x, y, 'coin').setGravityY(0);
            this.physics.add.overlap(player, coin, collectCoin, null, this);

            // Tween hinzufügen, um das Bild kontinuierlich zu skalieren
            this.tweens.add({
                targets: coin,
                scaleX: 1.1, // Skalierung auf 150% der Originalgröße
                scaleY: 1.1, // Skalierung auf 150% der Originalgröße
                yoyo: true, // Kehrt die Animation um, sodass sie zurück zur Originalgröße skaliert
                repeat: -1, // Unendlich wiederholen
                ease: 'Sine.easeInOut', // Weiches Ein- und Ausblenden der Animation
                duration: 500 // Dauer für eine komplette Animation (Hin- und Zurück)
            });

        }
        

        var coin2 = this.physics.add.sprite(500, 500, 'coin');

        // Überlappung zwischen dem Spieler und den Münzen erstellen
        this.physics.add.overlap(player, coin2, collectCoin, null, this);
        this.physics.add.overlap(player, coin, collectCoin, null, this);

        // Deaktiviere die Schwerkraft spezifisch für diese Münze
        //coin.body.setGravityY(0);
        coin2.body.setGravityY(0);
*/
        cursors = this.input.keyboard.createCursorKeys();
        text = this.add.text(20, 20, 'Hoodies: 0', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setScrollFactor(0);
        text.setOrigin(0, 0.5); // Setzt den Ursprungspunkt auf die linke Mitte

        debugText = this.add.text(20, 60, 'debug', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        debugText.setScrollFactor(0);
        debugText.setOrigin(0, 0.5); // Setzt den Ursprungspunkt auf die linke Mitte



        // In der create-Funktion
        this.coinEmitter = this.add.particles('coinParticle').createEmitter({
            speed: 300,//{ min: -100, max: 100 },
            angle: { min: -70, max: -65 },
            scale: { start: 1, end: 0 },
            lifespan: 1500,
            gravityY: 300,
            quantity: score, // Anzahl der Partikel entspricht der Anzahl der gesammelten Münzen
            on: false, // Emittor ist zunächst nicht aktiv
        });
        this.emittedParticles = 0;




        // Endzone erstellen
        let endZone = this.physics.add.sprite(8600, 256, null);
        endZone.setSize(20, 512, true); // Setzt die Größe der Endzone
        endZone.visible = false; // Macht die Endzone unsichtbar

        // Überlappung zwischen dem Spieler und der Endzone erstellen
        this.physics.add.overlap(player, endZone, reachEnd, null, this);

        // preEndzone erstellen
        let preEndZone = this.physics.add.sprite(8200, 256, null);
        preEndZone.setSize(20, 512, true); // Setzt die Größe der Endzone
        preEndZone.visible = false; // Macht die Endzone unsichtbar

        // Überlappung zwischen dem Spieler und der Endzone erstellen
        this.physics.add.overlap(player, preEndZone, reachPreEnd, null, this);

        // Start-Countdown initialisieren
        startTimer = 3; // Starte den Countdown von 3 Sekunden
        startTimerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start in: 3', {
            fontSize: '60px',
            fill: '#ffffff',
            fontWeight: 'bold'
        });
        startTimerText.setOrigin(0.5);

        // Phaser-Timer-Event für den Countdown
        this.time.addEvent({
            delay: 1000, // 1000 ms = 1 Sekunde
            callback: countdown,
            callbackScope: this,
            loop: true
        });

/*
        // Partikel-Emitter für Rauch erstellen
        this.smokeEmitter = this.add.particles('smoke').createEmitter({
            x: 400, // X-Position des Emitters
            y: 200, // Y-Position des Emitters
            speed: { min: -50, max: 50 }, // Geschwindigkeit der Partikel
            angle: { min: 0, max: 360 }, // Ausbreitungswinkel
            scale: { start: 0.5, end: 0 }, // Anfangs- und Endskalierung
            lifespan: 1000, // Lebensdauer der Partikel in Millisekunden
            blendMode: 'ADD', // Mischmodus für die Darstellung
            frequency: 1, // Häufigkeit der Partikel-Emission
            quantity: 1, // Anzahl der Partikel pro Emission
            alpha: { start: 1, end: 0 }, // Anfangs- und Endtransparenz
            gravityY: -50 // Vertikale Schwerkraft
        });
        // Rauch-Emitter starten
        this.smokeEmitter.start();
*/


        scene = this;

    }

    function countdown() {
        startTimer -= 1;
        startTimerText.setText('Start in: ' + startTimer);
        if (startTimer === 0) {
            this.time.removeAllEvents(); // Stoppe den Timer
            startTimerText.setVisible(false); // Verstecke den Countdown-Text
            gameStart = true; // Setze das Spiel als gestartet
            // Hier kannst du weitere Aktionen hinzufügen, die nach dem Countdown ausgeführt werden
        }
    }
    let jumpCount = 0; // Variable zum Verfolgen der Sprünge
    function update() {


        if (!gameEnd && !gamePreEnd && gameStart) {
            player.body.setVelocityX(450); // Bewege den Spieler nach rechts
            player.anims.play('walk', true);
            player.flipX = false;
            if (Phaser.Input.Keyboard.JustDown(cursors.up) && (player.body.onFloor() || jumpCount < 1)) {
                player.body.setVelocityY(-650); // Springen
                jumpCount++;
            }

            if (player.body.onFloor()) {
                jumpCount = 0;
            }
        } else if (gamePreEnd && !gameEnd) {
            player.body.setVelocityX(200); // Bewege den Spieler nach rechts
            player.anims.play('walk', true);
            player.flipX = false;
        } else if (gameEnd) {
            player.body.setVelocityX(0); // Bewege den Spieler nach rechts
            player.anims.play('walk', false);
            this.coinEmitter.stop(); // Stoppe den Emitter
            // this.coinEmitter.on = false; // Stelle sicher, dass wir den Emitter nicht erneut stoppen
        }

    }


    // Definiere eine Liste von verschiedenen Texten
    var randomTexts = [
        "Stylisch!",
        "Schön!",
        "Wow!"
    ];






    function collectCoin(player, coin) {
        //coin.disableBody(true, true);
        coin.destroy(); // Münze entfernen
        score++;
        text.setText('Hoodies: ' + score);

        // Zufälligen Text auswählen
        var randomIndex = Phaser.Math.Between(0, randomTexts.length - 1);
        var randomText = randomTexts[randomIndex];

        // Text anzeigen, wenn ein Coin eingesammelt wurde
        var collectedText = scene.add.text(coin.x, coin.y, randomText, {
            fontSize: '50px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Den Text nach einer kurzen Zeit ausblenden und dann zerstören
        scene.tweens.add({
            targets: collectedText,
            alpha: 0,
            duration: 1000,
            delay: 500,
            onComplete: function () {
                collectedText.destroy();
            }
        });

    }

    // Funktion, die aufgerufen wird, wenn der Spieler die Endzone erreicht
    function reachEnd(player, endZone) {
        if (!gameProcessed) {
            gameProcessed = true;
            // Hier können Sie den Code hinzufügen, der ausgeführt werden soll, wenn der Spieler die Endzone erreicht
            debugText.setText("Endzone erreicht!");
            player.body.setVelocityX(0); // Bewege den Spieler nach rechts
            gameEnd = true;
            this.coinEmitter.emitParticle(score, player.x, player.y)
            // Zeige eine Nachricht und den Highscore an

            // Box erstellen
            var box = scene.add.rectangle(scene.cameras.main.centerX, scene.cameras.main.centerY, 690, 250, 0x000000);
            box.setOrigin(0.5, 0.5);
            // Box hinter den Text legen
            box.setScrollFactor(0);
            box.setDepth(5);
            // Transparenz der Box einstellen
            box.setAlpha(0.7);

            var gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Herzlichen Glückwunsch! Du hast ' + score + ' Hoodies gesammelt!\n\nAber warum eigentlich?\n Niemand hat dir gesagt, dass du Hoodies sammeln sollst.\n\nFast Fashion verführt uns dazu, mehr zu kaufen, als wir brauchen.\n Stell dir vor, Kleidung könnte nachhaltig, langlebig,\n fair produziert und umweltfreundlich sein.\n\n Es ist Zeit für eine Veränderung.\n Informiere dich und entdecke nachhaltige Alternativen z.B. hier:\n\nwww.kokolor-clothing.de :)', {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            gameOverText.setScrollFactor(0);
            gameOverText.setDepth(10);

             this.coinEmitter.on = true; // Aktiviere den Emitter
             this.coinEmitter.emittedParticles
        }

    }
    // Funktion, die aufgerufen wird, wenn der Spieler die Endzone erreicht
    function reachPreEnd(player, preEndZone) {
        // Hier können Sie den Code hinzufügen, der ausgeführt werden soll, wenn der Spieler die Endzone erreicht
        debugText.setText("PreEndzone erreicht!");
        gamePreEnd = true;
    }

    function placeCoins(grid, cols, rows, gridSize) {
        let placedCoins = 0;
    const minX = 500;
    const maxX = 9000 - 1000; // 9000 ist die Breite des Spielfeldes abzüglich 200

    while (placedCoins < maxCoins) {
        let col = Phaser.Math.Between(0, cols - 1);
        let row = Phaser.Math.Between(0, rows - 1);

        if (!grid[col][row]) {
            let x = col * gridSize + gridSize / 2;

            // Sicherstellen, dass die X-Position zwischen 200 und maxX-200 liegt
            if (x < minX) {
                x = minX + Phaser.Math.Between(0, gridSize / 2);
            } else if (x > maxX) {
                x = maxX - Phaser.Math.Between(0, gridSize / 2);
            }

            let y = row * gridSize + gridSize / 2;
            let coin = this.physics.add.sprite(x, y, 'coin').setGravityY(0);
            this.physics.add.overlap(player, coin, collectCoin, null, this);

            this.tweens.add({
                targets: coin,
                scaleX: 1.1,
                scaleY: 1.1,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                duration: 500
            });

            grid[col][row] = true;
            placedCoins++;
            }
           // console.log(`Placing coin at (${x}, ${y}) in grid cell (${col}, ${row})`);
        }
        
    }

}

window.startPhaserGame = startPhaserGame;
