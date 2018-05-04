import React, { Component } from 'react';
import TextAni from './text_animation.js';
import FlowField from './flow_field.js';
import FlowPath from './flow_path.js';
class Container extends Component {
  componentDidMount(){
    // new TextAni();
    // new FlowField();
    new FlowPath();
  }
  render() {
    return (
    <div className="container">
    </div>
    );
  }
}

export default Container;