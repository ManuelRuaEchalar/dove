import React, { useState, useEffect } from 'react';

const InfoPanel = () => {
  const [gameData, setGameData] = useState({
    stepCount: 0,
    targetBorder: '',
    speed: '0.2'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.gameState) {
        setGameData(window.gameState);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="info-panel">
      <div className="step-counter">Pasos: {gameData.stepCount}</div>
    </div>
  );
};

export default InfoPanel;