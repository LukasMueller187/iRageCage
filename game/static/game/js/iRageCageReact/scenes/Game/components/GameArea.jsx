import React from 'react';

function GameObject() {
    return {
        'x': 0,
        'y': 0,
        'x_dot': 0,
        'y_dot': 0,
        'update': () => {
        },
    }
}

export default class GameArea extends React.Component {
    constructor(props) {
        super(props);
        this.status = Object.freeze({
            'moving': 'moving', 'choose_direction': 'choose_direction',
            'choose_power': 'choose_power',
        });
        this.state = {
            'status': '',
            'cup_bg': GameObject(),
            'cup_fg': GameObject(),
            'ball': GameObject(),
            'gauge': GameObject(),
            'mouse_x': 0,
            'mouse_y': 0,
            'your_turn': false,
        };
        this.canvas = React.createRef();
        this.context = {};
        this.update = this.update.bind(this);
        this.logicMoving = this.logicMoving.bind(this);
        this.logicChooseDirection = this.logicChooseDirection.bind(this);
        this.logicChoosePower = this.logicChoosePower.bind(this);
        this.handleOnMouseDown = this.handleOnMouseDown.bind(this);
        this.drawBall = this.drawBall.bind(this);
    }

    componentDidMount() {
        this.context = this.canvas.current.getContext('2d');
        this.setState({'status': this.status.choose_direction});
        addEventListener('mousedown', this.handleOnMouseDown);
        setInterval(this.update, 1 / 60 * 1000);
        addEventListener('mousemove', event => {
            const canvas_coords = this.canvas.current.getBoundingClientRect();
            this.setState({
                'mouse_x': event.clientX - canvas_coords.left,
                'mouse_y': event.clientY - canvas_coords.top,
            });
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.status !== this.state.status) {
            switch (this.state.status) {
                case this.status.choose_direction:
                    this.logicChooseDirection();
                    break;
                case this.status.choose_power:
                    this.logicChoosePower();
                    break;
                case this.status.moving:
                    this.logicMoving();
                    break;
            }
        }
    }

    logicChooseDirection() {
        let cup_front_bg = new Image();
        cup_front_bg.src = cup_front_bg_url;
        let cup_bg_object = this.state.cup_bg;
        cup_bg_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.drawImage(cup_front_bg, 66, 14, 240 - 66, 267 - 14, 500, 1000 - (267 - 14), 240 - 66, 267 - 14);
        };
        let cup_front_fg = new Image();
        cup_front_fg.src = cup_front_fg_url;
        let cup_fg_object = this.state.cup_fg;
        cup_fg_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.drawImage(cup_front_fg, 66, 14, 240 - 66, 267 - 14, 500, 1000 - (267 - 14), 240 - 66, 267 - 14);
        };

        let gauge_object = this.state.gauge;
        gauge_object.angle = 0;
        gauge_object.angle_dot = 2;
        gauge_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.beginPath();
            const length = 50;
            gauge_object.angle += gauge_object.angle_dot;
            if (gauge_object.angle > 90 || gauge_object.angle < 0)
                gauge_object.angle_dot = -gauge_object.angle_dot;
            context.moveTo(this.state.mouse_x, this.state.mouse_y);
            context.lineWidth = 5;
            context.lineTo(this.state.mouse_x - Math.cos(gauge_object.angle / 180 * Math.PI) * length,
                this.state.mouse_y + Math.sin(gauge_object.angle / 180 * Math.PI) * length);
            context.stroke();
        };
        let ball_object = this.state.ball;
        ball_object.update = () => {
            this.drawBall(this.state.mouse_x, this.state.mouse_y);
        };
        this.setState({'cup_bg': cup_bg_object, 'cup_fg': cup_fg_object, 'gauge': gauge_object,
            'ball': ball_object});
    }

    logicChoosePower() {
        let gauge_object = this.state.gauge;
        gauge_object.power = 50;
        gauge_object.power_dot = 2;
        gauge_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.beginPath();
            gauge_object.power += gauge_object.power_dot;
            if (gauge_object.power >= 100 || gauge_object.power <= 0)
                gauge_object.power_dot = -gauge_object.power_dot;
            context.moveTo(this.state.mouse_x, this.state.mouse_y);
            context.lineWidth = 5;
            context.lineTo(this.state.mouse_x - Math.cos(gauge_object.angle / 180 * Math.PI) * gauge_object.power,
                this.state.mouse_y + Math.sin(gauge_object.angle / 180 * Math.PI) * gauge_object.power);
            context.stroke();
        };
        let ball_object = this.state.ball;
        ball_object.update = () => {
            this.drawBall(this.state.mouse_x, this.state.mouse_y);
        };
        this.setState({'gauge': gauge_object, 'ball': ball_object});
    }

    logicMoving() {
        let gauge_object = this.state.gauge;
        gauge_object.update = () => {
        };
        let ball_object = this.state.ball;
        ball_object.x = this.state.mouse_x;
        ball_object.y = this.state.mouse_y;
        ball_object.y_dot = 10 * gauge_object.power * Math.sin(gauge_object.angle / 180 * Math.PI);
        ball_object.x_dot = 10 * -gauge_object.power * Math.cos(gauge_object.angle / 180 * Math.PI);
        ball_object.update = () => {
            ball_object.y += 1 / 60 * ball_object.y_dot + 0.5 * (1 / 60) * (1 / 60) * 1200;
            ball_object.y_dot += 1 / 60 * 1200;
            ball_object.x += 1 / 60 * ball_object.x_dot;
            if (ball_object.y > 1000 - 120)
                ball_object.y_dot = -Math.abs(ball_object.y_dot * 0.8);
            this.drawBall(ball_object.x, ball_object.y);
        };
        this.setState({'ball': ball_object, 'gauge': gauge_object});
    }

    drawBall(x, y) {
        let ball = new Image();
        ball.src = ball_url;
        let context = this.canvas.current.getContext('2d');
        context.drawImage(ball, 0, 0, 200, 200, x, y, 120, 120);
    }

    handleOnMouseDown() {
        // if (this.props.yourTurn)
        switch (this.state.status) {
            case this.status.choose_direction:
                this.setState({'status': this.status.choose_power});
                break;
            case this.status.choose_power:
                this.setState({'status': this.status.moving});
                break;
            case this.status.moving:
                this.setState({'status': this.status.choose_direction});
                break;
        }
    }


    update() {
        this.canvas.current.getContext('2d').clearRect(0, 0, 1920, 1000);
        this.state.cup_bg.update();
        this.state.ball.update();
        this.state.cup_fg.update();
        this.state.gauge.update();
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