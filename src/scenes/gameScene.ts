/** @type {Phaser.Scene} */

import { ObjectImages as ImagesScene } from "../enum/objects";
import { GameDefault, Level } from "../enum/gameValues";
import { BaseScene } from "./baseScene";

export class GameScene extends BaseScene {
    firstClick: boolean;
    //Objects constructor
    bird!: Phaser.Physics.Arcade.Sprite;
    cloud!: Phaser.GameObjects.TileSprite;
    pauseButton!: Phaser.GameObjects.Image;
    isPaused: boolean;

    //Score constructor
    score: number;
    scoreText!: Phaser.GameObjects.Text;
    bestScore: number;
    bestScoreText!: Phaser.GameObjects.Text;

    pipesGroup!: Phaser.Physics.Arcade.Group;

    //CountDown
    initialTime: number;
    countDownText!: Phaser.GameObjects.Text;
    timeEvent!: Phaser.Time.TimerEvent;
    pauseEvent!: Phaser.Events.EventEmitter;

    //Level
    level: number;
    bestLevel: number;
    listLevels = {
        1: {
            pipeHorizontalDistanceRange: [400, 500],
            pipeVerticalDistanceRange: [250, 350],
            amplitudePipe: 100,
            changeFactor: 1,
        },
        2: {
            pipeHorizontalDistanceRange: [380, 480],
            pipeVerticalDistanceRange: [230, 330],
            amplitudePipe: 130,
            changeFactor: 0.9,
        },
        3: {
            pipeHorizontalDistanceRange: [360, 460],
            pipeVerticalDistanceRange: [210, 300],
            amplitudePipe: 170,
            changeFactor: 0.8,
        },
        4: {
            pipeHorizontalDistanceRange: [360, 460],
            pipeVerticalDistanceRange: [200, 290],
            amplitudePipe: 200,
            changeFactor: 0.7,
        },
        5: {
            pipeHorizontalDistanceRange: [360, 460],
            pipeVerticalDistanceRange: [190, 270],
            amplitudePipe: 220,
            changeFactor: 0.5,
        },
    };

    constructor(config: any) {
        super("GameScene", config);
        this.config = config;

        this.firstClick = false;
        this.isPaused = false;
        this.score = 0;
        this.bestScore = 0;
        this.initialTime = 3;
        this.level = Level.EASY_LEVEL;
        this.bestLevel = Level.EASY_LEVEL;
    }

