import Phaser from "phaser";
import { BestScoreScene } from "./scenes/bestScoreScene";
import { GameScene } from "./scenes/gameScene";
import { MenuScene } from "./scenes/menuScene";
import { PauseScene } from "./scenes/pauseScene";
import { PreloadScene } from "./scenes/preloadScene";
import CONFIG from "./config.js";

let game: Phaser.Game;

window.onload = function () {
    const BIRD_POSITION = { x: CONFIG.WIDTH * 0.1, y: CONFIG.HEIGHT / 2 };
    const SHARED_CONFIG = {
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
        birdPosition: BIRD_POSITION,
    };

    const scenes = [
        PreloadScene,
        MenuScene,
        BestScoreScene,
        GameScene,
        PauseScene,
    ];
    const createScene = (scene: any) => new scene(SHARED_CONFIG);
    const initScenes = scenes.map(createScene);

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        ...SHARED_CONFIG,
        physics: {
            default: "arcade",
            arcade: {
                // debug: true,
            },
        },
        scene: initScenes,
        pixelArt: true,
        // scale: {
        //     mode: Phaser.Scale.NONE,
        // },
    };

    game = new Phaser.Game(config);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
};

function resize() {
    let canvas: any;
    canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = Number(game.config.width) / Number(game.config.height);

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = windowWidth / gameRatio + "px";
    } else {
        canvas.style.width = windowHeight * gameRatio + "px";
        canvas.style.height = windowHeight + "px";
    }
}
