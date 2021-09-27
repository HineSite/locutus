export class SvgCircleItem {
    #element = HTMLElement;

    #org = {};
    #current = {};
    #scaled = {};

    #scale = 0;
    #offsets = {};

    constructor(element) {
        this.#element = element;
        this.#org = this.#makeVariables(
            element.getAttribute('r'),
            element.getAttribute('cx'),
            element.getAttribute('cy')
        );

        Object.assign(this.#current, this.#org);
    }

    // Update the position of the circle based on real(?) coordinates.
    updatePosition(r, x, y) {
        if (r)
            this.#current.r = r;

        if (x)
            this.#current.x = x;

        if (y)
            this.#current.y = y;

        this.updateView(this.#scale, this.#offsets);
    }

    // Update the position of the circle based on the current scaled coordinates.
    updateScaledPosition(r, x, y) {
        if (r) {
            this.#current.r = (r / this.#scale);
        }

        if (x) {
            this.#current.x = (x + this.#offsets.x) / this.#scale;
        }

        if (y) {
            this.#current.y = (y + this.#offsets.y) / this.#scale;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Updates the scaled position of the circle.
    updateView(scale, offsets) {
        this.#scale = scale;
        this.#offsets = offsets;

        this.#scaled.r = (this.#current.r * scale);
        this.#scaled.x = ((this.#current.x * scale) - offsets.x);
        this.#scaled.y = ((this.#current.y * scale) - offsets.y);

        this.#element.setAttribute('r', this.#scaled.r);
        this.#element.setAttribute('cx', this.#scaled.x);
        this.#element.setAttribute('cy', this.#scaled.y);
    }

    // Resets the current coords to the original coords.
    resetPosition() {
        Object.assign(this.#current, this.#org);

        this.updateView(this.#scale, this.#offsets);
    }

    #makeVariables (r, x, y) {
        return {
            r: r,
            x: x,
            y: y
        };
    }
}

export class SvgLineItem {
    #element = HTMLElement;

    #org = {};
    #current = {};
    #scaled = {};

    #scale = 0;
    #offsets = {};

    constructor(element) {
        this.#element = element;
        this.#org = this.#makeVariables(
            element.getAttribute('x1'),
            element.getAttribute('y1'),
            element.getAttribute('x2'),
            element.getAttribute('y2')
        );

        Object.assign(this.#current, this.#org);
    }

    // Update the position of the circle based on real(?) coordinates.
    updatePosition(x1, y1, x2, y2) {
        if (x1) {
            this.#current.x1 = x1;
        }

        if (y1) {
            this.#current.y1 = y1;
        }

        if (x2) {
            this.#current.x2 = x2;
        }

        if (y2) {
            this.#current.y2 = y2;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Update the position of the circle based on the current scaled coordinates.
    updateScaledPosition(x1, y1, x2, y2) {
        if (x1) {
            this.#current.x1 = (x1 + this.#offsets.x) / this.#scale;
        }

        if (y1) {
            this.#current.y1 = (y1 + this.#offsets.y) / this.#scale;
        }

        if (x2) {
            this.#current.x2 = (x2 + this.#offsets.x) / this.#scale;
        }

        if (y2) {
            this.#current.y2 = (y2 + this.#offsets.y) / this.#scale;
        }

        this.updateView(this.#scale, this.#offsets);
    }

    // Updates the scaled position of the circle.
    updateView(scale, offsets) {
        this.#scale = scale;
        this.#offsets = offsets;

        this.#scaled.x1 = ((this.#current.x1 * scale) - offsets.x);
        this.#scaled.y1 = ((this.#current.y1 * scale) - offsets.y);
        this.#scaled.x2 = ((this.#current.x2 * scale) - offsets.x);
        this.#scaled.y2 = ((this.#current.y2 * scale) - offsets.y);

        this.#element.setAttribute('x1', this.#scaled.x1);
        this.#element.setAttribute('y1', this.#scaled.y1);
        this.#element.setAttribute('x2', this.#scaled.x2);
        this.#element.setAttribute('y2', this.#scaled.y2);
    }

    // Resets the current coords to the original coords.
    resetPosition() {
        Object.assign(this.#current, this.#org);

        this.updateView(this.#scale, this.#offsets);
    }

    #makeVariables (x1, y1, x2, y2) {
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };
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
