

/*==================================================== INITIALIZATION ========================================== */
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
  gl_Position = a_Position;
  //gl_PointSize = 10.0;
  gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
  gl_FragColor = u_FragColor;
  }`

// Global Variables
var gl;
var canvas;
var a_Position;
var u_FragColor;
var u_Size;


// Setup WebGL
function setupWebgl() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
 
  /*
  gl = getWebGLContext(canvas);
  */
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

// Connect Variables to GLSL
function connectVariablestoGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

/*================================================ MAIN FUNCTION ==================================================*/

function main() {
  
  setupWebgl();

  connectVariablestoGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) { click(ev)}};
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/*===================================================== FUNCTIONS ============================================================ */

/*
var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
var g_sizes = []; // The array to store the size of the point
*/
var g_shapesList = [];

function click(ev) {
  // Convert mouse coordinate to GL
  [x,y] = convertCoordinatesEventToGL(ev);

  let point = new Point();
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);
/*
  // Store the coordinates to g_points array
  g_points.push([x, y]);

  // Push the selected color for slider and button
  g_colors.push(g_selectedColor.slice());

  // Push the selected size of the point
  g_sizes.push(g_selectedSize);
*/
  // Render the selected shape on canvas
  renderAllShapes();
  
  /*
  OUTDATED CODE
  // Store the coordinates to g_points array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  
  // Push the selected color for button
  g_colors.push(g_selectedColor);
  */
}


function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}


function renderAllShapes() {
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
    /*
    var xy = g_points[i];
    var rgba = g_colors[i];
    var size = g_sizes[i]

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    */
  }

  // Calculate Performance metrics
  var duration = performance.now() - startTime;
  var text = "Performance Metrics: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10;
  sendTextToHTML(text, "numdot");
} 

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
  }
  htmlElm.innerHTML = text;
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // DEFAULT COLOR [WHITE]
let g_selectedSize=5; // DEFAULT SIZE [5]

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events (Shape Type)
  document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clear').onclick = function() {
    // Clear the user's shapes list
    g_shapesList = []; 
    renderAllShapes();
    };

  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });
}