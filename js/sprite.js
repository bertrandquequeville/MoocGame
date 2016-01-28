function Sprite(ctx, spritesheet, x, y, width, height, nbImages, nbFramesOfAnimationBetweenRedraws) {
    this.spriteImages = [];
    this.currentFrame = 0;
    this.nbFrames = nbImages;
    this.nbTicksBetweenRedraws = nbFramesOfAnimationBetweenRedraws;
    this.nbCurrentTicks=0;
    this.ctx = ctx;

    // let's process the row in the big image, and extract all sprites for a given posture
    // of animation
    for(var i = 0; i < nbImages; i++) {
        // we extract the subimage
        this.spriteImages[i] = new SpriteImage(this.ctx, spritesheet, x+i*width, y, width, height);
    }

    this.renderMoving = function(x, y, scale) {
        // renders animated sprite, changed every nbTicksBetweenRedraws
        // the frame number

        // draw the sprite with the current image
        this.spriteImages[this.currentFrame].render(x, y, scale);

        // increment the number of ticks of animation 
        this.nbCurrentTicks++;

        if(this.nbCurrentTicks > this.nbTicksBetweenRedraws) {
            // enough time elapsed, let's go to the next image
            this.currentFrame++;
            if(this.currentFrame == this.nbFrames) {
                this.currentFrame=0;
            }
            this.nbCurrentTicks = 0;
        }
    };
    this.render = function(x, y, scale) {
        // draws always frame 0, static position
        this.spriteImages[0].render(x, y, scale);
    };
}