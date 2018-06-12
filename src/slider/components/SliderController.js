import * as PIXI from 'pixi.js';
import TimelineMax from 'gsap/TimelineMax';
import displacementImage from './displacement/fibers.jpg';
import sprite00 from './images/ny.jpg';
import sprite01 from './images/balloon.jpg';
import sprite02 from './images/balloon2.jpg';
import sprite03 from './images/ice.jpg';
import sprite04 from './images/ice2.jpg';
export default class SliderController{
    constructor(){
      this.wrapper = document.getElementsByClassName('Slider-item')[0];
      this.next = document.getElementsByClassName('next')[0];
      this.back = document.getElementsByClassName('back')[0];
      this.current = 0;
      this.init();
    }
    init = () => {
       const w = window.innerWidth;
       const h = window.innerHeight;
       const option = {
        antialiasing: false,
        transparent: true,
        resolution: window.devicePixelRatio,
        autoResize: true
       }
       this.renderer = new PIXI.autoDetectRenderer(w,h,option);
       this.stage = new PIXI.Container();
       this.slidesContainer = new PIXI.Container();
       this.displacementSprite  = new PIXI.Sprite.fromImage( displacementImage );
    //    this.displacementSprite = this.scaleToFit(this.displacementSprite);
       this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
       this.displacementFilter  = new PIXI.filters.DisplacementFilter( this.displacementSprite );
       this.displacementFilter.autoFit = true;
    //    this.displacementFilter.scale.y = 0;
    //    this.displacementFilter.scale.x = 0;
    

       this.wrapper.appendChild(this.renderer.view);
       this.stage.addChild(this.slidesContainer);
       this.stage.addChild(this.displacementSprite);
       this.stage.filters = [this.displacementFilter];

       this.loadImages();
       this.changeSlider();
       this.animate();
    }

    loadImages = () => {
        const sprites = [sprite00,sprite01,sprite02,sprite03,sprite04];
        for(let i=0;i<sprites.length;i++){
            const texture = new PIXI.Texture.fromImage( sprites[i] );
            let image   = new PIXI.Sprite( texture );
            let img = this.scaleToFit(image);
            this.slidesContainer.addChild( img );
        }
        for(let i=0;i<this.slidesContainer.children.length;i++){
            if(i===0){
                this.slidesContainer.children[i].alpha = 1;
            }else{
                this.slidesContainer.children[i].alpha = 0;
            }
        }
    }

    scaleToFit = (image) => {
       const w = window.innerWidth;
       const h = window.innerHeight
       let imageRatio = image.height/image.width;
       let screenRatio = h/w;
       if(screenRatio>imageRatio){
           image.height = h;
           image.width = (h/imageRatio);
       }else{
           image.width = w;
           image.height = (w*imageRatio);
       }
       image.anchor.set(0.5);
       image.x = w/2;
       image.y = h/2;
       return image;
    }
    changeSlider = () =>{
      this.next.addEventListener('click',()=>this.increaseCurrent(),false);
      this.back.addEventListener('click',()=>this.decreaseCurrent(),false);
    }
    increaseCurrent = () => {
        let oldcurrent = this.current;
        this.current+=1;
        if(this.current>this.slidesContainer.children.length-1){
            this.current = 0;
        }
        this.moveSlider(oldcurrent);
    }
    decreaseCurrent = () => {
        let oldcurrent = this.current;
        this.current-=1;
        if(this.current<0){
            this.current = this.slidesContainer.children.length-1;
        }
        this.moveSlider(oldcurrent);
    }
    moveSlider = (oldcurrent) => {
      let basetimeline = new TimelineMax({paused: false});
      let secondtimeline = new TimelineMax({paused: false});
      basetimeline.to(this.displacementFilter.scale,0.5,{x:0,y:100})
                  .to(this.slidesContainer.children[oldcurrent],0.5,{alpha:0})
                  .to(this.slidesContainer.children[this.current],0.5,{alpha:1},"-=0.5")
                  .to(this.displacementFilter.scale,0.5,{x:0,y:0});
    }
    animate = () => {
        
        const ticker = new PIXI.ticker.Ticker();
        ticker.autoStart = true;
        ticker.add( (delta)=>{
            this.displacementSprite.y +=delta;
            this.displacementSprite.x +=delta;
            this.renderer.render(this.stage)
        });
    }
}