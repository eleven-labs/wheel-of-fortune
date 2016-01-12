/////////////////////////////
// arrow on top of the wheel of fortune
/////////////////////////////

(function() {
  'use strict';

  function Arrow(x, y, w, h, image) {
    this.updatePosition(x, y, w, h);
    this.image = new Image();
    this.image.src = image;
  }

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
    ctx.drawImage(this.image, this.pX - this.image.width * 0.65, this.pY - this.image.height * 0.5);
    ctx.restore();
  };

  window.Arrow = Arrow;
})();
