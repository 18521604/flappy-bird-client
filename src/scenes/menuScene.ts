/** @type {Phaser.Scene} */
import { ObjectImages as ImagesScene } from "../enum/objects";
import { BaseScene } from "./baseScene";

export class MenuScene extends BaseScene {
    private menu: Array<object>;
    constructor(config: any) {
        super("MenuScene", config);
        this.menu = [
            { scene: "GameScene", text: "Play" },
            { scene: "BestScoreScene", text: "Score" },
            { scene: null, text: "Exit" },
        ];
    }

    create() {
        super.create();
        this.add.image(
            this.config.width / 2,
            this.config.height / 4,
            ImagesScene.Title
        );
        this.createMenu(this.menu, this.setUpMenuEvents.bind(this));
    }

    setUpMenuEvents(menuItem: object) {
        const textGameObj = menuItem["textGameObj"];
        textGameObj.setInteractive();
        textGameObj.on("pointerover", () => {
            textGameObj.setStyle({ fill: "#fff" });
        });
        textGameObj.on("pointerout", () => {
            textGameObj.setStyle({ fill: "#eae7d6" });
        });
        textGameObj.on("pointerup", () => {
            this.scene.start(menuItem["scene"]);

            if (menuItem["text"] === "Exit") {
                this.game.destroy(true);
            }
        });
    }
}
