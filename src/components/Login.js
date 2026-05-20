import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InicioSesion = () => {
  const [dni, setDni] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [pasoDni, setPasoDni] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [usuarioNoPaciente, setUsuarioNoPaciente] = useState(null);
  const navigate = useNavigate();

  // Función para manejar el cambio del DNI (limpia si el usuario pega texto)
  const manejarCambioDni = (e) => {
    const valorNumerico = e.target.value.replace(/\D/g, ''); 
    if (valorNumerico.length <= 8) {
      setDni(valorNumerico);
    }
  };

  const verificarDni = async () => {
    // Validación estricta de 8 dígitos antes de enviar al servidor
    if (dni.length !== 8) {
      setMensaje('El DNI debe tener exactamente 8 dígitos.');
      setTipoMensaje('error');
      return;
    }

    setCargando(true);
    setMensaje('');
    try {
      const respuesta = await fetch('https://vitalsmedic-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni }),
      });
      const data = await respuesta.json();
      
      if (data.success) {
        if (data.rol === 'Paciente') {
          localStorage.setItem('dniUsuario', dni);
          navigate('/paciente');
        } else {
          setUsuarioNoPaciente(data);
          setPasoDni(false);
        }
      } else {
        setMensaje(` ${data.error || 'DNI no registrado'}`);
        setTipoMensaje('error');
      }
    } catch (err) {
      setMensaje('Error del servidor');
      setTipoMensaje('error');
    }
    setCargando(false);
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    
    // Validación de la contraseña
    if (!contraseña || contraseña.trim().length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      setTipoMensaje('error');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const respuesta = await fetch('https://vitalsmedic-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password: contraseña }),
      });

      const data = await respuesta.json();

      if (data.success) {
        switch (data.rol) {
          case 'Admin':
            localStorage.setItem('rol', data.rol);
            navigate('/registro');
            break;
          case 'Doctor':
            localStorage.setItem('rol', data.rol);
            navigate('/dashboard');
            break;
          case 'Admision':
            localStorage.setItem('rol', data.rol);
            navigate('/admision');
            break;
          default:
            setMensaje('Rol desconocido');
            setTipoMensaje('error');
        }
      } else {
        setMensaje(` ${data.error || 'Credenciales incorrectas'}`);
        setTipoMensaje('error');
      }
    } catch (err) {
      setMensaje('Error del servidor');
      setTipoMensaje('error');
    }
    setCargando(false);
  };

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        <div style={estilos.encabezado}>
          <div style={estilos.icono}>⚕</div>
          <h2 style={estilos.titulo}>Bienvenido</h2>
          <p style={estilos.subtitulo}>Sistema de triaje inteligente</p>

          {mensaje && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                background: tipoMensaje === 'success' ? '#dcfce7' : '#fee2e2',
                color: tipoMensaje === 'success' ? '#166534' : '#991b1b',
                border: tipoMensaje === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
              }}
            >
              {mensaje}
            </div>
          )}
        </div>
        <form
          onSubmit={pasoDni ? (e) => { e.preventDefault(); verificarDni(); } : manejarLogin}
          style={estilos.formulario}
        >
          <div style={estilos.grupo}>
            <label style={estilos.etiqueta}>DNI</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ingresa tu DNI"
              value={dni}
              onChange={manejarCambioDni}
              maxLength={8}
              onKeyDown={(e) => {
                const teclasPermitidas = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
                // Bloquea cualquier tecla que no sea número o de control
                if (!/^[0-9]$/.test(e.key) && !teclasPermitidas.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                }
              }}
              required
              style={estilos.input}
              disabled={!pasoDni}
            />
          </div>
          {!pasoDni && (
            <div style={estilos.grupo}>
              <label style={estilos.etiqueta}>Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                style={estilos.input}
              />
            </div>
          )}

          <button type="submit" style={estilos.boton} disabled={cargando}>
            {cargando ? 'Verificando...' : pasoDni ? 'Siguiente' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const estilos = {
  pagina: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: '20px'
  },
  tarjeta: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
  },
  encabezado: {
    textAlign: 'center',
    marginBottom: '36px'
  },
  icono: {
    fontSize: '40px',
    marginBottom: '12px',
    display: 'block'
  },
  titulo: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a2e3b',
    margin: '0 0 6px',
    letterSpacing: '-0.5px'
  },
  subtitulo: {
    fontSize: '13px',
    color: '#6b8a9a',
    margin: 0,
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  etiqueta: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#344d5c',
    letterSpacing: '0.3px'
  },
  input: {
    padding: '12px 14px',
    border: '1.5px solid #d0dce4',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1a2e3b',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fbfc'
  },
  boton: {
    marginTop: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, #1a6b8a, #2c9abf)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s'
  },
};

export default InicioSesion;