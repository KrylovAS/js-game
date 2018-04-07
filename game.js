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


console.log('hhhh')

const grid = [
    [undefined, undefined],
    ['wall', 'wall']
  ];
  
  function MyCoin(title) {
    this.type = 'coin';
    this.title = title;
  }
  MyCoin.prototype = Object.create(Actor);
  MyCoin.constructor = MyCoin;
  
  const goldCoin = new MyCoin('Золото');
  const bronzeCoin = new MyCoin('Бронза');
  const player = new Actor();
  const fireball = new Actor();
  
  const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);
  
  level.playerTouched('coin', goldCoin);
  level.playerTouched('coin', bronzeCoin);
  
  if (level.noMoreActors('coin')) {
    console.log('Все монеты собраны');
    console.log(`Статус игры: ${level.status}`);
  }
  
  const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
  if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
  }
  
  const otherActor = level.actorAt(player);
  if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
  }

