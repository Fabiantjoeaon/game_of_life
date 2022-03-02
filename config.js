const RESOLUTION = 1024;
// Option: size 100 - 150
const GRID_SIZE = 150;

module.exports = {
    WIDTH: RESOLUTION,
    HEIGHT: RESOLUTION,
    // Exploring grid with more y values is interesting, moire effect
    GRID_X: GRID_SIZE,
    GRID_Y: GRID_SIZE,
    // Option: spacing 0 - 4
    SPACING: 1,

    LUMINANCE_INCREMENT: 0.1,
    LUMINANCE_DECREMENT: 0.01,
    MAX_LUMINANCE: 0,

    SPAWN_NEW_LIFE_NEIGHBOUR_RANGE: 5,

    RULESET: "REGULAR",

    FPS: 10,
};
// TODO: make config class which automatically converts to gui etc.

// Regular:
// LUMINANCE_INCREMENT: 0.1,
// LUMINANCE_DECREMENT: 0.01,

// Regular increased:
// LUMINANCE_INCREMENT: 1,
// LUMINANCE_DECREMENT: 0.1,

// Swarm:
// LUMINANCE_INCREMENT: 1,
// LUMINANCE_DECREMENT: 0.1,
