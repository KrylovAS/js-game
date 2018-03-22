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
            throw new Error('Передан другой класс');
        };
    }
    times(n) {
        console.log(this.x)
        return new Vector(this.x * n, this.y * n)
    }

}


