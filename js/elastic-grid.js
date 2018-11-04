
var canvas = document.getElementById('canvas'),
    w, h,
    ctx = canvas.getContext('2d'),
    mouse, touchStop, ax, ay, az, pax, pay, paz,
    options,
    lines,
    start = Date.now();

// options = {
//     "line_default_color": "#f2f2f2",
//     "line_active_color": "#787878",
//     "bg_color": "#FFFFFF",
//     "columns": 7.994657935550578,
//     "resolution": 22.589178011373427,
//     "grid_width": 1,
//     "tension": 0.1672945028433569,
//     "dampen": 0.05747957952783044,
//     "color_decay": 1,
//     "k": 0.021951145958986732,
//     "mouse_influence": 1,
//     "click": "random",
//     "click_strength": 1000
// }

var options = new function() {
    this.line_default_color = "#f2f2f2";
    this.line_active_color = "#787878";
    this.bg_color = "#FFFFFF";
    this.columns = 16;
    this.resolution = 22.589178011373427;
    this.grid_width = 1;
    this.tension = 0.1672945028433569;
    this.dampen = 0.05747957952783044;
    this.color_decay = 1;
    this.k = 0.021951145958986732;
    this.mouse_influence = 1;
    this.click = "random";
    this.click_strength = 100;
}

var gui = new dat.GUI({ load: getPresetJSON(), preset: 'acid' });

var folder_colors = gui.addFolder('Colors');
var folder_wave = gui.addFolder('Wave');
gui.remember(options);

var controller_line_default_color = folder_colors.addColor(options, 'line_default_color');
folder_colors.addColor(options, 'line_active_color');
folder_colors.addColor(options, 'bg_color');
var controller_resolution = folder_wave.add(options, 'columns', 1, 100).step(1);
var controller_columns = folder_wave.add(options, 'resolution', 5, 300).step(1);
var controller_grid_width = folder_wave.add(options, 'grid_width', 1, 200);
folder_wave.add(options, 'tension', 0.01, 1);
folder_wave.add(options, 'dampen', 0.002, 0.2);
folder_wave.add(options, 'color_decay', .4, 4);
folder_wave.add(options, 'k', 0.0025, 0.110);
folder_wave.add(options, 'mouse_influence', .5, 4);
folder_wave.add(options, 'click', ['off', 'random', 'targeted']);
folder_wave.add(options, 'click_strength', 100, 5000);
controller_line_default_color.onChange(createGrid);
controller_resolution.onChange(createGrid);
controller_columns.onChange(createGrid);
controller_grid_width.onChange(createGrid);
// gui.close();

createGrid();
animate();

function createGrid() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    lines = [];
    for (var i = 0; i < options.columns - 1; i++) {
        lines[i] = new Line((i + 1) * (w / options.columns));
    }
}
window.addEventListener('resize', createGrid, false);

function animate() {
    ctx.clearRect(0, 0, w, h);
    // ctx.save();
    ctx.fillStyle = options.bg_color;
    ctx.rect(0, 0, w, h);
    ctx.fill();
    // ctx.restore();

    shakeListener();
    for (var i = 0; i < options.columns - 1; i++) {
        lines[i].update();
    }
    window.requestAnimationFrame(animate);
}

function Line(posX) {
    this.color = options.line_default_color;
    this.posX = posX;
    this.segments = [];
    for (var i = 0; i < options.resolution; i++) {
        this.segments[i] = new spring(posX);
    }

    this.update = function () {

        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].update();
        }

        var ldelta = new Array(this.segments.length);
        var rdelta = new Array(this.segments.length);

        for (var j = 0; j < 10; j++) {
            for (i = 0; i < this.segments.length; i++) {
                // if (i > 0) {
                    ldelta[i] = options.k * (this.segments[i].height - this.segments[i - 1].height);
                    this.segments[i - 1].speed += ldelta[i];
                // }
                if (i < this.segments.length - 1) {
                    rdelta[i] = options.k * (this.segments[i].height - this.segments[i + 1].height);
                    this.segments[i + 1].speed += rdelta[i];
                }
            }

            for (i = 0; i < this.segments[i].length; i++) {
                if (i > 0) {
                    this.segments[i - 1].height += ldelta[i];
                }
                if (i < segments.length - 1) {
                    this.segments[i + 1].height += rdelta[i];
                }
            }
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = options.grid_width;
        ctx.beginPath();
        ctx.moveTo(this.segments[0].height, 0);

        for (var i = 0; i < this.segments.length; i++) {
            // ctx.bezierCurveTo(this.segments[i].height, (i + 1) * (h / options.resolution));
            ctx.lineTo(this.segments[i].height, (i + 1) * (h / options.resolution));
        }
        ctx.stroke();
    }
}

function spring(posX) {
    this.posX = posX
    this.height = this.posX;
    this.speed = 0;
    this.update = function () {
        var x = this.posX - this.height;
        this.speed += options.tension * x - this.speed * options.dampen;
        this.height += this.speed;
    }
}

var mouse = function () {
    this.x;
    this.y;
    this.segment;
    this.previousx;
    this.previousy;
    this.speedx;
    this.speedy;
    this.column;
    this.previouscolumn
}

