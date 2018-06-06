import React, { Component } from 'react';
import threebox from './threebox';
class Dbox extends Component {
  componentDidMount(){
    new threebox()
  }
  render() {
    return (
      <div className="dbox">
        <canvas id="canvas"></canvas>
      </div>
    );
  }
}
export default Dbox;