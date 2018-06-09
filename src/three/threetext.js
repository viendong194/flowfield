import * as THREE from 'three';
import GeometryUtils from 'three/examples/js/utils/GeometryUtils';

export default class threetext {
  constructor() {
    this.container = document.getElementsByClassName('dbox')[0];
    this.init();
  }
  init = () => {
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
    let loader = new THREE.FontLoader();
    loader.load('/font02.json',(font)=>{
      let theText = ["I","AM","DONG"];
      let text3d = [];
      for(let i=0;i<theText.length;i++){
        text3d[i].geometry = new THREE.TextGeometry(theText[i],{
          size : window.innerWidth*0.02,
          height : 4,
          curveSegments : 10,
          font : font
        });

        THREE.GeometryUtils.center( text3d[i].geometry )
        text3d[i].particles = new THREE.Geometry();
		    text3d[i].points = THREE.GeometryUtils.randomPointsInGeometry(texts[i].geometry, 6000);
      }
      this.text = new THREE.Mesh(text3d,textMaterial);
      
      this.scene.add(this.text);
      this.render();
    })
    
  }
  render = () =>{
    this.text.rotation.y +=0.01;
    this.text.rotation.x +=0.01;
    this.text.rotation.z +=0.01;
    for(let i=0;i<this.text.geometry.vertices.length;i++){
      this.text.geometry.vertices[i].x+=0.01;
      // console.log(this.text.geometry.vertices[i]);
    }
    this.renderer.render(this.scene,this.camera);
    requestAnimationFrame(()=>this.render());
  }
}