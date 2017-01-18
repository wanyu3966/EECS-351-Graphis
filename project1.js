
// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// here we do the bare minimum: if we draw any part of any drawing primitive in
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 5.0;
var isDrag=false;    // mouse-drag: true when user holds down mouse button
var xMclik=0.0;     // last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices into an array, transfer
  // array contents to a Vertex Buffer Object created in the
  // graphics hardware.
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  window.addEventListener("keypress", myKeyPress, false);

   canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) };

            // when user's mouse button goes down call mouseDown() function
  canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas) };

                      // call mouseMove() function
  canvas.onmouseup =    function(ev){myMouseUp(   ev, gl, canvas)};
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel
  // unless the new Z value is closer to the eye than the old one..
//  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST);

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }


  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}


function initVertexBuffers(gl) {
//==============================================================================
  var vertices = new Float32Array ([
    //vertices for the middle big star
     0.0,  0.65, 0.0, 1,    1, 0, 0,
    -0.13, 0.25, 0.0, 1,    1, 0, 1,
    -0.5,  0.25, 0.0, 1,    0, 1, 0,
    -0.2,  0.0,  0.0, 1,    0, 1, 1,
     0.2,  0.0,  0.0, 1,    0.1, 1, 0,
     0.5,  0.25, 0.0, 1,    0, 0, 1,
     0.13, 0.25, 0.0, 1,    1, 0, 1,

    //lines connecting
    0.0,  0.65,  0.0, 1,    1, 0, 0,
    0.0,  0.65, -0.1, 1,    0, 1, 1,
  -0.13,  0.25,  0.0, 1,    1, 0, 0,
  -0.13,  0.25, -0.1, 1,    0, 1, 1,
  -0.5,   0.25,  0.0, 1,    0, 1, 0,
  -0.5,   0.25, -0.1, 1,    1, 1, 1,
  -0.2,   0.0,   0.0, 1,    0, 1, 0,
  -0.2,   0.0,  -0.1, 1,    1, 1, 0,
   0.2,   0.0,   0.0, 1,    0, 1, 0,
   0.2,   0.0,  -0.1, 1,    1, 1, 1,
   0.5,   0.25,    0, 1,    0, 0, 1,
   0.5,   0.25, -0.1, 1,    1, 1, 0,
   0.13,  0.25,  0.0, 1,    0, 0, 1,
   0.13,  0.25, -0.1, 1,    1, 1, 0,

   //vertices for the small star
   0.5,   0.4,   0, 1,      1, 1, 0,
   0.37,  0.0,   0, 1,      1, 0, 1,
   0.0,   0.0,   0, 1,      0, 1, 1,
   0.3,  -0.25,  0, 1,      1, 0, 0,
   0.15, -0.65,  0, 1,      0, 1, 0,
   0.5,  -0.4,   0, 1,      0, 0, 1,
   0.85, -0.65,  0, 1,      1, 1, 1,
   0.7,  -0.25,  0, 1,      1, 0, 1,
   1,     0.0,   0, 1,      1, 0, 0,
   0.63,  0.0,   0, 1,      0, 0, 1,

    // +x face: RED
     2.0, -2.0, -2.0, 1.0,    0.2, 0, 0,  // Node 3
     2.0,  0.0, -2.0, 1.0,    0.2, 0, 0,  // Node 2
     2.5,  -1,     -1, 1 ,    0, 0, 0,  //pointly

     2.5,  -1,     -1, 1 ,     0.1, 0.2, 0.2,  //pointly
     2.0,  0,       0, 1,      0.5, 0, 0,  // Node 4
     2.0,  0,    -2.0, 1.0,    0.2, 0, 0,  // Node 2

     2.0,  0.0,  0.0, 1.0,    0.2, 0, 0, // Node 4
     2.0, -2.0,  0.0, 1.0,    0.2, 0, 0,  // Node 7
     2.5, -1.0,   -1, 1 ,     0.3, 0.2, 0.2,  //pointly

     2.0, -2.0,  0.0, 1.0,    0.2, 0, 0,  // Node 7
     2.5, -1,    -1, 1 ,     0.3, 0.2, 0.2,  //pointly
     2.0, -2.0, -2.0, 1.0,    0.2, 0, 0,  // Node 3

    // +y face: GREEN
    0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 0.0,  // Node 1
    0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 0.0,  // Node 5
    1.0,  0.5, -1.0,    1,     0.0, 1.0, 0.0,    //pointy

      1.0,  0.5,  -1.0, 1,     0.0, 1.0, 0.0,    //pointy
     2.0,  0.0,  0.0, 1.0,    1.0, 0.0, 0.0,  // Node 4
     0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 0.0,  // Node 5

       1,  0.5,  -1,    1,     0.0, 1.0, 0.0,    //pointy
     2.0,  0.0,  0.0, 1.0,    1.0, 0.0, 0.0,  // Node 4
     2.0,  0.0, -2.0, 1.0,    1.0, 0.0, 0.0,  // Node 2

     1.0,  0.5,  -1.0,    1,    0.0, 1.0, 1.0,    //pointy
     2.0,  0.0, -2.0, 1.0,    1.0, 0.0, 1.0,  // Node 2
     0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,   // Node 1

    // -x face: CYAN
    0.0, -2.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 6
    0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 5
   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy

    0.0, -2.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 6
    -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    0.1, 1.0, 1.0,  // Node 0

   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    0.1, 1.0, 1.0,  // Node 0
    0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,  // Node 1

   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
   0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,  // Node 1
   0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 5

    // -y face: MAGENTA
     2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 3
     2.0, -2.0,  0.0, 1.0,    0.0, 0.0, 1.0,  // Node 7
     1.0, -2.5, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy

     1.0, -2.5, -1.0, 1.0,    1.0, 0.0, 1.0,  // pointy
     0.0, -2.0,  0.0, 1.0,    1.0, 0.0, 1.0,  // Node 6
      2.0, -2.0,  0.0, 1.0,    1.0, 0.0, 1.0,  // Node 7

    1.0, -2.5, -1.0, 1.0,    1.0, 0.0, .2,  // pointy
     0.0, -2.0,  0.0, 1.0,    1.0, 0.0, .2,  // Node 6
    -0.0, -2.0, -2.0, 1.0,    1.0, 0.1, .2,  // Node 0

      1.0, -2.5, -1.0, 1.0,    1.0, 0.0, 1.0,  // pointy
     2.0, -2.0, -2.0, 1.0,    1.0, 0.0, 1.0,  // Node 3
     -0.0, -2.0, -2.0, 1.0,    1.0, 0.1, 1.0,  // Node 0

     // -z face: YELLOW
     2.0,  0.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 2
     2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 3
     1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy

     1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
     0.0,  0.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 1
     2.0,  0.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 2

    1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
     0.0,  0.0, -2.0, 1.0,    1.0, 1.0, 0.1,  // Node 1
    0.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 0

    1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 0
    2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 3

  ]);
  var n = 91;   // The number of vertices

  // Create a buffer object. same as shapeBufferHandle
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;

  // // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE*7, 0);
  gl.enableVertexAttribArray(a_Position);

// Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }


  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*7, FSIZE*4);
  gl.enableVertexAttribArray(a_Color);

  //--------------------------------DONE!
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //------- Starly girl with her pony tail------------------------
  // -------Crown body---------------
  modelMatrix.setTranslate(0.3,0.1, 0.0);
  //modelMatrix.scale(0.7,0.7,0.7);
  modelMatrix.rotate(30, 0, 1,0);
  modelMatrix.rotate(currentAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, 7);

  //drawSeveralTimes(gl, n, modelMatrix, u_ModelMatrix);
   //layer 2
    modelMatrix.translate(0, 0,0.1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINE_LOOP, 0, 7);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINES, 7, 14);

    var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
              // why add 0.001? avoids divide-by-zero in next statement
              // in cases where user didn't drag the mouse.)
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
 //-------1nd  small star----------------
  modelMatrix.translate(0, 0.65, 0);
  modelMatrix.scale(0.2,0.2,0.2);
  modelMatrix.rotate(20, 0,0,1);
  modelMatrix.rotate(0.6*currentAngle, 0,0,1);
  //pushMatrix(modelMatrix);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

