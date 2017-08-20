
import Card from './Card';

class GameState extends Phaser.State {
    init() {
       /* this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;*/
        this.ranks = [
            'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
            'nine', 'ten', 'jack', 'queen', 'king'
        ]
        this.suits = ['clubs', 'spades', 'hearts', 'diamonds'];

        this.columns = [];
        this.parks = [];
        this.draw = 3;
        this.groupHash = [];

    }

    preload () {
        let w = 90, h = 135;
        this.load.spritesheet('backs', '../assets/images/card-backs.png',w,h);
        this.load.spritesheet('clubs', '../assets/images/card-clubs.png',w,h);
        this.load.spritesheet('diamonds', '../assets/images/card-diamonds.png',w,h);
        this.load.spritesheet('hearts', '../assets/images/card-hearts.png',w,h);
        this.load.spritesheet('spades', '../assets/images/card-spades.png',w,h);
        this.load.spritesheet('jokers', '../assets/images/card-jokers.png',w,h);
    }

    create () {
        this.game.stage.backgroundColor = '#116036';


        this.hand = this.game.add.group(this.world, 'hand');
        this.hand.enableBody = true;
        console.log(this.hand);


        // set up base sprite for deck
        let deckGraphics = this.game.add.graphics(0, 0);
        deckGraphics.lineStyle(2, 0xFFAAFF, 1)
        let deckTexture = deckGraphics
            .drawRoundedRect(-200, -200, 90, 135, 8)
            .drawCircle(-155, -130,50)
            .generateTexture();

        let deckSprite = this.game.add.sprite(512, 576,deckTexture);
        deckSprite.anchor.setTo(0.5);
        deckSprite.inputEnabled = true;
        deckSprite.events.onInputUp.add(this.resetDeck, this);

        this.deck = this.game.add.group(this.world, 'deck');
        this.deck.inputEnableChildren = true;
        this.deck.name='deck';
        /*let deckSprite = this.game.add.sprite(512, 576, deckTexture);
        deckSprite.anchor.setTo(0.5);
        this.deck.add(deckSprite);
        */

        for (let i = 0; i < 13; i++){
           for (let index in this.suits){
               let colour = '';

               let suit = this.suits[index];
               if (suit === 'clubs' || suit === 'spades'){
                   colour = 'black';
               } else {
                   colour = 'red';
               }
               let backFrame = 1;
               let card = new Card(this.game, this.world.centerX, this.world.centerY + this.world.height / 4, suit, i, 'backs', backFrame, i+1, colour);
               card.name = this.ranks[i] + ' of ' + suit;

               //console.log(this.ranks[i] + ' of ' + suit, colour, card.value);
               this.deck.add(card);
           }
        }
        
        this.deck.onChildInputUp.add(this.drawCards, this);

        this.deck.shuffle();



        // set up base sprite for columns
        let colGraphics = this.game.add.graphics(0, 0);
        colGraphics.lineStyle(2, 0xFFAAAA, 0);
        let colTexture = colGraphics.drawRoundedRect(-200, -200, 100, 300, 8).generateTexture();
        // add 7 columns
        for (let i = 0; i < 7; i++){
            this.columns[i] = this.game.add.group(this.world, 'col0' + i.toString());
            let colSprite = this.game.add.sprite(200 + (i * 100), 330, colTexture);
            colSprite.anchor.setTo(0.5);

            this.columns[i].add(colSprite);
        }
        // deal cards to 7 columns
        for (let row = 0; row < 7; row++){
            for (let col = 0; col < 7; col++){
                //console.log(this.columns[col].length);
                if(this.columns[col].length < col + 2){
                    let card = this.deck.getTop();
                    card.x = 200 + col * 100;
                    card.y = 250 + row * 20;
                    card.input.enableDrag();
                    card.events.onDragStart.add(this.handleDragStart, this);
                    card.events.onDragStop.add(this.handleDragStop, this);
                    //console.log(card.name, card.index);
                    this.columns[col].add(card);
                }
            }
        }
        // flip the last card in each column
        for (let i = 0; i < 7; i++){
            this.columns[i].getTop().flip();
        }




        // set up base texture for parks
        let parkGraphics = this.game.add.graphics(0,0);
        parkGraphics.lineStyle(2, 0xAAAAAA, 1);
        let parkTexture = parkGraphics.drawRoundedRect(-200, -200, 100, 140, 8).generateTexture();

        // set up parks as an array of groups
        for (let i = 0; i < 4; i++){
            this.parks[i] = this.game.add.group(this.world, 'park0' + i.toString());
            this.parks[i].enableBody = true;
            let parkSprite = this.game.add.sprite(250 + (i * 150), 90, parkTexture);
            parkSprite.anchor.setTo(0.5);
            this.parks[i].add(parkSprite);

        }

        // finally, add a top Group
        this.topGroup = this.game.add.group(this.world, 'top');
        this.topGroup.name='top';

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable([...this.parks, ...this.columns, this.hand]);


        //draw x cards
        this.drawCards();

    }

