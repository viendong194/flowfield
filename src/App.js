import React, { Component } from 'react';
import Container from './canvas/components/Container.jsx';
import Slider from './slider/Slider.jsx';
import DBox from './three/DBox.jsx';
import Tunel from './three/Tunel.jsx';
class App extends Component {
	componentDidMount() {}
	render() {
		return (
			<div className="App">
				{/* <Container/> */}
				{/* <Slider/> */}
				{/* <DBox/> */}
				<Tunel />
			</div>
		);
	}
}

export default App;
