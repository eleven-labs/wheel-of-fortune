/////////////////////////////
// wheel of fortune
/////////////////////////////

(function() {
  'use strict';

  function Wheel(x, y, radius, segments) {
    this.updatePosition(x, y, radius);
    this.segments = segments;

    this.createBody();
  }

  Wheel.prototype.updatePosition = function(x, y, radius) {
    this.x = x;
    this.y = y;
    this.pX = this.x * config.physics.ppm;
    this.pY = this.y * config.physics.ppm;

    this.radius = radius;
    this.pRadius = this.radius * config.physics.ppm;

    if (this.body) {
      this.body.position = [this.x, config.physics.physicsHeight - this.y];
    }

    if (this.axis) {
      this.axis.position = [this.x, config.physics.physicsHeight - this.y];
    }
  };

  Wheel.prototype.createBody = function() {
    this.body = new p2.Body({
      mass: 1,
      position: [this.x, config.physics.physicsHeight - this.y]
    });

    this.body.angularDamping = 0.2;
    this.body.addShape(new p2.Circle(this.radius));

    this.axis = new p2.Body({
      position: [this.x, config.physics.physicsHeight - this.y]
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
    var angle = this.getNormalizeAngle();
    for (var i = 0; i < this.segments.length; ++i) {
      if (angle >= this.segments[i].start && angle < this.segments[i].start + this.segments[i].size) {
        return i;
      }
    }
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
    this.updateSegmentsPosition();
    var l = this.segments.length;

    this.segments.forEach(function(segment) {
      var start = segment.start;
      var size = segment.size;
      var end = start + size;
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, start, end);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = segment.secondaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, end - segment.bonusSize, end);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }.bind(this));

    var minImageY = this.pRadius * 0.4;
    var maxHeight = this.pRadius * 0.5 * 0.7;

    for (var j = 0; j < l; j++) {
      var segmentLabel = this.segments[j].label;

      ctx.save();
      ctx.rotate(-Math.PI * 0.5);
      ctx.rotate(this.segments[j].start + this.segments[j].size / 2);

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

  Wheel.prototype.updateSegmentsPosition = function() {
    var additionalWeight = this.segments.reduce(function(additionalWeight, segment) {
      return additionalWeight + segment.additionalWeight;
    }, 0);
    var baseSize = Math.PI * 2 / this.segments.length;
    var sizeRatio = 1 + additionalWeight / this.segments.length;
    var startPos = 0;
    this.segments = this.segments.map(function(segment) {
      var newSegment = _.clone(segment);
      newSegment.start = startPos;
      newSegment.size = baseSize * (1 + newSegment.additionalWeight) / sizeRatio;
      newSegment.bonusSize = newSegment.size - newSegment.size / (1 + newSegment.additionalWeight);
      startPos += newSegment.size;
      return newSegment;
    });
  };

  window.Wheel = Wheel;
})();
