import p5Types from 'p5';

// Define complex coded visual elements of a recognizable camel
export const RenderUtils = {
  // --- Adults (recognizable humps, long necks, distinct heads) ---
  
  // Draws your main player camel (can be 2-humped)
  drawPlayerCamel: (p5: p5Types, x: number, y: number, angle: number, color: string) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    p5.fill(color);
    p5.noStroke();

    // Main Body (ellipse)
    p5.ellipse(0, 0, 25, 18);

    // Two humps (bezier curves on the back)
    p5.stroke('#8b5e34');
    p5.strokeWeight(3);
    p5.bezier(-10, -8, -5, -20, 5, -20, 10, -8); // Front hump
    p5.bezier(5, -8, 10, -18, 20, -18, 25, -8); // Back hump
    p5.noStroke();

    // Long Neck (rectangle connecting body and head)
    p5.fill(color);
    p5.rect(-18, -10, 8, 20, 3);

    // Head (ellipse with distinctive snout and ears)
    p5.push();
    p5.translate(-18, -10); // Center head on neck
    p5.ellipse(0, 0, 12, 10);
    p5.fill('#d2b48c'); // Stylized light snout color
    p5.ellipse(-6, 0, 6, 4);
    
    // Eyes (small ellipses)
    p5.fill(0);
    p5.ellipse(-2, -2, 2, 2);
    p5.ellipse(2, -2, 2, 2);
    p5.pop();

    // Ears (triangles)
    p5.fill(color);
    p5.triangle(-20, -18, -25, -15, -18, -15);
    p5.triangle(-13, -18, -8, -15, -15, -15);

    // Legs (stylized lines)
    p5.stroke('#c49e63'); // Hoof/leg color
    p5.strokeWeight(2);
    p5.line(-8, 10, -12, 18); // Left front
    p5.line(8, 10, 12, 18);   // Right front
    p5.line(-15, 8, -20, 15); // Left back
    p5.line(15, 8, 20, 15);   // Right back
    p5.noStroke();

    p5.pop();
  },

  // Draws enemy camels (slightly simplified, perhaps one hump)
  drawEnemyCamel: (p5: p5Types, x: number, y: number, angle: number, color: string) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    p5.fill(color);
    p5.noStroke();
    
    // Body (ellipse)
    p5.ellipse(0, 0, 25, 18);
    
    // One hump (bezier)
    p5.stroke('#af8a56'); // Different shade for definition
    p5.strokeWeight(3);
    p5.bezier(0, -8, 10, -18, 20, -18, 30, -8);
    p5.noStroke();

    // Long Neck (rect)
    p5.fill(color);
    p5.rect(-18, -10, 8, 20, 3);
    
    // Head (ellipse with snout)
    p5.push();
    p5.translate(-18, -10);
    p5.ellipse(0, 0, 12, 10);
    p5.fill('#d2b48c');
    p5.ellipse(-6, 0, 6, 4);
    p5.pop();
    
    // Ears (triangles)
    p5.fill(color);
    p5.triangle(-20, -18, -25, -15, -18, -15);
    p5.triangle(-13, -18, -8, -15, -15, -15);
    
    // Eyes (ellipses)
    p5.fill(0);
    p5.ellipse(-16, -12, 2, 2);
    p5.ellipse(-12, -12, 2, 2);

    // Legs (lines)
    p5.stroke('#af8a56');
    p5.strokeWeight(2);
    p5.line(-8, 10, -12, 18);
    p5.line(8, 10, 12, 18);
    p5.line(-15, 8, -20, 15);
    p5.line(15, 8, 20, 15);
    p5.noStroke();

    p5.pop();
  },

  // --- Camel Kids (small, simplified, one hump) ---
  
  // Draws the scattered camel kids
  drawCamelKid: (p5: p5Types, x: number, y: number, angle: number) => {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    p5.fill('#8b5e34'); // Unified kid color
    p5.noStroke();

    // Body (ellipse)
    p5.ellipse(0, 0, 15, 10);

    // One small hump (bezier)
    p5.stroke('#af8a56');
    p5.strokeWeight(2);
    p5.bezier(0, -5, 5, -12, 10, -12, 15, -5);
    p5.noStroke();

    // Short Neck & Small Head (ellipses/rects)
    p5.fill('#8b5e34');
    p5.rect(-10, -6, 5, 12, 2);
    p5.ellipse(-10, -6, 8, 7);

    // Small stylized legs (lines)
    p5.stroke('#af8a56');
    p5.strokeWeight(1);
    p5.line(-5, 5, -7, 10); // Front
    p5.line(5, 5, 7, 10);   // Back
    p5.noStroke();

    p5.pop();
  }
};
