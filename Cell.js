const { mapRange, clamp01 } = require("canvas-sketch-util/math");

const { MAX_LUMINANCE, ...CONFIG } = require("./config");
const COLORS = require("./colors");
const util = require("./util");

class Cell {
    constructor(x, y, w, h, column, row) {
        this.column = column;
        this.row = row;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.setState(Math.random() > 0.5 ? 1.0 : 0.0);
        this.savePrevious();
        this.historyActive = 0;

        this.color = this.state
            ? COLORS.blue[util.randomInArray(COLORS.blue)]
            : COLORS.purple[util.randomInArray(COLORS.purple)];
    }

    savePrevious() {
        this.previousState = this.state;
    }

    setHistory(val) {
        this.historyActive += val;
    }

    setState(val) {
        if (val) this.setHistory(CONFIG.LUMINANCE_INCREMENT);
        else this.setHistory(CONFIG.LUMINANCE_DECREMENT * -1);

        this.historyActive = clamp01(this.historyActive);
        this.state = val;
    }

    render(ctx) {
        const bgColor = `hsl(0, 0%, ${MAX_LUMINANCE}%)`;
        const luminance = mapRange(this.historyActive, 0, 1, MAX_LUMINANCE, 30);

        ctx.fillStyle =
            this.historyActive === 0
                ? bgColor
                : `hsl(${this.color.h}, ${this.color.s}%, ${luminance}%)`;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    get active() {
        return this.previousState;
    }
}

module.exports = Cell;
