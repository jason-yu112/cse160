
function drawVector(v, color) {
  var canvas = document.getElementById('example');
  if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
  }
  var ctx = canvas.getContext('2d');
  ctx.beginPath();

  let x = v.elements[0] * 20;
  let y = v.elements[1] * 20;

  ctx.moveTo(200, 200);
  ctx.lineTo(200 + x, 200 - y);
  ctx.strokeStyle = color;

  ctx.stroke();
}

function handleDrawEvent(event) {

  var canvas = document.getElementById('example');
  if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
  }

  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1_x = document.getElementById("v1_x").value;
  let v1_y = document.getElementById("v1_y").value;
  
  let v2_x = document.getElementById("v2_x").value;
  let v2_y = document.getElementById("v2_y").value;

  if (isNaN(v1_x) || isNaN(v1_y) || isNaN(v2_x) || isNaN(v2_y)) {
      console.log("Invalid input values!");
      return;
  }

  // Create new vectors using the input values and draw it
  let v1 = new Vector3([v1_x, v1_y, 0]);
  let v2 = new Vector3([v2_x, v2_y, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
  event.preventDefault();
}

function handleDrawOperationEvent(event) {



  scalar = document.getElementById("scalar").value;
  op = document.getElementById("operation").value;

  if (!scalar && (op == "multiply" || op == "divide")) {
      console.log("NEED SCALAR!");
      event.preventDefault();
      return;
  }

  var canvas = document.getElementById('example');
  if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      event.preventDefault();
      return;
  }

  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1_x = document.getElementById("v1_x").value;
  let v1_y = document.getElementById("v1_y").value;
  
  let v2_x = document.getElementById("v2_x").value;
  let v2_y = document.getElementById("v2_y").value;

  if (isNaN(v1_x) || isNaN(v1_y) || isNaN(v2_x) || isNaN(v2_y)) {
      console.log("Invalid input values!");
      return;
  }

  // Draw the two vectors using the input values and draw it
  let v1 = new Vector3([v1_x, v1_y, 0]);
  let v2 = new Vector3([v2_x, v2_y, 0]); 
  drawVector(v1, "red");
  drawVector(v2, "blue");
 
  let v3 = new Vector3([v1_x, v1_y, 0]);

  if (op == "addition") {
      v3.add(v2);
      drawVector(v3, "green");
  }
  else if (op == "subtraction") {
      v3.sub(v2);
      drawVector(v3, "green");
  }
  else if (op == "multiply") {
      v1.mul(scalar);
      v2.mul(scalar);
      drawVector(v1, "green");
      drawVector(v2, "green");
  }
  else if (op == "divide") {
      v1.div(scalar);
      v2.div(scalar);
      drawVector(v1, "green");
      drawVector(v2, "green");
  }
  else if (op == "magnitude") {
      console.log("Magnitude v1: " + v1.magnitude());
      console.log("Magnitude v2: " + v2.magnitude());
  }
  else if (op == "normalize") {
      drawVector(v1.normalize(), "green");
      drawVector(v2.normalize(), "green");
  }
  else if (op == "angle_between") {
      let dot_product = Vector3.dot(v1, v2);
      let v1_mag = v1.magnitude();
      let v2_mag = v2.magnitude();
      let fraction = dot_product / (v1_mag * v2_mag);
      let result = Math.acos(fraction)* (180 / Math.PI); 
      console.log(result);
  }
  else if (op == "area") {
      // ||v1 x v2||
      let cross_product = Vector3.cross(v1, v2);
      let area = cross_product.magnitude() / 2; 
      console.log("Area of the Triangle: " + area);
  }


  event.preventDefault();

}

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');
  if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
  }

  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let submitButton = document.getElementById("submit");
  submitButton.addEventListener("click", handleDrawEvent);

  let secondSubmit = document.getElementById("secondSubmit");
  secondSubmit.addEventListener("click", handleDrawOperationEvent);
}
