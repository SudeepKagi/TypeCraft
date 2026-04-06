// Centralized configuration for API endpoints
// In development, these will default to localhost.
// In production (Vercel/Render), these will be set via Environment Variables.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
