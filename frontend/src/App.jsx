
import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './services/api';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function Login() {
  const navigate = useNavigate();

  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (mostrarRegistro) {
      setError('El registro lo conectaremos próximamente.');
      return;
    }

    try {
      setCargando(true);

      const respuesta = await api.post('/auth/login', {
        correo,
        password
      });

      const { token, usuario } = respuesta.data;

      if (usuario.rol !== 'admin') {
        setError('Tu cuenta no tiene permisos para acceder al panel administrativo.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      navigate('/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo conectar con el servidor.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-info">
        <div className="brand">
          <span className="brand-icon">F</span>
          <span>FIT<span className="brand-highlight">ZONE</span></span>
        </div>

        <div className="info-content">
          <span className="tagline">
            TU MEJOR VERSION COMIENZA AQUI
          </span>

          <h1>
            ENTRENA DURO.<br />
            <span>SUPERA TUS LIMITES.</span>
          </h1>

          <p>
            Alcanza tus objetivos, mejora tu rendimiento
            y transforma tu estilo de vida con FitZone.
          </p>
        </div>

        <div className="info-footer">
          <span>FUERZA</span>
          <span>DISCIPLINA</span>
          <span>RESULTADOS</span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-card">
          <div className="mobile-brand">
            FIT<span>ZONE</span>
          </div>

          <span className="welcome-label">
            BIENVENIDO A FITZONE
          </span>

          <h2>
            {mostrarRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h2>

          <p className="form-description">
            {mostrarRegistro
              ? 'Regístrate y comienza tu transformación.'
              : 'Ingresa tus datos para continuar.'}
          </p>

          <form onSubmit={iniciarSesion}>
            {mostrarRegistro && (
              <div className="input-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p style={{ color: '#ff6262', marginBottom: '15px' }}>
                {error}
              </p>
            )}

            {mensaje && (
              <p style={{ color: '#b5f23c', marginBottom: '15px' }}>
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={cargando}
            >
              {cargando
                ? 'VERIFICANDO...'
                : mostrarRegistro
                  ? 'CREAR CUENTA'
                  : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="form-switch">
            {mostrarRegistro
              ? '¿Ya tienes una cuenta?'
              : '¿Todavía no tienes una cuenta?'}

            <button
              type="button"
              onClick={() => {
                setMostrarRegistro(!mostrarRegistro);
                setError('');
                setMensaje('');
              }}
            >
              {mostrarRegistro ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </div>
        </div>

        <span className="copyright">
          © 2026 FITZONE. TODOS LOS DERECHOS RESERVADOS.
        </span>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
