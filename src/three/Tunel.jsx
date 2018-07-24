import React, { Component } from 'react';
import Tunel3D from './tunel3D'
class Tunel extends Component {
  componentDidMount(){
    new Tunel3D();
  }
  render() {
    return (
      <div className="tunel">
      </div>
    );
  }
}

export default Tunel;