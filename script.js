//preview: python -m http.server
let score = 0;
let globalCooldown = 0;
let myBall;
let holdChecker = 0;
let allBalls = [];
let obstacles = [];
let tops = [];
let gameStart = 20;

function setup() {
  createCanvas(windowWidth - 100, windowHeight - 100);
  background(136, 241, 252);
  myBall = new Ball(width / 2, height / 2, 40);
  //for (let n = 0; n < 50; n++) {
  //allBalls.push(new Ball(random(width), random(height), random(80)));
  //}
}

function clamp(num, min, max) {
  if (num > max) return max;
  if (num < min) return min;
  return num;
}

function combineArea(radius, addRadius) {
  console.log(radius + ", " + addRadius);
  let rSq = radius ** 2;
  let addSq = addRadius ** 2;
  rSq += addSq;
  return Math.floor(Math.sqrt(rSq));

}

function draw() {
  //Not a thing??
  globalCooldown--;
  background(136, 241, 252);
  //for (let i = 0; i < allBalls.length; i++) {
  // for (let j = 0; j < allBalls.length; j++) {
  //if ((i != j && allBalls[i].pos.dist(allBalls[j].pos) < allBalls[j].r)) {
  //     console.log("hit!")
  //}
  //}
  //allBalls[i].update();
  //allBalls[i].checkKeys();
  if (gameStart <= 0) {
    myBall.update();
  } else {
    gameStart--;
  }
  /*if (score >= 0)*/ myBall.checkKeys();

  //allBalls[i].display();

  if (frameCount % 70 == 0) {
    let gap = 100;
    let height1 = random((height - 100), (height / 5));
    if (score < 1) obstacles.push(new Obstacle(width, height1, 160, height - height1));
    if (score < 1) tops.push(new Obstacle(width, 0, 160, height1 - gap));

  }
  let removeObstaclesList = [];
  for (let n = 0; n < obstacles.length; n++) {
    obstacles[n].display();
    tops[n].display();
    if (score < 1) obstacles[n].pos.x -= 9;
    tops[n].pos.x = obstacles[n].pos.x;
    if (obstacles[n].pos.x <= -obstacles[n].width) removeObstaclesList.push(n);
  }
  for (let r = removeObstaclesList.length; r > 0; r--) {
    obstacles.splice(removeObstaclesList[r], 1);
    tops.splice(removeObstaclesList[r], 1);
    score++;
  }


  myBall.display();
  textAlign(CENTER);
  textSize(height / 8);
  if (gameStart <= 0) {
    if (score >= 0) {
      text(score, width / 2, height / 3);
    } else {
      text("You Lose", width / 2, height / 3);
    }
  } else {
    textSize(height / 11);
    text("Press any key to start in " + gameStart, width / 2, height / 3);
  }
}

