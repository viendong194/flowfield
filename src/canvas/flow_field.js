// import Particle from './components/particle';
import Vector from './components/vector';
import OpenSimplexNoise from 'open-simplex-noise';

const canvas = document.createElement('canvas');
const  ctx = canvas.getContext('2d');
let hue = 0;
export default class FlowField{
    constructor(){
        this.container = document.getElementsByClassName('container')[0];
        this.container.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize',this.resize,false);
        this.init();
    }
    init = () => {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.rect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#000";
        ctx.fill();

        this.columns = Math.round(canvas.width/20);
        this.rows = Math.round(canvas.height/20);
        this.noise = new OpenSimplexNoise(Date.now());
        // this.noise.seed(Math.random());
        this.noise3 = 0;

        this.createField();
        this.createParticle();
        this.animation();
        
    }
    createField = () =>{
        this.field = [];
        for(let i=0;i<this.columns;i++){
            this.field[i] = [];
            for(let j=0;j<this.columns;j++){
               this.field[i][j] = new Vector(0,0)
            }
        }
    }
    calculateField = () =>{
        for(let i=0;i<this.columns;i++){
            for(let j=0;j<this.columns;j++){
               let angle = this.noise.noise3D(i/20,j/20,this.noise3);
               let length = this.noise.noise3D(i/40+40000,j/40+40000,this.noise3)*0.01;
               let x = Math.cos(angle)*length;
               let y = Math.sin(angle)*length;
               this.field[i][j] = new Vector(x,y);
            //    console.log(x+";;"+y);
            }
        }
    }
    createParticle = () =>{
        let number = canvas.width*canvas.height/2000;
        this.particles = [];
        for(let i=0;i<number;i++){
            this.particles.push(new Particle(Math.random()*canvas.width,Math.random()*canvas.height));
        }
    }
    draw = () =>{
       this.calculateField();
       for(let i=0;i<this.particles.length;i++){
           let a = Math.floor(this.particles[i].pos.x/this.columns);
           let b = Math.floor(this.particles[i].pos.y/this.rows);
           if( a>0 && a<this.columns && b>0 && b<this.rows){
            let posx = this.field[a][b].x;
            let posy = this.field[a][b].y;
            let force = new Vector(posx,posy);
         //    console.log(force)
            this.particles[i].applyForce(force);
            this.particles[i].bound();
           }
           
       }
    
    }
    animation = () =>{
        hue +=0.5;
        this.noise3 +=0.001;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.rect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#000";
        ctx.fill();
        this.draw();
        requestAnimationFrame(this.animation)
    }
    resize = () =>{
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.rect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#000";
    }
}
class Particle{
    constructor(x,y){
        this.pos = new Vector(x,y);
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.size = 5;
        this.maxSpeed = 5;
    }
    applyForce = (force)=>{
        this.acc.add(force);
        this.move();
    }
    bound = () =>{
        if(this.pos.x > canvas.width){
           this.pos.x = this.size;
        }else if(this.pos.x < -this.size){
           this.pos.x = canvas.width;
        }
        if(this.pos.y > canvas.height){
            this.pos.y = this.size;
         }else if(this.pos.y < -this.size){
            this.pos.y = canvas.height;
         }
    }
    move = () =>{
        let speed = new Vector(this.vel.x,this.vel.y);
        if(speed.mag()>5) this.vel.normalize().mul(5);
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.acc = new Vector(0,0);
        // this.bound();
        this.draw();
    }
    draw = () =>{
        ctx.save();
        ctx.fillStyle = `hsla(${hue}, 50%, 50%, 1)`;
        ctx.beginPath();
        ctx.arc(this.pos.x,this.pos.y,this.size,0,Math.PI*2,false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    } 

}