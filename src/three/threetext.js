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
			let vertex = new THREE.Vector3();
			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;

			this.particles.vertices.push(vertex);
		}
		this.particleSystem = new THREE.Points(this.particles, this.pMaterial);

		this.scene.add(this.particleSystem);
		let loader = new THREE.FontLoader();

		loader.load('/font02.json', (font) => {
			let theText = [
				'FLEXIBLE',
				'AGILE',
				'CURIOUS',
				'WE',
				'ARE',
				'FRONTIERS'
			];
			this.text3d = [];
			for (let i = 0; i < theText.length; i++) {
				this.text3d[i] = {};
				this.text3d[i].geometry = new THREE.TextGeometry(theText[i], {
					size: window.innerWidth * 0.02,
					height: 4,
					curveSegments: 10,
					font: font
				});

				this.text3d[i].geometry.center();
				this.text3d[i].particles = new THREE.Geometry();
				this.text3d[i].points = randomPointsInGeometry(
					this.text3d[i].geometry,
					this.numberParticles
				);

				this.createVertices(
					this.text3d[i].particles,
					this.text3d[i].points
				);
			}
			this.loaded = true;
			this.morpto(this.text3d[0].particles);
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
			this.particles.vertices[i].x = p.vertices[i].x;
			this.particles.vertices[i].y = p.vertices[i].y;
			this.particles.vertices[i].z = p.vertices[i].z;
		}
	};
	changeText = () => {
		this.morpto(this.text3d[this.count].particles);
	};
	render = () => {
		this.color =
			this.particleSystem.rotation.y < 6.2
				? this.color
				: (this.color += 20);

		this.particles.verticesNeedUpdate = true;
		if (this.particleSystem.rotation.y > 6.28) {
			this.particleSystem.rotation.y = 0;
			this.count = this.count === 5 ? 0 : this.count + 1;
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
