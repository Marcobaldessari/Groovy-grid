var canvas = document.getElementById("canvas"), w, h, ctx = canvas.getContext("2d"), mouse, touchStop, ax, ay, az, pax, pay, paz, options, lines, start = Date.now();

var options = new function() {
    this.line_default_color = "#f2f2f2";
    this.line_active_color = "#787878";
    this.bg_color = "#FFFFFF";
    this.columns = 16;
    this.resolution = 22.589178011373427;
    this.grid_width = 1;
    this.tension = .1672945028433569;
    this.dampen = .05747957952783044;
    this.color_decay = 1;
    this.k = .021951145958986732;
    this.mouse_influence = 1;
    this.click = "random";
    this.click_strength = 100;
}();

var gui = new dat.GUI({
    load: getPresetJSON(),
    preset: "acid"
});

var folder_colors = gui.addFolder("Colors");

var folder_wave = gui.addFolder("Wave");

gui.remember(options);

var controller_line_default_color = folder_colors.addColor(options, "line_default_color");

folder_colors.addColor(options, "line_active_color");

folder_colors.addColor(options, "bg_color");

var controller_resolution = folder_wave.add(options, "columns", 1, 100).step(1);

var controller_columns = folder_wave.add(options, "resolution", 5, 300).step(1);

var controller_grid_width = folder_wave.add(options, "grid_width", 1, 200);

folder_wave.add(options, "tension", .01, 1);

folder_wave.add(options, "dampen", .002, .2);

folder_wave.add(options, "color_decay", .4, 4);

folder_wave.add(options, "k", .0025, .11);

folder_wave.add(options, "mouse_influence", .5, 4);

folder_wave.add(options, "click", [ "off", "random", "targeted" ]);

folder_wave.add(options, "click_strength", 100, 5e3);

controller_line_default_color.onChange(createGrid);

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

window.addEventListener("resize", createGrid, false);

function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = options.bg_color;
    ctx.rect(0, 0, w, h);
    ctx.fill();
    shakeListener();
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
        var t = new Array(this.segments.length);
        for (var n = 0; n < 10; n++) {
            for (e = 0; e < this.segments.length; e++) {
                o[e] = options.k * (this.segments[e].height - this.segments[e - 1].height);
                this.segments[e - 1].speed += o[e];
                if (e < this.segments.length - 1) {
                    t[e] = options.k * (this.segments[e].height - this.segments[e + 1].height);
                    this.segments[e + 1].speed += t[e];
                }
            }
            for (e = 0; e < this.segments[e].length; e++) {
                if (e > 0) {
                    this.segments[e - 1].height += o[e];
                }
                if (e < segments.length - 1) {
                    this.segments[e + 1].height += t[e];
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
        mouse.speedx = 10;
    }
    mouse.segment = Math.floor(options.resolution / h * mouse.y);
    mouse.column = Math.floor(mouse.x / w * options.columns);
    if (mouse.column < mouse.previouscolumn) {
        lines[mouse.column].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var o = new TimelineLite();
        o.to(lines[mouse.column], .001, {
            color: options.line_active_color
        }).to(lines[mouse.column], options.color_decay, {
            color: options.line_default_color
        });
    }
    if (mouse.column > mouse.previouscolumn) {
        lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx * options.mouse_influence;
        var o = new TimelineLite();
        o.to(lines[mouse.column - 1], .001, {
            color: options.line_active_color
        }).to(lines[mouse.column - 1], options.color_decay, {
            color: options.line_default_color
        });
    }
    mouse.previousx = mouse.x;
    mouse.previousy = mouse.y;
    mouse.previouscolumn = mouse.column;
}

window.addEventListener("mousemove", cursorMove);

window.addEventListener("touchmove", cursorMove);

window.addEventListener("touchend", function() {
    touchStop = Date.now() - start;
});

document.addEventListener("click", function() {
    if (w >= 460) {
        if (options.click != "off") {
            for (var e = 0; e < lines.length; e++) {
                if (options.click == "random") {
                    lines[e].segments[Math.floor(Math.random() * options.resolution)].speed = options.click_strength / 10;
                } else if (options.click == "targeted") {
                    lines[e].segments[mouse.segment].speed = Math.sign(lines[e].posX - mouse.x) * options.click_strength / Math.sqrt(Math.max(Math.abs(lines[e].posX - mouse.x), 100));
                }
                var o = new TimelineLite();
                o.to(lines[e], .001, {
                    color: options.line_active_color
                }).to(lines[e], options.color_decay, {
                    color: options.line_default_color
                });
            }
        }
    }
}, false);

function shakeListener() {
    if (window.DeviceMotionEvent != undefined) {
        window.ondevicemotion = function(e) {
            ax = event.accelerationIncludingGravity.x;
            ay = event.accelerationIncludingGravity.y;
            az = event.accelerationIncludingGravity.z;
        };
        var e = Math.abs(ax - pax);
        var o = Math.abs(ay - pay);
        var t = Math.abs(az - paz);
        if (e + o + t > 20) {
            for (var n = 0; n < lines.length; n++) {
                lines[n].segments[Math.floor(Math.random() * options.resolution)].speed = 40;
                var s = new TimelineLite();
                s.to(lines[n], .001, {
                    color: options.line_active_color
                }).to(lines[n], options.color_decay, {
                    color: options.line_default_color
                });
            }
        }
        pax = ax;
        pay = ay;
        paz = az;
    }
}

function getPresetJSON() {
    return {
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
                    click: "random",
                    mouse_influence: 1,
                    click_strength: 3e3
                }
            },
            "light, low-res": {
                "0": {
                    line_default_color: "#d9d9d9",
                    line_active_color: "#000000",
                    bg_color: "#FFFFFF",
                    columns: 7.994657935550578,
                    resolution: 22.589178011373427,
                    grid_width: 1,
                    tension: .5821971394106497,
                    dampen: .2,
                    k: .021951145958986732,
                    mouse_influence: 1,
                    click_random: true,
                    click_strength: 878.528347406514
                }
            },
            folio: {
                "0": {
                    line_default_color: "#e1e1e1",
                    line_active_color: "004DC6",
                    bg_color: "#FFFFFF",
                    columns: 16,
                    resolution: 22.589178011373427,
                    grid_width: 1,
                    tension: .1672945028433569,
                    dampen: .05747957952783044,
                    k: .021951145958986732,
                    mouse_influence: 1,
                    click: "random",
                    click_strength: 1e3
                }
            },
            "dense grid": {
                "0": {
                    line_default_color: "#050505",
                    line_active_color: "#787878",
                    bg_color: "#FFFFFF",
                    columns: 100,
                    resolution: 152.72876098569705,
                    grid_width: 1,
                    tension: .6258711011545752,
                    dampen: .10552093744614854,
                    k: .0741172669308978,
                    mouse_influence: 1.8667068757539202,
                    click_random: false,
                    click_strength: 100
                }
            },
            acid: {
                "0": {
                    line_default_color: "#028e54",
                    line_active_color: "#78ff00",
                    bg_color: "#000000",
                    columns: 2,
                    resolution: 103.9264173703257,
                    grid_width: 1,
                    tension: .6258711011545752,
                    dampen: .10552093744614854,
                    k: .0741172669308978,
                    mouse_influence: 3.6423401688781665,
                    click_random: false,
                    click_strength: 5e3
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