import React from 'react';
import Chat from './Chat.jsx';
import {Link} from 'react-router-dom';
import GameArea from './GameArea.jsx';


export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'websocket': {}, 'game_id': 0, 'chat_messages': []};
        this.addChatMessage = this.addChatMessage.bind(this);
    }

    componentDidMount() {
        const game_id = window.location.hash.replace('#', '');
        const location = window.location.host;
        let websocket = new WebSocket(`ws://${window.location.host}/ws/play/${game_id}/`);
        websocket.onopen = () => {
            websocket.send(JSON.stringify({
                'command': 'chat_join',
                'username': `username${parseInt(Math.random() * 100)}`
            }))
        };
        websocket.onmessage = data => {
            const content = JSON.parse(data.data);
            console.log(content);
            switch (content['type']) {
                case 'chat_message':
                    this.addChatMessage(content['message']);
            }
        };
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
        return (
            <div>
                <p>Welcome to room {this.state.game_id}</p>
                <GameArea />
                <Chat websocket={this.state.websocket} messages={this.state.chat_messages}/>
            </div>
        );
    }
}
