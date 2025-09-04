import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../../api';

const GamePanel = ({ theme, gameStyle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score] = useState(0);
  const navigate = useNavigate();

  // Obtener el tema actual del body
  const isDarkMode = document.body.classList.contains('dark');

  const handleStartGame = async () => {  // ← Corrección aquí
    try {
      const result = await apiRequest('/game/start', 'POST');
      // Pasar el tema y el gameId como estado de navegación
      console.log("partida iniciada con ID:", result.gameId);
      navigate('/game', {
        state: {
          theme,       // dark o light
          gameStyle:gameStyle,   // abstract o dove
          gameId: result.gameId
        }
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
        {isLoading ? 'Cargando...' : 'Iniciar Juego'}
      </button>

      {showScore && (
        <div className="final-score">
          Puntuación: {score} pasos
        </div>
      )}
    </div>
  );
};

export default GamePanel;