class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.r = r;
    this.topSpeed = 40;
    this.friction = 0.99;
    this.red = 235
    this.green = 225
    this.blue = 52
    this.grav = 0.7
  }

  combine(index) {

    var totalR = this.r + allBalls[index].r;
    if (this.pos.dist(allBalls[index].pos) > totalR) {
    }

    var biggerPercent = this.r / totalR;
    var smallerPercent = allBalls[index].r / totalR;
    this.red *= biggerPercent;
    this.green *= biggerPercent;
    this.blue *= biggerPercent;

    allBalls[index].red *= smallerPercent;
    allBalls[index].green *= smallerPercent;
    allBalls[index].blue *= smallerPercent;

    this.red += allBalls[index].red;
    this.green += allBalls[index].green;
    this.blue += allBalls[index].blue;

    this.r = combineArea(this.r, allBalls[index].r);

    allBalls[index].r = 0;

  }

  // Method to check keyboard input and apply forces
  checkKeys() {
    if (gameStart > 0) {
      if ((keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) || keyIsDown(UP_ARROW)) gameStart = 0;
    }
    if (!keyIsDown(UP_ARROW)) {
      holdChecker -= 2;
      if (holdChecker < 0) holdChecker = 0;
    }
    let forceMagnitude = 1;
    if (keyIsDown(LEFT_ARROW)) this.applyForce(createVector(-forceMagnitude, 0));
    if (keyIsDown(RIGHT_ARROW)) this.applyForce(createVector(forceMagnitude, 0));
    if (keyIsDown(UP_ARROW)) {
      if (globalCooldown > 0) return;
      if (holdChecker > 0) return;
      this.vel.y = -12;
      globalCooldown = 8;
    }
    //if (keyIsDown(DOWN_ARROW)) this.applyForce(createVector(0, forceMagnitude));
    if (keyIsDown(UP_ARROW)) {
      holdChecker++;
      if (holdChecker > 4) holdChecker = 4;
    }
  }

  // The "Force" pattern: Force adds to Acceleration
  setForce(force) {
    this.vel.set(force);
  }
  applyForce(force) {
    this.vel.add(force);
  }

  update() {

    this.acc.add(createVector(0, 0.7));
    // 1. Acceleration changes Velocity
    this.vel.add(this.acc);

    // 2. Limit the speed so it doesn't go infinite
    this.vel.limit(this.topSpeed);

    this.predictedPos = this.pos;
    this.predictedPos.add(this.vel);
    // 3. Velocity changes Position

    let closest = 0;
    let shortestValue = []
    if (obstacles.length > 0) {
      for (let i = 0; i < obstacles.length; i++) {
        let collision = obstacles[i].hitbox; // x, further x, y, higher y
        collision[0] -= 20;
        collision[1] += 20;

        let distx1 = Math.abs(this.predictedPos.x - collision[0]);
        let distx2 = Math.abs(this.predictedPos.x - collision[1]);
        let shortestDistance = 9999;
        if (distx1 > distx2) {
          shortestDistance = distx2;
        } else {
          shortestDistance = distx1;
        }
        shortestValue.push(shortestDistance);
        if (shortestDistance < shortestValue[closest]) {
          closest = i;
        }
      }
      //console.log(closest);
      //console.log(obstacles[closest]);
      obstacles[closest].makeSpecial();
      tops[closest].makeSpecial();

      let hitbox = obstacles[closest].hitbox; // x, further x, y, higher y
      let topbox = tops[closest].hitbox;
      /*hitbox[0] -= 20;
      hitbox[1] += 20;
      hitbox[2] -= 20;
      hitbox[3] += 20;
      */
      let xCenter = (hitbox[0] + hitbox[1]) / 2;

      let dWall = 0;
      //[0]
      if (!(this.pos.y > hitbox[2]) && !(this.pos.y < topbox[3])) {
        this.pos.x += this.vel.x;
      } else {
        if (this.pos.x < xCenter) {
          dWall = hitbox[0] - this.pos.x; //+
          if (this.vel.x > dWall) {
            this.pos.x += ((2 * dWall) - this.vel.x);
            this.vel.x *= -1;
          } else {
            this.pos.x += this.vel.x;
          }

        } else { //[1]
          dWall = hitbox[1] - this.pos.x; //-
          if (this.vel.x < dWall) {
            this.pos.x += ((2 * dWall) - this.vel.x);
            this.vel.x *= -1;
          } else {
            this.pos.x += this.vel.x;
          }
        }
      }
      let dFloor = 0;
      if ((this.pos.x > hitbox[0]) && (this.pos.x < hitbox[1])) {
        if (this.vel.y > 0) {
          dFloor = topbox[3] - this.pos.y; // - //low - higher = neg. neg gvel less than neg dist
          if (this.vel.y < dWall) {
            this.pos.y += ((2 * dFloor) - this.vel.y);
            this.vel.y *= -1;
          } else {
            this.pos.y += this.vel.y;
          }
          //topbox bottom
        } else {
          dFloor = hitbox[2] - this.pos.y; // + // up dist, bigger - smaller vel greater
          if (this.vel.y < dWall) {
            this.pos.y += ((2 * dFloor) - this.vel.y);
            this.vel.y *= -1;
            console.log("hit bottom");
          } else {
            this.pos.y += this.vel.y;
          }
        }
      } else {
        //this.pos.y += this.vel.y;
      }
    }



    //this.pos.add(this.vel);
    //should just wrap
    this.checkEdges();

    // 4. Apply friction (velocity decay)
    this.vel.mult(this.friction);

    // 5. Reset acceleration for the next frame
    this.acc.mult(0);
  }

  display() {
    fill(this.red, this.green, this.blue);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  checkEdges() {
    this.pos.x = clamp(this.pos.x, 0 + (this.r / 2), width - (this.r / 2));
    this.pos.y = clamp(this.pos.y, 0 + (this.r / 2), height - (this.r / 2));
    if (!(this.r / 2 < this.pos.x && this.pos.x < width - (this.r / 2))) this.vel.x *= -1;
    if (!(this.r / 2 < this.pos.y && this.pos.y < height - (this.r / 2))) this.vel.y *= -1;
    //if (!(height - (this.r / 2) > this.pos.y)) score -= 2;
    //if (this.pos.x <= this.r / 2) score -= 5;
  }


  checkEdgesWrap() {
    this.changeX = 0;
    this.changeY = 0;
    if (this.pos.x > width) this.changeX = -width;
    if (this.pos.x < 0) this.changeX = width;
    if (this.pos.y > height) this.changeY = -height;
    if (this.pos.y < 0) this.changeY = height;
    this.pos.add(createVector(this.changeX, this.changeY));
  }
}

