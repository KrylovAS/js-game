'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus(typeVector) {
        if(typeVector instanceof Vector ) {
            return  new Vector(this.x + typeVector.x , this.y + typeVector.y);
        }else {            
          throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        }
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
        if(!(actor instanceof Actor || actor === undefined)){
          throw new Error('Ожидается обьект типа Actor');
        }
        if(actor === this) {
            return false;
        }
        if(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top) {                  
            return false;
        } 
        return true;
    }    
}

class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;
        this.player = actors.find(element => element.type === 'player')
        this.width = grid.reduce((y, x) => {
            if(x.length > y){
            return x.length;
            } return y;
        }, 0);
        this.status = null;
        this.finishDelay = 1;        
    }

    isFinished() {
        if(this.status !== null && this.finishDelay < 0) {
            return true;
        }return false;
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
        for (let y = Math.floor(position.y); y < Math.ceil(position.y + size.y); y++) {
            for (let x = Math.floor(position.x); x < Math.ceil(position.x + size.x); x++) {
                if (typeof(this.grid[x][y] !== 'undefined')) {
                  return this.grid[x][y];
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
    constructor(dictionaryObj = {}) {
        this.dictionaryObj = dictionaryObj;
    }

    actorFromSymbol(symbol) {
        if(symbol === undefined){
            return undefined;
        }return this.dictionaryObj[symbol]
    }

    obstacleFromSymbol(symbol) {
        if(symbol === 'x') {
            return 'wall';
        }else if(symbol === '!'){
            return 'lava';
        }return undefined;
    }

    createGrid(plan){
        return plan.map(row => row.split('').map(symbol => this.obstacleFromSymbol(symbol)));
    }

    createActors(plan) {
        const actors = [];
        for(let y = 0; y < plan.length; y++) {
            console.log(y)
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
        super(pos, new Vector(1, 1), speed)
    }

    get type() {
        return 'fireball'
    }

    getNextPosition(time = 1) {
        return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time)
    }

    handleObstacle() {
        this.speed = new Vector(this.speed.x *(-1), this.speed.y*(-1))
    }

    act(time, level) {
        let nextPosition = this.getNextPosition(time);
        if (level.obstacleAt(nextPosition, this.size)){
          this.handleObstacle();
        }else {
          this.pos = nextPosition;
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos){
         super(pos, new Vector(2, 0))
    }
}

class VerticalFireball extends Fireball {
    constructor(pos){
         super(pos, new Vector(0, 2))
    }
}

class FireRain extends Fireball {
    constructor(pos) {
         super(pos, new Vector(0, 3))
         this.startPos = pos
    }
    handleObstacle() {
        this.pos = this.startPos
    }
}

class Coin extends Actor {
    constructor(pos) {
        super()
    }

}




