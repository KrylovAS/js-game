    plus(typeVector) {
         if(typeVector instanceof Vector ) {
             return  new Vector(this.x + typeVector.x , this.y + typeVector.y);
+        // else не нужен, т.к. в if return
         }else {            
           throw new Error('Можно прибавлять к вектору только вектор типа Vector');
         }
@@ -50,12 +51,16 @@ class Actor {
     act() {}
 
     isIntersect(actor) {
+        // вторая проверка лишняя, т.к. undefined instanceof Actor === false
         if(!(actor instanceof Actor || actor === undefined)){
           throw new Error('Ожидается обьект типа Actor');
         }
         if(actor === this) {
             return false;
         }
+
+        // можно обратить условие и написать просто return ...
+        // чтобы обрать условие нужно || заменить на &&, <= на > и >= на <
         if(actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top) {                  
             return false;
         } 
@@ -65,10 +70,12 @@ class Actor {
 
 class Level {
     constructor(grid = [], actors = []) {
+        // здесь лушч есоздать копии массивов, чтобы нельзя было изменить поля объекта извне
         this.grid = grid;
         this.actors = actors;
         this.height = grid.length;
         this.player = actors.find(element => element.type === 'player')
+        // рабочее решение, короче можно написть использую Math.max, map и оператор "..."
         this.width = grid.reduce((y, x) => {
             if(x.length > y){
             return x.length;
@@ -79,6 +86,7 @@ class Level {
     }
 
     isFinished() {
+        // тут лушче написать просто return <условие в if>
         if(this.status !== null && this.finishDelay < 0) {
             return true;
         }return false;
@@ -104,8 +112,12 @@ class Level {
         if(position.y + size.y >= this.height) {
             return 'lava';
         }
+
+        // округлённые значения лучше сохранить в переменных,
+        // чтобы не округлять на каждой итерации цикла
         for (let y = Math.floor(position.y); y < Math.ceil(position.y + size.y); y++) {
             for (let x = Math.floor(position.x); x < Math.ceil(position.x + size.x); x++) {
+                // this.grid[y][x] лучше сохранить в переменную, чтобы 2 раза не писать
                 if (this.grid[y][x]) {
                   return this.grid[y][x];
                 }
@@ -149,10 +161,12 @@ class Player extends Actor {
 
 class LevelParser {
     constructor(actorDict = {}) {
+        // здесь лучше создать копию объекта, чтобы нельзя было изменить поле извне
         this.actorDict = actorDict;
     }
 
     actorFromSymbol(symbol) {
+        // проверку можно убрать, ничего не изменится
         if(symbol === undefined){
             return undefined;
         }return this.actorDict[symbol]
@@ -163,7 +177,7 @@ class LevelParser {
             return 'wall';
         }else if(symbol === '!'){
             return 'lava';
-        }return undefined;
+        }return undefined; // лишняя строчка, функция и так возвращает undefined, если не указая явный return
     }
 
     createGrid(plan){
@@ -201,10 +215,12 @@ class Fireball extends Actor {
     }
 
     getNextPosition(time = 1) {
+        //  здесь лучше использовать мтеоды plus и times
         return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
     }
 
     handleObstacle() {
+        // здесь можно обойтись методом times
         this.speed = new Vector(this.speed.x *(-1), this.speed.y*(-1));
     }