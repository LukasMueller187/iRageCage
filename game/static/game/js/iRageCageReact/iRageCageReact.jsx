import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import Home from './scenes/Home/components/Home.jsx';
import Game from './scenes/Game/components/Game.jsx';


export default class RageCageReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <BrowserRouter>
            <Route exact path="/" component={Home}/>
            <Route path="/play/" component={Game}/>
        </BrowserRouter>;
    }
}
