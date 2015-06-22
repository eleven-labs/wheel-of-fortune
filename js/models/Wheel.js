/////////////////////////////
// wheel of fortune
/////////////////////////////

(function() {
  'use strict';

  function Wheel(x, y, radius, segments) {
    this.updatePosition(x, y, radius);
    this.segments = segments;
    this.deltaPI = Math.PI * 2 / this.segments.length;

    this.createBody();
  }

  Wheel.prototype.updatePosition = function(x, y, radius) {
    this.x = x;
    this.y = y;
    this.pX = this.x * config.physics.ppm;
    this.pY = config.physics.physicsHeight * 0.61 * config.physics.ppm;

    this.radius = radius;
    this.pRadius = this.radius * config.physics.ppm;

    if (this.body) {
      this.body.position = [this.x, this.y];
    }

    if (this.axis) {
      this.axis.position = [this.x, this.y];
    }
  };

  Wheel.prototype.createBody = function() {
    this.body = new p2.Body({
      mass: 1,
      position: [this.x, this.y]
    });

    this.body.angularDamping = 0.2;
    this.body.addShape(new p2.Circle(this.radius));

    this.axis = new p2.Body({
      position: [this.x, this.y]
    });

    this.constraint = new p2.LockConstraint(this.body, this.axis);
    this.constraint.collideConnected = false;

    world.addBody(this.body);
    world.addBody(this.axis);
    world.addConstraint(this.constraint);
  };

  Wheel.prototype.getNormalizeAngle = function() {
    var angle = this.body.angle % (Math.PI * 2);

    if (angle < 0) {
      angle += Math.PI * 2; // positive value
    }

    return angle;
  };

  Wheel.prototype.getScore = function() {
    return Math.floor(this.getNormalizeAngle() / this.deltaPI);
  };

  Wheel.prototype.getSegmentPercent = function(score) {
    var progress = this.getNormalizeAngle() - score * this.deltaPI;
    return progress / this.deltaPI;
  };

  Wheel.prototype.draw = function() {
    // TODO this should be cached in a canvas, and drawn as an image
    ctx.save();
    ctx.translate(this.pX, this.pY);

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(0, 0, this.pRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-this.body.angle);

    this.drawSegments();

    ctx.restore();
  };

  Wheel.prototype.drawSegments = function() {
    var l = this.segments.length;

    for (var i = 0; i < l; i++) {
      ctx.fillStyle = this.segments[i].color;
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    var minImageY = this.pRadius * 0.4;
    var maxHeight = this.pRadius * 0.5 * 0.7;

    for (var j = 0; j < l; j++) {
      var segmentLabel = this.segments[j].label;

      ctx.save();
      ctx.rotate(-Math.PI * 0.5);
      ctx.rotate(j * this.deltaPI + this.deltaPI / 2);

      var image = this.img[segmentLabel] ? this.img[segmentLabel] : this.img.default;
      var height = maxHeight;
      var width = (height * image.width) / image.height;
      var imageY = minImageY + height * 0.5;

      if (image.width > image.height) {
        var percent = image.height / image.width;
        percent = percent < 0.8 ? percent : 0.8;
        width = width * percent;
        height = (width * image.height) / image.width;
      }

      ctx.drawImage(image, -width / 2, imageY, width, height);
      ctx.restore();
    }
  };

  Wheel.prototype.initAssets = function() {
    var sound = document.createElement('audio');
    sound.setAttribute('src', config.sounds.wheelSpin);
    this.sound = sound;

    var soundFound = document.createElement('audio');
    soundFound.setAttribute('src', config.sounds.wheelFound);
    this.soundFound = soundFound;

    this.img = {};

    this.img.default = new Image(); // Create new img element
    this.img.default.src = config.images.defaultPlanetIcon; // Set source path
    var l = this.segments.length;

    for (var i = 0; i < l; i++) {
      var segmentIcon = this.segments[i].icon;

      if (segmentIcon) {
        var segmentLabel = this.segments[i].label;
        this.img[segmentLabel] = new Image();
        this.img[segmentLabel].src = segmentIcon;
      }
    }
  };

  window.Wheel = Wheel;
})();
