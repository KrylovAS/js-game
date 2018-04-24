'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus(typeVector) {
        if(typeVector instanceof Vector ) {
            return  new Vector(this.x + typeVector.x , this.y + typeVector.y);        
        }
        throw new Error('Можно прибавлять к вектору только вектор типа Vector');        
    }
    times(n) {
        return new Vector(this.x * n, this.y * n);
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if(!(pos instanceof Vector ) || !(size instanceof Vector) || !(speed instanceof Vector)) {
            throw new Error('Ожидается обьект типа Vector');
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        
    }
    get left() {
        return this.pos.x;
      }
    
    get top() {
        return this.pos.y;
      }
    
    get right() {
        return this.pos.x + this.size.x;
      }
    
    get bottom() {
        return this.pos.y + this.size.y;
      }
    
    get type() {
        return 'actor';
      }
    
    act() {}

    isIntersect(actor) {        
        if(!(actor instanceof Actor)){
          throw new Error('Ожидается обьект типа Actor');
        }
        if(actor === this) {
            return false;
        }
        
        return (actor.left < this.right && actor.right > this.left && actor.top < this.bottom && actor.bottom > this.top);               
        
    }    
}

class Level {
    constructor(grid = [], actors = []) {        
        this.grid = grid.slice();
        this.actors = actors.slice();        
        this.height = grid.slice().length;
        this.player = actors.slice().find(element => element.type === 'player');        
        this.width = Math.max(0, ...grid.slice().map(element => element.length));
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {        
        return (this.status !== null && this.finishDelay < 0)
    }

    actorAt(actor) {
        if(!(actor instanceof Actor) || actor === undefined) {
            throw new Error('Ожидается обьект типа Actor');
        }
        return this.actors.find(element => element.isIntersect(actor));
        
    }

    obstacleAt(position, size){
        if(!(position instanceof Vector) && !(size instanceof Vector)){
            throw new Error('Ожидается обьекты типа Vector');
        }
        
        if(position.x < 0 || position.y < 0 || position.x + size.x >= this.width) {
            return 'wall';
        }

        if(position.y + size.y >= this.height) {
            return 'lava';
        }

        const posT = Math.floor(position.y),
              posB = Math.ceil(position.y + size.y),
              posL = Math.floor(position.x),
              posR = Math.ceil(position.x + size.x);

        for (let y = posT; y < posB; y++) {
            for (let x = posL ; x < posR ; x++) {                
                const positioning = this.grid[y][x];
                if (positioning) {
                  return positioning;
                }
            }
        }
    }

    removeActor(actor){
        this.actors = this.actors.filter(element => element !== actor);
    }

    noMoreActors(type) {
        return !this.actors.some(element => element.type === type);
    }

    playerTouched(type, actor){
        if(this.status !== null){
            return;
        }
        if(type === 'lava' || type === 'fireball'){
            this.status = 'lost';
        }
        if(type === 'coin' && actor.type === 'coin' ) {
            this.removeActor(actor);
            if(this.noMoreActors('coin')) {
                this.status = 'won';
            }
        }
    }
}

class Player extends Actor {
    constructor(pos = new Vector()) {
        super(new Vector(pos.x, pos.y - 0.5), new Vector(0.8, 1.5))
        
    }
    get type () {
        return 'player';
    }
}

class LevelParser {
    constructor(actorDict = {}) {        
        this.objactorDictCopy = Object.assign({} , actorDict);
    }

    actorFromSymbol(symbol) {
        
        return this.objactorDictCopy[symbol]
    }

    obstacleFromSymbol(symbol) {
        if(symbol === 'x') {
            return 'wall';
        }else if(symbol === '!'){
            return 'lava';
        } 
    }

    createGrid(plan){
        return plan.map(row => row.split('').map(symbol => this.obstacleFromSymbol(symbol)));
    }

    createActors(plan) {
        const actors = [];
        for(let y = 0; y < plan.length; y++) {            
            for(let x = 0; x < plan[y].length; x++) {
                const Obj = this.actorFromSymbol(plan[y][x]);
                if (typeof Obj === 'function') {
                    const actor = new Obj(new Vector(x, y));
                    if (actor instanceof Actor) {
                        actors.push(actor);
                    }
                }
            }
        }
        return actors;
    }  
    parse(plan){
        return new Level(this.createGrid(plan), this.createActors(plan));
    }
    
}

class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, new Vector(1, 1), speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {        
       return this.pos.plus(this.speed.times(time));
    }
    

    handleObstacle() {        
        this.speed = this.speed.times(-1);
    } 

    act(time, level) {
        let nextPosition = this.getNextPosition(time);
        if (level.obstacleAt(nextPosition, this.size)) {
          this.handleObstacle();
        }else {
          this.pos = nextPosition;
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos){
         super(pos, new Vector(2, 0));
    }
}

class VerticalFireball extends Fireball {
    constructor(pos){
         super(pos, new Vector(0, 2));
    }
}

class FireRain extends Fireball {
    constructor(pos) {
         super(pos, new Vector(0, 3))
         this.startPos = pos;
    }
    handleObstacle() {
        this.pos = this.startPos;
    }
}

class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super(new Vector(pos.x + 0.2, pos.y + 0.1), new Vector(0.6, 0.6));
        this.startPos = this.pos;
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * Math.PI;
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring)* this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        return this.startPos.plus(this.getSpringVector());
    }

    act(time, level) {
        this.pos = this.getNextPosition(time);
    }
}

const actorDict = {
     
    '@': Player,
    '=': HorizontalFireball,
    'v': FireRain,
    '|': VerticalFireball,
    'o': Coin
  };

 
  const parser = new LevelParser(actorDict);
loadLevels()
  .then(schemas => runGame(JSON.parse(schemas), parser, DOMDisplay))
  .then(() => alert('Вы выиграли приз!'))
  .catch(err => alert.log(err));