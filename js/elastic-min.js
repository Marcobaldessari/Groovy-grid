var canvas = document.getElementById("canvas"), w = window.innerWidth, h = window.innerHeight, ctx = canvas.getContext("2d"), mouse, drops = [], shower = false, options, linePosition = 550;

canvas.width = w;

canvas.height = h;

options = {
    res: 100,
    "options.k": .025,
    tension: .1,
    dampen: .02,
    k: .025
};

line1 = new Line();

animate();

function animate() {
    line1.update();
    window.requestAnimationFrame(animate);
}

function Line() {
    this.water = [];
    for (var t = 0; t < options.res; t++) {
        this.water[t] = new spring();
    }
    this.update = function() {
        ctx.clearRect(0, 0, w, h);
        var t;
        for (t = 0; t < this.water.length; t++) {
            this.water[t].update();
        }
        var e = new Array(this.water.length);
        var i = new Array(this.water.length);
        for (var n = 0; n < 8; n++) {
            for (t = 0; t < this.water.length; t++) {
                if (t > 0) {
                    e[t] = options.k * (this.water[t].height - this.water[t - 1].height);
                    this.water[t - 1].speed += e[t];
                }
                if (t < this.water.length - 1) {
                    i[t] = options.k * (this.water[t].height - this.water[t + 1].height);
                    this.water[t + 1].speed += i[t];
                }
            }
            for (t = 0; t < this.water[t].length; t++) {
                if (t > 0) {
                    this.water[t - 1].height += e[t];
                }
                if (t < water.length - 1) {
                    this.water[t + 1].height += i[t];
                }
            }
        }
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.water[0].height, 0);
        for (var t = 0; t < this.water.length; t++) {
            ctx.lineTo(this.water[t].height, (t + 1) * (w / options.res));
        }
        ctx.stroke();
    };
}

function spring() {
    this.height = linePosition;
    this.speed = 0;
    this.update = function() {
        var t = linePosition - this.height;
        this.speed += options.tension * t - this.speed * options.dampen;
        this.height += this.speed;
    };
}

document.addEventListener("mousemove", function(t) {
    mouse = new function() {
        this.x = t.clientX - canvas.getBoundingClientRect().left;
        this.y = t.clientY - canvas.getBoundingClientRect().top;
        this.col = Math.floor(options.res / h * this.y);
        console.log(this.col);
    }();
    if (mouse.x == Math.floor(line1.water[5].height)) {
        line1.water[mouse.col].speed = line1.water[mouse.col].speed + 10;
    }
}, false);

canvas.addEventListener("click", function() {
    line1.water[mouse.col].speed = 20;
}, false);