var canvas = document.getElementById("canvas"), mx, my, w = window.innerWidth, h = window.innerHeight, ctx = canvas.getContext("2d"), mouse, drops = [], shower = false, options, linePosition = 550;

canvas.width = w;

canvas.height = h;

options = {
    line_color: "#000000",
    bg_color: "#FFFFFF",
    res: 100,
    tension: .22,
    dampen: .2,
    k: .075,
    columns: 8,
    click_strength: 3e3,
    m_influence: 1
};

var gui = new dat.GUI({
    load: options,
    preset: "Preset1"
});

var folder_colors = gui.addFolder("Colors");

var folder_wave = gui.addFolder("Wave");

gui.remember(options);

folder_colors.addColor(options, "line_color");

folder_colors.addColor(options, "bg_color");

folder_wave.add(options, "res", 5, 300);

folder_wave.add(options, "tension", .01, 1);

folder_wave.add(options, "dampen", .002, .2);

folder_wave.add(options, "k", .0025, .11);

folder_wave.add(options, "click_strength", 1e3, 5e3);

lines = [];

for (var i = 0; i < options.columns - 1; i++) {
    lines[i] = new Line((i + 1) * (w / options.columns));
}

animate();

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
    this.posX = e;
    this.segments = [];
    for (var s = 0; s < options.res; s++) {
        this.segments[s] = new spring(e);
    }
    this.update = function() {
        for (var e = 0; e < this.segments.length; e++) {
            this.segments[e].update();
        }
        var s = new Array(this.segments.length);
        var o = new Array(this.segments.length);
        for (var t = 0; t < 8; t++) {
            for (e = 0; e < this.segments.length; e++) {
                if (e > 0) {
                    s[e] = options.k * (this.segments[e].height - this.segments[e - 1].height);
                    this.segments[e - 1].speed += s[e];
                }
                if (e < this.segments.length - 1) {
                    o[e] = options.k * (this.segments[e].height - this.segments[e + 1].height);
                    this.segments[e + 1].speed += o[e];
                }
            }
            for (e = 0; e < this.segments[e].length; e++) {
                if (e > 0) {
                    this.segments[e - 1].height += s[e];
                }
                if (e < segments.length - 1) {
                    this.segments[e + 1].height += o[e];
                }
            }
        }
        ctx.strokeStyle = options.line_color;
        ctx.beginPath();
        ctx.moveTo(this.segments[0].height, 0);
        for (var e = 0; e < this.segments.length; e++) {
            ctx.lineTo(this.segments[e].height, (e + 1) * (h / options.res));
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

document.addEventListener("mousemove", function(e) {
    bounds = canvas.getBoundingClientRect();
    mouse.x = e.clientX - bounds.left;
    mouse.y = e.clientY - bounds.top;
    mouse.speedx = mouse.x - mouse.previousx;
    mouse.speedy = Math.abs(mouse.previousy - mouse.y);
    mouse.segment = Math.floor(options.res / h * mouse.y);
    mouse.column = Math.floor(mouse.x / w * options.columns);
    if (mouse.column < mouse.previouscolumn) {
        lines[mouse.column].segments[mouse.segment].speed = mouse.speedx;
    }
    if (mouse.column > mouse.previouscolumn) {
        lines[mouse.column - 1].segments[mouse.segment].speed = mouse.speedx;
    }
    if (mouse.x == Math.floor(lines[3].segments[5].height)) {
        lines[3].segments[mouse.segment].speed = lines[3].segments[mouse.segment].speed + 10;
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