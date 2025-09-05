import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ThemeToggle from '../components/home_parts/ThemeToggle';
import Particles from '../components/home_parts/Particles';
import IntroPanel from '../components/home_parts/IntroPanel';
import GamePanel from '../components/home_parts/GamePanel';
import ScoresPanel from '../components/home_parts/ScoresPanel';
import Form from '../components/home_parts/Form';

const Home = () => {
  const [mode, setMode] = useState("dark");        // dark / light
  const [gameStyle, setGameStyle] = useState(null); // null / abstract / dove
  const location = useLocation();

  const [formData, setFormData] = useState(null);
  const scoresPanelRef = useRef(null);

  useEffect(() => {
    if (location.state?.gameId && location.state?.token) {
      // Guardamos temporalmente los datos para mostrar el form
      setFormData({
        gameId: location.state.gameId,
        token: location.state.token
      });

      // Limpiamos location.state para que no se muestre de nuevo en recargas
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleScoreSubmitted = () => {
    // Llamar al método de actualización del ScoresPanel
    if (scoresPanelRef.current && scoresPanelRef.current.refreshScores) {
      scoresPanelRef.current.refreshScores();
    }
  };

  return (
    <div className={`home-container ${mode}`}>
      <ThemeToggle
        mode={mode}
        gameStyle={gameStyle}
        onChangeMode={setMode}
        onChangeGameStyle={setGameStyle}
      />
      <Particles />

      <div className="main-content">
        <div className="content-grid">
          <ScoresPanel ref={scoresPanelRef} />
          <GamePanel theme={mode} gameStyle={gameStyle} />
          <IntroPanel />

          {formData && (
            <Form
              gameId={formData.gameId}
              token={formData.token}
              onClose={() => setFormData(null)}
              onScoreSubmitted={handleScoreSubmitted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;