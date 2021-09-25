import { GameLoop } from './GameLoop.js';
import { Flyer } from './Flyer.js';

(function ($) {
    $(function() {
        let debugLogs = true;
        let gameLoop = new GameLoop(onRun, onStart, onStop, onPause, onResume, 60);

        let flyers = [];
        let flyerWidth = 32;
        let flyerHeight = 41;
        let maxFlyers = 50;
        let flyerSpeed = 50; // px/s
        let flyerSpeedVariation = 30; // +- px/s

        let documentHasFocus = true;

        Flyer.initialize($('#comm-template').removeAttr('id'), $('#flyers'));

        gameLoop.logger = (type, message) => {
            if (type !== GameLoop.LogType.DEBUG)
                logType(type, message);
        };

        gameLoop.initialize(() => {
            $(window).one('click', function () {
                gameLoop.start();
            });
        });

        function pause() {
            gameLoop.pause(() => {
                if (document.hasFocus()) {
                    documentHasFocus = true;
                    gameLoop.resume();
                }
            }, 600);
        }

        function createFlyer() {
            let pos = getRandom(1, 4);
            let flyer = null;

            if (pos === 1) {
                flyer = createFlyerTop();
            }
            else if (pos === 2) {
                flyer = createFlyerRight();
            }
            else if (pos ===3) {
                flyer = createFlyerBottom();
            }
            else {
                flyer = createFlyerLeft();
            }

            flyer.initialize();
            flyer.start();

            flyers.push(flyer);
        }

        function createFlyerTop() {
            let sign = getRandom(1, 2);
            let speedX = getRandomFlyerSpeed();
            speedX = (sign === 1 ? speedX : -speedX);

            return new Flyer(
                getRandom(0, document.documentElement.clientWidth),
                -flyerHeight,
                speedX,
                getRandomFlyerSpeed()
            );
        }

        function createFlyerRight() {
            let sign = getRandom(1, 2);
            let speedY = getRandomFlyerSpeed();
            speedY = (sign === 1 ? speedY : -speedY);

            return new Flyer(
                document.documentElement.clientWidth + flyerWidth,
                getRandom(0, document.documentElement.clientHeight),
                -getRandomFlyerSpeed(),
                speedY
            );
        }

        function createFlyerBottom() {
            let sign = getRandom(1, 2);
            let speedX = getRandomFlyerSpeed();
            speedX = (sign === 1 ? speedX : -speedX);

            return new Flyer(
                getRandom(0, document.documentElement.clientWidth),
                document.documentElement.clientHeight + flyerHeight,
                speedX,
                -getRandomFlyerSpeed()
            );
        }

        function createFlyerLeft() {
            let sign = getRandom(1, 2);
            let speedY = getRandomFlyerSpeed();
            speedY = (sign === 1 ? speedY : -speedY);

            return new Flyer(
                -flyerWidth,
                getRandom(0, document.documentElement.clientHeight),
                getRandomFlyerSpeed(),
                speedY
            );
        }

        function getRandomFlyerSpeed () {
            return getRandom(flyerSpeed - flyerSpeedVariation, flyerSpeed + flyerSpeedVariation);
        }

        function getRandom(min, max) {
            let rando = 0;

            while (!(rando = Math.random()));
            rando = Math.round(rando * (max - min) + min);

            return rando;
        }

        function isFlyerOffScreenX(posX) {
            return (posX > document.documentElement.clientWidth || posX < -flyerWidth);
        }

        function isFlyerOffScreenY(posY) {
            return (posY > document.documentElement.clientHeight || posY < -flyerHeight);
        }

        function onRun (delay) {
            if (!document.hasFocus()) {
                if (documentHasFocus) {
                    pause();
                }

                documentHasFocus = false;
                return;
            }

            // Fill flyers
            while (flyers.length < maxFlyers) {
                createFlyer();
            }

            let destroyedFlyers = [];
            let flyer = null;
            for (let i = 0; i < flyers.length; i++) {
                flyer = flyers[i];

                // If flyer has moved off screen
                if ((flyer.startX <= 0 && (isFlyerOffScreenY(flyer.posY) || flyer.posX > document.documentElement.clientWidth)) ||
                    (flyer.startY <= 0 && (isFlyerOffScreenX(flyer.posX) || flyer.posY > document.documentElement.clientHeight)) ||
                    (flyer.startX >= document.documentElement.clientWidth && (isFlyerOffScreenY(flyer.posY) || flyer.posX < -flyerWidth)) ||
                    (flyer.startY >= document.documentElement.clientHeight && (isFlyerOffScreenX(flyer.posX) || flyer.posY < -flyerHeight))) {

                    log(GameLoop.LogType.DEBUG, 'flyer', 'flyerId: ' + flyer.id + ' | flyerPos: ' + flyer.posX + 'x' + flyer.posY + ' | flyerStart: ' + flyer.startX + 'x' + flyer.startY);
                    flyer.destroy();
                    destroyedFlyers.push(flyer.id);
                }

                flyer.move(delay);
            }

            // Remove destroyed flyers
            flyers = flyers.filter(flyer => !destroyedFlyers.includes(flyer.id));
        }

        function onStart () {
            log(GameLoop.LogType.INFO, 'Loop State', 'Started');

            log(GameLoop.LogType.INFO, 'screenWidth', document.documentElement.clientWidth);
            log(GameLoop.LogType.INFO, 'screenHeight', document.documentElement.clientHeight);
        }

        function onStop () {
            if (gameLoop.loopState !== GameLoop.LoopState.STOPPED)
                return;

            log(GameLoop.LogType.INFO, 'Loop State', 'Stopped');
        }

        function onPause () {
            if (gameLoop.loopState !== GameLoop.LoopState.PAUSED)
                return;

            log(GameLoop.LogType.INFO, 'Loop State', 'Paused');
        }

        function onResume () {
            log(GameLoop.LogType.INFO, 'Loop State', 'Resumed');
        }

        function log(type, title, message) {
            logType(type, title + ': ' + message);
        }

        function logType(type, message) {
            if (!debugLogs && type === GameLoop.LogType.DEBUG)
                return;

            console.log(type.description + ' - ' + message);
        }
    });
})(jQuery);
