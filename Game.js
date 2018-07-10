//Setting up variables
var rows = 7, // The width of field
    columns = 6, //The height of field
    Scale = 100, //Size of the map  

    Turns = columns * rows, //Amount of turns this game
    Width = Scale * 12 + rows * (Scale + Scale / 5),//Setting world width
    Height = Scale * 3 + columns * Scale;//Setting world height

//Making an Array
var board = new Array(rows); //Creating normal array
  //Making it a 2D array
for (i = 0; i < columns; i++)
  board[i] = new Array(columns);

//Filling array with 0
for (var i = 0; i < columns; i++)
{
  for (var j = 0; j < rows; j++)
  {
    board[i][j] = "0";
  }
}
//Make win window draggable
$( function() {
    $( "#win_msg" ).draggable();
  } );

//Error if nobody won and win window still pops up.
$( "#won" ).text("An error has occurred")

window.addEventListener('load', function() {
document.getElementById("win_msg").style.visibility = "hidden";//set win window off by default

  //Fetch canvas
  var canvas = document.getElementById('world');
  
  //Setup Matter JS
  var engine = Matter.Engine.create(),//Creating engine
      world = engine.world,
      Composites = Matter.Composites,
      Composite = Matter.Composite,
      Vertices = Matter.Vertices,
      Runner = Matter.Runner,
      Common = Matter.Common,
      World = Matter.World,
      Events = Matter.Events,
      Bodies = Matter.Bodies,
      Body = Matter.Body,      
      Sleeping = Matter.Sleeping,
      render = Matter.Render.create({//Setting up the renderer
        canvas: canvas,
        engine: engine,
        options: {
          width: Width,
          height: Height,
          background: 'transparent',
          wireframes: false
        }
      });
      mouseConstraint = Matter.MouseConstraint.create(engine, {//Creating mouseconstraint
        element: canvas,
        constraint: {
          render: {
            visible: false
          },
        stiffness:0.2
        }
      });
var mouse = mouseConstraint.mouse;
//Setting filters
var defaultCategory = 0x0001,
        redCategory = 0x0002,
        yellowCategory = 0x0004;

//Adding world borders and filtered areas
Borders();
function Borders(){
  World.add(world, [
        Bodies.rectangle(Width / 2, Height + 50, Width, 100, { isStatic: true}), //Floor
        Bodies.rectangle(Width / 2, -50, Width, 100, { isStatic: true}), //Ceiling
        Bodies.rectangle(-50, Height / 2, 100, Height, { isStatic: true}), //Left wall
        Bodies.rectangle(Width + 50, Height / 2, 100, Height, { isStatic: true}), //Right wall
        Bodies.rectangle(Scale * 6 - Scale * 3 + Scale / 5, Height / 2 , Scale * 6, Height + 200, { isStatic: true, collisionFilter: {category: yellowCategory}, render: {fillStyle: 'transparent'}}), // Collision Left
        Bodies.rectangle(Width - Scale * 6 + Scale * 3, Height / 2, Scale * 6, Height + 200, { isStatic: true, collisionFilter: {category: redCategory}, render: {fillStyle: 'transparent'}}), // Collision Right
    ]);
  }

  //Textured Playfield
  var Field = Composites.stack(Scale * 6 + Scale / 5, Height - columns * Scale, rows, columns, Scale / 5, 0, function(x, y) {
        return Bodies.rectangle(x, y, Scale, Scale, {
          collisionFilter: {
                mask: redCategory | yellowCategory},
        isStatic: true,
        render: {
          sprite: {
            texture: 'Images/Field.png',//Texture file for board     
            xScale: Scale / 800,
            yScale: Scale / 800
        }}});
    });  

  //Dividers inbetween
  var Dividers = Composites.stack(Scale * 6, Height - columns * Scale, rows + 1, columns, Scale, 0, function(x, y) {
        return Bodies.rectangle(x, y, Scale / 5, Scale, { isStatic: true, render: {fillStyle: '#479AFF'}});
    });
    //Adding the board to the world
  World.add(world, [Field, Dividers]);

//Adding Players
var Player1 = Bodies.circle(Scale * 2, Height / 2, Scale / 2 + .2,{ collisionFilter: {
              mask: defaultCategory | redCategory},
        isSleeping: true,
        friction: 0.0001, 
          render: {
            fillStyle: '#FF0000'//Red
          }})
var Player2 = Bodies.circle(Width - Scale * 2, Height / 2, Scale / 2 + .2,{ collisionFilter: {
              mask: defaultCategory | yellowCategory},
         isSleeping: true,     
        friction: 0.0001,
          render: {
            fillStyle: '#FFFF00'//Yellow
          }})

World.add(world, [Player1]);//Add beginning player

//Adding interactivity
window.setInterval(function(){

  //Player 1
  if (Player1.position.y >= Height - columns * Scale + Scale / 2 && Player1.position.x >= Scale * 6)//Check if Player1 is within board
  {  
    World.remove(world, mouseConstraint);
    if (Player1.speed <= 0.3){// Check the speed of Player1   
      column = Math.round((Player1.position.x - Scale / 2 - Scale * 6) / (Scale + Scale / 5));//Relocate Player1
      row = Math.round((Player1.position.y - Scale / 2 - Scale * 3) / Scale);
      Body.translate(Player1, { x: (Scale * 2 - Player1.position.x), y: (Height / 2 - Player1.position.y)});
      Turns = Turns - 1;//Remove a turn
      Sleeping.set(Player1, true);
      World.add(world, Player2);
      World.remove(world, Player1);//make it player2's turn
      board[row][column] = "1";//Fill array with posistion
      fillBrd();//Sync the visual board with the array
      chkWin();//Check board for 4 in a row
  }
}
  //Player 2
  if (Player2.position.y >= Height - columns * Scale + Scale / 2 && Player2.position.x <= Width - Scale * 6)//Check if Player2 is within board
  {
    //do something special
    World.remove(world, mouseConstraint);
    if (Player2.speed <= 0.3){// Check the speed of Player2
      column = Math.round((Player2.position.x - Scale / 2 - Scale * 6) / (Scale + Scale / 5));
      row = Math.round((Player2.position.y - Scale / 2 - Scale * 3) / Scale);
      Matter.Body.translate(Player2, { x: (Width - Scale * 2 - Player2.position.x), y: (Height / 2 - Player2.position.y)});//Relocate Player2
      Turns = Turns - 1;//Remove a turn
      Sleeping.set(Player2, true);
      World.add(world, Player1);
      World.remove(world, Player2);//make it player1's turn
      board[row][column] = "2";//Fill array with posistion
      fillBrd();//Sync the visual board with the array
      chkWin();//Check board for 4 in a row
  }
}

//Keep player in area
if (Player1.position.x > Width || Player1.position.x < 0 ||  Player1.position.y > Height || Player1.position.y < 0){
      Body.translate(Player1, { x: (Scale * 2 - Player1.position.x), y: (Height / 2 - Player1.position.y)});
    }
if (Player2.position.x > Width || Player2.position.x < 0 ||  Player2.position.y > Height || Player2.position.y < 0){
      Matter.Body.translate(Player2, { x: (Width - Scale * 2 - Player2.position.x), y: (Height / 2 - Player2.position.y)});
    }
//The amount of turns left
$( "#turns" ).text( "Turns left: " + Turns);

});

    $(document).mousemove(function(event){
        if (mouse.position.x >= Scale * 6 && mouse.position.x <= Width - Scale * 6 + (Scale / 5) && mouse.position.y >= Height - columns * Scale)
          {
            World.remove(world, mouseConstraint);//Remove mouse input when inside board
          }
        });

Events.on(mouseConstraint, 'startdrag', function (event) {
World.add(world, mouseConstraint);//Add mouseconstraint back if player starts dragging
});

  //Starting the engine
  Matter.Engine.run(engine);
  Matter.Render.run(render);

//Sync the visual board with the array
function fillBrd(){
  for (var i = 0; i < columns; i++)
    {
    for (var j = 0; j < rows; j++)
      {
      if (board[i][j] == 1){
        World.add(world, [Bodies.circle(Scale * 6 + (Scale / 5 + Scale) * j + 1 + Scale / 2 + Scale / 5, Scale * 3 + (Scale) * i + 1 + Scale / 2, Scale / 2,{
        isStatic: true,
        render: {
            fillStyle: '#FF0000'
          }
      })]);
      }
      if (board[i][j] == 2){
        World.add(world, [Bodies.circle(Scale * 6 + (Scale / 5 + Scale) * j + 1 + Scale / 2 + Scale / 5, Scale * 3 + (Scale) * i + 1 + Scale / 2, Scale / 2,{
        isStatic: true,
        render: {
            fillStyle: '#FFFF00'
          }
      })]);
      }
    }
  }
} 
//Check for a winner
function chkWin(){
  function chkLine(a,b,c,d) {
    // Check first cell non-zero and all cells match
    return ((a != 0) && (a ==b) && (a == c) && (a == d));
  }

  function chkWinner(board) {
    // Check down
    for (r = 0; r < 3; r++)
        for (c = 0; c < 7; c++)
            if (chkLine(board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]))
                return board[r][c];

    // Check right
    for (r = 0; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]))
                return board[r][c];

    // Check down-right
    for (r = 0; r < 3; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]))
                return board[r][c];

    // Check down-left
    for (r = 3; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]))
                return board[r][c];

    return 0;
  }
