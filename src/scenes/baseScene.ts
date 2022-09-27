/** @type {Phaser.Scene} */

import Phaser from "phaser";
import { Client, Room } from "colyseus.js";

import { ObjectImages as ImagesScene } from "../enum/objects";

export class BaseScene extends Phaser.Scene {
    protected config: any;
    protected screenCenter: Array<number>;
    protected fontOptions: object;
    private fontSize: number;
    private lineHeight: number;

    //Server connection
    client = new Client("ws://localhost:2567");
    room!: Room;

    constructor(key: any, config: any) {
        super(key);
        this.config = config;
        this.screenCenter = [config.width / 2, config.height / 2];
        this.fontSize = 40;
        this.lineHeight = 120;
        this.fontOptions = {
            font: `${this.fontSize}px Arial`,
            fill: "#eae7d6",
        };
    }

    async create() {
        console.log("joining room....");
        try {
            this.room = await this.client.joinOrCreate("my_room");
            console.log("Joined successfully!", this.room);
        } catch (e) {
            console.error(e);
        }
        this.createBackground();
    }

    createBackground() {
        this.cameras.main.setBackgroundColor(0x46c0e9);
    }

    createMenu(menu: Array<object>, setupMenuEvents: any) {
        let lastMenuPositionY: number = 0;

        menu.forEach((menuItem: object) => {
            const menuPossition = [
                this.screenCenter[0],
                this.screenCenter[1] + lastMenuPositionY,
            ];
            menuItem["textGameObj"] = this.add
                .text(
                    menuPossition[0],
                    menuPossition[1],
                    menuItem["text"],
                    this.fontOptions
                )
                .setOrigin(0.5, 1.5)
                .setPadding(30, 20, 30, 20)
                .setStyle({
                    backgroundColor: "#5d7b6f",
                    borderRadius: "20px",
                    fixedWidth: 300,
                    align: "center",
                })
                .setInteractive({ useHandCursor: true });

            lastMenuPositionY += this.lineHeight;
            setupMenuEvents(menuItem);
        });
    }

    protected createBackButton() {
        const backButton = this.add
            .image(
                this.config.width - 10,
                this.config.height - 10,
                ImagesScene.Back
            )
            .setOrigin(1)
            .setScale(2)
            .setInteractive();

        backButton.on("pointerup", () => {
            this.scene.start("MenuScene");
        });
    }
}
