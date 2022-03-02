const {
    WIDTH,
    HEIGHT,
    MAX_LUMINANCE,
    GRID_X,
    GRID_Y,
    SPACING,
    ...CONFIG
} = require("./config");
const Cell = require("./Cell");

class Grid {
    constructor() {
        this.createCells();
    }

    createCells() {
        this.cells = [...Array(GRID_X).keys()].map((xi) =>
            [...Array(GRID_Y).keys()].map((yi) => {
                const w = WIDTH / GRID_X - SPACING;
                const h = HEIGHT / GRID_Y - SPACING;
                const x = (w + SPACING) * xi + SPACING / 2;
                const y = (h + SPACING) * yi + SPACING / 2;

                return new Cell(x, y, w, h, xi, yi);
            })
        );
    }

    iterateCells(callback) {
        for (let c = 0; c < GRID_X; c++) {
            for (let r = 0; r < GRID_Y; r++) {
                callback(this.cells[c][r]);
            }
        }
    }

    savePreviousValues() {
        this.iterateCells((cell) => {
            cell.savePrevious();
        });
    }

    calculateNextGenerationAndRender(ctx) {
        this.iterateCells((cell) => {
            const nextState = this.calculateNextGeneration(cell);
            cell.setState(nextState);
            cell.render(ctx);
        });
    }

    calculateNextGeneration(cell) {
        const totalActiveNeighbours = this.calculateActiveNeighbours(1, cell);
        const rangedNeighbours = this.calculateActiveNeighbours(
            CONFIG.SPAWN_NEW_LIFE_NEIGHBOUR_RANGE,
            cell
        );

        if (rangedNeighbours === 0) {
            return 1;
        }

        // B3 / S23
        // if (totalActiveNeighbours < 2) return 0;
        // if (totalActiveNeighbours > 3) return 0;
        // if (totalActiveNeighbours === 3) return 1;
        // else return cell.active;

        // B3456 / S23
        // 4 and 5 are factors for heavy overpopulation
        if (CONFIG.RULESET === "REGULAR") {
            if (totalActiveNeighbours < 2) return 0;
            if (totalActiveNeighbours > 3) return 0;
            if (totalActiveNeighbours === 3) return 1;
            else return cell.active;
        }

        if (CONFIG.RULESET === "SWARM") {
            if (totalActiveNeighbours === 4) return 1;
            if (totalActiveNeighbours < 2) return 0;
            if (totalActiveNeighbours > 3) return 0;
            if (totalActiveNeighbours === 3) return 1;
            else return cell.active;
        }

        if (totalActiveNeighbours < 2) return 0;
        if (totalActiveNeighbours > 3) return 0;
        if (totalActiveNeighbours === 3) return 1;
        else return cell.active;

        // B6 / S16
        // if (totalActiveNeighbours < 1) return 1;
        // if (totalActiveNeighbours > 6) return 0;
        // if (totalActiveNeighbours === 6) return 1;
        // else return 0;
    }

    calculateActiveNeighbours(range, cell) {
        const isOnGrid = (c, r) => c >= 0 && r >= 0 && c < GRID_X && r < GRID_Y;
        let total = 0;

        for (let cc = range * -1; cc <= range; cc++) {
            for (let rr = range * -1; rr <= range; rr++) {
                // Can't be neighbour to itself
                if (cc === 0 && rr === 0) continue;
                // Only 4 cells as neighbourhood
                // if (Math.abs(cc) + Math.abs(rr) > 1) continue;

                let nextC = cell.column + cc;
                let nextR = cell.row + rr;

                if (!isOnGrid(nextC, nextR)) {
                    // TODO: Wraparound logic
                    // console.log(nextC, nextR)
                }
                if (isOnGrid(nextC, nextR)) {
                    if (this.cells[nextC][nextR].active) total += 1;
                }
            }
        }

        return total;
    }
}

module.exports = Grid;
