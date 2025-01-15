let walls = [];
let ray;
let particle;

let wallCount = 10;
let rayCount = 2; ////between 0-1 is best but it can be 0-X

function setup() {
  createCanvas(1000, 1000);

  let centerX = width / 2.1;
  let centerY = height / 2.3;
  let rings = 30; // Número de círculos concéntricos
  let radiusStep = 10;

  for (let i = 1; i <= rings; i++) {
    let radius = i * radiusStep;
    let points = 512; // Número de puntos en el círculo

    for (let j = 0; j < points; j++) {
      let angle1 = TWO_PI / points * j;
      let angle2 = TWO_PI / points * (j + 1);

      let x1 = centerX + cos(angle1) * radius;
      let y1 = centerY + sin(angle1) * radius;
      let x2 = centerX + cos(angle2) * radius;
      let y2 = centerY + sin(angle2) * radius;

      walls.push(new Boundary(x1, y1, x2, y2));
    }
  }
  ////////////////////////////////////////Outlines
  walls.push(new Boundary(-1, -1, width, -1));
  walls.push(new Boundary(width+1, -1, width+1, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));

  particle = new Particle();

  noCursor();
}

function draw() {
  background(0);

  for (let wall of walls) {
    wall.show();
  }
  particle.update(mouseX, mouseY); //// interaccion del mause
  particle.show();
  particle.look(walls);
}

///////////////////////////////////////////////Walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.touched = false; // Nuevo atributo para marcar si la pared ha sido tocada
    this.lastTouchedTime = null; // Momento en que fue tocada por última vez
  }

  show() {
    if (this.touched) {
      stroke(255, 0, 0); // Rojo si ha sido tocada
    } else {
      stroke(0, 0, 255); // Azul si no ha sido tocada
    }
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  toggleTouched() {
    this.touched = true; // Cambia a rojo
    this.lastTouchedTime = millis(); // Registra el momento del toque
  }

  update() {
    if (this.touched && millis() - this.lastTouchedTime > 3000) {
      this.touched = false; // Cambia de nuevo a azul después de 3 segundos
    }
  }
}

///////////////////////////////////////////Rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 0, this.dir.y * 0);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

////////////////////////////////////////////////////Particles
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      let touchedWall = null; // Variable para almacenar la pared tocada
      for (let wall of walls) {
        wall.update(); // Actualiza el estado de cada pared
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
            touchedWall = wall; // Guarda la pared más cercana
          }
        }
      }
      if (closest) {
        // Cambia el estado de la pared tocada
        if (touchedWall) {
          touchedWall.toggleTouched();
        }

        stroke(255, 0, 0, 100); // Color del rayo
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 0);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
