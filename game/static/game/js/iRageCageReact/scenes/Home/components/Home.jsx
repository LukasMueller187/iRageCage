import React from 'react';
import {Link} from 'react-router-dom';


export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'random': ''};
    }

    componentDidMount() {
        this.setState({'random': parseInt(Math.random() * 10000)});
    }

    render() {
        return (
            <div>
                <p>Hi! Please join a room</p>
                <Link to={`/play/#${this.state.random}`}>Go</Link>
            </div>
        );
    }
}