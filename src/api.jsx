export const API_BASE = 'http://localhost:3000/api';

// Función para hacer peticiones HTTP
export async function apiRequest(endpoint, method = 'GET', data = null) {
    console.log(`Haciendo petición a ${endpoint} con método ${method}`);
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        console.log('Respuesta recibida:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Error en la petición');
        }

        return result;
    } catch (error) {
        throw new Error(`Error de conexión: ${error.message}`);
    }
}
