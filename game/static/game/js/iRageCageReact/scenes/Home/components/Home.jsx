import React from 'react';
import {Redirect} from 'react-router';


export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'random': '',
            'username': '',
            'redirect': false
        };
        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
    }

    componentDidMount() {
        this.setState({'random': parseInt(Math.random() * 10000)});
        document.getElementById('username_input').focus();
    }

    onUsernameChange(event) {
        event.preventDefault();
        this.setState({'username': event.target.value});
        document.getElementById('username_input').focus();
    }

    joinRoom(event) {
        event.preventDefault();
        if (this.state.username.length !== 0) {
            this.setState(({'redirect': true}));
        }
        else {
            this.setState(({'redirect': false}));
            alert("Please specify a username!")
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to={"/play/#" + this.state.random} />;
        }
        return (
            <div>
                <p>Hi! Please join a room</p>
                <form>
                    <input id="username_input" type="text" onChange={this.onUsernameChange}
                           value={this.state.username}/>
                    <button onClick={this.joinRoom} type="submit">Join Room</button>
                </form>
            </div>
        );
    }
}