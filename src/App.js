import React, { Component } from 'react';
import Container from './canvas/components/Container.jsx';
import Slider from './slider/Slider.jsx';
class App extends Component {
  componentDidMount(){
    
  }
  render() {
    return (
      <div className="App">
        {/* <Container/> */}
        <Slider/>
      </div>
    );
  }
}

export default App;
