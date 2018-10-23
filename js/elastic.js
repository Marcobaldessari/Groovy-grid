var canvas = document.getElementById('canvas'),

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
    "res": 100,
    "options.k": 0.025,
    "tension": 0.10,
    "dampen": 0.02,
    "k": 0.025
}

line1 = new Line();

animate();


function animate() {
    line1.update();
    window.requestAnimationFrame(animate);
}

function Line() {
    this.water = [];

    for (var i = 0; i < options.res; i++) {
        this.water[i] = new spring();
    }

    this.update = function () {
        ctx.clearRect(0, 0, w, h);

        var i;
        for (i = 0; i < this.water.length; i++) {
            this.water[i].update();
        }

        var ldelta = new Array(this.water.length);
        var rdelta = new Array(this.water.length);

        for (var j = 0; j < 8; j++) {
            for (i = 0; i < this.water.length; i++) {
                if (i > 0) {
                    ldelta[i] = options.k * (this.water[i].height - this.water[i - 1].height);
                    this.water[i - 1].speed += ldelta[i];
                }
                if (i < this.water.length - 1) {
                    rdelta[i] = options.k * (this.water[i].height - this.water[i + 1].height);
                    this.water[i + 1].speed += rdelta[i];
                }
            }

            for (i = 0; i < this.water[i].length; i++) {
                if (i > 0) {
                    this.water[i - 1].height += ldelta[i];
                }
                if (i < water.length - 1) {
                    this. water[i + 1].height += rdelta[i];
                }
            }
        }

        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.water[0].height, 0);

        for (var i = 0; i < this.water.length; i++) {
            ctx.lineTo(this.water[i].height, (i + 1) * (w / options.res));
        }
        ctx.stroke();
    }
}

function spring() {
    this.height = linePosition;
    this.speed = 0;
    this.update = function () {
        var x = linePosition - this.height;
        this.speed += options.tension * x - this.speed * options.dampen;
        this.height += this.speed;
    }
}


document.addEventListener('mousemove', function (e) {

    mouse = new (function () {
        this.x = e.clientX - canvas.getBoundingClientRect().left;
        this.y = e.clientY - canvas.getBoundingClientRect().top;
        this.col = Math.floor((options.res / h) * this.y);
        console.log(this.col);

    });

    if (mouse.x == Math.floor(line1.water[5].height)) {
        line1.water[mouse.col].speed = line1.water[mouse.col].speed + 10;
        // console.log(water[mouse.col].speed);
    }
}, false);

canvas.addEventListener('click', function () {
    line1.water[mouse.col].speed = 20;

}, false);