//-------2nd  small star----------------
  //modelMatrix = popMatrix();
	modelMatrix.translate(0.85, -0.65, 0.0);
	modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(-10, 0,0,1);
  modelMatrix.rotate(0.3*currentAngle, 0,0,1);
  pushMatrix(modelMatrix);
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

//-------3rd  small star----------------
  modelMatrix = popMatrix();
	// Now move drawing axes to the centered end of that lower-jaw segment:
	modelMatrix.translate(0.85, -0.65, 0.0);
	modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(-40, 1,0,1);		// make bend in the lower jaw
	//modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
  modelMatrix.rotate(1.3*currentAngle, 1,0,1);
	// Draw outer lower jaw segment:
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);


//-------second object
modelMatrix.setTranslate(-0.8, 0.2, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.rotate(currentAngle, 0, 0, 1);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);

//second
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(-0.2*currentAngle, 0, 1, 1);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);

  //third
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(-50, 1, 0, 0);
  modelMatrix.rotate(0.2*currentAngle, 1, 0, 0);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);

  var dist = Math.sqrt(xMclik*xMclik + yMclik*yMclik);
              // why add 0.001? avoids divide-by-zero in next statement
              // in cases where user didn't drag the mouse.)
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);


//fourth
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(2*currentAngle, 1, 0, 0);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);

//fifth
  modelMatrix.translate(2, -2, -2);
 // modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(0.2*currentAngle, 1, 0, 0);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);

  //sixth
  modelMatrix.translate(2, -2, -2);
  //modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(3*currentAngle, 1, 0, 0);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 31,60);
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  if(angle >   30.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  -30.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

  var newAngle = angle + ANGLE_STEP / 30.0;
  return newAngle %= 360;
}

function myKeyPress(ev) {
  if (ev.keyCode == 32){
    runStop();
  }

}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}

function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
//                  (Which button?    console.log('ev.button='+ev.button);   )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

  isDrag = true;                      // set our mouse-dragging flag
  xMclik = x;                         // record where mouse-dragging began
  yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

  if(isDrag==false) return;       // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);          // Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;                         // Make next drag-measurement from here.
  yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
//                  (Which button?   console.log('ev.button='+ev.button);    )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);

  isDrag = false;                     // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};

// function clearDrag() {
// // Called when user presses 'Clear' button in our webpage
//   xMdragTot = 0.0;
//   yMdragTot = 0.0;
// }


function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
  ANGLE_STEP += 25;
}

function spinDown() {
// Called when user presses the 'Spin <<' button
 ANGLE_STEP -= 25;
}
