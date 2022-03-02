const canvasSketch = require("canvas-sketch");
const Grid = require("./Grid");

const { WIDTH, HEIGHT, FPS, MAX_LUMINANCE } = require("./config");

const sketch = ({ canvas, context }) => {
    canvas.style.boxShadow = "none";
    const bgColor = `hsl(0, 0%, ${MAX_LUMINANCE}%)`;
    document.body.style.backgroundColor = bgColor;

    //let generation = 0;

    const grid = new Grid();

    let previousTime = -1;

    return ({ context: ctx, width, height, playhead, time }) => {
        const deltaTime =
            previousTime === -1 ? 0 : (time - previousTime) / 1000;
        const lerpFrac = deltaTime * 1000;
        ctx.fillStyle = `hsl(0, 0%, ${MAX_LUMINANCE}%)`;
        ctx.clearRect(0, 0, width, height);

        grid.savePreviousValues();
        grid.calculateNextGenerationAndRender(ctx);

        previousTime = time;
    };
};

canvasSketch(sketch, {
    animate: true,
    dimensions: [WIDTH, HEIGHT],
    fps: FPS,
    playbackRate: "throttle",
});
