import React from 'react';

export default class UsernameForm extends React.Component {
    constructor(props) {
        super(props);
        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.handleOnFormSubmit = this.handleOnFormSubmit.bind(this);
    }

    onUsernameChange(event) {
        event.preventDefault();
        document.getElementById('username_input').focus();
        this.props.handleOnUsernameChange(event.target.value);
    }

    handleOnFormSubmit(event) {
        event.preventDefault();
        const username = document.getElementById('username_input').value;
        console.log(username);
        this.props.handleOnUsernameChange(username);
    }

    render() {
        if (this.props.renderForm === true)
            return (
                <div>
                    <form>
                        <input id="username_input" type="text"/>
                        <button type="submit" onClick={this.handleOnFormSubmit}>Confirm</button>
                    </form>
                </div>
            );
        else
            return (
                <div>
                    <input id="username_input" type="text" onChange={this.onUsernameChange}
                           value={this.props.username}/>
                </div>
            );
    }

}