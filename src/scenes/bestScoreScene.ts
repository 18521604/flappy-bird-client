/** @type {Phaser.Scene} */

import { BaseScene } from "./baseScene";

export class BestScoreScene extends BaseScene {
    constructor(config: any) {
        super("BestScoreScene", config);
    }

    create() {
        super.create();

        const bestScore = localStorage.getItem("bestScore");
        this.add
            .text(
                this.screenCenter[0],
                this.screenCenter[1],
                `Best Score: ${bestScore || 0}`,
                this.fontOptions
            )
            .setOrigin(0.5);

        this.createBackButton();
    }
}
