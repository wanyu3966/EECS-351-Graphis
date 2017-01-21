//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda AND
// Chapter 2: ColoredPoints.js (c) 2012 matsuda
//
// merged and modified to became:
//
// ControlMulti.js for EECS 351-1,
//									Northwestern Univ. Jack Tumblin

//		--converted from 2D to 4D (x,y,z,w) vertices
//		--demonstrate how to keep & use MULTIPLE colored shapes
//			in just one Vertex Buffer Object(VBO).
//		--demonstrate several different user I/O methods:
//				--Webpage pushbuttons
//				--Webpage edit-box text, and 'innerHTML' for text display
//				--Mouse click & drag within our WebGL-hosting 'canvas'
//				--Keyboard input: alphanumeric + 'special' keys (arrows, etc)
//
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

// Global Variables for the spinning tetrahedron:
var ANGLE_STEP = 45.0;  // default rotation angle rate (deg/sec)

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;

var r=1;
var g=1;
var b=1;
var s=1;


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

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  // Register the Mouse & Keyboard Event-handlers-------------------------------
	// If users move, click or drag the mouse, or they press any keys on the
	// the operating system will sense them immediately as 'events'.
	// If you would like your program to respond to any of these events, you must // tell JavaScript exactly how to do it: you must write your own 'event
	// handler' functions, and then 'register' them; tell JavaScript WHICH
	// events should cause it to call WHICH of your event-handler functions.
	//
	// First, register all mouse events found within our HTML-5 canvas:
  canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) };

  					// when user's mouse button goes down call mouseDown() function
  canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };

											// call mouseMove() function
  canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};
  					// NOTE! 'onclick' event is SAME as on 'mouseup' event
  					// in Chrome Brower on MS Windows 7, and possibly other
  					// operating systems; use 'mouseup' instead.


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

          function initVertexBuffer(gl) {
          //==============================================================================


            var vertices = new Float32Array ([

              -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                 0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3

                -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                 0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3


                -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                 0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                 0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                 0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6

                 -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                 0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                 0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2

                  -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8

                -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4

                0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7
                3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3

                0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                 0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7
                3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3

                -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                   0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                  3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3

                  -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                   0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                  3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3


                  -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                   0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                  -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                   0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                  -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                  -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                   0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6

                   -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                   0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                   0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2

                    -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                  -s*3,  1.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 5
                  0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8

                  -3,  0.0, 0.0, 1.0,     r,  0.0,  0.0,  // Node 1
                  0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                  0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4

                  0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                  0,  1.0, -s*2.0, 1.0,    0.0,  g,  0.0,  // Node 8
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                  0,  0.0, -2.0, 1.0,    0.0,  g,  0.0,  // Node 4
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7
                  3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3

                  0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                  0,  1.0, s*2.0, 1.0,     0.0,  g,  0.0,  // Node 6
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7

                   0,  0.0, 2.0, 1.0,     0.0,  g,  0.0,  // Node 2
                  s*3,  1.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 7
                  3,  0.0, 0.0, 1.0,     0.0,  0.0,  b,  // Node 3


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

              var nn=132;
              // Create a buffer object
var shapeBufferHandle = gl.createBuffer();
if (!shapeBufferHandle) {
  console.log('Failed to create the shape buffer object');
  return false;
}

// Bind the the buffer object to target:
gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
// Transfer data from Javascript array colorShapes to Graphics system VBO
// (Use sparingly--may be slow if you transfer large shapes stored in files)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

var FSIZE = vertices.BYTES_PER_ELEMENT; // how many bytes per stored value?

//Get graphics system's handle for our Vertex Shader's position-input variable:
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
if (a_Position < 0) {
  console.log('Failed to get the storage location of a_Position');
  return -1;
}
// Use handle to specify how to retrieve position data from our VBO:
gl.vertexAttribPointer(
    a_Position,   // choose Vertex Shader attribute to fill with data
    4,            // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
    gl.FLOAT,     // data type for each value: usually gl.FLOAT
    false,        // did we supply fixed-point data AND it needs normalizing?
    FSIZE * 7,    // Stride -- how many bytes used to store each vertex?
                  // (x,y,z,w, r,g,b) * bytes/value
    0);           // Offset -- now many bytes from START of buffer to the
                  // value we will actually use?
gl.enableVertexAttribArray(a_Position);
                  // Enable assignment of vertex buffer object's position data

// Get graphics system's handle for our Vertex Shader's color-input variable;
var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
if(a_Color < 0) {
  console.log('Failed to get the storage location of a_Color');
  return -1;
}
// Use handle to specify how to retrieve color data from our VBO:
gl.vertexAttribPointer(
  a_Color,        // choose Vertex Shader attribute to fill with data
  3,              // how many values? 1,2,3 or 4. (we're using R,G,B)
  gl.FLOAT,       // data type for each value: usually gl.FLOAT
  false,          // did we supply fixed-point data AND it needs normalizing?
  FSIZE * 7,      // Stride -- how many bytes used to store each vertex?
                  // (x,y,z,w, r,g,b) * bytes/value
  FSIZE * 4);     // Offset -- how many bytes from START of buffer to the
                  // value we will actually use?  Need to skip over x,y,z,w

gl.enableVertexAttribArray(a_Color);
                  // Enable assignment of vertex buffer object's position data

//--------------------------------DONE!
// Unbind the buffer object
gl.bindBuffer(gl.ARRAY_BUFFER, null);

return nn;
}



function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);

  modelMatrix.setTranslate(0, -0.7, 0);
  modelMatrix.scale(0.2,0.2,0.2);
  modelMatrix.rotate(-30, 1, 0, 0);
  //modelMatrix.rotate(currentAngle, 0, 1, 0);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 1, 0);
  modelMatrix.scale(0.8,0.8,0.8);
  modelMatrix.rotate(currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 1.1, 0);
  modelMatrix.scale(0.7,0.7,0.7);
  modelMatrix.rotate(currentAngle*0.3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 1.3, 0);
  modelMatrix.scale(0.6,0.6,0.6);
  modelMatrix.rotate(currentAngle*0.5, 0, 0, 1);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);



  modelMatrix.translate(0.7, 1.3, 0);
  modelMatrix.scale(0.15,0.15,0.15);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 4, 0);
  modelMatrix.scale(1,1,1);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix = popMatrix();

  modelMatrix.translate(0.35, 1.6, 0);
  modelMatrix.scale(0.17,0.17,0.17);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 4, 0);
  modelMatrix.scale(1,1,1);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,0, 36);

  modelMatrix = popMatrix();

  modelMatrix.translate(0, 1.9, 0);
  modelMatrix.scale(0.17,0.17,0.17);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 4, 0);
  modelMatrix.scale(1,1,1);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix = popMatrix();

  modelMatrix.translate(-0.35, 1.6, 0);
  modelMatrix.scale(0.17,0.17,0.17);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  modelMatrix.translate(0, 4, 0);
  modelMatrix.scale(1,1,1);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

   modelMatrix = popMatrix();

  modelMatrix.translate(-0.7, 1.3, 0);
  modelMatrix.scale(0.17,0.17,0.17);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,0, 36);

  modelMatrix.translate(0, 4, 0);
  modelMatrix.scale(1,1,1);
  modelMatrix.rotate(currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);



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

  if(angle >   50 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  -50.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  g = Math.abs((newAngle%100*0.01 - 0.5));
  return newAngle%360;
}

