import React, { useEffect, useRef } from "react";

const Particles = ({ quantity = 25, radius = 70 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let SCREEN_WIDTH = window.innerWidth;
    let SCREEN_HEIGHT = window.innerHeight;

    let mouseX = SCREEN_WIDTH / 2;
    let mouseY = SCREEN_HEIGHT / 2;

    let particles = [];

    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    for (let i = 0; i < quantity; i++) {
      particles.push({
        size: 1 + Math.random() * 7,
        position: { x: mouseX, y: mouseY },
        offset: { x: 0, y: 0 },
        shift: { x: mouseX, y: mouseY },
        speed: 0.01 + Math.random() * 0.04,
        fillColor:
          "#" + ((Math.random() * 0x404040 + 0xaaaaaa) | 0).toString(16),
        orbit: radius * 0.5 + radius * 0.5 * Math.random(),
      });
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      SCREEN_WIDTH = window.innerWidth;
      SCREEN_HEIGHT = window.innerHeight;
      canvas.width = SCREEN_WIDTH;
      canvas.height = SCREEN_HEIGHT;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let animationFrameId;

    const loop = () => {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.offset.x += p.speed;
        p.offset.y += p.speed;
        p.shift.x += (mouseX - p.shift.x) * p.speed;
        p.shift.y += (mouseY - p.shift.y) * p.speed;
        p.position.x = p.shift.x + Math.cos(i + p.offset.x) * p.orbit;
        p.position.y = p.shift.y + Math.sin(i + p.offset.y) * p.orbit;

        ctx.beginPath();
        ctx.fillStyle = p.fillColor;
        ctx.arc(p.position.x, p.position.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [quantity, radius]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
};

export default Particles;

//BUBBLE EFFECT - IGNORE
// import React, { useEffect, useRef } from "react";

// export default function Particles({ fillColor = "#e6f1f7", strokeColor = "#3a92c5", zIndex = 9999999999 }) {
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const particlesRef = useRef([]);
//   const cursorRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

//   useEffect(() => {
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");
//     canvas.style.position = "fixed";
//     canvas.style.top = "0";
//     canvas.style.left = "0";
//     canvas.style.pointerEvents = "none";
//     canvas.style.zIndex = zIndex;
//     document.body.appendChild(canvas);
//     canvasRef.current = canvas;

//     let width = window.innerWidth;
//     let height = window.innerHeight;
//     canvas.width = width;
//     canvas.height = height;

//     // Detect prefers-reduced-motion
//     const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
//     if (prefersReducedMotion.matches) return;

//     function Particle(x, y) {
//       this.lifeSpan = Math.floor(Math.random() * 30 + 30);
//       this.initialLifeSpan = this.lifeSpan;
//       this.position = { x, y };
//       this.velocity = {
//         x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 20),
//         y: -0.4 + Math.random() * -0.5,
//       };
//       this.baseDimension = 4;
//       this.update = function (ctx) {
//         this.position.x += this.velocity.x;
//         this.position.y += this.velocity.y;
//         this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
//         this.velocity.y -= Math.random() / 600;
//         this.lifeSpan--;

//         const scale = 0.2 + (this.initialLifeSpan - this.lifeSpan) / this.initialLifeSpan;
//         ctx.fillStyle = fillColor;
//         ctx.strokeStyle = strokeColor;
//         ctx.beginPath();
//         ctx.arc(
//           this.position.x - (this.baseDimension / 2) * scale,
//           this.position.y - this.baseDimension / 2,
//           this.baseDimension * scale,
//           0,
//           2 * Math.PI
//         );
//         ctx.stroke();
//         ctx.fill();
//         ctx.closePath();
//       };
//     }

//     function addParticle(x, y) {
//       particlesRef.current.push(new Particle(x, y));
//     }

//     function onMouseMove(e) {
//       cursorRef.current.x = e.clientX;
//       cursorRef.current.y = e.clientY;
//       addParticle(cursorRef.current.x, cursorRef.current.y);
//     }

//     function onWindowResize() {
//       width = window.innerWidth;
//       height = window.innerHeight;
//       canvas.width = width;
//       canvas.height = height;
//     }

//     function updateParticles() {
//       const ctx = canvas.getContext("2d");
//       ctx.clearRect(0, 0, width, height);

//       particlesRef.current.forEach(p => p.update(ctx));

//       // Remove dead particles
//       particlesRef.current = particlesRef.current.filter(p => p.lifeSpan > 0);
//     }

//     function loop() {
//       updateParticles();
//       animationRef.current = requestAnimationFrame(loop);
//     }

//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("resize", onWindowResize);
//     loop();

//     return () => {
//       // Cleanup on unmount
//       cancelAnimationFrame(animationRef.current);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("resize", onWindowResize);
//       canvas.remove();
//     };
//   }, [fillColor, strokeColor, zIndex]);

//   return null; // No JSX needed; canvas is appended to body
// }

//