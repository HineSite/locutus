import { GameLoop } from './GameLoop.js';
import { Flyer } from './Flyer.js';
import { Boom } from './Boom.js';
import { SvgBackgroundMapper, SvgCircleItem, SvgLineItem } from "./SvgBackgroundMapper";

;(function ($) {
    $(function() {
        let debugLogs = false;
        let gameLoop = new GameLoop(onRun, onStart, null, null, null, 60);

        let viewport = $(window);
        let locutus = $('#locutus').get(0);
        let circle = $('#circle');
        let laser = $('#laser');
        let svgCircle = new SvgCircleItem(circle.get(0));
        let svgLaser = new SvgLineItem(laser.get(0));
        let bgMapper = new SvgBackgroundMapper(locutus.naturalWidth, locutus.naturalHeight, SvgBackgroundMapper.BackgroundOffset.CENTERED);
        bgMapper.addSvgItem(svgCircle);
        bgMapper.addSvgItem(svgLaser);

        bgMapper.updateView(viewport.width(), viewport.height());
        viewport.resize(function() {
            bgMapper.updateView(viewport.width(), viewport.height());
        });

        let flyers = [];
        let flyerWidth = 32;
        let flyerHeight = 41;
        let maxFlyers = 50;
        let flyerSpeed = 50; // px/s
        let flyerSpeedVariation = 30; // +- px/s

        let documentHasFocus = true;

        gameLoop.logger = (type, message) => {
            if (type !== GameLoop.LogType.DEBUG)
                logType(type, message);
        };

        gameLoop.initialize(() => {
            Flyer.initialize($('#comm-template').removeAttr('id'), $('#flyers'));
            Boom.initialize($('#boombox-template').removeAttr('id'), $('body'));

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

            // Shoot
            laser.removeClass('animate-fade');
            circle.removeClass('animate-fade');
            svgLaser.updateScaledPosition(this.posX + (flyerWidth * .5), this.posY + (flyerHeight * .5));

            setTimeout(() => {
                // Then reset shooter
                laser.addClass('animate-fade');
                circle.addClass('animate-fade');
                svgLaser.resetPosition();
            }, 200);
        }

        function onRun (delayMilli, delaySeconds) {
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

                    flyer.destroy();
                }

                log(GameLoop.LogType.DEBUG, 'flyer', flyer);
                flyer.move(delaySeconds);
            }

            // Remove destroyed flyers
            flyers = flyers.filter(flyer => !flyer.destroyed);
        }

        function onStart () {
            log(GameLoop.LogType.INFO, 'Loop State', 'Started');

            log(GameLoop.LogType.INFO, 'screenWidth', document.documentElement.clientWidth);
            log(GameLoop.LogType.INFO, 'screenHeight', document.documentElement.clientHeight);
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
