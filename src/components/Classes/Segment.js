import p5 from 'p5';
let p = new p5;

export default class Segment {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = p5.width/3;
    this.h = p5.height/2;
    this.hitLeft = false;
    this.hitRight = false;
    this.alpha = 0;
  }

  display() {
    if (this.hitLeft || this.hitRight) {
      //this.alpha = p5.lerp(this.alpha, 255, 0.3)
      p.fill(255, 0, 255, this.alpha);
      p.rect(this.x, this.y, p5.width/3, p5.height/2);
    } else {
      //this.alpha = p5.lerp(this.alpha, 0, 0.1)
      p.fill(255, 0, 0, this.alpha);
      p.rect(this.x, this.y, p5.width/3, p5.height/2);
    }
  }

  checkCollision(targetL, targetR) {
    this.hitLeft = collision(targetL.x, targetL.y, 5, this.x, this.y, this.w, this.h)
    this.hitRight = collision(targetR.x, targetR.y, 5, this.x, this.y, this.w, this.h)
  }
}

function collision(targetX, targetY, radius, segX, segY, segW, segH) {
  let testX = targetX;
  let testY = targetY;

  if (targetX < segX) {testX = segX}
  else if (targetX > segX+segW) {testX = segX + segW}

  if (targetY < segY) {testY = segY}
  else if (targetY > segY+segH) {testY = segY + segH}

  let distX = targetX - testX;
  let distY = targetY - testY;
  let distance = Math.sqrt((distX*distX) + (distY * distY));

  if (distance <= radius) {
    return true;
  }
  return false;
}