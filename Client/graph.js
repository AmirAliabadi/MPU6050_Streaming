function getRandomColor() {
  // creating a random number between 0 and 255
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
 
  // going from decimal to hex
  var hexR = r.toString(16);
  var hexG = g.toString(16);
  var hexB = b.toString(16);
 
  // making sure single character values are prepended with a "0"
  if (hexR.length == 1) {
    hexR = "0" + hexR;
  }
 
  if (hexG.length == 1) {
    hexG = "0" + hexG;
  }
 
  if (hexB.length == 1) {
    hexB = "0" + hexB;
  }
 
  // creating the hex value by concatenatening the string values
  var hexColor = "#" + hexR + hexG + hexB;
   
  return hexColor.toUpperCase();
}

if (document.getElementById('c')) {

  // context
  var c_canvas = document.getElementById("c");
  var context = c_canvas.getContext("2d");


  // grid
  for (var x = 0.5; x < 800; x += 10) {
    context.moveTo(x, 0);
    context.lineTo(x, 600);
  }

  for (var y = 0.5; y < 600; y += 10) {
    context.moveTo(0, y);
    context.lineTo(800, y);
  }

  context.strokeStyle = "#eee";
  context.stroke();

  // axis
  context.beginPath();
  context.moveTo(0,   600 / 2);
  context.lineTo(800, 600 / 2);

  context.strokeStyle = "#000";
  context.stroke();

   var lineGraph = function(o) {
    context.beginPath();
    context.moveTo(0, 600 / 2);
    for(var i in o) {
      context.lineTo(i*10, (o[i]/-30.0) + (600 / 2) );
    }
    context.strokeStyle = getRandomColor();
    context.stroke();
  }; 
}