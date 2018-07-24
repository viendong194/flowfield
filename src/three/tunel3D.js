import * as THREE from 'three';
export default class Tunel3D {
	constructor() {
		this.container = document.getElementsByClassName('tunel')[0];
		this.init();
	}
	init = () => {
		this.percentage = 0;
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
    this.lightInTube = new THREE.PointLight(0xffffff,1, 50);
    this.scene.add(this.lightInTube);
		this.createTube();
	};
	/**
	 * create Tube from points
	 *
	 */
	createTube = () => {
		let points = [
			[68.5, 185.5],
			[1, 262.5],
			[270.9, 281.9],
			[345.5, 212.8],
			[178, 155.7],
			[240.3, 72.3],
			[153.4, 0.6],
			[52.6, 53.3],
			[68.5, 185.5]
		];
		//Convert the array of points into vertices
		for (let i = 0; i < points.length; i++) {
			let x = points[i][0];
			let y = 0;
			let z = points[i][1];
			points[i] = new THREE.Vector3(x, y, z);
		}
		//Create a path from the points
		this.path = new THREE.CatmullRomCurve3(points);
		//Create the tube geometry from the path
		//1st param is the path
		//2nd param is the amount of segments we want to make the tube
		//3rd param is the radius of the tube
		//4th param is the amount of segment along the radius
		//5th param specify if we want the tube to be closed or not
		let geometry = new THREE.TubeGeometry(this.path, 300, 10, 12, true);
		//Basic red material
		let material = new THREE.MeshLambertMaterial({
			color: 0xff2200,
			side: THREE.BackSide
		});
		//Create a mesh
		this.tube = new THREE.Mesh(geometry, material);
		//Add tube into the scene
		this.scene.add(this.tube);
		this.render();
	};
	render = () => {
		this.percentage += 0.0003;
		let p1 = this.path.getPointAt(this.percentage % 1);
		//Get another point along the path but further
		let p2 = this.path.getPointAt((this.percentage + 0.02) % 1);
		this.camera.position.set(p1.x, p1.y, p1.z);
		//Rotate the camera into the orientation of the second point
    this.camera.lookAt(p2);
    //Move light
    this.lightInTube.position.set(p2.x, p2.y, p2.z);
		//Render the scene
		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(() => this.render());
	};
}
