import Vector from './components/vector';
import OpenSimplexNoise from 'open-simplex-noise';

const canvas = document.createElement('canvas');
const  ctx = canvas.getContext('2d');
let hue = 0;
export default class FlowPath{
  constructor(){
    this.container = document.getElementsByClassName('container')[0];
    this.container.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // window.addEventListener('resize',this.resize,false);
    this.init();
  }
  init = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#000";
    ctx.fill();
    this.path = [];
    this.createPath();
    this.createParticle();
    this.animation();
  }
  createPath = () =>{
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.moveTo(0,canvas.height/2);
    ctx.lineTo(canvas.width/4,canvas.height/3);
    ctx.lineTo(canvas.width/2,canvas.height/2);
    ctx.lineTo(3*canvas.width/4,canvas.height/4);
    ctx.lineTo(canvas.width,canvas.height/2);
    ctx.stroke();
    ctx.closePath()
    ctx.restore();
    let seg01_start = new Vector(0,canvas.height/2);
    let seg01_end = new Vector(canvas.width/4,canvas.height/3);
    let seg02_end = new Vector(canvas.width/2,canvas.height/2);
    let seg03_end = new Vector(3*canvas.width/4,canvas.height/4);
    let seg04_end = new Vector(canvas.width,canvas.height/2);
    this.getSegmentPoints(seg01_start);
    this.getSegmentPoints(seg01_end);
    this.getSegmentPoints(seg02_end);
    this.getSegmentPoints(seg03_end);
    this.getSegmentPoints(seg04_end);
  }
  getSegmentPoints = (point) =>{
    this.path.push(point);
  }
  createParticle = () =>{
    let number = 100;
    this.particles = [];
    for(let i=0;i<number;i++){
        this.particles.push(new Particle(Math.random()*canvas.width,Math.random()*canvas.height));
    }
  }
  draw = () =>{
    for(let i=0;i<this.particles.length;i++){
        this.particles[i].behavior(this.path);
    }
  }
  animation = () =>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#000";
    ctx.fill();
    this.draw();
    window.requestAnimationFrame(this.animation);
  }
  resize = () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#000";
    ctx.fill();
  }
}
class Particle{
  constructor(x,y){
      this.pos = new Vector(x,y);
      this.vel = new Vector(0,0);
      this.acc = new Vector(0,0);
      this.size = 5;
      this.maxSpeed = 5;
      this.noise = new OpenSimplexNoise(Math.random());
      this.noiseX = Math.random()*20+1;
      this.maxSpeed = 5;
      this.maxForce = 0.5;
      this.radius = 50;
  }
  applyForce = (force)=>{
      this.acc.add(force);
      this.move();
  }
  bound = () =>{
      if(this.pos.x > canvas.width + this.size){
         this.pos.x = this.size;
      }else if(this.pos.x < -this.size){
         this.pos.x = canvas.width -1;
      }
      if(this.pos.y > canvas.height + this.size){
          this.pos.y = this.size;
       }else if(this.pos.y < -this.size){
          this.pos.y = canvas.height -1;
       }
  }
  getNormalPoint = (p,a,b) =>{
    let ap = new Vector(p.x-a.x,p.y-a.y);
    let ab = new Vector(b.x-a.x,b.y-a.y);
    ab.normalize();
    let mag = ap.dot(ab);
    let value = ab.mul(mag);
    return new Vector(value.x+a.x,value.y+a.y);
    
  }
  findTarget = (segmentPoints) =>{
    let predict = new Vector(this.vel.x,this.vel.y);
    predict.normalize().mul(50);
    // console.log(predict.x);
    let predictPos = predict.add(this.pos);
    let record = 10000000;
    let target = null;
    let normal = null;
    for(let i=0;i<segmentPoints.length-1;i++){
      let a = new Vector(segmentPoints[i].x,segmentPoints[i].y);
      let b = new Vector(segmentPoints[i+1].x,segmentPoints[i+1].y);
      
      // this.getNormalPoint(predictPos,a,b);
      let normalPoint = this.getNormalPoint(predictPos,a,b);
      if(normalPoint.x<a.x||normalPoint.x>b.x){
        normalPoint = new Vector(b.x,b.y);
      }
      let distance = predictPos.sub(normalPoint).mag();
      
      if(distance<record){
        record = distance;
        let dir = new Vector(b.x-a.x,b.y-a.y);
        dir.normalize().mul(15)
        target = new Vector(normalPoint.x,normalPoint.y);
        target.add(dir);
      }
    }
    if (record > 30) {
			return target;
		}
  }
  behavior = (segmentPoints) =>{
    let target = this.findTarget(segmentPoints);
    if(target){
      let arrive = this.arrive(target);
      this.applyForce(arrive);
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
      this.acc = new Vector(0,0);
      this.bound();
      this.draw();
  }
  draw = () =>{
      
      ctx.save();
      ctx.fillStyle = `hsla(${hue}, 50%, 50%, 1)`;
      ctx.beginPath();
      ctx.globalAlpha = this.noise.noise3D(this.noiseX,this.noiseX,Math.random());
      ctx.arc(this.pos.x,this.pos.y,this.size,0,Math.PI*2,false);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
  } 

}