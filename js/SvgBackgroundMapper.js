export class SvgCircleItem {
    #element = HTMLElement;

    #orgR = 0;
    #orgX = 0;
    #orgY = 0;

    #r = 0;
    #x = 0;
    #y = 0;

    #scaledR = 0;
    #scaledX = 0;
    #scaledY = 0;

    #scale = 0;
    #offsets = {};

    constructor(element) {
        this.#element = element;
        this.#orgR = element.getAttribute('r');
        this.#orgX = element.getAttribute('cx');
        this.#orgY = element.getAttribute('cy');

        this.#r = this.#orgR;
        this.#x = this.#orgX;
        this.#y = this.#orgY;
    }

    // Update the position of the circle based on real(?) coordinates.
    updatePosition(r, x, y) {
        if (r)
            this.#r = r;

        if (x)
            this.#x = x;

        if (y)
            this.#y = y;

        this.updateView(this.#scale, this.#offsets);
    }

    // Update the position of the circle based on the current scaled coordinates.
    updateScaledPosition(r, x, y) {
        if (r) {
            this.#r = (r / this.#scale);
        }

        if (x) {
            this.#x = (x + this.#offsets.x) / this.#scale;
        }

        if (y) {
            this.#y = (y + this.#offsets.y) / this.#scale;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Updates the scaled position of the circle.
    updateView(scale, offsets) {
        this.#scale = scale;
        this.#offsets = offsets;

        this.#scaledR = (this.#r * scale);
        this.#scaledX = ((this.#x * scale) - offsets.x);
        this.#scaledY = ((this.#y * scale) - offsets.y);

        this.#element.setAttribute('r', this.#scaledR);
        this.#element.setAttribute('cx', this.#scaledX);
        this.#element.setAttribute('cy', this.#scaledY);
    }

    // Resets the current coords to the original coords.
    resetPosition() {
        this.#r = this.#orgR;
        this.#x = this.#orgX;
        this.#y = this.#orgY;

        this.updateView(this.#scale, this.#offsets);
    }
}

export class SvgLineItem {
    #element = HTMLElement;
    #orgX1 = 0;
    #orgY1 = 0;
    #orgX2 = 0;
    #orgY2 = 0;

    #x1 = 0;
    #y1 = 0;
    #x2 = 0;
    #y2 = 0;

    #scaledX1 = 0;
    #scaledY1 = 0;
    #scaledX2 = 0;
    #scaledY2 = 0;

    #scale = 0;
    #offsets = {};

    constructor(element) {
        this.#element = element;
        this.#orgX1 = element.getAttribute('x1');
        this.#orgY1 = element.getAttribute('y1');
        this.#orgX2 = element.getAttribute('x2');
        this.#orgY2 = element.getAttribute('y2');

        this.#x1 = this.#orgX1;
        this.#y1 = this.#orgY1;
        this.#x2 = this.#orgX2;
        this.#y2 = this.#orgY2;
    }

    // Update the position of the circle based on real(?) coordinates.
    updatePosition(x1, y1, x2, y2) {
        if (x1) {
            this.#x1 = x1;
        }

        if (y1) {
            this.#y1 = y1;
        }

        if (x2) {
            this.#x2 = x2;
        }

        if (y2) {
            this.#y2 = y2;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Update the position of the circle based on the current scaled coordinates.
    updateScaledPosition(x1, y1, x2, y2) {
        if (x1) {
            this.#x1 = (x1 + this.#offsets.x) / this.#scale;
        }

        if (y1) {
            this.#y1 = (y1 + this.#offsets.y) / this.#scale;
        }

        if (x2) {
            this.#x2 = (x2 + this.#offsets.x) / this.#scale;
        }

        if (y2) {
            this.#y2 = (y2 + this.#offsets.y) / this.#scale;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Updates the scaled position of the circle.
    updateView(scale, offsets) {
        this.#scale = scale;
        this.#offsets = offsets;

        this.#scaledX1 = ((this.#x1 * scale) - offsets.x);
        this.#scaledY1 = ((this.#y1 * scale) - offsets.y);
        this.#scaledX2 = ((this.#x2 * scale) - offsets.x);
        this.#scaledY2 = ((this.#y2 * scale) - offsets.y);

        this.#element.setAttribute('x1', this.#scaledX1);
        this.#element.setAttribute('y1', this.#scaledY1);
        this.#element.setAttribute('x2', this.#scaledX2);
        this.#element.setAttribute('y2', this.#scaledY2);
    }

    // Resets the current coords to the original coords.
    resetPosition() {
        this.#x1 = this.#orgX1;
        this.#y1 = this.#orgY1;
        this.#x2 = this.#orgX2;
        this.#y2 = this.#orgY2;

        this.updateView(this.#scale, this.#offsets);
    }
}

export class SvgBackgroundMapper {
    static BackgroundOffset = Object.freeze({
        NONE:           Symbol("None"),
        CENTERED:       Symbol("Centered")
    });

    #backgroundWidth = 0;
    #backgroundHeight = 0;
    #backgroundRatio = 0;
    #backgroundOffset = SvgBackgroundMapper.BackgroundOffset.NONE;
    #svgItems = [];

    constructor(backgroundWidth, backgroundHeight, backgroundOffset) {
        this.changeBackground(backgroundWidth, backgroundHeight, backgroundOffset);
    }

    changeBackground(backgroundWidth, backgroundHeight, backgroundOffset) {
        this.#backgroundWidth = backgroundWidth;
        this.#backgroundHeight = backgroundHeight;
        this.#backgroundOffset = backgroundOffset;
        this.#backgroundRatio = (backgroundWidth / backgroundHeight);
    }

    updateView (viewportWidth, viewportHeight) {
        let viewportRatio = (viewportWidth / viewportHeight);
        let currentWidth = 0;
        let currentHeight = 0;

        // Note: I think this logic will only work if the background image is set to cover?
        // ToDo: Test other background positions and offsets.
        if (viewportRatio > this.#backgroundRatio)
        {
            // Here the background's height is larger than the viewport's height.

            currentWidth = viewportWidth;
            currentHeight = (viewportWidth / this.#backgroundRatio);
        }
        else
        {
            // Here the background's width is larger than the viewport's width.

            currentWidth = (viewportHeight * this.#backgroundRatio);
            currentHeight = viewportHeight;
        }

        let scale = (currentWidth / this.#backgroundWidth);

        // The background image is centered in the viewport, so we need to calculate for that.
        let offsets = this.#getOffset(viewportWidth, viewportHeight, currentWidth, currentHeight);

        for (let svgItem of this.#svgItems) {
            svgItem.updateView(scale, offsets);
        }
    }

    addSvgItem(svgItem) {
        this.#svgItems.push(svgItem);
    }

    #getOffset(viewportWidth, viewportHeight, currentWidth, currentHeight) {
        let offsets = {
            x: 0,
            y: 0
        };

        switch (this.#backgroundOffset) {
            case SvgBackgroundMapper.BackgroundOffset.CENTERED: {
                offsets.x = ((currentWidth - viewportWidth) * .5);
                offsets.y = ((currentHeight - viewportHeight) * .5)

                break;
            }
        }

        return offsets;
    }
}
