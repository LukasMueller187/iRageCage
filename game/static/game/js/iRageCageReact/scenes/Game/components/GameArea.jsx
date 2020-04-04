import React from 'react';

function GameObject() {
    return {
        'x': 0,
        'y': 0,
        'x_dot': 0,
        'y_dot': 0,
        'update': () => {
        },
        'update_needed': true,
    }
}

export default class GameArea extends React.Component {
    constructor(props) {
        super(props);
        this.status = Object.freeze({
            'moving': 'moving', 'choose_direction': 'choose_direction',
            'choose_power': 'choose_power'
        });
        this.state = {'cup': GameObject(), 'ball': GameObject(), 'status': this.status.choose_direction};
        this.canvas = React.createRef();
        this.context;
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        this.context = this.canvas.current.getContext('2d');
        console.log(this.context);
        let cup_front = new Image();
        cup_front.src = cup_front_url;
        let ball = new Image();
        ball.src = ball_url;
        let cup_object = this.state.cup;
        cup_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.drawImage(cup_front, 66, 14, 240 - 66, 267 - 14, 500, 1000 - (267 - 14), 240 - 66, 267 - 14);
        };
        let ball_object = this.state.ball;
        ball_object.update = () => {
            ball_object.y += 1 / 60 * ball_object.y_dot + 0.5 * (1 / 60) * (1 / 60) * 1200;
            ball_object.y_dot += 1 / 60 * 1200;
            ball_object.x += 1 / 60 * ball_object.x_dot;
            ball_object.x_dot = 100;
            if (ball_object.y > 1000 - 120)
                ball_object.y_dot = -Math.abs(ball_object.y_dot * 0.8);
            let context = this.canvas.current.getContext('2d');
            context.drawImage(ball, 0, 0, 200, 200, ball_object.x, ball_object.y, 120, 120);

        };
        this.setState({'cup': cup_object, 'ball': ball_object});
        setInterval(this.update, 1 / 60 * 1000);
    }

    update() {
        switch (this.state.status) {
            case this.status.choose_direction:
            case this.status.moving:
                this.canvas.current.getContext('2d').clearRect(0, 0, 1920, 1000);
                this.state.cup.update();
                this.state.ball.update();
        }
    }

    render() {
        return <>
            <div>
                <canvas ref={this.canvas}
                        height={1000} width={1920}/>
            </div>
        </>;
    }

}