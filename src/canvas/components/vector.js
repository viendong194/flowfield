export default class Vector{
    constructor(posx,posy){
        this.x = posx;
        this.y = posy;
    }
    add = (ar) =>{
        this.x += ar.x;
        this.y += ar.y;
        return this;
    }
    sub = (ar) => {
        this.x -= ar.x;
        this.y -= ar.y;
        return this;
    }
    mul = (number) =>{
        this.x*=number;
        this.y*=number;
        return this;
    }
    div = (number) =>{
        this.x/=number;
        this.y/=number;
        return this;
    }
    mag = () => {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    normalize = () =>{
        let mag = this.mag(this);
        return this.div(mag);
    }
    dot = (vector) =>{
        return this.x*vector.x + this.y*vector.y;
    }
}
