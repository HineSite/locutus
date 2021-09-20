;(function ($) {
    let flyerHeight = 41;
    let flyers = $();
    let commTemplate = $();
    let intervalCounter = 0;
    let commSize = (32*41); // Displayed resolution
    let maxFlyers = 50;
    let maxFlyersMagicNum = 0.041;

    function makeFlyer() {
        let flyerData = {
            speedX: getRandom(100, 250) / 100,
            speedY: (Math.random() < 0.5 ? -1 : 1) * (getRandom(100, 250) / 100),
            stop: false
        };

        let flyer = commTemplate.clone();
        flyer.removeAttr('id');
        flyer.addClass('comm-flyer');
        flyer.data('flyer-data', flyerData);
        flyer.css({
            top: (-flyerHeight + 'vh'),
            left: (getRandom(1, 99) + 'vw')
        });

        flyers.append(flyer);

        flyer.show();
    }

    function getRandom(min, max) {
        let rando = 0;

        while (!(rando = Math.random()));
        rando = Math.round(rando * (max - min) + min);

        return rando;
    }

    let loopTime;
    function mainLoop () {
        setTimeout(function () {
            if (loopTime) {
                console.log(Date.now() - loopTime);
            }
            loopTime = Date.now();

            let currOffset = {};
            let data = {};

            intervalCounter++;
            if ((intervalCounter % 5) === 0) {
                intervalCounter = 0;

                if (flyers.children().length < 50)
                    makeFlyer();
            }

            for (let i = 0; i <= (flyers.children().length - 1); i++) {
                let flyer = flyers.children().eq(i);

                currOffset = flyer.offset();
                data = flyer.data('flyer-data');

                if (data.stop) {
                    continue;
                }

                currOffset.top += data.speedX;
                currOffset.left += data.speedY;

                if (currOffset.top > document.documentElement.clientHeight || currOffset.left > document.documentElement.clientWidth || currOffset.left < -32) {
                    flyer.remove();
                    continue;
                }

                flyer.css({
                    top: (currOffset.top + 'px'),
                    left: (currOffset.left + 'px')
                });
            }

            mainLoop();
        }, 50);
    }

    function launchFlyers() {
        makeFlyer();

        mainLoop();
    }

    $(function () {
        flyers = $('#flyers');
        commTemplate = $('#comm-template');
        flyerHeight = flyerHeight * (100 / document.documentElement.clientHeight);
        maxFlyers = (document.documentElement.clientWidth * document.documentElement.clientHeight * commSize * maxFlyersMagicNum)

        $('.locutus').one('click', function () {
            $('#locutus-laser').fadeOut();
            launchFlyers();
        });
    });
})(jQuery);
