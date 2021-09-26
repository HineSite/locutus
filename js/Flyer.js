export class Flyer {
    static #flyerTemplate = $();
    static #flyersHolder = $();
    static #idCounter = 0;

    #flyer = $();
    #id = 0;
    #startX = 0;
    #startY = 0;
    #speedX = 0;
    #speedY = 0;
    #posX = 0;
    #posY = 0;
    #moving = false;
    #destroyed = false;

    constructor(startX, startY, speedX, speedY) {
        this.#id = Flyer.#idCounter++;
        this.#startX = startX;
        this.#startY = startY;
        this.#speedX = speedX;
        this.#speedY = speedY;
        this.#posX = startX;
        this.#posY = startY;
    }

    static initialize(flyerTemplate, flyersHolder) {
        this.#flyerTemplate = flyerTemplate;
        this.#flyersHolder = flyersHolder;
    }

    initialize() {
        this.#flyer = Flyer.#flyerTemplate.clone().attr('id', 'flyer_' + this.#id).addClass('comm-flyer');
        Flyer.#flyersHolder.append(this.#flyer);

        this.#flyer.css({
            display: "block",
            top: this.#startY,
            left: this.#startX
        });
    }

    move(delay) {
        if (!this.#moving) {
            return;
        }

        this.#posX += (this.#speedX * delay);
        this.#posY += (this.#speedY * delay);

        this.#flyer.css({
            top: this.#posY,
            left: this.#posX
        });
    }

    start() {
        this.#moving = true;
    }

    stop() {
        this.#moving = false;
    }

    destroy() {
        this.#flyer.remove();
        this.#destroyed = true;
    }

    onMouseDown(callback) {
        if (typeof callback === 'function') {
            this.#flyer.one('mousedown', (event) => {
                event.preventDefault();
                event.stopPropagation();

                callback.bind(this)();
            });
        }
    }

    toString() {
        return 'id: ' + this.#id + ' | ' +
                'startX: ' + this.#startX + ' | ' +
                'startY: ' + this.#startY + ' | ' +
                'speedX: ' + this.#speedX + ' | ' +
                'speedY: ' + this.#speedY + ' | ' +
                'posX: ' + this.#posX + ' | ' +
                'posY: ' + this.#posY + ' | ' +
                'moving: ' + this.#moving + ' | ' +
                'destroyed: ' + this.#destroyed
        ;
    }

    get id() {
        return this.#id;
    }

    get posX() {
        return this.#posX;
    }

    get posY() {
        return this.#posY;
    }

    get startX() {
        return this.#startX;
    }

    get startY() {
        return this.#startY;
    }

    get destroyed() {
        return this.#destroyed;
    }
}
