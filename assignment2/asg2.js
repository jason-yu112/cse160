/*
  Created by Jason Yu
  CSE 160 Assignment 2: Blocky Animal
*/


var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

const POINT = 0; 
const TRIANGLE = 1;
const CIRCLE = 2;

let g_globalAngle = 0; 
let g_verticalAngle = 0;
let g_jawAngle = 0;   
let g_tongueLength = 0.6; 
let g_yellowAngle = 0;
let g_yellowAnimation = false;
let g_snakeAnimation = false;
let g_body5Angle = 0;
let g_body5AnimAngle = 0;

// Easier Manual Camera Rotation (mouse click)
let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;

// Easier Manual Camera 
let g_zoom = 1.0;  // 1.0 = default scale, zoom in/out changes this

let g_selectedType = POINT; 
let g_selectedSize = 5; 
let canvas; 
let gl; 
let a_Position; 
let u_FragColor; 
let u_GlobalRotateMatrix; 
let u_ModelMatrix; 
let cSegments = 10; 
let g_headPos = 0;

function addActionsForHtmlUI(){
  canvas.onmousedown = function (ev) { mouseDown(ev) };
  canvas.onmousemove = function (ev) { mouseMove(ev) };
  canvas.onmouseup = function (ev) { mouseUp(ev) };
  canvas.onmouseleave = function (ev) { mouseUp(ev) }; // in case they drag out of the canvas

  canvas.addEventListener('wheel', function(ev) {
    if (ev.deltaY < 0) {
      g_zoom *= 1.05; // Zoom in
    } else {
      g_zoom /= 1.05; // Zoom out
    }
    g_zoom = Math.max(0.2, Math.min(5.0, g_zoom)); // Clamp zoom between 0.2x and 5x
    renderAllShapes();
    ev.preventDefault(); // prevent page scroll
  });

  document.getElementById('shiftAnimationON').onclick = function() {
    g_yellowAnimation = true;
  };
  document.getElementById('shiftAnimationOFF').onclick = function() {
    g_yellowAnimation = false;
    resetAnimation();
  };
  document.getElementById('snakeAnimationON').onclick = function() {
    g_snakeAnimation = true;
  };
  document.getElementById('snakeAnimationOFF').onclick = function() {
    g_snakeAnimation = false;
    resetAnimation();
  };
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = -1 * this.value;
    renderAllShapes();
  });
  document.getElementById('verticalSlide').addEventListener('input', function() {
    g_verticalAngle = -1 * this.value;
    renderAllShapes();
  });
  document.getElementById('jawAngleSlide').addEventListener('input', function() {
    g_jawAngle = -1 * this.value;
    renderAllShapes();
  });
  document.getElementById('bodyAngle').addEventListener('input', function() {
    g_body5Angle = parseFloat(this.value);
    renderAllShapes();
  });
  document.addEventListener("click",
    function(e) {
      if (e.shiftKey) g_yellowAnimation=true;
    },
    g_yellowAnimation=false);
}

function setupWebGL(){
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.depthRange(0.0, 0.9);
}

function connectVariablesToGLSL(){
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix'); 
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix'); 
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix'); 
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix'); 
    return;
  }

  var identityM = new Matrix4(); 
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI(); 
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  requestAnimationFrame(tick);
}

let g_startTime = performance.now() / 1000.0; 
let g_seconds  = performance.now() / 1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now() / 1000.0 - g_startTime; 
  updateAnimationAngles();
  renderAllShapes(); 
  requestAnimationFrame(tick); 
}

function clamp(val, min, max){
  return (val < min) ? min : (val > max) ? max : val;
}

function updateAnimationAngles(){
  if (g_yellowAnimation){
    if(g_jawAngle < 45){
      g_jawAngle += 0.3;  
    }
  }
  
  let angleFrac = clamp(g_jawAngle, 0, 45) / 45; 
  let targetLength = 0.8 + (1.5 - 0.8) * angleFrac; 

  let diff = targetLength - g_tongueLength;
  if (Math.abs(diff) > 0.01){
    g_tongueLength += 0.01 * Math.sign(diff);
  }

  if (g_snakeAnimation){
    g_body5AnimAngle = 30 * Math.sin(g_seconds * 2);
  } else {
    g_body5AnimAngle = 0;
  }
}