function cursorMove(e) {
    bounds = canvas.getBoundingClientRect();
    if (e.targetTouches && e.targetTouches[0]) {
        e.preventDefault();
        pointerEvent = e.targetTouches[0];
        mouse.x = pointerEvent.pageX;
        mouse.y = pointerEvent.pageY;
    } else {
        mouse.x = e.clientX - bounds.left;
        mouse.y = e.clientY - bounds.top;
    }
    mouse.speedx = mouse.x - mouse.previousx;
    if (touchStop > 300) {
        mouse.speedx = 10
    }
    mouse.segment = Math.floor((options.resolution / h) * mouse.y);
    mouse.column = Math.floor(mouse.x / w * options.columns);


    if (mouse.column < mouse.previouscolumn) {
        lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var animationColor = new TimelineLite();
        animationColor.to(lines[mouse.column], .001, { color: options.line_active_color })
            .to(lines[mouse.column], options.color_decay, { color: options.line_default_color });
    }

    if (mouse.column > mouse.previouscolumn) {
        lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var animationColor = new TimelineLite();
        animationColor.to(lines[mouse.column - 1], .001, { color: options.line_active_color })
            .to(lines[mouse.column - 1], options.color_decay, { color: options.line_default_color });
    }

    mouse.previousx = mouse.x;
    mouse.previousy = mouse.y;
    mouse.previouscolumn = mouse.column;
}

window.addEventListener("mousemove", cursorMove);
window.addEventListener("touchmove", cursorMove);
window.addEventListener("touchend", function () {
    touchStop = Date.now() - start;
});

document.addEventListener('click', function () {
    if (w >= 460) {
        if (options.click != "off") {
            for (var i = 0; i < lines.length; i++) {
                if (options.click == "random") {
                    lines[i].segments[Math.floor(Math.random() * options.resolution)].speed = options.click_strength / 10;
                } else if (options.click == "targeted") {
                    lines[i].segments[mouse.segment].speed = Math.sign(lines[i].posX - mouse.x) * options.click_strength / Math.sqrt(Math.max(Math.abs((lines[i].posX - mouse.x)), 100));

                }
                var animationColor = new TimelineLite();
                animationColor.to(lines[i], .001, { color: options.line_active_color })
                    .to(lines[i], options.color_decay, { color: options.line_default_color });
            }
        }
    }
}, false);

function shakeListener() {
    if (window.DeviceMotionEvent != undefined) {
        window.ondevicemotion = function (e) {
            ax = event.accelerationIncludingGravity.x;
            ay = event.accelerationIncludingGravity.y;
            az = event.accelerationIncludingGravity.z;
        }
        var axdelta = Math.abs(ax - pax);
        var aydelta = Math.abs(ay - pay);
        var azdelta = Math.abs(az - paz);

        if (axdelta + aydelta + azdelta > 20) {
            for (var i = 0; i < lines.length; i++) {
                lines[i].segments[Math.floor(Math.random() * options.resolution)].speed = 40;
                var animationColor = new TimelineLite();
                animationColor.to(lines[i], .001, { color: options.line_active_color }).to(lines[i], options.color_decay, { color: options.line_default_color });
            }
        }
        pax = ax;
        pay = ay;
        paz = az;
    }
}

function getPresetJSON() {
    return {
        "remembered": {
            "Preset1": {
                "0": {
                    "line_default_color": "#ebebeb",
                    "line_active_color": "#787878",
                    "bg_color": "#FFFFFF",
                    "columns": 7.994657935550578,
                    "resolution": 22.589178011373427,
                    "grid_width": 1,
                    "tension": 0.5821971394106497,
                    "dampen": 0.2,
                    "k": 0.021951145958986732,
                    "click": "random",
                    "mouse_influence": 1,
                    "click_strength": 3000
                }
            },
            "light, low-res": {
                "0": {
                    "line_default_color": "#d9d9d9",
                    "line_active_color": "#000000",
                    "bg_color": "#FFFFFF",
                    "columns": 7.994657935550578,
                    "resolution": 22.589178011373427,
                    "grid_width": 1,
                    "tension": 0.5821971394106497,
                    "dampen": 0.2,
                    "k": 0.021951145958986732,
                    "mouse_influence": 1,
                    "click_random": true,
                    "click_strength": 878.528347406514
                }
            },
            "folio": {
                "0": {
                    "line_default_color": "#e1e1e1",
                    "line_active_color": "004DC6",
                    "bg_color": "#FFFFFF",
                    "columns": 16,
                    "resolution": 22.589178011373427,
                    "grid_width": 1,
                    "tension": 0.1672945028433569,
                    "dampen": 0.05747957952783044,
                    "k": 0.021951145958986732,
                    "mouse_influence": 1,
                    "click": "random",
                    "click_strength": 1000
                }
            },
            "dense grid": {
                "0": {
                    "line_default_color": "#050505",
                    "line_active_color": "#787878",
                    "bg_color": "#FFFFFF",
                    "columns": 100,
                    "resolution": 152.72876098569705,
                    "grid_width": 1,
                    "tension": 0.6258711011545752,
                    "dampen": 0.10552093744614854,
                    "k": 0.0741172669308978,
                    "mouse_influence": 1.8667068757539202,
                    "click_random": false,
                    "click_strength": 100
                }
            },
            "acid": {
                "0": {
                    "line_default_color": "#028e54",
                    "line_active_color": "#78ff00",
                    "bg_color": "#000000",
                    "columns": 2,
                    "resolution": 103.9264173703257,
                    "grid_width": 1,
                    "tension": 0.6258711011545752,
                    "dampen": 0.10552093744614854,
                    "k": 0.0741172669308978,
                    "mouse_influence": 3.6423401688781665,
                    "click_random": false,
                    "click_strength": 5000
                }
            }
        },
        "closed": false,
        "folders": {
            "Colors": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            },
            "Wave": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            }
        }
    }
}