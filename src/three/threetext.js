import * as THREE from 'three';

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
    loader.load('/font.json',(font)=>{
      let theText = "I'm frontier";
      let text3d = new THREE.TextGeometry(theText,{
        size : 80,
        height : 5,
        curveSegments : 1,
        font : font
      });
  
      let textMaterial = new THREE.MeshBasicMaterial({
        color : Math.random() * 0xffffff,
      });

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