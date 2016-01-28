// constructor function for balls
    function Ball(x, y, angle, v, diameter, color, type) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.v = v;
        this.radius = diameter / 2;
        this.color = color;

        this.draw = function (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        };

        this.move = function () {
            // add horizontal increment to the x pos
            // add vertical increment to the y pos

            var incX = this.v * Math.cos(this.angle);
            var incY = this.v * Math.sin(this.angle);

            this.x += calcDistanceToMove(delta, incX);
            this.y += calcDistanceToMove(delta, incY);
        };


    }

    TARGETAREACOLOR = function () {
        return 'green';
    };

    ENEMYBALLCOLOR = function () {
        return 'OrangeRed';
    };

    ENEMYBALLTYPE = function () {
        return 'ENEMY';
    };

    TARGETAREATYPE = function () {
        return 'TARGETAREA';
    };