//==================HTML Button Callbacks======================

function angleSubmit() {
// Called when user presses 'Submit' button on our webpage
//    HOW? Look in HTML file (e.g. ControlMulti.html) to find
//  the HTML 'input' element with id='usrAngle'.  Within that
//  element you'll find a 'button' element that calls this fcn.

// Read HTML edit-box contents:
  var UsrTxt=document.getElementById('usrAngle').value;
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='Result':
  document.getElementById('Result').innerHTML ='You Typed: '+UsrTxt;
};

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
  xMdragTot = 0.0;
  yMdragTot = 0.0;
}

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

function runStop() {
// Called when user presses the 'Run/Stop' button
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}

//===================Mouse and Keyboard event-handling Callbacks

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


function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the
// keyboard's scancode or keycode(varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins,
// Del, etc), then just use the 'keypress' event instead.
//   The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get the ASCII code for uppercase 'S' if you hold shift
// and press the 's' key.
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//

  switch(ev.keyCode) {      // keycodes !=ASCII, but are very consistent for
  //  nearly all non-alphanumeric keys for nearly all keyboards in all countries.
    case 37:    // left-arrow key
      // print in console:
      console.log(' left-arrow.');
      // and print on webpage in the <div> element with id='Result':
      document.getElementById('Result').innerHTML =
        ' Left Arrow:keyCode='+ev.keyCode;
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');
      document.getElementById('Result').innerHTML =
        '   Up Arrow:keyCode='+ev.keyCode;
      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');
      document.getElementById('Result').innerHTML =
        'Right Arrow:keyCode='+ev.keyCode;
      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');
      document.getElementById('Result').innerHTML =
        ' Down Arrow:keyCode='+ev.keyCode;
      break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
      document.getElementById('Result').innerHTML =
        'myKeyDown()--keyCode='+ev.keyCode;
      break;
  }
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as
// CTRL-C, alt-F, SHIFT-4, etc.
  console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
                        ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                        ', altKey='   +ev.altKey   +
                        ', metaKey(Command key or Windows key)='+ev.metaKey);
}
