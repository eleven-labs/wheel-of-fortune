/////////////////////////////
// arrow on top of the wheel of fortune
/////////////////////////////

(function() {
  'use strict';

  function Item(x, y, w, h, image) {
    this.updatePosition(x, y, w, h);
    this.image = new Image();
    this.image.src = image;
  }

  Item.prototype.updatePosition = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.pX = this.x * config.physics.ppm;
    this.pY = this.y * config.physics.ppm;

    this.w = w;
    this.h = h;
  };

  Item.prototype.draw = function() {
    var width = this.w || this.image.width;
    var height = this.h || this.image.height;

    ctx.save();
    ctx.drawImage(this.image, this.pX - width * 0.5, this.pY - height * 0.5, width, height);
    ctx.restore();
  };

  window.Item = Item;
})();
