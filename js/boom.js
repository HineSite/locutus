;(function ($) {
    let circle = $('#circle');
    let laser = $('#laser');
    let boomBoxTemplate = $('#boombox-template')

    let circleX = 200;
    let circleY = 70;

    circle.attr({
        cx: circleX,
        cy: circleY
    });

    laser.attr({
        x1: circleX,
        y1: circleY,
        x2: circleX,
        y2: circleY
    });

    $('body').on('mousedown', '.comm-flyer', function (event) {
        let badge = $(this);
        let boomBox = boomBoxTemplate.clone().removeAttr('id').appendTo('body');

        laser.attr({
            x2: event.pageX,
            y2: event.pageY
        });

        badge.animate({
            width: "48px",
            height: "62px"
        });

        let badgeOffset = badge.offset();
        badge.hide();
        boomBox.css({
            top: badgeOffset.top,
            left: badgeOffset.left,
            display: 'block'
        });

        boomBox.find('.box').each(function (i, e) {
            $(this).animate({
                top: getRandomWithNegative(100),
                left: getRandomWithNegative(100),
                opacity: 0
            }, {
                duration: 500,
                complete: function () {
                    boomBox.remove();
                }
            });
        });

        // Reset laser
        setTimeout(function () {
            laser.attr({
                x2: circleX,
                y2: circleY
            });
        }, 50);
    });

    function getRandomWithNegative(max) {
        let random = Math.random();
        let negative = random < .5;

        let rando = (random * max);
        return (negative ? -rando : rando);
    }
})(jQuery);
