import React, { useState, useEffect, useRef } from 'react';

const SkyDecorations = ({ theme, gameRunning }) => {
  const [decorations, setDecorations] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!gameRunning) {
      setDecorations([]);
      return;
    }

    let intervalId;
    
    if (theme === 'light') {
      // Generar nubes periódicamente
      intervalId = setInterval(() => {
        // Probabilidad de generar una nube (30% cada 2 segundos)
        if (Math.random() < 0.3) {
          const newCloud = {
            id: Date.now() + Math.random(),
            type: 'cloud',
            size: Math.random() * 0.5 + 0.5, // Tamaño entre 0.5 y 1.0
            x: Math.random() * window.innerWidth,
            y: Math.random() * (window.innerHeight * 0.4), // Solo en la parte superior
            opacity: Math.random() * 0.4 + 0.4, // Opacidad entre 0.4 y 0.8
            speed: Math.random() * 0.5 + 0.2 // Velocidad entre 0.2 y 0.7
          };
          setDecorations(prev => [...prev, newCloud]);
        }
      }, 2000);
    } else {
      // Generar estrellas - creamos un conjunto inicial
      const initialStars = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        type: 'star',
        size: Math.random() * 2 + 1, // Tamaño entre 1px y 3px
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.7 + 0.3, // Opacidad entre 0.3 y 1.0
        twinkle: Math.random() < 0.7 // 70% de estrellas parpadean
      }));
      setDecorations(initialStars);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [theme, gameRunning]);

  // Efecto para animar y limpiar decoraciones
  useEffect(() => {
    if (!gameRunning || theme !== 'light') return;

    const animationId = requestAnimationFrame(() => {
      setDecorations(prev => {
        // Mover nubes y eliminar las que salieron de pantalla
        return prev
          .map(dec => {
            if (dec.type !== 'cloud') return dec;
            return {
              ...dec,
              x: dec.x - dec.speed // Mover nubes hacia la izquierda
            };
          })
          .filter(dec => {
            if (dec.type !== 'cloud') return true;
            return dec.x > -200; // Eliminar cuando salen completamente
          });
      });
    });

    return () => cancelAnimationFrame(animationId);
  }, [decorations, gameRunning, theme]);

  if (!gameRunning) return null;

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {decorations.map(dec => {
        if (dec.type === 'cloud') {
          return (
            <div
              key={dec.id}
              className="cloud"
              style={{
                transform: `scale(${dec.size})`,
                left: `${dec.x}px`,
                top: `${dec.y}px`,
                opacity: dec.opacity,
                position: 'absolute',
                zIndex: 1
              }}
            />
          );
        } else {
          return (
            <div
              key={dec.id}
              className={`star ${dec.twinkle ? 'twinkle' : ''}`}
              style={{
                width: `${dec.size}px`,
                height: `${dec.size}px`,
                left: `${dec.x}px`,
                top: `${dec.y}px`,
                opacity: dec.opacity,
                position: 'absolute',
                zIndex: 1
              }}
            />
          );
        }
      })}
    </div>
  );
};

export default SkyDecorations;