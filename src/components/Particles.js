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
