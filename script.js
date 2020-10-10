/**
 * @author Joris Monnet
 * @date 21/06/2020
 */

//the differents mitosis phases in hours for a 24 hour cycle
let g1PhaseTime = 12;
let sPhaseTime = 6;
let sTimeFinal = g1PhaseTime + sPhaseTime;
let g2PhaseTime = 4;
let g2TimeFinal = sTimeFinal + g2PhaseTime;
let mPhaseTime = 2;
let finalPhaseTime = g2TimeFinal + mPhaseTime;

let lifeTimeMax = 48;	//stomach cell -> 48hours of life

//size in µm
let initialCellSize = 8;
let finalCellSize = initialCellSize*2; //it depends, I choose to double the size

//grow uniformly
let stepGrow=(finalCellSize-initialCellSize)/(g1PhaseTime+g2PhaseTime);

let nbCellMax = 2000;	
let sizeCanvas = 1000;
let factorTime = 100; //here 100ms = 1 hour in reality
let varInterval=null;
let cells = [];

class Cell{
	constructor(x,y,size){
		this.x = x;
		this.y = y;
		this.size = size;
		this.lifeTime = 0;
		this.phaseTime = 0;
	}
	
	setIndex(i){
		this.index = i;
	}

	//animate cells + moving them to avoid collisions
	move(coef){
		let distanceX = Math.random()*coef - Math.random()*coef;
		let distanceY = Math.random()*coef - Math.random()*coef;
		if(!this.testCollisionDetection(this.x+distanceX,this.y+distanceY)){
			this.x += distanceX;
			this.y += distanceY;
		}
	}
	
	//apply the four phases of mitosis
	grow(tabLength){
		if(cells.length<nbCellMax){
			if(this.phaseTime<g1PhaseTime){
				this.size+=stepGrow;
			}
			else if(this.phaseTime<sTimeFinal);//double nucleus in draw
			else if(this.phaseTime <g2TimeFinal){
				this.size+=stepGrow;
			}
			else if(this.phaseTime<finalPhaseTime){
				if(this.size!=initialCellSize){
					this.mitosis();
				}
			}
			else{
				this.phaseTime=-1;
			}
			this.phaseTime++;
		}
		this.lifeTime++;
	}
	
	mitosis(){
		this.size = initialCellSize;
		cells.push(new Cell(this.x,this.y,initialCellSize));
	}
	
	collisionDetection() {
		for(let i = 0; i < cells.length; i++){
			//verify that the cells are neighbour
			if(this.index !=i){
				let j = 1
				while(intersection(this.x,this.y,this.size,cells[i].x,cells[i].y,cells[i].size)&&this.lifeTime < lifeTimeMax)
					this.move(j++);
			}
		}
	}
	
	//test if the urrent cell is colliding with something
	testCollisionDetection(x,y){
		for(let i = 0; i < cells.length; i++)
			if(this.index !=i&&intersection(x,y,this.size,cells[i].x,cells[i].y,cells[i].size))
				return true;
		return false;
	}
}

//calculate if two cells are colliding by calculating the distance of the centers and the addition of the radius
function intersection(x0, y0, r0, x1, y1, r1){
	return Math.hypot(x1 - x0, y1 - y0) < (r0 + r1);
}

//called every timeFactor, make grow cells and remove the cells which are out of the screen 
function update() {
	for(let i = 0; i < cells.length; i++){
		if(cells[i].lifeTime > lifeTimeMax||cells[i].x<-finalCellSize||cells[i].x>sizeCanvas||cells[i].y<-finalCellSize||cells[i].y>sizeCanvas){
			cells.splice(i,1);
		}else{
			if(cells[i].index !=i)
				cells[i].setIndex(i)
			cells[i].collisionDetection();
			cells[i].grow(cells.length);
		}
	}
	draw();
}

function draw() {
	let ctx = document.getElementById("canvas").getContext("2d");
	ctx.clearRect(0,0,sizeCanvas,sizeCanvas)
	for(let i = 0; i < cells.length; i++) {
		//shade of beige
		let blue = 200-5*cells[i].lifeTime
		ctx.fillStyle='rgb('+Math.round(blue*1.5)+','+Math.round(blue*1.15)+','+Math.round(blue)+')';
		ctx.strokeStyle='black';
		ctx.beginPath();
		ctx.arc(cells[i].x,cells[i].y,cells[i].size,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		
		if(blue<15){
			ctx.strokeStyle='white';
		}
		else{
			ctx.strokeStyle='black';
		}
		if(cells[i].phaseTime>g1PhaseTime&&cells[i].phaseTime<g2TimeFinal){
			if(cells[i].phaseTime<sTimeFinal){
				//creation of the two nucleus and growth to animate the S phase
				ctx.beginPath();
				ctx.arc(cells[i].x-initialCellSize*0.8+Math.random()*cells[i].size/5,cells[i].y-initialCellSize*0.8+Math.random()*cells[i].size/5,cells[i].size/(5*(sTimeFinal + 0.1 - cells[i].phaseTime)),0,2*Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(cells[i].x+initialCellSize*0.5+Math.random()*cells[i].size/5,cells[i].y+initialCellSize*0.5+Math.random()*cells[i].size/5,cells[i].size/(5*(sTimeFinal + 0.1 -cells[i].phaseTime)),0,2*Math.PI);
				ctx.stroke();
			}
			else{
				//two nucleaus with constant size
				ctx.beginPath();
				ctx.arc(cells[i].x-initialCellSize*0.8+Math.random()*cells[i].size/5,cells[i].y-initialCellSize*0.8+Math.random()*cells[i].size/5,cells[i].size/5,0,2*Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(cells[i].x+initialCellSize*0.5+Math.random()*cells[i].size/5,cells[i].y+initialCellSize*0.5+Math.random()*cells[i].size/5,cells[i].size/5,0,2*Math.PI);
				ctx.stroke();
			}
		}
		else{
			//one nucleus with one constant size
			ctx.beginPath();
			ctx.arc(cells[i].x+Math.random()*cells[i].size/5,cells[i].y+Math.random()*cells[i].size/5,cells[i].size/5,0,2*Math.PI);
			ctx.stroke();
		}
		
	}
}

//buttons functions

function stop(){
	clearInterval(varInterval);
}

function start(){
	varInterval = setInterval(update,factorTime);
}

function reset(){
	cells = [];
	cells.push(new Cell(sizeCanvas/2,sizeCanvas/2,initialCellSize));
	stop();
	start();
}

//begin the animation
reset();