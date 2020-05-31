import React from 'react';
import decomp from 'poly-decomp';
window.decomp = decomp;
// https://github.com/liabru/matter-js/issues/559
import Matter from 'matter-js';

// module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Events = Matter.Events,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner;

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
        this.Ball = this.Ball.bind(this);
        this.checkWinCondition = this.checkWinCondition.bind(this);

        this.ball_radius = 60;
        this.cup_x = 400;
        this.cup_width = 300;
        this.cup_height = 420;
        this.winState = 'None';

        this.canvas_height = 1000;
        this.canvas_width = 1920;
        console.log(window.innerWidth)

        this.engine = Engine.create({positionIteration:20});
        this.ground_height = this.canvas_height;
        this.ground_width = this.canvas_width;
        this.ground_thickness = 100;
        let world = this.engine.world;
        this.ground = Bodies.rectangle(this.ground_width/2, this.ground_height+(this.ground_thickness/2), this.ground_width,
            this.ground_thickness, {friction: 0.3, restitution:0, isStatic: true});
        this.ball_physics = new this.Ball(960, 100, this.ball_radius);

        let cupOffset = 30;

        // TODO: Thin walls causes problems with simulation. Shape needs to be optimized as well.
        // TODO: Align physics object with rendered image
        let cup_vertices = [
            {x: 0, y:0}, // Oben links außen
            {x: 5, y:0}, // Oben links innen
            {x: cupOffset+5, y: this.cup_height-5},
            {x: this.cup_width-cupOffset-5, y: this.cup_height-5},
            {x: this.cup_width, y: 0}, // Oben rechts innen
            {x: this.cup_width+5, y: 0}, // Oben rechts außen
            {x: this.cup_width-cupOffset, y: this.cup_height}, // Unten rechts
            {x: cupOffset, y: this.cup_height} // Unten links
        ];
        let options_cup = {
            friction: 0.3,
            restitution: 0.2,
            isStatic: true
        };
        this.cup_static  = Bodies.fromVertices(this.cup_x+(this.cup_width/2), this.ground_height-(this.cup_height/4), cup_vertices, options_cup);

        let winZoneVertices = [
            {x: cupOffset+2, y: 0},
            {x: this.cup_width-cupOffset-2, y: 0},
            {x: this.cup_width-cupOffset, y: this.cup_height/2},
            {x: cupOffset, y: this.cup_height/2},
        ];
        let optionsWinZone = {
            isSensor: true,
            isStatic: true
        };
        this.winZone  = Bodies.fromVertices(this.cup_x+(this.cup_width/2), this.ground_height-(this.cup_height/4), winZoneVertices, optionsWinZone);

        World.add(world, this.ball_physics.body);
        World.add(world, this.ground);
        World.add(world, this.cup_static);
        World.add(world, this.winZone);

        Events.on(this.engine, 'collisionStart', this.checkWinCondition);

        Runner.run(this.engine);
    }

    checkWinCondition(event) {
        let pairs = event.pairs;

        for (let i = 0, j = pairs.length; i !== j; ++i) {
            let pair = pairs[i];

            if (pair.bodyA === this.ball_physics.body && pair.bodyB === this.winZone) {
                this.winState = 'Winner!';
                console.log(pair);
            } else if (pair.bodyB === this.ball_physics.body && pair.bodyA === this.winZone) {
                this.winState = 'Winner!';
                console.log(pair);
            }
        }
    }

    Ball(x, y, radius) {
        this.body = Bodies.circle(x, y, radius, {friction: 0.3, restitution: 0.99, isStatic: false, frictionAir:0.01, density:0.001});
    }

    componentDidMount() {
        this.context = this.canvas.current.getContext('2d');
        //this.setState({'status': this.status.moving});
        this.setState({'status': this.status.choose_direction});
        addEventListener('mousedown', this.handleOnMouseDown);
        setInterval(this.update, 1 / 60 * 1000);
        addEventListener('mousemove', event => {
            const canvas_coords = this.canvas.current.getBoundingClientRect();
            this.setState({
                'mouse_x': (window.innerWidth / (this.canvas_width*0.8)) * (event.clientX - canvas_coords.left) ,
                'mouse_y': (window.innerHeight / (this.canvas_height*0.65)) * (event.clientY - canvas_coords.top) ,
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
        this.winState = 'None';

        let cup_front_bg = new Image();
        cup_front_bg.src = cup_front_bg_url;
        let cup_bg_object = this.state.cup_bg;
        cup_bg_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.drawImage(cup_front_bg, 0, 0, 1000, 1400, this.cup_x, this.canvas_height - 420, 300, 420);
        };
        let cup_front_fg = new Image();
        cup_front_fg.src = cup_front_fg_url;
        let cup_fg_object = this.state.cup_fg;
        cup_fg_object.update = () => {
            let context = this.canvas.current.getContext('2d');
            context.drawImage(cup_front_fg, 0, 0, 1000 , 1400, this.cup_x, this.canvas_height - 420, 300, 420);
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

        // this.ball_physics.show();
        let gauge_object = this.state.gauge;
        gauge_object.update = () => {
        };
        let ball_object = this.state.ball;
        ball_object.x = this.state.mouse_x;
        ball_object.y = this.state.mouse_y;
        ball_object.y_dot = 0.5 * gauge_object.power * Math.sin(gauge_object.angle / 180 * Math.PI);
        ball_object.x_dot = 0.5 * -gauge_object.power * Math.cos(gauge_object.angle / 180 * Math.PI);

        Body.setPosition(this.ball_physics.body, {x:ball_object.x+60, y:ball_object.y+60});
        Body.setVelocity(this.ball_physics.body, {x: ball_object.x_dot, y: ball_object.y_dot});

        ball_object.update = () => {
            ball_object.y = this.ball_physics.body.position.y-60;
            ball_object.x = this.ball_physics.body.position.x-60;
            this.drawBall(ball_object.x, ball_object.y);
        };
        this.setState({'ball': ball_object, 'gauge': gauge_object});
    }

    drawBall(x, y) {
        let ball = new Image();
        ball.src = ball_url;
        let context = this.canvas.current.getContext('2d');
        context.drawImage(ball, 0, 0, 200, 200, x, y, this.ball_radius*2, this.ball_radius*2);
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
        console.log(this.winState);
        this.canvas.current.getContext('2d').clearRect(0, 0, this.canvas_width, this.canvas_height);
        // Draw ground
        let context = this.canvas.current.getContext('2d');
        // context.drawImage(ball, 0, 0, 200, 200, x, y, 120, 120);
        context.beginPath();
        context.lineWidth = "6";
        context.strokeStyle = "black";
        context.rect(0, this.ground_height, this.ground_width, this.ground_thickness);
        context.stroke();

        this.state.cup_bg.update();
        this.state.ball.update();
        this.state.cup_fg.update();
        this.state.gauge.update();

        // Draw cup physics model vertices
        let cupOffset = 50;
        let cupLidOffset = 25;
        context.fillStyle = '#f00';
        context.beginPath();
        context.moveTo(this.cup_x, this.ground_height-this.cup_height);
        context.lineTo(this.cup_x+cupLidOffset,this.ground_height-this.cup_height+cupLidOffset);
        context.lineTo(this.cup_x+cupOffset+2,this.ground_height-this.cup_height+this.cup_height-2);
        context.lineTo(this.cup_x+this.cup_width-cupOffset-2, this.ground_height-this.cup_height+this.cup_height-2);
        context.lineTo(this.cup_x+this.cup_width-cupLidOffset,this.ground_height-this.cup_height+cupLidOffset);
        context.lineTo(this.cup_x+this.cup_width, this.ground_height-this.cup_height);
        context.lineTo(this.cup_x+this.cup_width-cupLidOffset+2,this.ground_height-this.cup_height+cupLidOffset);
        context.lineTo(this.cup_x+this.cup_width-cupOffset, this.ground_height-this.cup_height+this.cup_height);
        context.lineTo(this.cup_x+cupOffset, this.ground_height-this.cup_height+this.cup_height);
        context.lineTo(this.cup_x+cupLidOffset-2,this.ground_height-this.cup_height+cupLidOffset);
        context.closePath();
        context.fill();
    }

    render() {
        return <>
            <div>
                <canvas ref={this.canvas}
                        height={this.canvas_height} width={this.canvas_width}/>
            </div>
        </>;
    }

}