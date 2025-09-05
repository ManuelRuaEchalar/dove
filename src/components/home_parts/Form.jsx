import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';

const Form = ({ gameId, token, onClose, onScoreSubmitted }) => {
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      console.error('El nombre no puede estar vacío');
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('/game/register-top3', 'POST', {
        gameId,
        username,
        token
      });
      setIsSubmitted(true);
      
      // Notificar al componente padre que se guardó la puntuación
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }
    } catch (error) {
      console.error('Error al registrar nombre:', error.message);
      setIsLoading(false);
    }
  };

  // Cerrar automáticamente 2 segundos después de enviar
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose]);

  return (
    <div className="form-overlay">
      <div className="form-modal">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">Nuevo récord 🎉</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="username-input"
              disabled={isLoading}
            />
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Guardar'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <h3>¡Registro exitoso!</h3>
            <p>Tu puntuación fue guardada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;