function renderAllShapes(){
  var startTime = performance.now();

  let scaleMat = new Matrix4().scale(g_zoom, g_zoom, g_zoom);
  let yRotationMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  let xRotationMat = new Matrix4().rotate(g_verticalAngle, 1, 0, 0);
  let globalRotMat = scaleMat.multiply(yRotationMat).multiply(xRotationMat);
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let upperJaw = new Cube();
  upperJaw.color = [0.0, 0.7, 0.0, 1.0];
  upperJaw.matrix.translate(-0.25, 0.75, -0.75);
  upperJaw.matrix.scale(0.2, 0.25, 0.5);
  let upperJawMat = new Matrix4(upperJaw.matrix);
  upperJaw.render();

  let lowerJaw = new Cube();
  lowerJaw.color = [0.0, 0.5, 0.0, 1.0];
  lowerJaw.matrix = new Matrix4(upperJawMat);
  lowerJaw.matrix.translate(0, -0.45, 0.15);
  lowerJaw.matrix.rotate(180, 0, 1, 0);
  lowerJaw.matrix.translate(-1.0, 0.25, -0.85);
  lowerJaw.matrix.rotate(g_jawAngle, 1, 0, 0);
  lowerJaw.matrix.scale(1, 0.25, 1);
  lowerJaw.render();

  let rightEye = new Ellipsoid();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = new Matrix4(upperJawMat);
  rightEye.matrix.scale(0.35, 0.35, 0.35);
  rightEye.matrix.translate(0, 1.5, 1.0);
  rightEye.render();

  let leftEye = new Ellipsoid();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix = new Matrix4(upperJawMat);
  leftEye.matrix.scale(0.35, 0.35, 0.35);
  leftEye.matrix.translate(2.75, 1.5, 1.0);
  leftEye.render();

  // Tongue Animation
  let tongueOffset = g_jawAngle;
  let time = performance.now() / 1000;
  let wiggle = Math.sin(time * 10) * 0.1;
  
  let baseTongue = new Cube();
  baseTongue.color = [0.95, 0.4, 0.4, 1.0];
  baseTongue.matrix = new Matrix4(lowerJaw.matrix);
  baseTongue.matrix.translate(0.30, 1.0, 0.0);
  baseTongue.matrix.translate(wiggle, 0.0, 0.0);
  baseTongue.matrix.scale(0.4, 0.25, g_tongueLength);
  baseTongue.render();

  let leftFork = new Cube();
  leftFork.color = [0.95, 0.4, 0.4, 1.0];
  leftFork.matrix = new Matrix4(baseTongue.matrix);
  leftFork.matrix.translate(0.5, 0, 0.8);
  leftFork.matrix.translate(wiggle, 0, 0);
  leftFork.matrix.rotate(45, 0, 1, 0);
  leftFork.matrix.scale(0.3, 1, 0.5);
  leftFork.render();

  let rightFork = new Cube();
  rightFork.color = [0.95, 0.4, 0.4, 1.0];
  rightFork.matrix = new Matrix4(baseTongue.matrix);
  rightFork.matrix.translate(0.15, 0, 0.6);
  rightFork.matrix.translate(wiggle, 0, 0.0);
  rightFork.matrix.rotate(-45, 0, 1, 0);
  rightFork.matrix.scale(0.3, 1, 0.5);
  rightFork.render();

  let body1 = new Cube();
  body1.color = [0.0, 0.8, 0.0, 1.0];
  body1.matrix = new Matrix4(upperJawMat);
  body1.matrix.translate(0.25, 0, 1.0);
  body1.matrix.rotate(-180, 1, 0, 0);
  body1.matrix.scale(0.5, 1.5, 0.25);
  let body1Mat = new Matrix4(body1.matrix);
  body1.render();

  let body2 = new Cube();
  body2.color = [0.0, 0.6, 0.0, 1.0];
  body2.matrix = new Matrix4(body1Mat);
  body2.matrix.translate(0, 1.0, 0);
  body2.matrix.rotate(-15, 1, 0, 0);
  let body2Mat = new Matrix4(body2.matrix);
  body2.render();

  let body3 = new Cube();
  body3.color = [0.0, 0.8, 0.0, 1.0];
  body3.matrix = new Matrix4(body2Mat);
  body3.matrix.translate(0, 1, 0);
  body3.matrix.rotate(-25, 1, 0, 0);
  let body3Mat = new Matrix4(body3.matrix);
  body3.render();

  let body4 = new Cube();
  body4.color = [0.0, 0.6, 0.0, 1.0];
  body4.matrix = new Matrix4(body3Mat);
  body4.matrix.translate(0, 1, 0);
  body4.matrix.rotate(-50, 1, 0, 0);
  body4.matrix.rotate(g_snakeAnimation ? 30 * Math.sin(g_seconds * 2 + Math.PI/6) : 0, 0, 0, 1);
  body4.matrix.scale(1, 2.5, 0.75);
  let body4Mat = new Matrix4(body4.matrix);
  body4.render();

  let body5 = new Cube();
  body5.color = [0.0, 0.8, 0.0, 1.0];
  body5.matrix = new Matrix4(body4Mat);
  body5.matrix.translate(0, 1, 0);
  body5.matrix.rotate(g_body5Angle + g_body5AnimAngle, 0, 0, 1);
  body5.matrix.scale(0.98, 0.98, 0.98);
  let body5Mat = new Matrix4(body5.matrix);
  body5.render();

  let body6 = new Cube();
  body6.color = [0.0, 0.6, 0.0, 1.0];
  body6.matrix = new Matrix4(body5Mat);
  body6.matrix.translate(0, 1, 0);
  body6.matrix.rotate(g_snakeAnimation ? -30 * Math.sin(g_seconds * 2 + Math.PI/3) : 0, 0, 0, 1);
  body6.matrix.scale(0.8, 0.75, 0.8);
  let body6Mat = new Matrix4(body6.matrix);
  body6.render();

  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
  }
  htmlElm.innerHTML = text;
}

// Reset the animation back to the orginal
function resetAnimation() {
  g_jawAngle = 0;
  g_tongueLength = 0.6;
  g_body5AnimAngle = 0;
  g_body5Angle = 0; // optionally reset manual body angle too
  g_startTime = performance.now() / 1000.0; // reset timer
}

// Manual Rotation for Mouse click
function mouseDown(ev) {
  g_mouseDown = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
}

function mouseUp(ev) {
  g_mouseDown = false;
}

function mouseMove(ev) {
  if (!g_mouseDown) return; // Only rotate if mouse is being held

  let newX = ev.clientX;
  let newY = ev.clientY;

  let deltaX = newX - g_lastMouseX;
  let deltaY = newY - g_lastMouseY;

  g_globalAngle += deltaX * 0.5;   // Rotate left/right
  g_verticalAngle += deltaY * 0.5; // Rotate up/down

  g_lastMouseX = newX;
  g_lastMouseY = newY;

  renderAllShapes();
}
