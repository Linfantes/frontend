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

const ProtectedRoute = ({
  children,
  rolesPermitidos
}) => {
  const rol =
    localStorage.getItem('rol');
  if (!rol) {
    return <Navigate to="/" replace />;
  }
  if (!rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<InicioSesion />}
        />
        <Route
          path="/paciente"
          element={<Paciente />}
        />
        <Route
          path="/registro"
          element={
            <ProtectedRoute
              rolesPermitidos={['Admin']}
            >
              <Registro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admision"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                'Admision'
              ]}
            >
              <Admision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                'Doctor'
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SignosVitales"
          element={
            <ProtectedRoute
              rolesPermitidos={[
                'Doctor'
              ]}
            >
              <SignosVitales />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;