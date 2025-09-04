import { useState, useEffect } from 'react';
import { apiRequest } from '../../api';

const ScoresPanel = () => {
  const [topScores, setTopScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const result = await apiRequest('/leaderboard');
        
        if (result.leaderboard.length === 0) {
          console.log("No hay puntuaciones registradas");
          setTopScores([]);
        } else {
          console.log("Puntuaciones cargadas:", result.leaderboard);
          setTopScores(result.leaderboard);
        }
        
      } catch (error) {
        console.error('Error al cargar leaderboard:', error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="scores-panel">
        <h2 className="scores-title">Mejores Puntuaciones</h2>
        <p>Cargando puntuaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scores-panel">
        <h2 className="scores-title">Mejores Puntuaciones</h2>
        <p>Error al cargar las puntuaciones</p>
      </div>
    );
  }

  if (topScores.length === 0) {
    return (
      <div className="scores-panel">
        <h2 className="scores-title">Mejores Puntuaciones</h2>
        <p>No hay puntuaciones registradas aún</p>
      </div>
    );
  }

  return (
    <div className="scores-panel">
      <h2 className="scores-title">Mejores Puntuaciones</h2>
      
      <ol className="scores-list">
        {topScores.map((score, index) => (
          <li key={index}>
            {index + 1}. {score.username} - {score.score} pts
          </li>
        ))}
      </ol>
      
      <p className="scores-note">
        Menos pasos = mejor puntuación
      </p>
    </div>
  );
};

export default ScoresPanel;