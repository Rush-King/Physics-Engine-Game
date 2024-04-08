const Body = Matter.Body;
const World = Matter.World;

const Bodies = Matter.Bodies;
const Engine = Matter.Engine;
const Render = Matter.Render;

const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;

let engine;
let world;

var ground;
var snowman;
var star_score;
var air_cushion;
var rope_one,rope_two;
var star_one,star_two;
var button_one,button_two;
var support_one,support_two;
var carrot,carrot_constraint_one,carrot_constraint_two;

var snowman_sad;
var snowman_idle;
var snowman_happy;

var star_image;
var carrot_image;
var snowman_image;
var support_image;
var background_image;
var air_cushion_image;

var no_stars_collected;
var one_stars_collected;
var two_stars_collected;

var cut_sfx;
var sad_sfx;
var happy_sfx;
var air_cushion_sfx;
var gameplay_ambience;

var carrot_collected="false";

function preload() {

  star_image = loadImage("./assets/Star.png");
  carrot_image = loadImage("./assets/Carrot.png");
  snowman_image = loadImage("./assets/Snowman.png");
  support_image = loadImage("./assets/Support.png");
  air_cushion_image = loadImage("./assets/Balloon.png");
  background_image = loadImage("./assets/Background.png");
  
  cut_sfx = loadSound("Cut_Sfx.mp3");
  sad_sfx = loadSound("Sad_Sfx.mp3")
  happy_sfx = loadSound("Happy_Sfx.mp3");
  air_cushion_sfx = loadSound("Air_Cushion_Sfx.mp3");
  gameplay_ambience = loadSound("Gameplay_Ambience.mp3");

  snowman_idle = loadAnimation("./assets/Snowman.png");
  snowman_sad = loadAnimation("./assets/Snowman_Sad.png");
  snowman_happy = loadAnimation("./assets/Snowman_Happy.png");

  no_stars_collected = loadAnimation("./assets/No_Stars.png");
  one_star_collected = loadAnimation("./assets/One_Star.png");
  two_stars_collected = loadAnimation("./assets/Two_Stars.png");

}

function setup() {

  createCanvas(600,700);
  frameRate(80);

  engine = Engine.create();
  world = engine.world;

  gameplay_ambience.play();
  gameplay_ambience.setVolume(1);

  button_one = createImg("./assets/Cut_Button.png");
  button_one.position(130,160);
  button_one.size(75,75);
  button_one.mouseClicked(drop);

  button_two = createImg("./assets/Cut_Button.png");
  button_two.position(400,160);
  button_two.size(75,75);
  button_two.mouseClicked(drop_two);
 
  rope_one = new Rope(7.5,{x:50,y:105});
  rope_two = new Rope(7.5,{x:550,y:105});
  
  ground = new Ground(300,height,width,20);

  snowman = createSprite(150,575,100,100);
  snowman.scale = 0.4;

  snowman.addAnimation('sad',snowman_sad);
  snowman.addAnimation('idle',snowman_idle);
  snowman.addAnimation('happy',snowman_happy);
  snowman.changeAnimation('idle');

  star_one = createSprite(300,50,20,20);
  star_one.addImage(star_image);
  star_one.scale=0.2;

  star_two = createSprite(100,350,20,20);
  star_two.addImage(star_image);
  star_two.scale=0.2;

  support_one = createSprite(50,110,10,10)
  support_one.addImage(support_image);
  support_one.scale=1;

  support_two = createSprite(550,110,10,10)
  support_two.addImage(support_image);
  support_two.scale=1;
  
  air_cushion = createImg("./assets/Balloon.png");
  air_cushion.position(255,290)
  air_cushion.size(100,100)
  air_cushion.mouseClicked(airblow);

  star_score = createSprite(55,30,30,30);
  star_score.addAnimation('one',one_star_collected);
  star_score.addAnimation('two',two_stars_collected);
  star_score.addAnimation('none',no_stars_collected);
  star_score.changeAnimation('none');
  star_score.scale=0.15;

  carrot = Bodies.circle(300,300,20);
  Matter.Composite.add(rope_one.body,carrot);

  carrot_constraint_one = new Link(rope_one,carrot);
  carrot_constraint_two = new Link(rope_two,carrot);

  rectMode(CENTER);
  ellipseMode(RADIUS);
  textSize(50)
  
}

function draw() {

  background(background_image);
  image(background_image,0,0,width,height);

  if(carrot_collected=="false") {

  textSize(15);
  fill("black");
  text("The snowman is feeling incomplete without a nose",250,620);
  text("Can you help it sniff out the perfect one",250,640);

  } 

  if(carrot_collected=="true") {

    textSize(15);
    fill("black");
    text("Hooray ! You found the missing carrot nose",250,620);
    text("Now the snowman looks fantastic",250,640);
  
  } 

  if(carrot_collected=="lost") {

    textSize(15);
    fill("black");
    text("Drat ! You lost the carrot nose for the snowman",250,620);
    text("Now it looks incomplete",250,640);
  
  } 
  
  push();

  imageMode(CENTER);

  if(carrot!=null) {

    image(carrot_image,carrot.position.x,carrot.position.y,70,70);

  }

  pop();

  rope_one.show();
  rope_two.show();

  Engine.update(engine);
  ground.show();

  drawSprites();

  if(collide(carrot,star_one,30)==true) {

    star_one.visible=false;
    star_score.changeAnimation('one');

  }

  if(collide(carrot,star_two,30)==true) {

    star_two.visible=false;
    star_score.changeAnimation('two');

  }

  if(collide(carrot,snowman,100)==true) {

    World.remove(engine.world,carrot);
    carrot = null;
    carrot_collected="true";
    snowman.changeAnimation('happy');
    happy_sfx.play();

  }

  if(carrot!=null && carrot.position.y>=650) {

    snowman.changeAnimation('sad');
    carrot_collected="lost";
    gameplay_ambience.stop();
    sad_sfx.play();
    carrot=null;

  }
  
}

function drop() {

  cut_sfx.play();
  rope_one.break();
  carrot_constraint_one.dettach();
  carrot_constraint_one = null; 

}

function drop_two() {

  cut_sfx.play();
  rope_two.break();
  carrot_constraint_two.dettach();
  carrot_constraint_two = null;

}

function collide(body,sprite,x) {

  if(body!=null) {
    var d = dist(body.position.x,body.position.y,sprite.position.x,sprite.position.y);

      if(d<=x) {

        return true; 

      }

      else {

        return false;

      }
  }

}

function airblow () {

  Matter.Body.applyForce(carrot,{x:0 , y:0},{x:0 , y:-0.1})
  air_cushion_sfx.play();
  
}
