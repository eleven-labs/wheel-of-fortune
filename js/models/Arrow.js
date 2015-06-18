/////////////////////////////
// arrow on top of the wheel of fortune
/////////////////////////////

(function() {
  'use strict';

  function Arrow(x, y, w, h, image) {
    this.updatePosition(x, y, w, h);
    this.verts = [];
    this.pVerts = [];

    if (!image) {
      return this.createBody();
    }

    this.image = new Image();
    this.image.src = config.arrow.image;
  }

  Arrow.prototype.createBody = function() {
    this.createArrowShape();
  };

  Arrow.prototype.createArrowShape = function() {
    var ppm = config.physics.ppm;

    this.verts[0] = [0, this.h * 0.5];
    this.verts[1] = [-this.w * 0.75, 0];
    this.verts[2] = [0, -this.h * 0.5];
    this.verts[3] = [this.w * 0.25, 0];

    this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
    this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
    this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
    this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

    var shape = new p2.Convex(this.verts);
    //shape.material = arrowMaterial;

    return shape;
  };

  Arrow.prototype.updatePosition = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.pX = this.x * config.physics.ppm;
    this.pY = config.physics.physicsHeight * 0.61 * config.physics.ppm;

    this.w = w;
    this.h = h;
  };

  Arrow.prototype.draw = function() {
    ctx.save();

    if (!this.image) {
      ctx.translate(this.pX, this.pY);
      ctx.fillStyle = 'red';

      ctx.beginPath();
      ctx.moveTo(this.pVerts[0][0], this.pVerts[0][1]);
      ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
      ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
      ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.drawImage(this.image, this.pX - this.image.width * 0.65, this.pY - this.image.height * 0.5);
    }

    ctx.restore();
  };

  window.Arrow = Arrow;
})();