    render () {
        this.game.debug.text('deck: ' + this.deck.length, 32, 32);
        this.game.debug.text('hand: ' + this.hand.length, 32, 52);
        let y = 72;
        this.hand.forEach((item) => {
            this.game.debug.text(item.name + ': ' + item.x + ', ' + item.y, 32, y);
            y += 20;
        });
        this.game.debug.text('groupHash: ' + this.groupHash.length, 700, 32);
        this.game.debug.text('top: ' + this.topGroup.length, 700, 52);
        y = 72;
        this.topGroup.forEach((item) => {
            this.game.debug.text(item.name + ': ' + item.x + ', ' + item.y, 700, y);
            y += 20;
        });

        this.game.debug.text('draggingGroup' + this.draggingGroup, 450, 32);

    }

    update () {
        //this.game.physics.arcade.overlap(this.columns, this.parkSprites, this.overlapParks, null, this);

        // dragging a group of cards, so need to make sure that all cards move together
        if (this.draggingGroup === true){
            let baseCard = this.topGroup.getChildAt(0);
            for (let i = 1; i < this.topGroup.length; i++ ){
                this.topGroup.getChildAt(i).x = baseCard.x;
                this.topGroup.getChildAt(i).y = baseCard.y + (i * 20);
            }
        }
    }

    drawCards(card){
        let numberOfCards = 0;
        if (this.deck.length < this.draw){
            numberOfCards = this.deck.length;
        } else {
            numberOfCards = this.draw;
        }
        for (let i = 0; i < numberOfCards; i++){
            let card = this.deck.getTop();
            card.flip(620 + (i*15));

            this.hand.add(card);
            card.input.enableDrag();
            card.events.onDragStart.add(this.handleDragStart, this);
            card.events.onDragStop.add(this.handleDragStop, this);

        }
    }

    resetDeck(){
        this.hand.reverse();
        this.hand.forEach((item) => {
           item.x = 512;
           item.y = 576;
           item.flip();
           item.input.disableDrag();
        });
        this.hand.moveAll(this.deck);
        this.drawCards();



    }

    handleDragStart(card){
        // register the card's initial position and group, so we can put it back if player attempts an illegal move
        card.home = new Phaser.Point(card.x, card.y);

        // preserve the original group name (don't over-write with 'top', otherwise it never leaves topGroup)
        if (card.parent.name !== 'top'){
            card.previousGroup = card.parent.name;
        }

        //console.log('previous group', card.previousGroup, card.parent.length, card.parent.getIndex(card));


        // check if player wants to drag multiple cards
        // using an array to collect items before changing groups (and therefore changing index, parent etc)
        // refresh any items in array before resetting it
        this.groupHash.forEach((item) => {
           item.reset(item.x, item.y);
        });
        this.groupHash = [];

        if (card.parent.length > card.parent.getIndex(card)){
            for (let i = card.parent.getIndex(card); i < card.parent.length; i++){
                console.log('add card to topGroup', i, card.parent.getChildAt(i).name);
                this.groupHash.push(card.parent.getChildAt(i));
            }
            console.log(this.groupHash);
            this.groupHash.forEach((item) => {
                item.home = new Phaser.Point(item.x, item.y);
                if(item.parent.name !== 'top'){
                    item.previousGroup = item.parent.name;
                }

                this.topGroup.add(item);
            });

            this.draggingGroup = true;
        }

        //this.topGroup.add(card);
        //this.topGroup.bringToTop(card);
        card.scale.setTo(1.05);

        // if card is face down, flip it
        if (card.isFaceUp === false){
            card.flip();
            return;
        }
    }

