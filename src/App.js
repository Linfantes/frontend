import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import Registro from './components/Registro';
import InicioSesion from './components/Login';
import Admision from './components/Admision';
import Dashboard from './components/Dashboard';
import Paciente from './components/Paciente';
import SignosVitales from './components/SignosVitales';

const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const rol = localStorage.getItem('rol');
  
  // Si no hay sesión, al login
  if (!rol) {
    return <Navigate to="/" replace />;
  }
  
  if (!rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const rol = localStorage.getItem('rol');

  // Si ya tiene un rol, lo mandamos a su panel automáticamente
  if (rol === 'Admin') return <Navigate to="/registro" replace />;
  if (rol === 'Doctor') return <Navigate to="/dashboard" replace />;
  if (rol === 'Admision') return <Navigate to="/admision" replace />;
  if (rol === 'Paciente') return <Navigate to="/paciente" replace />;

  // Si no hay sesión, le mostramos el Login (children)
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública (El Login) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <InicioSesion />
            </PublicRoute>
          }
        />

        {/* Rutas Privadas */}
        <Route
          path="/paciente"
          element={
            <ProtectedRoute rolesPermitidos={['Paciente']}>
              <Paciente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registro"
          element={
            <ProtectedRoute rolesPermitidos={['Admin']}>
              <Registro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admision"
          element={
            <ProtectedRoute rolesPermitidos={['Admision']}>
              <Admision />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute rolesPermitidos={['Doctor']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SignosVitales"
          element={
            <ProtectedRoute rolesPermitidos={['Doctor']}>
              <SignosVitales />
            </ProtectedRoute>
          }
        />

        {/* Ruta comodín (Si ponen una URL que no existe, van al login o a su panel) */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
