import * as THREE from 'three';
import {randomPointsInGeometry} from './utils';
export default class threetext {
  constructor() {
    this.container = document.getElementsByClassName('dbox')[0];
    this.init();
  }
  init = () => {
    this.color = 0;
    this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.01,
			2000
		);
		this.camera.position.z = 1000;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.domElement.classList.add('stage');

    this.container.appendChild(this.renderer.domElement);

    this.particles = new THREE.Geometry();
    this.pMaterial = new THREE.PointsMaterial({
      size: 1,
    })
    this.numberParticles = 3000;
    // Particles
    for (let i = 0; i < this.numberParticles; i++) {
      let vertex = new THREE.Vector3();
          vertex.x = 0;
          vertex.y = 0;
          vertex.z = 0;

      this.particles.vertices.push(vertex);
    }
    this.particleSystem = new THREE.Points(
      this.particles,
      this.pMaterial
    )

    this.scene.add(this.particleSystem);
    let loader = new THREE.FontLoader();

    loader.load('/font02.json',(font)=>{
      
      let theText = ["I","AM","CATERS"];
      let text3d = [];
      for(let i=0;i<theText.length;i++){
        text3d[i] = {};
        text3d[i].geometry = new THREE.TextGeometry(theText[i],{
          size : window.innerWidth*0.02,
          height : 4,
          curveSegments : 10,
          font : font
        });
      
        text3d[i].geometry.center();
        text3d[i].particles = new THREE.Geometry();
        text3d[i].points = randomPointsInGeometry(text3d[i].geometry, this.numberParticles);
        
        this.createVertices(text3d[i].particles,text3d[i].points);
      }
      this.morpto(text3d[2].particles);
    })

    
    this.render();
  }
  createVertices = (emptyArray, points) =>{
    for (let i=0;i<points.length;i++){
      let vertex = new THREE.Vector3();
      vertex.x = points[i].x;
      vertex.y = points[i].y;
      vertex.z = points[i].z;
      emptyArray.vertices.push(vertex);
    }
  }
  morpto = (p) => {
    
    for(let i=0;i<p.vertices.length;i++){
      
      this.particles.vertices[i].x = p.vertices[i].x;
      this.particles.vertices[i].y = p.vertices[i].y;
      this.particles.vertices[i].z = p.vertices[i].z;

    }
  }
  render = () =>{
    this.color = this.color > 100 ? 0 : this.color+=0.5;
    
    this.particles.verticesNeedUpdate = true;
    this.particleSystem.rotation.y += 0.01;
    this.particleSystem.material.color = new THREE.Color(`hsla(${this.color},50%,50%,1)`);
    this.camera.position.z = 400;
    this.renderer.render(this.scene,this.camera);
    requestAnimationFrame(()=>this.render());
  }
}