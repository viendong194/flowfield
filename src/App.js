import React, { Component } from 'react';
import TextAni from './canvas/text_animation.js';
import FlowField from './canvas/flow_field.js'
class App extends Component {
  componentDidMount(){
    // new TextAni();
    new FlowField();
  }
  render() {
    return (
      <div className="App">
        <div className="container">

        </div>
      </div>
    );
  }
}

export default App;
