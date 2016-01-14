/////////////////////////////
// Circular button with an image
/////////////////////////////

(function() {
  'use strict';

  function CircularButton(x, y, radius, image, periodicity) {
    Item.call(this, x, y, radius * 2, radius * 2, image);
    this.radius = radius;
    this.periodicity = periodicity;
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
      var force = this.getPressForce();
      var centerRadius = this.radius * 0.83;
      var ringSize = this.radius - centerRadius;
      var ringRadius = centerRadius + ringSize / 2;

      var ring = new Path2D();
      ring.arc(this.pX, this.pY, ringRadius * config.physics.ppm, 0, Math.PI * 2 * force);

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = ringSize * config.physics.ppm;
      ctx.stroke(ring);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.arc(this.pX, this.pY, centerRadius * config.physics.ppm, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  CircularButton.prototype.getPressForce = function() {
    var time = (Date.now() - this.pressStartTime) / 1000;
    var normalizedTime = time % this.periodicity;
    if (normalizedTime > this.periodicity / 2) {
      normalizedTime = this.periodicity - normalizedTime;
    }
    return normalizedTime / this.periodicity * 2;
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
