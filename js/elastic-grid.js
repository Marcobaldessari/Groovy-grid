var canvas = document.getElementById('canvas'),
    mx, my,
    w = window.innerWidth,
    h = window.innerHeight,
    ctx = canvas.getContext('2d'),
    mouse,
    drops = [],
    shower = false,
    options,
    linePosition = 550;

canvas.width = w;
canvas.height = h;

options = {
    "line_color": "#000000",
    // "line_color": "#D8D8D8",
    "bg_color": "#FFFFFF",
    "res": 100,
    "tension": 0.22,
    "dampen": 0.2,
    "k": 0.075,
    "columns": 8,
    "click_strength": 3000,
    "m_influence": 1
}

var gui = new dat.GUI({ load: options, preset: 'Preset1' });
var folder_colors = gui.addFolder('Colors');
var folder_wave = gui.addFolder('Wave');
gui.remember(options);

folder_colors.addColor(options, 'line_color');
folder_colors.addColor(options, 'bg_color');
folder_wave.add(options, 'res', 5, 300);
folder_wave.add(options, 'tension', 0.01, 1);
folder_wave.add(options, 'dampen', 0.002, 0.2);
folder_wave.add(options, 'k', 0.0025, 0.110);
folder_wave.add(options, 'click_strength', 1000, 5000);


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
    for (var i = 0; i < options.columns - 1; i++) {
        lines[i].update();
    }
    window.requestAnimationFrame(animate);
}

function Line(posX) {
    this.posX = posX;
    this.segments = [];
    for (var i = 0; i < options.res; i++) {
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

        ctx.strokeStyle = options.line_color;
        ctx.beginPath();
        ctx.moveTo(this.segments[0].height, 0);

        for (var i = 0; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].height, (i + 1) * (h / options.res));
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



document.addEventListener('mousemove', function (e) {
    bounds = canvas.getBoundingClientRect();

    mouse.x = e.clientX - bounds.left;
    mouse.y = e.clientY - bounds.top;
    mouse.speedx = mouse.x - mouse.previousx;
    mouse.speedy = Math.abs(mouse.previousy - mouse.y);
    mouse.segment = Math.floor((options.res / h) * mouse.y);
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

canvas.addEventListener('click', function () {
    for (var i = 0; i < lines.length; i++) {
        lines[i].segments[mouse.segment].speed = lines[i].segments[mouse.segment].speed + options.click_strength / (lines[i].posX - mouse.x);
    }
}, false);


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