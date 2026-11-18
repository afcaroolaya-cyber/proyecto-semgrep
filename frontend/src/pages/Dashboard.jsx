import { useState, useEffect } from "react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [seccion, setSeccion] = useState("Dashboard");

  const [totalClientes, setTotalClientes] = useState(0);
  const [totalPlanes, setTotalPlanes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem("token");

        const [respuestaClientes, respuestaPlanes] = await Promise.all([
          api.get("/clientes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          api.get("/planes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setTotalClientes(respuestaClientes.data.clientes.length);
        setTotalPlanes(respuestaPlanes.data.planes.length);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError("No fue posible cargar la información del Dashboard.");
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const opciones = [
    { nombre: "Dashboard", icono: "▦" },
    { nombre: "Clientes", icono: "♙" },
    { nombre: "Planes", icono: "🏋" },
    { nombre: "Entrenadores", icono: "♧" },
    { nombre: "Configuración", icono: "⚙" },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="dashboard-brand">
          <span className="brand-icon">F</span>
          <span>
            FIT<span>ZONE</span>
          </span>
        </div>

        <p className="menu-title">MENU PRINCIPAL</p>

        <nav className="sidebar-menu">
          {opciones.map((opcion) => (
            <button
              key={opcion.nombre}
              className={
                seccion === opcion.nombre ? "menu-item active" : "menu-item"
              }
              onClick={() => setSeccion(opcion.nombre)}
            >
              <span>{opcion.icono}</span>
              {opcion.nombre}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={cerrarSesion}>
          ↪ Cerrar sesión
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{seccion}</h1>
            <p>Bienvenido al sistema de gestión FitZone.</p>
          </div>

          <div className="user-profile">
            <div className="user-avatar">F</div>
            <div>
              <strong>{usuario.nombre || "Administrador"}</strong>
              <span>{usuario.rol || "admin"}</span>
            </div>
          </div>
        </header>

        <section className="welcome-banner">
          <div>
            <span>FITZONE ADMINISTRATION</span>
            <h2>¡Hola, {usuario.nombre || "Administrador"}!</h2>
            <p>
              Gestiona tu gimnasio y lleva el control de tus clientes y planes.
            </p>
          </div>
          <div className="banner-icon">🏋️</div>
        </section>

        {error && <p className="error-message">{error}</p>}
        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon">♙</div>
            <span>Total de clientes</span>
            <h3>{cargando ? "..." : totalClientes}</h3>
            <small>Clientes registrados</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon">🏋️</div>
            <span>Planes disponibles</span>
            <h3>{cargando ? "..." : totalPlanes}</h3>
            <small>Planes registrados</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon">♧</div>
            <span>Entrenadores</span>
            <h3>0</h3>
            <small>Módulo pendiente de desarrollo</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon">✓</div>
            <span>Estado del sistema</span>
            <h3 className="status-online">Activo</h3>
            <small>FitZone está funcionando</small>
          </article>
        </section>

        <section className="dashboard-bottom">
          <h2>Accesos rápidos</h2>

          <div className="quick-access">
            <button onClick={() => setSeccion("Clientes")}>
              <span>♙</span>
              <strong>Gestionar clientes</strong>
              <small>Consultar y administrar clientes</small>
            </button>

            <button onClick={() => setSeccion("Planes")}>
              <span>🏋️</span>
              <strong>Gestionar planes</strong>
              <small>Consultar planes del gimnasio</small>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
