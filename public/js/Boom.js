export class Boom {
    static #boomBoxTemplate = $();
    static #boomBoxHolder = $();
    static #idCounter = 0;

    #boomBox = $();
    #id = 0;
    #top = 0;
    #left = 0;

    constructor(top, left) {
        this.#id = Boom.#idCounter++;
        this.#boomBox = Boom.#boomBoxTemplate.clone().attr('id', 'boombox_' + this.#id).addClass('comm-flyer');
        Boom.#boomBoxHolder.append(this.#boomBox);
        this.#top = top;
        this.#left = left;
    }

    static initialize(boomBoxTemplate, boomBoxHolder) {
        this.#boomBoxTemplate = boomBoxTemplate;
        this.#boomBoxHolder = boomBoxHolder;
    }

    runAnimation () {
        this.#boomBox.css({
            top: this.#top,
            left: this.#left,
            display: 'block'
        });

        this.#boomBox.find('.box').each((i, e) => {
            $(e).animate({
                top: Boom.#getRandomWithNegative(100),
                left: Boom.#getRandomWithNegative(100),
                opacity: 0
            }, {
                duration: 500,
                complete: () => {
                    this.#boomBox.remove();
                }
            });
        });
    }

    static #getRandomWithNegative(max) {
        let random = Math.random();
        let negative = random < .5;

        let rando = (random * max);
        return (negative ? -rando : rando);
    }
}
