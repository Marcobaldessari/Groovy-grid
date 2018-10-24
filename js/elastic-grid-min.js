var canvas = document.getElementById("canvas"), w, h, ctx = canvas.getContext("2d"), mouse, shower = false, options, lines, linePosition = 550;

options = {
    line_default_color: "#000000",
    line_active_color: "#0000FF",
    bg_color: "#FFFFFF",
    grid_width: 1,
    resolution: 100,
    tension: .22,
    dampen: .2,
    k: .075,
    columns: 8,
    click_strength: 3e3,
    mouse_influence: 1
};

var gui = new dat.GUI({
    load: getPresetJSON(),
    preset: "Preset1"
});

var folder_colors = gui.addFolder("Colors");

var folder_wave = gui.addFolder("Wave");

gui.remember(options);

folder_colors.addColor(options, "line_default_color");

folder_colors.addColor(options, "line_active_color");

folder_colors.addColor(options, "bg_color");

var controller_resolution = folder_wave.add(options, "columns", 1, 100);

var controller_columns = folder_wave.add(options, "resolution", 5, 300);

var controller_grid_width = folder_wave.add(options, "grid_width", 1, 200);

folder_wave.add(options, "tension", .01, 1);

folder_wave.add(options, "dampen", .002, .2);

folder_wave.add(options, "k", .0025, .11);

folder_wave.add(options, "mouse_influence", .5, 4);

folder_wave.add(options, "click_strength", 1e3, 5e3);

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
    for (var e = 0; e < options.columns - 1; e++) {
        lines[e] = new Line((e + 1) * (w / options.columns));
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = options.bg_color;
    ctx.rect(0, 0, w, h);
    ctx.fill();
    for (var e = 0; e < options.columns - 1; e++) {
        lines[e].update();
    }
    window.requestAnimationFrame(animate);
}

function Line(e) {
    this.color = options.line_default_color;
    this.posX = e;
    this.segments = [];
    for (var o = 0; o < options.resolution; o++) {
        this.segments[o] = new spring(e);
    }
    this.update = function() {
        for (var e = 0; e < this.segments.length; e++) {
            this.segments[e].update();
        }
        var o = new Array(this.segments.length);
        var s = new Array(this.segments.length);
        for (var t = 0; t < 8; t++) {
            for (e = 0; e < this.segments.length; e++) {
                if (e > 0) {
                    o[e] = options.k * (this.segments[e].height - this.segments[e - 1].height);
                    this.segments[e - 1].speed += o[e];
                }
                if (e < this.segments.length - 1) {
                    s[e] = options.k * (this.segments[e].height - this.segments[e + 1].height);
                    this.segments[e + 1].speed += s[e];
                }
            }
            for (e = 0; e < this.segments[e].length; e++) {
                if (e > 0) {
                    this.segments[e - 1].height += o[e];
                }
                if (e < segments.length - 1) {
                    this.segments[e + 1].height += s[e];
                }
            }
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = options.grid_width;
        ctx.beginPath();
        ctx.moveTo(this.segments[0].height, 0);
        for (var e = 0; e < this.segments.length; e++) {
            ctx.lineTo(this.segments[e].height, (e + 1) * (h / options.resolution));
        }
        ctx.stroke();
    };
}

function spring(e) {
    this.posX = e;
    this.height = this.posX;
    this.speed = 0;
    this.update = function() {
        var e = this.posX - this.height;
        this.speed += options.tension * e - this.speed * options.dampen;
        this.height += this.speed;
    };
}

var mouse = function() {
    this.x;
    this.y;
    this.segment;
    this.previousx;
    this.previousy;
    this.speedx;
    this.speedy;
    this.column;
    this.previouscolumn;
};

document.addEventListener("mousemove", function(e) {
    bounds = canvas.getBoundingClientRect();
    mouse.x = e.clientX - bounds.left;
    mouse.y = e.clientY - bounds.top;
    mouse.speedx = mouse.x - mouse.previousx;
    mouse.speedy = Math.abs(mouse.previousy - mouse.y);
    mouse.segment = Math.floor(options.resolution / h * mouse.y);
    mouse.column = Math.floor(mouse.x / w * options.columns);
    if (mouse.column < mouse.previouscolumn) {
        lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var o = new TimelineLite();
        o.to(lines[mouse.column], .001, {
            color: options.line_active_color
        }).to(lines[mouse.column], .8, {
            color: options.line_default_color
        });
    }
    if (mouse.column > mouse.previouscolumn) {
        lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var o = new TimelineLite();
        o.to(lines[mouse.column - 1], .001, {
            color: options.line_active_color
        }).to(lines[mouse.column - 1], .8, {
            color: options.line_default_color
        });
    }
    mouse.previousx = mouse.x;
    mouse.previousy = mouse.y;
    mouse.previouscolumn = mouse.column;
}, false);

canvas.addEventListener("click", function() {
    for (var e = 0; e < lines.length; e++) {
        lines[e].segments[mouse.segment].speed = lines[e].segments[mouse.segment].speed + options.click_strength / (lines[e].posX - mouse.x);
    }
}, false);

window.addEventListener("resize", createGrid, false);

function getPresetJSON() {
    return {
        line_default_color: "#ebebeb",
        line_active_color: "#787878",
        bg_color: "#FFFFFF",
        grid_width: 1,
        resolution: 22.589178011373427,
        tension: .5821971394106497,
        dampen: .2,
        k: .021951145958986732,
        columns: 7.994657935550578,
        click_strength: 3e3,
        mouse_influence: 1,
        preset: "light, low-res",
        remembered: {
            Preset1: {
                "0": {
                    line_default_color: "#ebebeb",
                    line_active_color: "#787878",
                    bg_color: "#FFFFFF",
                    columns: 7.994657935550578,
                    resolution: 22.589178011373427,
                    grid_width: 1,
                    tension: .5821971394106497,
                    dampen: .2,
                    k: .021951145958986732,
                    mouse_influence: 1,
                    click_strength: 3e3
                }
            },
            "light, low-res": {
                "0": {
                    line_default_color: "#ebebeb",
                    line_active_color: "#787878",
                    bg_color: "#FFFFFF",
                    columns: 7.994657935550578,
                    resolution: 22.589178011373427,
                    grid_width: 1,
                    tension: .5821971394106497,
                    dampen: .2,
                    k: .021951145958986732,
                    mouse_influence: 1,
                    click_strength: 3e3
                }
            }
        },
        closed: false,
        folders: {
            Colors: {
                preset: "Default",
                closed: false,
                folders: {}
            },
            Wave: {
                preset: "Default",
                closed: false,
                folders: {}
            }
        }
    };
}