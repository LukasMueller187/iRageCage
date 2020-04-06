import React from 'react';
import Chat from './Chat.jsx';
import GameArea from './GameArea.jsx';
import {websocket_commands} from '../../../websocket_commands.js';
import UsernameForm from '../../../components/UsernameForm.jsx';


export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'websocket': {}, 'game_id': 0, 'chat_messages': [], 'users': [], 'whose_turn': ''};
        this.addChatMessage = this.addChatMessage.bind(this);
        this.connectToWebsocket = this.connectToWebsocket.bind(this);
        this.handleOnUserJoin = this.handleOnUserJoin.bind(this);
        this.handleOnUserLeave = this.handleOnUserLeave.bind(this);
        this.handleOnUserlist = this.handleOnUserlist.bind(this);
        this.handleOnWhoseTurn = this.handleOnWhoseTurn.bind(this);
        this.handleOnGameStateUpdate = this.handleOnGameStateUpdate.bind(this);
    }

    componentDidMount() {
        if (this.props.username)
            this.connectToWebsocket();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.username !== this.props.username) {
            this.connectToWebsocket();
        }
    }

    connectToWebsocket() {
        const game_id = window.location.hash.replace('#', '');
        let websocket = new WebSocket(`ws://${window.location.host}/ws/play/${game_id}/`);
        websocket.onopen = () => {
            websocket.send(JSON.stringify({
                'command': websocket_commands.join,
                'username': this.props.username
            }));
            websocket.send(JSON.stringify({
                'command': websocket_commands.userlist,
            }));
            websocket.send(JSON.stringify({
                'command': websocket_commands.whose_turn,
            }));
        };
        websocket.onmessage = data => {
            const content = JSON.parse(data.data);
            console.log(content);
            switch (content['type']) {
                case websocket_commands.chat_message:
                    this.addChatMessage(content['message']);
                    break;
                case websocket_commands.leave:
                    this.handleOnUserLeave(content['username']);
                    break;
                case websocket_commands.join:
                    this.handleOnUserJoin(content['username']);
                    break;
                case websocket_commands.whose_turn:
                    this.handleOnWhoseTurn(content);
                    break;
                case websocket_commands.userlist:
                    this.handleOnUserlist(content['users'], content['username']);
                    break;
                case websocket_commands.game_state_update:
                    this.handleOnGameStateUpdate(content);
                    break;
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

    handleOnUserJoin(username) {
        let users = this.state.users;
        if (users.indexOf(username) === -1)
            users.push(username);
        this.state.websocket.send(JSON.stringify({
            'command': websocket_commands.userlist,
            'username': this.props.username,
            'users': this.state.users
        }));
        this.setState({'users': users});
    }

    handleOnUserLeave(username) {
        let users = this.state.users;
        if (users.indexOf(username) !== -1)
            users.splice(users.indexOf(username), 1);
        this.state.websocket.send(JSON.stringify({
            'command': websocket_commands.userlist,
            'username': this.props.username,
            'users': this.state.users
        }));
        this.setState({'users': users});
    }

    handleOnUserlist(userlist, username) {
        if (userlist) {
            let updated = false;
            let users = this.state.users;
            for (const user of userlist)
                if (users.indexOf(user) === -1) {
                    updated = true;
                    users.push(user);
                }
            if (updated)
                this.state.websocket.send(JSON.stringify({
                    'command': websocket_commands.userlist,
                    'username': this.props.username,
                    'users': this.state.users
                }));
            this.setState({'users': users});
        } else {
            if (this.props.username !== username)
                this.state.websocket.send(JSON.stringify({
                    'command': websocket_commands.userlist,
                    'users': this.state.users
                }))
        }
    }

    handleOnWhoseTurn(content) {
        if (content['username'])
            this.setState({'whose_turn': content['username']});
        else
            websocket.send(JSON.stringify({
                'command': websocket_commands.whose_turn,
            }));
    }

    handleOnGameStateUpdate(content){

    }


    render() {
        if (!this.props.username)
            return <UsernameForm handleOnUsernameChange={this.props.handleOnUsernameChange} renderForm={true}/>;
        let userstring = '';
        for (let user of this.state.users)
            userstring += ' ' + user;
        return (
            <div>
                <p>Welcome to room {this.state.game_id} {userstring}. It's {this.state.whose_turn}s turn</p>
                <GameArea yourTurn={this.state.whose_turn === this.props.username}/>
                <Chat websocket={this.state.websocket} messages={this.state.chat_messages}/>
            </div>
        );
    }
}
