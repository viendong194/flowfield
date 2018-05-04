import React, { Component } from 'react';
import './components/index.css';
import SliderController from './components/SliderController.js';
class Slider extends Component {
  componentDidMount(){
    new SliderController();
  }
  render() {
    return (
      <div className="Slider">
        <div className="Slider-item"></div>
        <div className="Slider-nav">
          <span className="back">BACK</span>
          <span className="next">NEXT</span>
        </div>
      </div>
    );
  }
}

export default Slider;