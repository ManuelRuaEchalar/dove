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
          setTopScores([]);
        } else {
          setTopScores(result.leaderboard);
        }
      } catch (error) {
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
        <h2 className="scores-title">🏆 Mejores Puntuaciones</h2>
        <p className="scores-note">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scores-panel">
        <h2 className="scores-title">🏆 Mejores Puntuaciones</h2>
        <p className="scores-note">Error al cargar</p>
      </div>
    );
  }

  if (topScores.length === 0) {
    return (
      <div className="scores-panel">
        <h2 className="scores-title">🏆 Mejores Puntuaciones</h2>
        <p className="scores-note">No hay registros aún</p>
      </div>
    );
  }

  return (
    <div className="scores-panel">
      <h2 className="scores-title">🏆 THE TOP</h2>

      <div className="podium">
        {topScores.slice(0, 3).map((score, index) => (
          <div
            key={index}
            className={`podium-place place-${index + 1}`}
          >
            <span className="position">
              {index === 0 ? "👑" : index + 1}
            </span>
            <span className="username">{score.username}</span>
            <span className="points">{score.score} pts</span>
          </div>
        ))}
      </div>

      <p className="scores-note">⚡ More steps = Higher score</p>
    </div>
  );
};

export default ScoresPanel;
