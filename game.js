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
          throw new Error('Ожидается обьект типа Actor') ;
        }else if(actor === this) {
            return false;
        }else if(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top) {                  
            return false;
        } 
        return true;
    }    
}

