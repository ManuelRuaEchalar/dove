import React from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from '../components/game_parts/Canvas';
import CanvasDove from '../components/game_parts/CanvasDove';
import InfoPanel from '../components/game_parts/InfoPanel';

const Game = () => {
  const location = useLocation();

  // Obtener datos del state
  const theme = location.state?.theme || 'dark';
  const gameStyle = location.state?.gameStyle || null;
  const gameId = location.state?.gameId;

  return (
    <div className={`game-container ${theme}`}>
      {/* Si el estilo es dove, usamos CanvasDove */}
      {gameStyle === "dove" ? (
        <CanvasDove theme={theme} gameId={gameId} />
      ) : (
        <Canvas theme={theme} gameStyle={gameStyle} gameId={gameId} />
      )}

      <InfoPanel gameId={gameId} />
    </div>
  );
};

export default Game;
