import { GameLoop } from './GameLoop.js';
import { Flyer } from './Flyer.js';
import { Boom } from './Boom.js';

;(function ($) {
    $(function() {
        let debugLogs = false;
        let gameLoop = new GameLoop(onRun, onStart, onStop, onPause, onResume, 60);

        let flyers = [];
        let flyerWidth = 32;
        let flyerHeight = 41;
        let maxFlyers = 50;
        let flyerSpeed = 50; // px/s
        let flyerSpeedVariation = 30; // +- px/s

        let documentHasFocus = true;

        Flyer.initialize($('#comm-template').removeAttr('id'), $('#flyers'));
        Boom.initialize($('#boombox-template').removeAttr('id'), $('body'));

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
            let startingEdge = getRandom(1, 4);
            let flyerSettings = {};

            switch (startingEdge) {
                case 1: { // start from top of screen
                    flyerSettings = {
                        startX: getRandom(0, document.documentElement.clientWidth),
                        startY: -flyerHeight,
                        speedX: getRandomFlyerSpeed(true),
                        speedY: getRandomFlyerSpeed(false)
                    };

                    break;
                }

                case 2: { // start from right of screen
                    flyerSettings = {
                        startX: document.documentElement.clientWidth + flyerWidth,
                        startY: getRandom(0, document.documentElement.clientHeight),
                        speedX: -getRandomFlyerSpeed(false),
                        speedY: getRandomFlyerSpeed(true)
                    };

                    break;
                }

                case 3: { // start from bottom of screen
                    flyerSettings = {
                        startX: getRandom(0, document.documentElement.clientWidth),
                        startY: document.documentElement.clientHeight + flyerHeight,
                        speedX: getRandomFlyerSpeed(true),
                        speedY: -getRandomFlyerSpeed(false)
                    };

                    break;
                }

                default: { // start from left of screen
                    flyerSettings = {
                        startX: -flyerWidth,
                        startY: getRandom(0, document.documentElement.clientHeight),
                        speedX: getRandomFlyerSpeed(false),
                        speedY: getRandomFlyerSpeed(true)
                    };

                    break;
                }
            }

            let flyer = new Flyer(
                flyerSettings.startX,
                flyerSettings.startY,
                flyerSettings.speedX,
                flyerSettings.speedY
            );

            flyer.initialize();
            flyer.onMouseDown(flyerOnMouseDown);
            flyer.start();

            flyers.push(flyer);
        }

        function getRandomFlyerSpeed (includeNegative) {
            let speed = getRandom(flyerSpeed - flyerSpeedVariation, flyerSpeed + flyerSpeedVariation);

            if (includeNegative) {
                let sign = getRandom(1, 2);
                speed = (sign === 1 ? speed : -speed);
            }

            return speed;
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

        function flyerOnMouseDown()
        {
            this.stop();
            new Boom(this.posY, this.posX).runAnimation();
            this.destroy();

            let circle = $('#circle');
            let laser = $('#laser');

            let orgX1 = laser.attr('x1');
            let orgY1 = laser.attr('y1');

            // Shoot
            laser.removeClass('animate-fade');
            circle.removeClass('animate-fade');
            laser.attr('x1', this.posX + (flyerWidth * .5));
            laser.attr('y1', this.posY + (flyerHeight * .5));

            setTimeout(() => {
                // Then reset shooter
                laser.addClass('animate-fade');
                circle.addClass('animate-fade');
                laser.attr('x1', orgX1);
                laser.attr('y1', orgY1);
            }, 200);
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
                }

                flyer.move(delay);
            }

            // Remove destroyed flyers
            flyers = flyers.filter(flyer => !flyer.destroyed);
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
