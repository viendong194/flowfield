import * as THREE from 'three';

export default class threebox {
	constructor() {
		this.container = document.getElementsByClassName('dbox')[0];
		this.init();
		this.chaos = true;
	}
	init = () => {
		let loader = new THREE.TextureLoader();
		loader.crossOrigin = '';

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

		this.world = new THREE.Object3D();

		this.scene.add(this.world);

		this.container.addEventListener(
			'mousedown',
			() => {
				this.chaos = false;
			},
			false
		);
		this.container.addEventListener(
			'mouseup',
			() => {
        this.chaos = true;
			},
			false
		);
		this.run();
	};
	run = () => {
		this.getPixels();
		// this.createParticles(vertex);
		// this.render();
	};
	getPixels = () => {
		this.pixels = [];
		let img = new Image(500, 300);
		img.onload = () => {
			let x = 0,
				y = 0,
				z = 0;
			this.canvas = document.getElementById('canvas');
			this.ctx = this.canvas.getContext('2d');
			this.canvas.width = img.width || 500;
			this.canvas.height = img.height || 300;
			this.ctx.drawImage(img, 0, 0, 500, 300);
			let pixelData = this.ctx.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);

			for (let i = 0; i < pixelData.data.length; i += 4) {
				this.pixels.push({
					rgb: [
						pixelData.data[i],
						pixelData.data[i + 1],
						pixelData.data[i + 2]
					],
					x: x,
					y: y,
					z: z
				});
				x += 1;
				if (i % (pixelData.width * 4) === 0) {
					x = 1;
					y += 1;
				}
			}
			this.createParticles(this.pixels);
		};
		img.src = '/wolf03.jpg';
	};
	createParticles = (pixels) => {
		let geometry = new THREE.Geometry(),
			colors = [],
			material,
			pixel,
			vertex,
			particles;
		for (let i = 0; i < pixels.length; i++) {
			pixel = pixels[pixels.length-1-i];
			vertex = new THREE.Vector3();
			vertex.x = - pixel.x + 250;
			vertex.y = pixel.y - 150;
			vertex.z = pixel.z;
			geometry.vertices.push(vertex);
			geometry.colors.push(
				new THREE.Color(
					'rgb(' +
						pixel.rgb[0] +
						', ' +
						pixel.rgb[1] +
						', ' +
						pixel.rgb[2] +
						')'
				)
			);
		}
		this.material = new THREE.PointsMaterial({
			size: 3,
			// sizeAttenuation: false,
			// transparent: false,
			vertexColors: THREE.VertexColors,
			// side: THREE.FrontSide,
			depthTest: false
		});
		this.start = [];
		this.particles = new THREE.Points(geometry, this.material);
		this.world.add(this.particles);
		this.vertices = this.particles.geometry.vertices;
		for(let i=0;i<this.vertices.length;i++){
			this.start.push({x:0,y:0,z:0});
		}
		for(let i=0;i<this.vertices.length;i++){
			this.start[i].x = Math.random() * 2000 - 1000;
			this.start[i].y = Math.random() * 2000 - 1000;
			this.start[i].z = Math.random() * 2000 - 1000;
		}
		this.render();
	};
	render = () => {
		this.particles.geometry.verticesNeedUpdate = true;
		this.particles.geometry.__dirtyVertices = true;
		if (this.chaos) {
			for (let i = 0; i < this.vertices.length; i++) {
				this.vertices[i].x -= (this.vertices[i].x - this.start[i].x)/(Math.random()*300+1);
				this.vertices[i].y -= (this.vertices[i].y - this.start[i].y)/(Math.random()*300+2);
				this.vertices[i].z -= (this.vertices[i].z - this.start[i].z)/(Math.random()*300+3);
			}
			this.particles.rotation.y += 0.001;
			this.particles.rotation.z += 0.001;
			this.particles.rotation.x += 0.001;
		} else {
			for (let i = 0; i < this.vertices.length; i++) {
				this.vertices[i].x -= (this.vertices[i].x+this.pixels[i].x-250)/(Math.random()*100+1);
				this.vertices[i].y -= (this.vertices[i].y-this.pixels[i].y+150)/(Math.random()*100+2);
				this.vertices[i].z -= (this.vertices[i].z-this.pixels[i].z)/(Math.random()*100+3);
			}
			this.particles.rotation.y += 0.01;
			this.particles.rotation.z = 0;
			this.particles.rotation.x = 0;
		}
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	};
}
