
var canvas = document.getElementById('canvas'),
    w, h,
    ctx = canvas.getContext('2d'),
    mouse,
    shower = false,
    options,
    lines,
    linePosition = 550;



options = {
    "line_default_color": "#000000",
    "line_active_color": "#0000FF",
    "bg_color": "#FFFFFF",
    "grid_width": 1,
    "resolution": 100,
    "tension": 0.22,
    "dampen": 0.2,
    "k": 0.075,
    "columns": 8,
    "click_strength": 3000,
    "mouse_influence": 1
}

var gui = new dat.GUI({ load: getPresetJSON(), preset: 'Preset1' });

var folder_colors = gui.addFolder('Colors');
var folder_wave = gui.addFolder('Wave');
gui.remember(options);

folder_colors.addColor(options, 'line_default_color');
folder_colors.addColor(options, 'line_active_color');
folder_colors.addColor(options, 'bg_color');
var controller_resolution = folder_wave.add(options, 'columns', 1, 100);
var controller_columns = folder_wave.add(options, 'resolution', 5, 300);
var controller_grid_width = folder_wave.add(options, 'grid_width', 1, 200);
folder_wave.add(options, 'tension', 0.01, 1);
folder_wave.add(options, 'dampen', 0.002, 0.2);
folder_wave.add(options, 'k', 0.0025, 0.110);
folder_wave.add(options, 'mouse_influence', .5, 4);
folder_wave.add(options, 'click_strength', 1000, 5000);

controller_resolution.onChange(createGrid);
controller_columns.onChange(createGrid);
controller_grid_width.onChange(createGrid);

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

function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = options.bg_color;
    ctx.rect(0, 0, w, h);
    ctx.fill();
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

        for (var j = 0; j < 8; j++) {
            for (i = 0; i < this.segments.length; i++) {
                if (i > 0) {
                    ldelta[i] = options.k * (this.segments[i].height - this.segments[i - 1].height);
                    this.segments[i - 1].speed += ldelta[i];
                }
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

document.addEventListener('mousemove', function (e) {
    bounds = canvas.getBoundingClientRect();

    mouse.x = e.clientX - bounds.left;
    mouse.y = e.clientY - bounds.top;
    mouse.speedx = mouse.x - mouse.previousx;
    mouse.speedy = Math.abs(mouse.previousy - mouse.y);
    mouse.segment = Math.floor((options.resolution / h) * mouse.y);
    mouse.column = Math.floor(mouse.x / w * options.columns);


    if (mouse.column < mouse.previouscolumn) {
        lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var animationColor = new TimelineLite();
        animationColor.to(lines[mouse.column], .001, { color: options.line_active_color })
            .to(lines[mouse.column], .8, { color: options.line_default_color });
    }

    if (mouse.column > mouse.previouscolumn) {
        lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var animationColor = new TimelineLite();
        animationColor.to(lines[mouse.column - 1], .001, { color: options.line_active_color })
            .to(lines[mouse.column - 1], .8, {  color: options.line_default_color });
    }

    mouse.previousx = mouse.x;
    mouse.previousy = mouse.y;
    mouse.previouscolumn = mouse.column;
}, false);




// ['mousemove', 'touchmove'].forEach(function(i) {
//     window.addEventListener(i,function (e) {
//         bounds = canvas.getBoundingClientRect();

//         mouse.x = e.clientX - bounds.left;
//         mouse.y = e.clientY - bounds.top;
//         mouse.speedx = mouse.x - mouse.previousx;
//         mouse.speedy = Math.abs(mouse.previousy - mouse.y);
//         mouse.segment = Math.floor((options.resolution / h) * mouse.y);
//         mouse.column = Math.floor(mouse.x / w * options.columns);


//         if (mouse.column < mouse.previouscolumn) {
//             lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
//         }

//         if (mouse.column > mouse.previouscolumn) {
//             lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
//         }

//         if (mouse.x == Math.floor(lines[3].segments[5].height)) {
//             lines[3].segments[mouse.segment].speed = lines[3].segments[mouse.segment].speed + 10;
//         }

//         mouse.previousx = mouse.x;
//         mouse.previousy = mouse.y;
//         mouse.previouscolumn = mouse.column;
//     }, false);
// });

// document.addEventListener('touchmove', function (e) {
//     bounds = canvas.getBoundingClientRect();

//     mouse.x = e.clientX - bounds.left;
//     mouse.y = e.clientY - bounds.top;
//     mouse.speedx = mouse.x - mouse.previousx;
//     mouse.speedy = Math.abs(mouse.previousy - mouse.y);
//     mouse.segment = Math.floor((options.resolution / h) * mouse.y);
//     mouse.column = Math.floor(mouse.x / w * options.columns);


//     if (mouse.column < mouse.previouscolumn) {
//         lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
//     }

//     if (mouse.column > mouse.previouscolumn) {
//         lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
//     }

//     if (mouse.x == Math.floor(lines[3].segments[5].height)) {
//         lines[3].segments[mouse.segment].speed = lines[3].segments[mouse.segment].speed + 10;
//     }

//     mouse.previousx = mouse.x;
//     mouse.previousy = mouse.y;
//     mouse.previouscolumn = mouse.column;
// }, false);

canvas.addEventListener('click', function () {
    for (var i = 0; i < lines.length; i++) {
        lines[i].segments[mouse.segment].speed = lines[i].segments[mouse.segment].speed + options.click_strength / (lines[i].posX - mouse.x);
    }
}, false);


window.addEventListener('resize', createGrid, false);


function getPresetJSON() {
    return {
        "line_default_color": "#ebebeb",
        "line_active_color": "#787878",
        "bg_color": "#FFFFFF",
        "grid_width": 1,
        "resolution": 22.589178011373427,
        "tension": 0.5821971394106497,
        "dampen": 0.2,
        "k": 0.021951145958986732,
        "columns": 7.994657935550578,
        "click_strength": 3000,
        "mouse_influence": 1,
        "preset": "light, low-res",
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
                    "mouse_influence": 1,
                    "click_strength": 3000
                }
            },
            "light, low-res": {
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
                    "mouse_influence": 1,
                    "click_strength": 3000
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