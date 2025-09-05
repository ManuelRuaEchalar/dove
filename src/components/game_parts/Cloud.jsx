const Cloud = ({ size = 1, x = 0, y = 0, opacity = 0.8 }) => {
  const cloudStyle = {
    transform: `scale(${size})`,
    left: `${x}px`,
    top: `${y}px`,
    opacity: opacity,
    position: 'absolute',
    zIndex: 1, // Asegura que esté detrás de la paloma
  };

  return (
    <div className="cloud" style={cloudStyle}></div>
  );
};

export default Cloud;