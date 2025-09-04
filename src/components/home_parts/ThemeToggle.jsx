const ThemeToggle = ({ mode, gameStyle, onChangeMode, onChangeGameStyle }) => {
  return (
    <div className="theme-toggle">
      {/* Modo global */}
      <div className="toggle-group">
        <button
          className={mode === "dark" ? "active" : ""}
          onClick={() => onChangeMode("dark")}
        >
          Dark
        </button>
        <button
          className={mode === "light" ? "active" : ""}
          onClick={() => onChangeMode("light")}
        >
          Light
        </button>
      </div>

      {/* Estilo de juego */}
      <div className="toggle-group">
        <button
          className={gameStyle === "abstract" ? "active" : ""}
          onClick={() => onChangeGameStyle("abstract")}
        >
          Abstract
        </button>
        <button
          className={gameStyle === "dove" ? "active" : ""}
          onClick={() => onChangeGameStyle("dove")}
        >
          Dove
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
