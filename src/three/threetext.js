import * as THREE from 'three';
import { randomPointsInGeometry } from './utils';
export default class threetext {
	constructor() {
		this.container = document.getElementsByClassName('dbox')[0];
		this.init();
	}
	init = () => {
		this.color = 0;
		this.loaded = false;
		this.count = 0;
		this.scene = new THREE.Scene();
		this.bufferPos = [];
		this.chaosPos = [];
    this.chaos = true;
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
			size: 1
		});
		this.numberParticles = 6000;
		// Particles
		for (let i = 0; i < this.numberParticles; i++) {
			this.bufferPos.push({ x: 0, y: 0, z: 0 });
			this.chaosPos.push({x:Math.random()*1000-500,y:Math.random()*1000-500,z:Math.random()*1000-500});
			let vertex = new THREE.Vector3();
			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;

			this.particles.vertices.push(vertex);
		}
		this.particleSystem = new THREE.Points(this.particles, this.pMaterial);

		this.scene.add(this.particleSystem);
		let loader = new THREE.FontLoader();
    let that = this;
		loader.load('/font02.json',function(font){
			let theText = [
				'FLEXIBLE',
				'AGILE',
				'CURIOUS',
				'WE',
				'ARE',
				'FRONTIERS'
			];
			that.text3d = [];
			for (let i = 0; i < theText.length; i++) {
				that.text3d[i] = {};
				that.text3d[i].geometry = new THREE.TextGeometry(theText[i], {
					size: window.innerWidth * 0.04,
					height: 8,
					curveSegments: 10,
					font: font
				});

				that.text3d[i].geometry.center();
				that.text3d[i].particles = new THREE.Geometry();
				that.text3d[i].points = randomPointsInGeometry(
					that.text3d[i].geometry,
					that.numberParticles
				);

				that.createVertices(
					that.text3d[i].particles,
					that.text3d[i].points
				);
			}
			that.loaded = true;
      that.morpto(that.text3d[0].particles);
    });
    this.render();
	};
	createVertices = (emptyArray, points) => {
		for (let i = 0; i < points.length; i++) {
			let vertex = new THREE.Vector3();
			vertex.x = points[i].x;
			vertex.y = points[i].y;
			vertex.z = points[i].z;
			emptyArray.vertices.push(vertex);
		}
	};
	morpto = (p) => {
		for (let i = 0; i < p.vertices.length; i++) {
			this.bufferPos[i].x = p.vertices[i].x;
			this.bufferPos[i].y = p.vertices[i].y;
			this.bufferPos[i].z = p.vertices[i].z;
		}
	};
	explode = () => {
		for (let i = 0; i < this.particles.vertices.length; i++) {
			this.particles.vertices[i].x -= (this.particles.vertices[i].x - this.chaosPos[i].x)/30;
			this.particles.vertices[i].y -= (this.particles.vertices[i].y - this.chaosPos[i].y)/30;
      this.particles.vertices[i].z -= (this.particles.vertices[i].z - this.chaosPos[i].z)/30;
      if(this.particles.vertices[1].x - this.chaosPos[1].x < 0) this.chaos = false;
		}
  };
  converge = () => {
		for (let i = 0; i < this.particles.vertices.length; i++) {
			this.particles.vertices[i].x -= (this.particles.vertices[i].x - this.bufferPos[i].x)/30;
			this.particles.vertices[i].y -= (this.particles.vertices[i].y - this.bufferPos[i].y)/30;
      this.particles.vertices[i].z -= (this.particles.vertices[i].z - this.bufferPos[i].z)/30;
      if(this.particles.vertices[1].x - this.bufferPos[1].x < 0) this.chaos = true;
		}
  };
	changeText = () => {
    this.morpto(this.text3d[this.count].particles);
    if(this.chaos){
      this.explode()
    }else{
      this.converge();
    }
	};
	render = () => {
		this.color =
			this.particleSystem.rotation.y < 6.2
				? this.color
				: (this.color += 20);

		this.particles.verticesNeedUpdate = true;
		if (this.particleSystem.rotation.y > 6.28) {
			this.particleSystem.rotation.y = 0;
      if(this.chaos==false) this.count = this.count === 5 ? 0 : this.count + 1;
		}
		this.particleSystem.material.color = new THREE.Color(
			`hsla(${this.color},50%,50%,1)`
		);
		if (this.loaded) {
			this.particleSystem.rotation.y += 0.02;
			this.changeText();
			// console.log(this.count)
		}
		this.camera.position.z = 400;
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	};
}
