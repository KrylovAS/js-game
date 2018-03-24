'use strict';

class Vector {
    constructor(x = 0, y = 0) {        
        this.x = x;
        this.y = y;
    }
    plus(vector) {
        if(vector instanceof Vector ) {
            return  new Vector(this.x + vector.x , this.y + vector.y )
        }else {            
          throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        };
    }
    times(n) {        
        return new Vector(this.x * n, this.y * n);
    }
}

class Actor {
    constructor(pos = new Vector(0,0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if(!(pos instanceof Vector ) || !(size instanceof Vector) || !(speed instanceof Vector)) {
            throw new Error()        
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
    
        Object.defineProperties(this, {
            'left': {
                value: this.pos.x
            },
            'top': {
                value: this.pos.y
            },
            'right': {
                value: this.pos.x + this.size.x
            },
            'bottom': {
                value: this.pos.y + this.size.x
            },
            'type': {
                value: 'actor'
            }
        })
    }
    
    act() {
    
    }
    isIntersect(Actor) {
        if(!(actor instanceof Actor)){
          throw new Error()  
        }


    }

}
console.log('gggg')

