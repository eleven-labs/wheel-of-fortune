/////////////////////////////
// Circular button with an image
/////////////////////////////

(function() {
  'use strict';

  function CircularButton(x, y, radius, image) {
    Item.call(this, x, y, radius * 2, radius * 2, image);
    this.radius = radius;
    this.states.pressed = false;
    this.createBody();
  }

  CircularButton.prototype = Object.create(Item.prototype);
  CircularButton.prototype.constructor = CircularButton;

  CircularButton.prototype.createBody = function() {
    this.body = new p2.Body({
      position: [this.x, config.physics.physicsHeight - this.y]
    });

    this.body.addShape(new p2.Circle(this.radius));

    world.addBody(this.body);
  };

  CircularButton.prototype.updatePosition = function(x, y, radius) {
    this.radius = radius;
    Item.prototype.updatePosition(x, y, radius * 2, radius * 2);
  };

  CircularButton.prototype.draw = function() {
    Item.prototype.draw.call(this);

    if (this.states.pressed) {
      var opacity = this.getPressForce() / 2 * 0.75;

      ctx.save();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(0, 0, 0, ' + opacity + ')';
      ctx.arc(this.pX, this.pY, this.radius * 0.83 * config.physics.ppm, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  };

  CircularButton.prototype.getPressForce = function() {
    var time = (Date.now() - this.pressStartTime) / 1000;
    var max = 4;
    var normalizedTime = time % max;
    if (normalizedTime > max / 2) {
      normalizedTime = max - normalizedTime;
    }
    return normalizedTime;
  };

  CircularButton.prototype.press = function() {
    this.states.pressed = true;
    this.pressStartTime = Date.now();
  };

  CircularButton.prototype.release = function() {
    this.states.pressed = false;
    return this.getPressForce();
  };

  window.CircularButton = CircularButton;
})();
