import React from 'react';
import Chat from './Chat.jsx';
import {Link} from 'react-router-dom';
import GameArea from './GameArea.jsx';
import {websocket_commands} from '../../../websocket_commands.js';
import {Redirect} from 'react-router-dom';
import UsernameForm from '../../../components/UsernameForm.jsx';


export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'websocket': {}, 'game_id': 0, 'chat_messages': [], 'users': []};
        this.addChatMessage = this.addChatMessage.bind(this);
        this.connectToWebsocket = this.connectToWebsocket.bind(this);
    }

    componentDidMount() {
        if (this.props.username) {
            this.connectToWebsocket();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.username !== this.props.username) {
            this.connectToWebsocket();
        }
    }

    connectToWebsocket() {
        const game_id = window.location.hash.replace('#', '');
        const location = window.location.host;
        let websocket = new WebSocket(`ws://${window.location.host}/ws/play/${game_id}/`);
        websocket.onopen = () => {
            websocket.send(JSON.stringify({
                'command': websocket_commands.chat_join,
                'username': this.props.username
            }))
        };
        websocket.onmessage = data => {
            const content = JSON.parse(data.data);
            switch (content['type']) {
                case websocket_commands.chat_message:
                    this.addChatMessage(content['message']);
            }
        };
        setInterval(() => {
            websocket.send(JSON.stringify({
                'type': websocket_commands.heartbeat,
                'username': 'username'
            }))
        }, 1000);
        this.setState({'websocket': websocket, 'game_id': game_id});
    }

    addChatMessage(message) {
        this.setState(state => {
            let messages = state.chat_messages;
            messages.push(message);
            return {'chat_messages': messages};
        });
    }


    render() {
        if (!this.props.username)
            return <UsernameForm handleOnUsernameChange={this.props.handleOnUsernameChange} renderForm={true}/>;
        return (
            <div>
                <p>Welcome to room {this.state.game_id}</p>
                <GameArea/>
                <Chat websocket={this.state.websocket} messages={this.state.chat_messages}/>
            </div>
        );
    }
}
