import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import palomaGif from '../../assets/paloma.gif';
import cuervoGif from '../../assets/cuervo.gif';

const CanvasDove = ({ theme, gameId }) => {
  const containerRef = useRef(null);
  const doveRef = useRef(null);
  const stateRef = useRef({
    x: 0,
    y: 0,
    angle: 0,
    baseSpeed: 1,
    currentSpeed: 1,
    speedIncrement: 0.2, // Cambiado de 0.1 a 0.2
    gameRunning: true,
    startTime: 0,
    lastSpeedUpdate: 0,
    pushForce: 0,
    targetAngle: 0,
    angleChangeTimer: 0,
    angleChangeInterval: 2000,
    stepCount: 0,
    targetBorder: ''
  });
  const animationRef = useRef(null);
  const navigate = useNavigate();

  const gif = theme === 'light' ? cuervoGif : palomaGif;

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    const dove = doveRef.current;
    if (!container || !dove) return;

    const state = stateRef.current;
    state.x = window.innerWidth / 2;
    state.y = window.innerHeight / 2;
    state.angle = 0;
    state.targetAngle = Math.random() * 360;
    state.startTime = Date.now();
    state.lastSpeedUpdate = Date.now();
    state.pushForce = window.innerWidth / 6;
    state.currentSpeed = state.baseSpeed;
    state.gameRunning = true;
    state.stepCount = 0;
    state.targetBorder = '';
    state.angleChangeTimer = 0;
    state.angleChangeInterval = 2000;

    window.gameState = {
      stepCount: 0,
      targetBorder: '',
      speed: '0.2'
    };

    const updateDovePosition = () => {
      dove.style.left = `${state.x - 60}px`;
      dove.style.top = `${state.y - 60}px`;
      dove.style.transform = `rotate(${state.angle}deg)`;
    };

    const updateUI = () => {
      const displaySpeed = state.currentSpeed.toFixed(1);
      window.gameState = {
        stepCount: state.stepCount,
        targetBorder: state.targetBorder,
        speed: displaySpeed
      };
    };

    const setRandomDirection = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const borders = ['left', 'right', 'top', 'bottom'];
      const weights = [
        state.x / window.innerWidth,
        (window.innerWidth - state.x) / window.innerWidth,
        state.y / window.innerHeight,
        (window.innerHeight - state.y) / window.innerHeight
      ];
      
      let totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let chosenBorder = '';
      let weightSum = 0;

      for (let i = 0; i < borders.length; i++) {
        weightSum += weights[i];
        if (random <= weightSum) {
          chosenBorder = borders[i];
          break;
        }
      }

      let targetX, targetY;
      switch (chosenBorder) {
        case 'left':
          targetX = 0;
          targetY = centerY + (Math.random() - 0.5) * centerY * 0.5;
          break;
        case 'right':
          targetX = window.innerWidth;
          targetY = centerY + (Math.random() - 0.5) * centerY * 0.5;
          break;
        case 'top':
          targetX = centerX + (Math.random() - 0.5) * centerX * 0.5;
          targetY = 0;
          break;
        case 'bottom':
          targetX = centerX + (Math.random() - 0.5) * centerX * 0.5;
          targetY = window.innerHeight;
          break;
      }

      const dx = targetX - state.x;
      const dy = targetY - state.y;
      let escapeAngle = Math.atan2(dy, dx) * 180 / Math.PI;

      const randomVariation = (Math.random() - 0.5) * 40;
      state.targetAngle = escapeAngle + randomVariation;
      state.targetBorder = chosenBorder;
    };

    const update = () => {
      if (!state.gameRunning) return;

      const currentTime = Date.now();

      if (currentTime - state.lastSpeedUpdate > 1000) {
        state.currentSpeed += state.speedIncrement;
        state.lastSpeedUpdate = currentTime;
      }

      state.angleChangeTimer += 16;
      if (state.angleChangeTimer > state.angleChangeInterval) {
        setRandomDirection();
        state.angleChangeTimer = 0;
        state.angleChangeInterval = 1000 + Math.random() * 2000;
      }

      let angleDiff = state.targetAngle - state.angle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      state.angle += angleDiff * 0.02;

      const angleRad = (state.angle * Math.PI) / 180;
      const vx = Math.cos(angleRad) * state.currentSpeed;
      const vy = Math.sin(angleRad) * state.currentSpeed;

      state.x += vx;
      state.y += vy;

      state.stepCount++;

      const margin = 30;
      if (
        state.x < -margin ||
        state.x > window.innerWidth + margin ||
        state.y < -margin ||
        state.y > window.innerHeight + margin
      ) {
        gameOver();
        return;
      }

      updateDovePosition();
      updateUI();
    };

    const pushDove = (clickX, clickY) => {
      const dx = state.x - clickX;
      const dy = state.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 120) return;

      const pushAngle = state.angle + 180;
      const pushAngleRad = (pushAngle * Math.PI) / 180;
      const proximityFactor = 1 - distance / 120;
      const calculatedPushForce = state.pushForce * proximityFactor;
      const pushX = Math.cos(pushAngleRad) * calculatedPushForce;
      const pushY = Math.sin(pushAngleRad) * calculatedPushForce;

      state.x += pushX;
      state.y += pushY;

      state.x = Math.max(30, Math.min(window.innerWidth - 30, state.x));
      state.y = Math.max(30, Math.min(window.innerHeight - 30, state.y));

      setRandomDirection();

      createWindParticles(clickX, clickY, state.x, state.y);

      updateDovePosition();
    };

    const createWindParticles = (clickX, clickY, doveX, doveY) => {
      const particleCount = 12;
      const dx = doveX - clickX;
      const dy = doveY - clickY;
      const pushAngle = Math.atan2(dy, dx);
      const particleColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'wind-particle';
        particle.style.backgroundColor = particleColor;

        const angleVariation = Math.random() * (Math.PI / 2) - Math.PI / 4;
        const distanceFromCenter = 10 + Math.random() * 20;
        const particleAngle = pushAngle + Math.PI + angleVariation;
        const startX = clickX + Math.cos(particleAngle) * distanceFromCenter;
        const startY = clickY + Math.sin(particleAngle) * distanceFromCenter;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        container.appendChild(particle);

        const duration = 400 + Math.random() * 300;
        const startTime = Date.now();

        const animateParticle = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          if (progress >= 1) {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
            return;
          }

          const moveDistance = 60 * progress;
          const moveX = Math.cos(-particleAngle) * moveDistance;
          const moveY = Math.sin(-particleAngle) * moveDistance;

          particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
          particle.style.opacity = `${1 - progress}`;

          requestAnimationFrame(animateParticle);
        };

        requestAnimationFrame(animateParticle);
      }
    };

    const gameOver = async () => {
      state.gameRunning = false;

      console.log('finalizando partida con puntuacion: ', state.stepCount);

      try {
        const result = await apiRequest('/game/end', 'POST', {
          gameId: gameId,
          score: state.stepCount
        });

        if (result.isTop3) {
          navigate('/', { state: { gameId: gameId, token: result.token } });
        } else {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      }
    };

    const handleClick = (e) => {
      if (state.gameRunning) {
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        pushDove(clickX, clickY);
      }
    };

    const handleResize = () => {
      state.pushForce = window.innerWidth / 3;
      state.x = Math.max(30, Math.min(window.innerWidth - 30, state.x));
      state.y = Math.max(30, Math.min(window.innerHeight - 30, state.y));
      updateDovePosition();
    };

    container.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    const gameLoop = () => {
      update();
      if (state.gameRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();
    updateDovePosition();

    return () => {
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.querySelectorAll('.wind-particle').forEach((particle) => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      });
      delete window.gameState;
    };
  }, [gameId, theme]);

  return (
    <div ref={containerRef} id="gameCanvas" className={`game-canvas ${theme}`} style={{ position: 'relative' }}>
      <div 
        ref={doveRef} 
        id="dove" 
        style={{ 
          backgroundImage: `url(${gif})`,
          position: 'absolute',
          width: '120px',
          height: '120px',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }} 
      />
    </div>
  );
};

export default CanvasDove;