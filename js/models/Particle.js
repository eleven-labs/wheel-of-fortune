/////////////////////////////
// your reward
/////////////////////////////

(function() {
  'use strict';

  function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  function Particle(p0, p1, p2, p3) {
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
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r);
    ctx.scale(1, this.sy);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

    ctx.restore();
  };

  window.Point = Point;
  window.Particle = Particle;
})();
