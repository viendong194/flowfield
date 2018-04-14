import React, { Component } from 'react';
import TextAni from './canvas/text_animation.js';
class App extends Component {
  componentDidMount(){
    new TextAni();
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
