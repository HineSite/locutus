;(function ($) {
    var flyerHeight = 41;
    var flyers = $();
    var commTemplate = $();

    function makeFlyer() {
        var flyerData = {
            speedX: getRandom(250) / 100,
            speedY: (Math.random() < 0.5 ? -1 : 1) * (getRandom(250) / 100),
        };

        var flyer = commTemplate.clone();
        flyer.removeAttr('id');
        flyer.addClass('comm-flyer');
        flyer.data('flyer-data', flyerData);
        flyer.css({
            top: (-flyerHeight + 'vh'),
            left: (getRandom(99) + 'vw')
        });

        flyers.append(flyer);

        flyer.show();
    }

    function getRandom(max) {
        return Math.floor((Math.random() * max) + 1);
    }

    function launchFlyers() {
        makeFlyer();

        var intervalCounter = 0;
        setInterval(function () {
            var currOffset = {};
            var data = {};

            intervalCounter++;
            if ((intervalCounter % 50) == 0) {
                intervalCounter = 0;
                makeFlyer();
            }

            for (var i = 0; i <= (flyers.children().length - 1); i++) {
                var flyer = flyers.children().eq(i);

                currOffset = flyer.offset();
                data = flyer.data('flyer-data');

                currOffset.top += data.speedX;
                currOffset.left += data.speedY;

                if (currOffset.top > document.documentElement.clientHeight || currOffset.left > document.documentElement.clientWidth || currOffset.left < -32) {
                    flyer.remove();
                    return;
                }

                flyer.css({
                    top: (currOffset.top + 'px'),
                    left: (currOffset.left + 'px')
                });

            }
        }, 10);
    }

    $(function () {
        flyers = $('#flyers');
        commTemplate = $('#comm-template');
        flyerHeight = flyerHeight * (100 / document.documentElement.clientHeight);

        $('.locutus').one('click', function () {
            launchFlyers();
        });
    });
})(jQuery);