class Obstacle {
  constructor(x, y, width, height) {
    this.special = 0;
    this.pos = createVector(x, y);
    this.width = width;
    this.height = height;
  }

  makeSpecial() {
    this.special = 1;
  }

  display() {
    if (this.special == 1) {
      fill(235, 52, 52);
    } else {
      fill(100, 200, 50);
    }
    this.special = 0;
    this.hitbox = [this.pos.x, this.pos.x + this.width, this.pos.y, this.pos.y + this.height];
    rect(this.pos.x, this.pos.y, this.width, this.height);
    //this.collision = this.hitbox; // x, further x, y, higher y
    //this.collision[0] -= myBall.r;
    //this.collision[1] += myBall.r;
    //this.collision[2] -= myBall.r;
    //this.collision[3] += myBall.r;
    //fill(255,0,0,30);
    //noStroke();
    //rect(this.collision[0],this.collision[2],this.collision[1]-this.collision[0],this.collision[3]-this.collision[2]);
  }

}

function standardizeForce(vector) {
  let modifier = 8
  if (vector.x > vector.y) {
    modifier /= vector.x;
  } else {
    modifier /= vector.y;
  }
  Math.abs(modifier);
  vector.x *= modifier;
  vector.y *= modifier;
  return vector;
}

function oldCollision(i) {
  for (let i = 0; i < obstacles.length * 2; i++) {
    let collision = [];
    if (i >= obstacles.length) {
      collision = tops[i - obstacles.length].hitbox;
    } else {
      collision = obstacles[i].hitbox; // x, further x, y, higher y
    }
    collision[0] -= 20;
    collision[1] += 20;
    collision[2] -= 20;
    collision[3] += 20;
    let inY = false;
    let inX = false;
    if (myBall.pos.y > collision[2] && myBall.pos.y < collision[3]) inY = true;
    if (myBall.pos.x > collision[0] && myBall.pos.x < collision[1]) inX = true;
    if (inY && inX) {
      angleMode(DEGREES);
      let hitboxCenter = createVector((collision[0] + collision[1]) / 2, (collision[2] + collision[3]) / 2);
      let betweenVectorX = myBall.oldpos.x - hitboxCenter.x;
      let betweenVectorY = myBall.oldpos.y - hitboxCenter.y;
      let betweenVector = createVector(betweenVectorX, betweenVectorY);
      let xAxis = createVector(0, 1);
      let angleCollision = xAxis.angleBetween(betweenVector);

      let cornerAngle = [];
      for (let c = 0; c < 4; c++) {
        let cornerX = collision[Math.floor(c / 2)] - hitboxCenter.x;
        let cornerY = collision[2 + (c % 2)] - hitboxCenter.y;
        let vC = createVector(cornerX, cornerY);
        cornerAngle[c] = xAxis.angleBetween(vC);
      }

      if ((angleCollision > cornerAngle[0] && angleCollision <= 180) || (angleCollision < cornerAngle[2] && angleCollision > -180)) {
        // lower
        myBall.pos.y = clamp(myBall.pos.y, 0, collision[2]);
        myBall.vel.y *= -1;
      }
      if (angleCollision > cornerAngle[3] && angleCollision < cornerAngle[1]) {
        // upper
        myBall.pos.y = clamp(myBall.pos.y, collision[3], height);
        myBall.vel.y *= -1;
      }
      if (angleCollision <= cornerAngle[0] && angleCollision >= cornerAngle[1]) {
        myBall.pos.x = clamp(myBall.pos.x, 0, collision[0]);
        myBall.vel.x *= -1;
        myBall.applyForce(-12, 0);
      }
      if (angleCollision >= cornerAngle[2] && angleCollision <= cornerAngle[3]) {
        myBall.pos.x = clamp(myBall.pos.x, collision[1], width);
        myBall.vel.x *= -1;
      }
    }


  }
}