    handleDragStop(card){
        card.scale.setTo(1);
        this.draggingGroup = false;
        // console.log('dragStop', this.groupHash);

        // using an array to collect items before changing groups (and therefore changing index, parent etc)
        this.groupHash.forEach((item) => {
            item.reset(item.x, item.y);
        });
        this.groupHash = [];
        this.topGroup.forEach((item) => {
           this.groupHash.push(item);
        });

        // return cards to their respective groups
        this.topGroup.forEach((item) => {
            switch (item.previousGroup.substring(0,4)){
                case 'hand':
                    this.hand.add(item);
                    break;
                case 'deck':
                    this.deck.add(item);
                    break;
                case 'park':
                    this.parks.forEach((group) => {
                        if(group.name === item.previousGroup){
                            group.add(item);
                        }
                    });
                    break;
                case 'col0':
                    this.columns.forEach((group) => {
                        if(group.name === item.previousGroup){
                            group.add(item);
                        }
                    });
                    break;
                default:
                    console.log('group not found', item.previousGroup);
                    break;
            }

        });



        // check if the card overlaps with one of the parking spots
        if (this.game.physics.arcade.overlap(card, this.parks, this.overlapParks, null, this) === true){
            this.resetGroupHash();
            return;
        };


        // check if the card overlaps with the top card from one of the other columns
        for (let i = 0; i < this.columns.length; i++){
            if (this.game.physics.arcade.overlap(card, this.columns[i].getTop(), this.overlapColumns, null, this) === true){
                this.resetGroupHash();
                return;
            };
        }

        this.resetGroupHash();

    }

    overlapParks(card, park){
        console.log('overlap Park', card.name, park.parent.name);

        if (park.parent.length === 1 && card.value === 1){              // Empty park and card is Ace
            console.log('Ace in empty park!');
            park.parent.add(card);
            this.game.add.tween(card).to({x: park.position.x, y: park.position.y}, 200, null, true, 0, 0, false);
            this.groupHash=[];
            return true;
        } else if (
            park.parent.length > 1 &&                           // cards in park
            card.faceKey === park.parent.getTop().faceKey &&    // same suit
            card.value === (park.parent.getTop().value + 1)     // and card value is +1
        ) {
            console.log('same suit and value +1')
            park.parent.add(card);
            this.game.add.tween(card).to({x: park.position.x, y: park.position.y}, 200, null, true, 0, 0, false);
            this.groupHash=[];
            return true;
        } else {
            // tween the card back to its initial position (set in handleDragStart)
            //this.game.add.tween(card).to({x: this.cardHome.x, y: this.cardHome.y}, 200, null, true, 0, 0, false);
            return false;
        }
    }

    overlapColumns(card, column){
        console.log('overlap Column', card.name, column.name);

        // if column card is face up (avoids triggering collisions with every card in column)
        if (column.parent.getTop().isFaceUp === true){
            console.log('overlap Column', card.name, column.name);

            // if column is opposite colour and column value = card value + 1
            if (column.parent.getTop().colour !== card.colour && column.parent.getTop().value === (card.value + 1)){
                //console.log('opposite colour and value +1', column.colour, column.value, card.colour, card.value);
                for (let i = 0; i < this.groupHash.length; i++){
                    column.parent.add(this.groupHash[i]);
                    this.game.add.tween(this.groupHash[i]).to({x: column.position.x, y: column.position.y + 20 + (i * 20)}, 200, null, true, 0, 0, false);
                }
                this.groupHash = [];
                return true;
            } else {
                // tween the card back to its initial position (set in handleDragStart)
                this.groupHash.forEach((item) => {
                    this.game.add.tween(item).to({x: item.home.x, y: item.home.y}, 200, null, true, 0, 0, false);
                });
                this.groupHash = [];

                return false;
            }

        } else if (column.parent.length === 1 && card.value === 13){
            console.log('empty column + king');
            for (let i = 0; i < this.groupHash.length; i++){
                column.parent.add(this.groupHash[i]);
                this.game.add.tween(this.groupHash[i]).to({x: column.position.x, y: 250 + (i * 20)}, 200, null, true, 0, 0, false);
            }
            this.groupHash = [];

            //column.position.y - (column.position.y / 4)
            return true;

        } else {
            return false;
        }


    }

    resetGroupHash(){
        // tween the cards back to their initial positions (set in handleDragStart)
        this.groupHash.forEach((item) => {
            this.game.add.tween(item).to({x: item.home.x, y: item.home.y}, 200, null, true, 0, 0, false);
        });
        this.groupHash=[];
    }


}

export default GameState;

