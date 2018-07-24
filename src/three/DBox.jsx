import React, { Component } from 'react';
import threebox from './threebox';
import threetext from './threetext';
class Dbox extends Component {
  componentDidMount(){
    // new threebox()
    new threetext()
  }
  render() {
    return (
      <div className="dbox">
        <canvas id="canvas"></canvas>
        {/* <div id="note">CLICK and HOLD</div> */}
      </div>
    );
  }
}
export default Dbox;