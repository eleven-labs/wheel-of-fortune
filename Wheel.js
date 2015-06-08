/////////////////////////////
// wheel of fortune
/////////////////////////////
function Wheel(x, y, radius, segments) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.segments = segments;

  this.pX = this.x * ppm;
  this.pY = (physicsHeight - this.y) * ppm;
  this.pRadius = this.radius * ppm;

  this.deltaPI = TWO_PI / this.segments.length;

  this.createBody();
}
Wheel.prototype = {
  createBody: function() {
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
  },
  getScore: function() {
    var currentRotation = wheel.body.angle % TWO_PI;
    //currentRotation += this.deltaPI / 2; // offset 
    if (currentRotation < 0) currentRotation += TWO_PI; // positive value

    var currentSegment = Math.floor(currentRotation / this.deltaPI);

    return currentSegment;
  },
  draw: function() {
    // TODO this should be cached in a canvas, and drawn as an image
    ctx.save();
    ctx.translate(this.pX, this.pY);

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(0, 0, this.pRadius + 20, 0, TWO_PI);
    ctx.fill();

    ctx.rotate(-this.body.angle);

    this.drawSegments();

    ctx.restore();
  },
  drawSegments: function() {

    for (var i = 0; i < this.segments.length; i++) {
      ctx.fillStyle = this.segments[i].color;
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    for (var i = 0; i < this.segments.length; i++) {
      ctx.save();
      ctx.rotate(-HALF_PI);
      ctx.rotate(i * this.deltaPI + this.deltaPI/2);
      //ctx.rotate(-this.deltaPI/this.segments.length);
      ctx.textAlign = "center";
      ctx.fillStyle = 'yellow';
      ctx.fillText(this.segments[i].label, 0, 205);
      // if(this.segments[i].type)
      ctx.drawImage(this.img.rocket, -this.img.rocket.width / 2, 100);
      ctx.restore();
    }
  },
  initAssets: function() {
    var sound = document.createElement('audio');
    sound.setAttribute('src', 'http://bramp.net/javascript/wheel.mp3');
    this.sound = sound;

    var soundFound = document.createElement('audio');
    soundFound.setAttribute('src', 'result.mp3');
    this.soundFound = soundFound;

    var img = new Image(); // Create new img element
    img.src = 'rocket.png'; // Set source path
    this.img = {};
    this.img.rocket = img;
  }
};