//If Player1 wins
if (chkWinner(board) == 1){
  $( "#won" ).text("Player red has won!");
  win();
 }
 //If Player2 wins
if (chkWinner(board) == 2){
  $( "#won" ).text("Player yellow has won!");
  win();
 }
//When it is a draw
if (Turns == 0){
  $( "#won" ).text("It is a draw!");
  win();
}

}
//Show window when won
function win(){
  World.remove(world, Player1);//remove player1
  World.remove(world, Player2);//remove player2
  document.getElementById("win_msg").style.visibility = "visible";//show window
}
//Reset the game
document.getElementById("reset").addEventListener("click", function(){//when reset button is clicked
  Matter.World.clear(world, false)//remove the world
  Turns = columns * rows;//Resetting turns
  //filling array with 0
  for (var i = 0; i < columns; i++)
    {
    for (var j = 0; j < rows; j++)
      {
      board[i][j] = "0";
    }
  }
  Borders();//Re-adding world borders
  World.add(world, [Field, Dividers]);//Re-adding board
  World.add(world, Player1);//Adding 1 player back
  document.getElementById("win_msg").style.visibility = "hidden";//Hide window again
});
document.getElementById("exit").addEventListener("click", function(){//When exit button is clicked
  document.getElementById("win_msg").style.visibility = "hidden";
  document.getElementById("container").style.visibility = "hidden";
  document.getElementById("turns").style.visibility = "hidden";
});

});