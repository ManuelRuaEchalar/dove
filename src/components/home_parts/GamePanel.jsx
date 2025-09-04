import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../../api';

const GamePanel = ({ theme, gameStyle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score] = useState(0);
  const navigate = useNavigate();

  const handleStartGame = async () => {
    try {
      const result = await apiRequest('/game/start', 'POST');
      console.log("partida iniciada con ID:", result.gameId);
      navigate('/game', {
        state: { theme, gameStyle, gameId: result.gameId }
      });
    } catch (error) {
      console.error('Error al iniciar el juego:', error.message);
      return;
    }
  };

  return (
    <div className="game-panel">
      <button
        className="play-button"
        onClick={handleStartGame}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : '▶ Play'}
      </button>

      {showScore && (
        <div className="final-score">
          Score: {score} steps
        </div>
      )}
    </div>
  );
};

export default GamePanel;
