var c = document.getElementById('canvas'),

    w = window.innerWidth,
    h = window.innerHeight,
    ctx = c.getContext('2d'),
    mouse,
    drops = [],
    shower = false,
    water = [],
    water_level = 250;
res = 100,
    k = 0.0025,
    tension = 0.01
    dampen = 0.02;

    c.width = w;
    c.height = h;
    


for (var i = 0; i < res; i++) {
    water[i] = new spring();
}

animate();


dropplet = function (x, y) {
    this.x = x;
    this.y = y;
    this.vel = Math.random() * 10 - 5;

    this.col = Math.floor(res / w * this.x);
    this.update = function () {
        this.vel = this.vel * 0.7;
        this.y = this.y + Math.random() * 1.5 + 1;
        this.x = this.x + this.vel;
        this.col = Math.floor(res / w * this.x);

        if (this.x <= 0 || this.x >= w || this.y <= h || this.y <= water[this.col].height) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#28d9e2';
            ctx.fill();
        } else {
            this.destroy();
            if (this.col >= 0 && this.col < water.length) {
                water_level += 0.1;
                water[this.col].speed = 5;
            }
        }
    }
    this.destroy = function () {
        drops.splice(drops.indexOf(this), 1);
    }
}

function spring() {
    this.height = h - water_level;
    this.speed = 0;
    this.update = function () {
        var x = (h - water_level) - this.height;
        this.speed += tension * x - this.speed * dampen;
        this.height += this.speed;
        if (this.height > h) { this.height = h; }
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < drops.length; i++) {
        drops[i].update();
    }

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
    
    mouse = new (function(){
        this.x = e.clientX - c.getBoundingClientRect().left;
        this.y = e.clientY - c.getBoundingClientRect().top;
        this.col = Math.floor((res / w) * this.x);
    });
    
    // mouse = {
    //     'x': e.clientX - c.getBoundingClientRect().left,
    //     'y': e.clientY - c.getBoundingClientRect().top,
    //     'col': Math.floor((res / w) * x)
    // }
    console.log(mouse.col);
    if (mouse.y == Math.floor(water[5].height)) {
        water[5].speed = water[5].speed + 10;
    }
}, false);

c.addEventListener('click', function () {
        drops.push(new dropplet(mouse.x, mouse.y));
}, false);




