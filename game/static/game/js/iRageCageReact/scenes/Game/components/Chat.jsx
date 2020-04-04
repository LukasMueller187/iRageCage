import React from 'react';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'chat_message': ''};
        this.sendMessage = this.sendMessage.bind(this);
        this.onChatMessageChange = this.onChatMessageChange.bind(this);
    }

    componentDidMount() {
        document.getElementById('chat_message').focus();
    }

    sendMessage() {
        this.props.websocket.send(JSON.stringify({'command': 'chat_message', 'message': this.state.chat_message}));
        this.setState({'chat_message': ''});
        document.getElementById('chat_message').focus();
    }

    onChatMessageChange(event) {
        event.preventDefault();
        this.setState({'chat_message': event.target.value});
    }

    render() {
        let messages = [];
        for (let i = 0; i < this.props.messages.length; i++)
            messages.push(<p key={i}>{this.props.messages[i]}</p>);
        return (
            <div>
                <div>
                    <form>
                        <input id="chat_message" type="textarea" onChange={this.onChatMessageChange}
                               value={this.state.chat_message}/>
                        <button onClick={this.sendMessage} type="submit">Send</button>
                    </form>
                </div>
                {messages}
            </div>
        );
    }


}