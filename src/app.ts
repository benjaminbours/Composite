const canvas = document.getElementById("menu") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

function draw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, 500, 500);
    // showAxes(context);
    context.save();

    customPlotSine(context, step, 50);
    context.restore();

    step += 4;
    window.requestAnimationFrame(draw);
}

function plotSine(ctx, xOffset, yOffset) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = 20;
    ctx.beginPath();
    ctx.lineWidth = 2;
    // ctx.strokeStyle = "rgb(66,44,255)";
    // console.log("Drawing point...");
    // drawPoint(ctx, yOffset+step);

    let x = 4;
    let y = 0;
    const amplitude = 60;
    const frequency = 50;
    // ctx.moveTo(x, y);
    ctx.moveTo(x, 50);
    while (x < width) {
        y = height / 2 + amplitude * Math.sin((x + xOffset) / frequency);
        ctx.lineTo(x, y);
        x++;
        // console.log("x="+x+" y="+y);
    }
    ctx.stroke();
    ctx.save();
    // console.log("Drawing point at y=" + y);
    // drawPoint(ctx, y);
    ctx.stroke();
    ctx.restore();
}

function customPlotSine(ctx, xOffset, yOffset) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.beginPath();
    ctx.lineWidth = 2;
    // ctx.strokeStyle = "rgb(66,44,255)";
    // console.log("Drawing point...");
    // drawPoint(ctx, yOffset+step);

    let x = 0;
    let y = 0;
    const amplitude = 60;
    const frequency = 50;
    // ctx.moveTo(x, y);
    ctx.moveTo(x, 50);
    while (x < width) {
        y = height / 2 + amplitude * Math.sin((x + xOffset) / frequency);
        ctx.lineTo(x, y);
        x++;
        // console.log("x="+x+" y="+y);
    }
    ctx.stroke();
    ctx.save();
    // console.log("Drawing point at y=" + y);
    // drawPoint(ctx, y);
    ctx.stroke();
    ctx.restore();
}

let step = 0;
draw();
