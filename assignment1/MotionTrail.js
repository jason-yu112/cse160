class MotionTrailPoint {
    constructor() {
      this.positions = [];
      this.maxTrailLength = 50;
      this.fadeSpeed = 0.15;
      this.sizeSpeed = 0.1;
      this.maxSize = 10;
      this.minSize = 3;
    }
  
    addMotionTrail(x, y) {
      this.positions.push({ 
        x, 
        y, 
        alpha: 1.0, 
        size: g_selectedSize
      });
  
      // Limit the trail length
      if (this.positions.length > this.maxTrailLength) {
        this.positions.shift();
      }
    }
  
    render() {
      const trailLength = this.positions.length;
  
      for (let i = 0; i < trailLength; i++) {
        let pos = this.positions[i];
  
        let vertices = new Float32Array([pos.x, pos.y]);
  
        // Create and bind a buffer
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
  
        gl.uniform1f(u_Size, pos.size);
  
        let gradientFactor = i / trailLength;
  
        let gradientAlpha = Math.max(0.0, 1.0 - gradientFactor);
  
        // Calculate the color
        let gradientColor = [
          g_selectedColor[0] * gradientAlpha, // Red channel fades
          g_selectedColor[1] * gradientAlpha, // Green channel fades
          g_selectedColor[2] * gradientAlpha, // Blue channel fades
          gradientAlpha
        ];
  
        gl.uniform4f(u_FragColor, gradientColor[0], gradientColor[1], gradientColor[2], gradientColor[3]);
        gl.drawArrays(gl.POINTS, 0, 1);
  
        pos.alpha -= this.fadeSpeed;
        if (pos.alpha < 0) {
          pos.alpha = 0;
        }
  
        pos.size = g_selectedSize;
        if (pos.size < this.minSize) {
          pos.size = this.minSize;
        }
      }
    }
  }