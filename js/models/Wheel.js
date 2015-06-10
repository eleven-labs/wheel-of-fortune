/////////////////////////////
// wheel of fortune
/////////////////////////////

function Wheel(x, y, radius, segments) {
  'use strict';

  this.updatePosition(x, y);
  this.radius = radius;
  this.segments = segments;

  this.pRadius = this.radius * config.physics.ppm;
  this.deltaPI = Math.PI * 2 / this.segments.length;

  this.createBody();
}

(function() {
  'use strict';

  Wheel.prototype.updatePosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.pX = this.x * config.physics.ppm;
    this.pY = (config.physics.physicsHeight - this.y) * config.physics.ppm;
  };

  Wheel.prototype.createBody = function() {
    this.body = new p2.Body({
      mass: 1,
      position: [this.x, this.y]
    });

    this.body.angularDamping = 0.5;
    this.body.addShape(new p2.Circle(this.radius));

    var axis = new p2.Body({
      position: [this.x, this.y]
    });

    var constraint = new p2.LockConstraint(this.body, axis);
    constraint.collideConnected = false;

    world.addBody(this.body);
    world.addBody(axis);
    world.addConstraint(constraint);
  };

  Wheel.prototype.getScore = function() {
    var currentRotation = wheel.body.angle % (Math.PI * 2);
    //currentRotation += this.deltaPI / 2; // offset
    if (currentRotation < 0) {
      currentRotation += Math.PI * 2; // positive value
    }

    var currentSegment = Math.floor(currentRotation / this.deltaPI);

    return currentSegment;
  };

  Wheel.prototype.draw = function() {
    // TODO this should be cached in a canvas, and drawn as an image
    ctx.save();
    ctx.translate(this.pX, this.pY);

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(0, 0, this.pRadius + 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-this.body.angle);

    this.drawSegments();

    ctx.restore();
  };

  Wheel.prototype.drawSegments = function() {
    for (var i = 0; i < this.segments.length; i++) {
      ctx.fillStyle = this.segments[i].color;
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    for (var j = 0; j < this.segments.length; j++) {
      ctx.save();
      ctx.rotate(-Math.PI * 0.5);
      ctx.rotate(j * this.deltaPI + this.deltaPI / 2);
      //ctx.rotate(-this.deltaPI/this.segments.length);
      ctx.textAlign = "center";
      ctx.fillStyle = 'yellow';
      ctx.fillText(this.segments[j].label, 0, 205);
      // if(this.segments[j].type)
      ctx.drawImage(this.img.rocket, -this.img.rocket.width / 2, 100);
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

    var img = new Image(); // Create new img element
    img.src = config.images.defaultPlanetIcon; // Set source path
    this.img = {};
    this.img.rocket = img;
  };
})();
