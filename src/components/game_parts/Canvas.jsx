import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../../api';
import '../../index.css';

const Canvas = ({ theme, gameId }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [stepCount, setStepCount] = useState(0);
  const [targetBorder, setTargetBorder] = useState('');
  const [speed, setSpeed] = useState(0.2);
  const navigate = useNavigate();
  
  const colors = useMemo(() => {
    return theme === 'dark' ? {
      background: 'rgba(0, 0, 0, 0.1)',
      trajectory: 'rgba(255, 255, 255, 0.5)',
      dove: 'white',
      center: 'rgba(255, 0, 0, 0.5)',
      wind: (opacity) => `rgba(200, 200, 255, ${opacity})`
    } : {
      background: 'rgba(240, 248, 255, 0.1)',
      trajectory: 'rgba(0, 0, 0, 0.5)',
      dove: 'black',
      center: 'rgba(255, 0, 0, 0.5)',
      wind: (opacity) => `rgba(0, 0, 100, ${opacity})`
    };
  }, [theme]);

  // Función para obtener el estado inicial
  const getInitialState = () => ({
    X: 100,
    Y: 100,
    x: 50,
    y: 50,
    theta: Math.random() * 2 * Math.PI,
    kappa: 5.0,
    stepSize: 0.2,
    biasStrength: 0.55,
    stepCount: 0,
    trajectory: [],
    pushForce: 15.0,
    speedIncreaseInterval: 100,
    speedIncreaseFactor: 1.05,
    windParticles: [],
    scaleX: 1,
    scaleY: 1,
    targetBorder: ''
  });

  const simulationState = useRef(getInitialState());
  const borders = ['izquierda', 'derecha', 'arriba', 'abajo'];

  // Función para reiniciar el juego
  const resetGame = () => {
    simulationState.current = getInitialState();
    setStepCount(0);
    setSpeed(0.2);
    setTargetBorder('');
  };

  const vonMises = (mu, kappa) => {
    const a = 1 + Math.sqrt(1 + 4 * kappa * kappa);
    const b = (a - Math.sqrt(2 * a)) / (2 * kappa);
    const r = (1 + b * b) / (2 * b);

    while (true) {
      const u1 = Math.random();
      const z = Math.cos(Math.PI * u1);
      const f = (1 + r * z) / (r + z);
      const c = kappa * (r - f);
      const u2 = Math.random();
      if (c * (2 - c) - u2 > 0 || Math.log(c / u2) + 1 - c >= 0) {
        const u3 = Math.random();
        return mu + (u3 > 0.5 ? 1 : -1) * Math.acos(f);
      }
    }
  };

  const getBiasDirection = (x, y, targetBorder) => {
    if (targetBorder === 'izquierda') {
      return Math.PI;
    } else if (targetBorder === 'derecha') {
      return 0;
    } else if (targetBorder === 'arriba') {
      return -Math.PI / 2;
    } else {
      return Math.PI / 2;
    }
  };

  const createWindParticles = (clickX, clickY, centerX, centerY) => {
    const particleCount = 12;
    const dx = centerX - clickX;
    const dy = centerY - clickY;
    const windAngle = Math.atan2(dy, dx);

    for (let i = 0; i < particleCount; i++) {
      const angleVariation = (Math.random() * Math.PI / 2) - Math.PI / 4;
      const distanceFromCenter = 10 + Math.random() * 20;

      const particleAngle = windAngle + angleVariation;
      const startX = clickX + Math.cos(particleAngle) * distanceFromCenter;
      const startY = clickY + Math.sin(particleAngle) * distanceFromCenter;

      simulationState.current.windParticles.push({
        x: startX,
        y: startY,
        angle: windAngle,
        startTime: Date.now(),
        duration: 400 + Math.random() * 300,
        opacity: 1
      });
    }
  };

  const pushDove = (clickX, clickY) => {
    const state = simulationState.current;
    const logicalClickX = clickX / state.scaleX;
    const logicalClickY = clickY / state.scaleY;

    const dx = state.x - logicalClickX;
    const dy = state.y - logicalClickY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const influenceRadius = 120 / state.scaleX;

    if (distance > influenceRadius) return;

    const centerX = 50;
    const centerY = 50;
    const directionX = centerX - logicalClickX;
    const directionY = centerY - logicalClickY;

    const directionLength = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedDirectionX = directionX / directionLength;
    const normalizedDirectionY = directionY / directionLength;

    const proximityFactor = 1 - (distance / influenceRadius);
    const calculatedPushForce = state.pushForce * proximityFactor;

    const pushX = normalizedDirectionX * calculatedPushForce;
    const pushY = normalizedDirectionY * calculatedPushForce;

    state.x += pushX;
    state.y += pushY;

    state.x = Math.max(0, Math.min(state.X, state.x));
    state.y = Math.max(0, Math.min(state.Y, state.y));

    state.theta = Math.random() * 2 * Math.PI;

    const newTargetBorder = borders[Math.floor(Math.random() * borders.length)];
    state.targetBorder = newTargetBorder;
    setTargetBorder(newTargetBorder);

    createWindParticles(clickX, clickY, centerX * state.scaleX, centerY * state.scaleY);
  };

  const animate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = simulationState.current;

    state.stepCount++;
    setStepCount(state.stepCount);

    if (state.stepCount % state.speedIncreaseInterval === 0) {
      state.stepSize *= state.speedIncreaseFactor;
      setSpeed(state.stepSize);
    }

    state.theta = vonMises(state.theta, state.kappa);

    const biasTheta = getBiasDirection(state.x, state.y, state.targetBorder);
    const dx = state.biasStrength * Math.cos(biasTheta) + (1 - state.biasStrength) * Math.cos(state.theta);
    const dy = state.biasStrength * Math.sin(biasTheta) + (1 - state.biasStrength) * Math.sin(state.theta);
    const norm = Math.sqrt(dx * dx + dy * dy);
    const dxNorm = dx / norm;
    const dyNorm = dy / norm;

    state.x += state.stepSize * dxNorm;
    state.y += state.stepSize * dyNorm;
    state.x = Math.max(0, Math.min(state.X, state.x));
    state.y = Math.max(0, Math.min(state.Y, state.y));

    state.trajectory.push([state.x * state.scaleX, state.y * state.scaleY]);

    if ((state.targetBorder === 'izquierda' && state.x <= 0) ||
      (state.targetBorder === 'derecha' && state.x >= state.X) ||
      (state.targetBorder === 'arriba' && state.y <= 0) ||
      (state.targetBorder === 'abajo' && state.y >= state.Y)) {

      // Cancelar animación inmediatamente
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      try {

        console.log("finalizando partida con puntuacion: ", state.stepCount);
        const result = await apiRequest('/game/end', 'POST', {
          gameId: gameId,
          score: state.stepCount
        });

        if (result.isTop3) {
          navigate('/', { state: { gameId: gameId, token: result.token } });
        } else {
          navigate('/');
        }
        
        // Reiniciar el juego después de navegar
        resetGame();
      } catch (error) {
        console.error('Error al finalizar el juego:', error.message);
        // Reiniciar incluso si hay error
        resetGame();
        navigate('/');
      }
      return; // Importante: salir de la función animate
    }

    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.trajectory.length > 1) {
      ctx.beginPath();
      ctx.moveTo(state.trajectory[0][0], state.trajectory[0][1]);
      for (let i = 1; i < state.trajectory.length; i++) {
        ctx.lineTo(state.trajectory[i][0], state.trajectory[i][1]);
      }
      ctx.strokeStyle = colors.trajectory;
      ctx.stroke();
    }

    const currentTime = Date.now();
    for (let i = state.windParticles.length - 1; i >= 0; i--) {
      const p = state.windParticles[i];
      const elapsed = currentTime - p.startTime;
      const progress = Math.min(elapsed / p.duration, 1);

      if (progress >= 1) {
        state.windParticles.splice(i, 1);
        continue;
      }

      const moveDistance = 60 * progress;
      const moveX = Math.cos(p.angle) * moveDistance;
      const moveY = Math.sin(p.angle) * moveDistance;

      const currentX = p.x + moveX;
      const currentY = p.y + moveY;

      ctx.beginPath();
      ctx.arc(currentX, currentY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = colors.wind(1 - progress);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(state.x * state.scaleX, state.y * state.scaleY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = colors.dove;
    ctx.fill();

    if (animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    pushDove(clickX, clickY);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const state = simulationState.current;
    state.scaleX = canvas.width / state.X;
    state.scaleY = canvas.height / state.Y;

    const newTrajectory = [];
    for (const point of state.trajectory) {
      const logicalX = point[0] / state.scaleX;
      const logicalY = point[1] / state.scaleY;
      newTrajectory.push([logicalX * state.scaleX, logicalY * state.scaleY]);
    }
    state.trajectory = newTrajectory;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resetGame(); // Reiniciar el juego al montar el componente

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const state = simulationState.current;
    state.scaleX = canvas.width / state.X;
    state.scaleY = canvas.height / state.Y;
    state.trajectory = [[state.x * state.scaleX, state.y * state.scaleY]];

    const initialTarget = borders[Math.floor(Math.random() * borders.length)];
    state.targetBorder = initialTarget;
    setTargetBorder(initialTarget);

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [gameId]); // Se añade gameId como dependencia para reiniciar cuando cambie

  useEffect(() => {
    window.gameState = {
      stepCount,
      targetBorder,
      speed: speed.toFixed(2)
    };
  }, [stepCount, targetBorder, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      onClick={handleCanvasClick}
      style={{ cursor: 'crosshair' }}
    />
  );
};

export default Canvas;