/////////////////////////////
// arrow on top of the wheel of fortune
/////////////////////////////
function Arrow(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.verts = [];

  this.pX = this.x * ppm;
  this.pY = (physicsHeight - this.y) * ppm;
  this.pVerts = [];

  this.createBody();
}
Arrow.prototype = {
  createBody: function() {
    this.createArrowShape();
  },

  createArrowShape: function() {
    this.verts[0] = [0, this.h * 0.5];
    this.verts[1] = [-this.w * 0.75, 0];
    this.verts[2] = [0, -this.h * 0.5];
    this.verts[3] = [this.w * 0.25, 0];

    this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
    this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
    this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
    this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

    var shape = new p2.Convex(this.verts);
    shape.material = arrowMaterial;

    return shape;
  },
  update: function() {

  },
  draw: function() {
    ctx.save();
    
    ctx.translate(this.pX, this.pY);

    ctx.fillStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(this.pVerts[0][0], this.pVerts[0][1]);
    ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
    ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
    ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
  }
};