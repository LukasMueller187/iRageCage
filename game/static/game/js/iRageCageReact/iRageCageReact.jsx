import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import Home from './scenes/Home/components/Home.jsx';
import Game from './scenes/Game/components/Game.jsx';
import {setCookie, getCookie} from './Cookies.js';


export default class RageCageReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'username': ''};
        this.handleOnUsernameChange = this.handleOnUsernameChange.bind(this);
    }

    componentDidMount() {
        let username = getCookie('username');
        this.setState({'username': username});
    }

    handleOnUsernameChange(username) {
        this.setState({'username': username});
        setCookie('username', username, 10);
    }

    render() {
        return <BrowserRouter>
            <Route exact path="/" render={() =>
                <Home handleOnUsernameChange={this.handleOnUsernameChange} username={this.state.username}/>
            }/>
            <Route path="/play/" render={() =>
                <Game username={this.state.username} handleOnUsernameChange={this.handleOnUsernameChange} />}/>
        </BrowserRouter>;
    }
}
