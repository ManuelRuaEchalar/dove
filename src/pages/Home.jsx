import { useState } from 'react';
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

  const gameId = location.state?.gameId;
  const token = location.state?.token;
  const showForm = gameId && token;

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
          <IntroPanel />
          <GamePanel theme={mode} gameStyle={gameStyle} />
          <ScoresPanel />
          
          {showForm && (
            <Form gameId={gameId} token={token} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
