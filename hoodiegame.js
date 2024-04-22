
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
                debug: true
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

    function preload() {
        this.load.image('coin', 'assets/hoodie2.png');
        this.load.image('background', 'assets/bg_448x7000_pxl.png');
        //this.load.atlas('player', 'assets/player.png', 'assets/player.json');
        this.load.image('coinParticle', 'assets/hoodie2.png');
        this.load.spritesheet('player', 'assets/female_run.png', { frameWidth: 64, frameHeight: 64 });
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
        this.physics.world.setBounds(0, 0, 7200, 448); // Ersetzen Sie 600x2000 durch die tatsächliche Größe Ihres Hintergrundbildes
        this.cameras.main.setBounds(0, 0, 7200, 448); // Ersetzen Sie 2000x2000 durch die tatsächliche Größe Ihres Hintergrundbildes

        // Spieler erstellen
        player = this.physics.add.sprite(100, 200, 'player');
        player.setCollideWorldBounds(true);
        player.body.setGravityY(1000); // nur auf den Spieler anwenden

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
        var maxCoins = 10; // Maximale Anzahl von Münzen
        var maxX = 5000; // Maximale X-Koordinate, abhängig von der Spielfeldbreite
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

        cursors = this.input.keyboard.createCursorKeys();
        text = this.add.text(20, 20, 'Kleidungsstücke: 0', {
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
        let endZone = this.physics.add.sprite(6800, 256, null);
        endZone.setSize(20, 512, true); // Setzt die Größe der Endzone
        endZone.visible = false; // Macht die Endzone unsichtbar

        // Überlappung zwischen dem Spieler und der Endzone erstellen
        this.physics.add.overlap(player, endZone, reachEnd, null, this);

        // preEndzone erstellen
        let preEndZone = this.physics.add.sprite(6200, 256, null);
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


    function collectCoin(player, coin) {
        //coin.disableBody(true, true);
        coin.destroy(); // Münze entfernen
        score++;
        text.setText('Kleidungsstücke: ' + score);
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
            var box = scene.add.rectangle(scene.cameras.main.centerX, scene.cameras.main.centerY, 690, 200, 0x000000);
            box.setOrigin(0.5, 0.5);
            // Box hinter den Text legen
            box.setScrollFactor(0);
            box.setDepth(5);
            // Transparenz der Box einstellen
            box.setAlpha(0.5);

            var gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Du hast ' + score + ' Kleidungsstücke gesammelt!\n\nWieso?\n\n Niemand hat dir gesagt, dass du Kleidungsstücke sammeln sollst.\n\nFast Fashion fördert eine Wegwerfkultur in der Textilindustrie,\n die sowohl enorme Umweltbelastungen verursacht als auch die Ausbeutung\n von Arbeitskräften in Niedriglohnländern verschärft.\nNachhaltige Kleidung gibt es z.B. hier:\n\nwww.kokolor-clothing.de :)', {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            gameOverText.setScrollFactor(0);
            gameOverText.setDepth(10);

            // this.coinEmitter.on = true; // Aktiviere den Emitter
            // this.coinEmitter.emittedParticles
        }

    }
    // Funktion, die aufgerufen wird, wenn der Spieler die Endzone erreicht
    function reachPreEnd(player, preEndZone) {
        // Hier können Sie den Code hinzufügen, der ausgeführt werden soll, wenn der Spieler die Endzone erreicht
        debugText.setText("PreEndzone erreicht!");
        gamePreEnd = true;
    }

}

window.startPhaserGame = startPhaserGame;
