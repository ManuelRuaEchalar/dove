import React, { useState } from 'react';
import { apiRequest } from '../../api';

const Form = ({ gameId, token }) => {
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
      const result = await apiRequest('/game/register-top3', 'POST', {
        gameId: gameId,
        username: username,
        token: token
      });
      
      // Si llegamos aquí, la petición fue exitosa
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al registrar nombre:', error.message);
      setIsLoading(false);
    }
  };

  // Si ya se envió, mostrar solo el mensaje de confirmación
  if (isSubmitted) {
    return (
      <div className="form-panel">
        <div className="success-message">
          <h3>¡Registro exitoso!</h3>
          <p>Tu puntuación ha sido guardada correctamente.</p>
        </div>
      </div>
    );
  }

  // Mostrar el formulario
  return (
    <div className="form-panel">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="username-input"
          disabled={isLoading}
        />
        <input type="hidden" name="gameId" value={gameId} />
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Form;