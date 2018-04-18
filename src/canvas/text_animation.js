export default class TextAni{
    constructor(){
        this.canvas = document.createElement('canvas');
        this.container = document.getElementsByClassName('container')[0];
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.mousePos = new Vector(0,0);
        window.addEventListener('resize',this.resize,false);
        this.canvas.addEventListener('mousemove',this.getMouse,false);
        this.points = this.drawTxt('暇は辛い');
        this.particles = [];
        this.creatParticles();
        this.animation();
    }
    getMouse = (e) => {
        this.mousePos = new Vector(e.clientX,e.clientY);
    }
    drawTxt = (letter)  => {
        let positions:Vector= [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.font = 'bold 15rem Arial';
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(letter, this.canvas.width / 2 - this.ctx.measureText(letter).width/2, this.canvas.height / 2);
        let idata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let buffer32 = new Uint32Array(idata.data.buffer);
        let gridX = 10;
        let gridY = 10;
        for (let y = 0; y <= this.canvas.height; y += gridY) {
          for (let x = 0; x <= this.canvas.width; x += gridX) {
            if (buffer32[y * this.canvas.width + x]) {
              positions.push(new Vector(x,y));
            }
          }
        }
        this.ctx.restore();
        return positions;
    }
    creatParticles = () =>{
        for(let i=0;i<this.points.length;i++){
            let point = this.points[i];
            let particle = new Point(point);
            this.particles.push(particle);
        };
        
    }
    draw = () =>{
        
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i=0;i<this.particles.length;i++){
            this.particles[i].getMouse(this.mousePos);
            this.particles[i].behavior();
            this.particles[i].move();
            this.ctx.beginPath();
            this.ctx.fillStyle = "#000";
            this.ctx.globalAlpha = 1-this.particles[i].vel.mag();
            this.ctx.arc(this.particles[i].pos.a,this.particles[i].pos.b,5,0,Math.PI*2,false);
            this.ctx.fill();
            this.ctx.closePath();
        }

    }
    resize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
    }
    animation = () =>{
      
        this.draw();
        requestAnimationFrame(this.animation)
    }
}
class Point{
    constructor(targetpos){
      let w= window.innerWidth;
      let h= window.innerHeight;
      this.pos = new Vector(Math.random()*w,Math.random()*h);
      this.vel = new Vector(0,0);
      this.acc = new Vector(0,0);
      this.target = targetpos;
      this.maxSpeed = 5;
      this.maxForce = 0.5;
    }
    getMouse = (mouse) => {
      this.mousePos = mouse
    }
    applyForce = (force:Vector) =>{
        this.acc.add(force);
    }
    behavior = () =>{
        let target = new Vector(this.target.a,this.target.b);
        let arrive = this.arrive(target);
		let mouse = new Vector(this.mousePos.a, this.mousePos.b);
		let flee = this.flee(mouse);
		
		// arrive.mult(1);
		// flee.mult(5);
		
		this.applyForce(arrive);
		this.applyForce(flee);
    }
    flee = (target:Vector) => {
        let desire : Vector = target.sub(this.pos);
       
        let distance = desire.mag();
        let speed = this.maxSpeed;
        if(distance<50){
            desire.normalize()*speed;
            let steer : Vector = desire.sub(this.vel);
            let steerC = new Vector(steer.a,steer.b);
            if(steerC.mag()>this.maxForce) steer = steer.normalize().mul(this.maxForce);
            steer.mul(-1);
            return steer;
        }else{
            return new Vector(0,0)
        }
    }
    arrive = (target) =>{
      let desire = target.sub(this.pos) ;
      let distance = desire.mag();
      let speed = this.maxSpeed;
      if(distance<100){
        speed = distance*this.maxSpeed/100;
      }
      let temp = desire.normalize().mul(speed);
      let steer = temp.sub(this.vel);
      let steerC = new Vector(steer.a,steer.b);
      if(steerC.mag()>this.maxForce) steer = steer.normalize().mul(this.maxForce);
      return steer;
    }
    move = () =>{
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.acc.mul(0);
    }
}
class Vector{
    constructor(posx,posy){
        this.a = posx;
        this.b = posy;
    }
    add = (ar) =>{
        this.a += ar.a;
        this.b += ar.b;
        return this;
    }
    sub = (ar) => {
        this.a -= ar.a;
        this.b -= ar.b;
        return this;
    }
    mul = (number) =>{
        this.a*=number;
        this.b*=number;
        return this;
    }
    div = (number) =>{
        this.a/=number;
        this.b/=number;
        return this;
    }
    mag = () => {
      return Math.sqrt(this.a*this.a+this.b*this.b);
    }
    normalize = () =>{
        let mag = this.mag(this);
        return this.div(mag);
    }
}