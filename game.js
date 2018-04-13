'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus(typeVector) {
        if(typeVector instanceof Vector ) {
            return  new Vector(this.x + typeVector.x , this.y + typeVector.y);
        // else не нужен, т.к. в if return
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
        // вторая проверка лишняя, т.к. undefined instanceof Actor === false
        if(!(actor instanceof Actor || actor === undefined)){
          throw new Error('Ожидается обьект типа Actor');
        }
        if(actor === this) {
            return false;
        }

        // можно обратить условие и написать просто return ...
        // чтобы обрать условие нужно || заменить на &&, <= на > и >= на <
        if(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top) {                  
            return false;
        } 
        return true;
    }    
}

class Level {
    constructor(grid = [], actors = []) {
        // здесь лушч есоздать копии массивов, чтобы нельзя было изменить поля объекта извне
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;
        this.player = actors.find(element => element.type === 'player')
        // рабочее решение, короче можно написть использую Math.max, map и оператор "..."
        this.width = grid.reduce((y, x) => {
            if(x.length > y){
            return x.length;
            } return y;
        }, 0);
        this.status = null;
        this.finishDelay = 1;        
    }

    isFinished() {
        // тут лушче написать просто return <условие в if>
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

        // округлённые значения лучше сохранить в переменных,
        // чтобы не округлять на каждой итерации цикла
        for (let y = Math.floor(position.y); y < Math.ceil(position.y + size.y); y++) {
            for (let x = Math.floor(position.x); x < Math.ceil(position.x + size.x); x++) {
                // this.grid[y][x] лучше сохранить в переменную, чтобы 2 раза не писать
                if (this.grid[y][x]) {
                  return this.grid[y][x];
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
        // здесь лучше создать копию объекта, чтобы нельзя было изменить поле извне
        this.actorDict = actorDict;
    }

    actorFromSymbol(symbol) {
        // проверку можно убрать, ничего не изменится
        if(symbol === undefined){
            return undefined;
        }return this.actorDict[symbol]
    }

    obstacleFromSymbol(symbol) {
        if(symbol === 'x') {
            return 'wall';
        }else if(symbol === '!'){
            return 'lava';
        }return undefined; // лишняя строчка, функция и так возвращает undefined, если не указая явный return
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
        //  здесь лучше использовать мтеоды plus и times
        return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
    }

    handleObstacle() {
        // здесь можно обойтись методом times
        this.speed = new Vector(this.speed.x *(-1), this.speed.y*(-1));
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