/*jshint unused:false*/

/////////////////////////////
// your reward
/////////////////////////////

function Point(x, y) {
  'use strict';
  this.x = x || 0;
  this.y = y || 0;
}

function Particle(p0, p1, p2, p3) {
  'use strict';
  this.p0 = p0;
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;

  this.time = 0;
  this.duration = 3 + Math.random() * 2;
  this.color = 'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)';

  this.w = 10;
  this.h = 7;

  this.complete = false;
}

(function() {
  'use strict';

  Particle.prototype.update = function() {
    this.time = Math.min(this.duration, this.time + config.canvas.timeStep);

    var f = Maths.ease.outCubic(this.time, 0, 1, this.duration);
    var p = Maths.cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

    var dx = p.x - this.x;
    var dy = p.y - this.y;

    this.r = Math.atan2(dy, dx) + Math.PI * 0.5;
    this.sy = Math.sin(Math.PI * f * 10);
    this.x = p.x;
    this.y = p.y;

    this.complete = this.time === this.duration;
  };

  Particle.prototype.draw = function() {
    config.ctx.save();
    config.ctx.translate(this.x, this.y);
    config.ctx.rotate(this.r);
    config.ctx.scale(1, this.sy);

    config.ctx.fillStyle = this.color;
    config.ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

    config.ctx.restore();
  };
})();
