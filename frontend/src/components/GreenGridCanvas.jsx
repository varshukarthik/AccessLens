import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function GreenGridCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.2,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.4,
      pulse: Math.random() * Math.PI,
    }));

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        bgGrad.addColorStop(0, '#02120e');
        bgGrad.addColorStop(0.5, '#071d18');
        bgGrad.addColorStop(1, '#052e16');
      } else {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.4, '#f0fdf4');
        bgGrad.addColorStop(1, '#dcfce7');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.28;
      const vanishingX = width * 0.5;

      const horizonGlow = ctx.createRadialGradient(
        vanishingX,
        horizonY,
        10,
        vanishingX,
        horizonY,
        width * 0.6
      );
      if (isDark) {
        horizonGlow.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        horizonGlow.addColorStop(0.6, 'rgba(5, 150, 105, 0.08)');
        horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        horizonGlow.addColorStop(0, 'rgba(34, 197, 94, 0.22)');
        horizonGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
        horizonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      offset = (offset + 0.35) % 40;

      const numHorizLines = 24;
      for (let i = 1; i <= numHorizLines; i++) {
        const progress = Math.pow((i + offset / 40) / numHorizLines, 2.4);
        const y = horizonY + progress * (height - horizonY);

        if (y > height) continue;

        const alpha = Math.min(1, Math.max(0.04, progress * (isDark ? 0.45 : 0.28)));
        ctx.strokeStyle = isDark
          ? 'rgba(52, 211, 153, ' + alpha + ')'
          : 'rgba(16, 185, 129, ' + alpha + ')';
        ctx.lineWidth = Math.max(0.75, progress * 1.5);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const numVertLines = 26;
      for (let i = -numVertLines; i <= numVertLines; i++) {
        const spread = i * (width / (numVertLines * 0.85));
        const bottomX = vanishingX + spread * 2.2;

        const edgeDist = Math.abs(i) / numVertLines;
        const lineAlpha = (1 - edgeDist * 0.5) * (isDark ? 0.32 : 0.18);

        ctx.strokeStyle = isDark
          ? 'rgba(52, 211, 153, ' + lineAlpha + ')'
          : 'rgba(16, 185, 129, ' + lineAlpha + ')';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.fillStyle = isDark
          ? 'rgba(110, 231, 183, ' + currentAlpha + ')'
          : 'rgba(16, 185, 129, ' + currentAlpha + ')';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 2.5) {
          ctx.strokeStyle = isDark
            ? 'rgba(16, 185, 129, ' + (currentAlpha * 0.3) + ')'
            : 'rgba(34, 197, 94, ' + (currentAlpha * 0.25) + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={'absolute inset-0 w-full h-full pointer-events-none ' + className}
    />
  );
}