    async create() {
        super.create();
        this.createCloud();
        this.createBirds();
        this.createPause();
        this.createScore();
        this.handleInputs();
        this.listenToEvents();

        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("bird", {
                start: 8,
                end: 15,
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.bird.play("fly");
    }

    update(time: number, delta: number): void {
        this.updatePositionCloud();
        if (this.firstClick) {
            this.checkGameStatus();
            this.recyclePipes();
        }
    }

    createBirds() {
        this.bird = this.physics.add
            .sprite(
                this.config.birdPosition.x,
                this.config.birdPosition.y,
                ImagesScene.Bird
            )
            .setFlipX(true)
            .setScale(5);
        this.bird.setBodySize(this.bird.width, this.bird.height - 8);
        this.bird.body.gravity.y = 0;
        this.bird.setCollideWorldBounds(true);
    }

    createCloud() {
        this.cloud = this.add.tileSprite(
            0,
            100,
            this.config.width,
            500,
            ImagesScene.Cloud
        );
        this.cloud.setOrigin(0);
    }

    updatePositionCloud() {
        this.cloud.tilePositionX += 1;
    }

    createPipes() {
        this.pipesGroup = this.physics.add.group();
        for (let i = 0; i < GameDefault.PIPES_TO_RENDER; i++) {
            this.placePipe();
        }
    }

    createPause() {
        this.pauseButton = this.add
            .image(
                this.config.width - 10,
                this.config.height - 10,
                ImagesScene.Pause
            )
            .setScale(5)
            .setOrigin(1);
        this.pauseButton.depth = 5;
        this.pauseButton.setInteractive();

        this.pauseButton.on("pointerup", () => {
            this.isPaused = true;
            this.physics.pause();
            this.scene.pause();
            this.timeEvent?.remove();
            this.scene.launch("PauseScene");
        });
    }

    createScore() {
        this.bestScore = Number(localStorage.getItem("bestScore"));
        this.bestLevel = Number(localStorage.getItem("bestLevel"));
        this.scoreText = this.add.text(
            16,
            16,
            `Score: ${this.score}/ Best score: ${this.bestScore || 0}\nLevel: ${
                this.level
            }/ Best Level: ${this.bestLevel || 1}`,
            {
                font: "32px Arial",
                color: "#5d7b6f",
            }
        );

        this.scoreText.depth = 5;
    }

    handleInputs() {
        this.input.on("pointerup", this.flapBird, this);
        this.input.keyboard.on("keydown-SPACE", this.flapBird, this);
    }

    createColliders() {
        this.physics.add.collider(
            this.bird,
            this.pipesGroup,
            this.gameOver,
            undefined,
            this
        );
    }

    checkGameStatus() {
        if (
            this.bird.getBounds().bottom >= this.config.height ||
            this.bird.getBounds().top <= 0
        ) {
            this.gameOver();
        }
    }

    flapBird() {
        const tempLevel = this.listLevels[this.level];
        if (this.isPaused) {
            return;
        }
        if (!this.firstClick) {
            this.firstClick = true;
            this.createPipes();
            this.createColliders();
        }

        this.bird.body.gravity.y =
            GameDefault.BIRD_GRAVITY / tempLevel.changeFactor;
        this.bird.body.velocity.y =
            -GameDefault.FLAP_VELOCITY / tempLevel.changeFactor;
    }

    saveBestScoreAndLevel() {
        this.bestScore = Number(localStorage.getItem("bestScore"));
        if (!this.bestScore || this.score > this.bestScore) {
            localStorage.setItem("bestScore", this.score.toString());
        }

        //Save best level
        this.bestLevel = Number(localStorage.getItem("bestLevel"));
        if (!this.bestLevel || this.level > this.bestLevel) {
            localStorage.setItem("bestLevel", this.level.toString());
        }
    }

    gameOver() {
        this.physics.pause();
        this.bird.setTint(0x732335);
        this.score = 0;
        this.level = Level.EASY_LEVEL;
        this.saveBestScoreAndLevel();

        this.add
            .text(
                this.screenCenter[0],
                this.screenCenter[1],
                "GAME OVER!",
                this.fontOptions
            )
            .setOrigin(0.5);

        this.cameras.main.shake(1000, 0.005);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.firstClick = false;
                this.scene.start("MenuScene");
            },
            loop: false,
        });
    }

    placePipe() {
        const tempLevel = this.listLevels[this.level];
        const pipeRightMostX = this.getPipeRightMostX();
        const pipeVerticalDistance = Phaser.Math.Between(
            tempLevel.pipeVerticalDistanceRange[0],
            tempLevel.pipeVerticalDistanceRange[1]
        );
        //center axis x
        const originCenter = this.config.height / 2 - pipeVerticalDistance / 2;
        const pipeVerticalPosition = Phaser.Math.Between(
            originCenter - tempLevel.amplitudePipe,
            originCenter + tempLevel.amplitudePipe
        );
        const pipeHorizontalDistance = Phaser.Math.Between(
            tempLevel.pipeHorizontalDistanceRange[0],
            tempLevel.pipeHorizontalDistanceRange[1]
        );
        const upperPipe = this.pipesGroup
            .create(
                pipeRightMostX + pipeHorizontalDistance,
                pipeVerticalPosition,
                ImagesScene.Pipe
            )
            .setFlipY(true)
            .setImmovable(true)
            .setOrigin(0, 1);
        const lowerPipe = this.pipesGroup
            .create(
                upperPipe.x,
                upperPipe.y + pipeVerticalDistance,
                ImagesScene.Pipe
            )
            .setImmovable(true)
            .setOrigin(0);

        upperPipe.setBodySize(upperPipe.width - 4, upperPipe.height);
        lowerPipe.setBodySize(lowerPipe.width - 4, lowerPipe.height);
        this.pipesGroup.setVelocityX(
            -GameDefault.PIPE_VELOCITY / tempLevel.changeFactor
        );
    }

    getPipeRightMostX() {
        let rightMostX = this.config.width / 2;
        this.pipesGroup.getChildren().forEach((pipe: any) => {
            rightMostX = Math.max(pipe.x, rightMostX);
        });
        return rightMostX;
    }

    recyclePipes() {
        if (this.firstClick) {
            let tempPipes: any = [];
            if (!this.pipesGroup) {
                this.createPipes();
            }
            this.pipesGroup.getChildren().forEach((pipe: any) => {
                if (pipe.getBounds().left <= 0) {
                    tempPipes.push(pipe);
                    if (tempPipes.length === 2) {
                        this.pipesGroup.getChildren().splice(0, 2);
                        this.placePipe();
                        this.increaseScore();
                        this.increaseLevel();
                    }
                }
            });
        }
    }

    increaseScore() {
        this.score++;
        this.scoreText.destroy();
        this.saveBestScoreAndLevel();
        this.createScore();
    }

    //listen event when resume
    listenToEvents() {
        if (this.pauseEvent) {
            return;
        }
        this.pauseEvent = this.events.on("resume", () => {
            if (this.countDownText) {
                this.countDownText.setText("");
            }
            this.initialTime = 3;
            this.countDownText = this.add
                .text(
                    this.screenCenter[0],
                    this.screenCenter[1],
                    this.initialTime.toString(),
                    { font: "80px Arial" }
                )
                .setOrigin(0.5);
            this.timeEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countDown,
                callbackScope: this,
                loop: true,
            });
        });
    }

    countDown() {
        this.initialTime--;
        this.countDownText.setText(this.initialTime.toString());
        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countDownText.setText("");
            this.physics.resume();
            this.timeEvent.remove();
        }
    }

    increaseLevel() {
        switch (this.score) {
            case Level.MEDIUM_LEVEL_SCORE:
                this.level = Level.MEDIUM_LEVEL;
                break;
            case Level.HARD_LEVEL_SCORE:
                this.level = Level.HARD_LEVEL;
                break;
            case Level.VERY_HARD_LEVEL_SCORE:
                this.level = Level.VERY_HARD_LEVEL;
                break;
            case Level.EXTRA_HARD_LEVEL_SCORE:
                this.level = Level.EXTRA_HARD_LEVEL;
                break;
            default:
                break;
        }
    }
}
