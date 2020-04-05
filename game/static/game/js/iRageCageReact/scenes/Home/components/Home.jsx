import React from 'react';
import {Redirect} from 'react-router';
import UsernameForm from '../../../components/UsernameForm.jsx';


export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'random': '',
            'redirect': false
        };
        this.joinRoom = this.joinRoom.bind(this);
    }

    componentDidMount() {
        this.setState({'random': parseInt(Math.random() * 10000)});
        document.getElementById('username_input').focus();
    }


    joinRoom(event) {
        event.preventDefault();
        if (this.props.username.length !== 0) {
            this.setState(({'redirect': true}));
        } else {
            this.setState(({'redirect': false}));
            alert("Please specify a username!")
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to={"/play/#" + this.state.random}/>;
        }
        return (
            <div>
                <p>Hi! Please join a room</p>
                <form>
                    <UsernameForm username={this.props.username}
                                  handleOnUsernameChange={this.props.handleOnUsernameChange}/>
                    <button onClick={this.joinRoom} type="submit">Join Room</button>
                </form>
            </div>
        );
    }
}