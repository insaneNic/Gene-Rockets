// This code followed a tutorial by the coding train
// It uses the p5.js library

var popul;
var lifespan = 200;
var lifeP;
var count = 0;
var bar1;
var bar2;
var bar3;

var target;

function setup() {
    bar1 = new Barrier(200, 300);
    bar2 = new Barrier(700, 300);
    bar3 = new Barrier(400,490);
    createCanvas(800, 600);
    popul = new Population();
    lifeP = createP();
    target = createVector(width/2, 50);
}


function draw() {

    background(0);
    popul.run();

    if (count == lifespan){
        popul.evaluate();
        popul.selection();
        count = 0;
    }

    lifeP.html(count);
    count++;

    ellipse(target.x, target.y, 16, 16);
    bar1.show();
    bar2.show();
    bar3.show();

}

function Barrier(x_,y_) {
    this.x = x_;
    this.y = y_;
    this.w = 100;
    this.h = 10;

    this.show = function() {
        fill(240, 10, 10, 200);
        noStroke();
        rectMode(CENTER);
        rect(x_, y_, this.w*2, this.h*2);
    }

    this.collide = function(rocket) {
        return (abs(this.x - rocket.pos.x) < this.w && abs(this.y - rocket.pos.y) < this.h);
        log("something collided");
    }
}

function Population() {
    this.rockets = [];
    this.popsize = 100;
    this.matingpool = [];
    this.maxRocket;


    for (var i = 0; i < this.popsize; i++){
        this.rockets[i] = new Rocket();
    }

    this.run = function() {
        for (var i = 0; i < this.popsize; i++){
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }

    this.evaluate = function() {

        var maxfit = 0;
        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxfit) {
                maxfit = this.rockets[i].fitness;
                this.maxRocket = this.rockets[i];
            }
        }
        createP(maxfit);

        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = [];

        for (var i = 0; i < this.popsize; i++) {
            var n = this.rockets[i].fitness * 100;
            for (var j = 0; j < n; j++){
                this.matingpool.push(this.rockets[i]);
            }
        }
    }

    this.selection = function() {
        var newRockets = [];
        for (var i = 0; i < this.rockets.length-1; i++) {
            var parentA = random(this.matingpool).dna;
            var parentB = random(this.matingpool).dna;
            newRockets[i] = new Rocket(parentA.crossover(parentB));
        }
        var newmax = new Rocket(this.maxRocket.dna);
        newRockets.push(newmax);

        this.rockets = newRockets;
    }

}

function DNA(newgenes) {
    this.genes = [];
    if (newgenes === undefined){
        for (var i = 0; i < lifespan; i++){
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(0.5);
        }
    }else{
        this.genes = newgenes;
    }

    this.crossover = function(partner) {
        var newdna = [];
        for (var i = 0; i < this.genes.length; i++) {
//            if (random(1) > 0.5){
//                newdna[i] = this.genes[i];
//            } else {
//                newdna[i] = partner.genes[i];
//            }
            var thorpa = round(random(1));
            thix = this.genes[i].x * thorpa;
            thiy = this.genes[i].y * thorpa;
            parx = partner.genes[i].x * (1-thorpa);
            pary = partner.genes[i].y * (1-thorpa);
            newdna[i] = createVector(thix + parx + random(-0.02,0.02), thiy + pary+ random(-0.02,0.02));
            newdna[i].setMag(0.5);

        }
        return new DNA(newdna);
    }

}

function Rocket(dna) {
    this.h = 36;
    this.w = 6;
    this.pos = createVector(width/2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.completed = false;
    this.comptime = 200;
    this.died = false;
    this.weight = 1.5;

    if (dna) {
        this.dna = dna;
    } else {
        this.dna = new DNA();
    }
    this.fitness;

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.collide = function(obj) {
        if (abs(this.pos.x - obj.x) < obj.w && abs(this.pos.y - obj.y) < obj.h){
            this.died = true;
        }
    }

    this.update = function() {
        if (this.pos.y > height) {
            this.pos.y = height;
        }

        //this.weight = this.weigth - 0.0025;

        this.applyForce(createVector(0,0.04)); // gravity

        var d = dist(this.pos.x, this.pos.y, target.x, target.y) // hit target?
        if (d < 10){
            this.completed = true;
            if (count < this.comptime){
                this.comptime = count;
            }
        }

        this.weight -= 0.0025;

        this.collide(bar1);
        this.collide(bar2);
        this.collide(bar3);

        this.applyForce(this.dna.genes[count]);

        this.acc.mult(1/this.weight);

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);


    }

    this.show = function() {
        if (!(this.died || this.completed)){
            fill(0, 0);
            fill(255, 200);
            push();
            noStroke();
            translate(this.pos.x, this.pos.y)
            rotate(this.vel.heading());
            rectMode(CENTER);
            rect(0, 0, this.h, this.w);
            pop();
        }
    }

    this.calcFitness = function() {
        if(this.died){
            return 1;
        } else {
            if(this.completed) {
                this.fitness = width+200 - this.comptime;
            } else {
                var d = dist(this.pos.x, this.pos.y, target.x, target.y);
//                this.fitness = 10000/(d+1);
                this.fitness = map(d, 0, width, width, 0);
            }
        }
    }
}
