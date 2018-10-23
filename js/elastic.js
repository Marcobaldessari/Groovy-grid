var c = document.getElementById('canvas'),

    w = window.innerWidth,
    h = window.innerHeight,
    ctx = c.getContext('2d'),
    mouse,
    drops = [],
    shower = false,
    water = [],
    linePosition = 250,
    res = 100,
    k = 0.025,
    tension = 0.10,
    dampen = 0.02;

c.width = w,
    c.height = h;


for (var i = 0; i < res; i++) {
    water[i] = new spring();
}

animate();


function spring() {
    this.height = linePosition;
    this.speed = 0;
    this.update = function () {
        var x = linePosition - this.height;
        this.speed += tension * x - this.speed * dampen;
        this.height += this.speed;
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);

    var i;
    for (i = 0; i < water.length; i++) {
        water[i].update();
    }

    var ldelta = new Array(water.length);
    var rdelta = new Array(water.length);

    for (var j = 0; j < 8; j++) {
        for (i = 0; i < water.length; i++) {
            if (i > 0) {
                ldelta[i] = k * (water[i].height - water[i - 1].height);
                water[i - 1].speed += ldelta[i];
            }
            if (i < water.length - 1) {
                rdelta[i] = k * (water[i].height - water[i + 1].height);
                water[i + 1].speed += rdelta[i];
            }
        }

        for (i = 0; i < water[i].length; i++) {
            if (i > 0) {
                water[i - 1].height += ldelta[i];
            }
            if (i < water.length - 1) {
                water[i + 1].height += rdelta[i];
            }
        }
    }

    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(0, water[0].height);

    for (var i = 0; i < water.length; i++) {
        ctx.lineTo((i + 1) * (w / res), water[i].height);
    }
    ctx.stroke();

    window.requestAnimationFrame(animate);

}

document.addEventListener('mousemove', function (e) {

    mouse = new (function () {
        this.x = e.clientX - c.getBoundingClientRect().left;
        this.y = e.clientY - c.getBoundingClientRect().top;
        this.col = Math.floor((res / w) * this.x);
    });

    if (mouse.y == Math.floor(water[5].height)) {
        water[mouse.col].speed = water[mouse.col].speed + 10;
        console.log(water[mouse.col].speed);
    }
}, false);

c.addEventListener('click', function () {
}, false);




