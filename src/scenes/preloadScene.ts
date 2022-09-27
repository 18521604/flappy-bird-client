/** @type {Phaser.Scene} */

import Phaser from "phaser";
import { ObjectImages as ImagesScene } from "../enum/objects";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.path = "assets/";
        this.load.image(ImagesScene.Title, "title-2.png");
        this.load.image(ImagesScene.Cloud, "cloud-2.png");
        this.load.spritesheet(ImagesScene.Bird, "birdSprite.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.image(ImagesScene.Pipe, "pipe-3.png");
        this.load.image(ImagesScene.Pause, "pause.png");
        this.load.image(ImagesScene.Back, "back.png");
    }

    create() {
        this.scene.start("MenuScene");
    }
}
