
class Card extends Phaser.Sprite{
    constructor(game, x = 0, y = 0, faceKey = '', faceFrame = 0, backKey = '', backFrame = 0, value, colour){
        super(game, x, y, backKey, backFrame );
        this.isFaceUp = false;
        this.value = value;
        this.colour = colour;
        this.faceKey = faceKey;
        this.faceFrame = faceFrame;
        this.backKey = backKey;
        this.backFrame = backFrame;
        this.previousGroup = '';
        this.home = new Phaser.Point(0,0);

        this.anchor.setTo(0.5);
        this.inputEnabled = true;
        //this.input.enableDrag();
    }

    flip(dx = 0){

        let t0;
        let t1 = this.game.add.tween(this.scale).to({x:0}, 200, null, false, 0, 0,false);
        let t2 = this.game.add.tween(this.scale).to({x:1}, 200, null, false, 0, 0,false);

        if (this.isFaceUp === true){
            this.isFaceUp = false;
            this.loadTexture(this.backKey, this.backFrame);
        } else {
            t1.onComplete.add(() => {
                this.isFaceUp = true;
                this.loadTexture(this.faceKey, this.faceFrame);
                t2.start();
            });

            if (dx !== 0){
                t0 = this.game.add.tween(this).to({x: dx}, 100, Phaser.Easing.Bounce.Out, false, 0, 0, false);
                t0.onComplete.add(() => {
                   t1.start();
                });
                t0.start();
            } else {
                t1.start();
            }
        }
        // play flip animation
    }

    select(){
        //play select tween
    }

}

export default Card;
