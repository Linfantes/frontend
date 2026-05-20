import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importado para redirigir al salir

const estadoConfig = {
  'Normal': { color: '#166534', bg: '#f0fdf4', borde: '#86efac', icono: '✅' },
  'Requiere atención': { color: '#92400e', bg: '#fffbeb', borde: '#fcd34d', icono: '⚠️' },
  'Crítico': { color: '#991b1b', bg: '#fef2f2', borde: '#fca5a5', icono: '🚨' },
  'Pendiente': { color: '#475569', bg: '#f1f5f9', borde: '#cbd5e1', icono: '⏳' }, // Nuevo estado para pacientes sin triaje
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [esMobil, setEsMobil] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Función para obtener los pacientes del servidor
    const obtenerPacientes = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const respuesta = await fetch('https://backend-46yr.onrender.com/api/pacientes/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
          setPacientes(resultado.data);
          setError('');
        } else {
          setError(resultado.error || 'Error al cargar el listado de pacientes');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    };

    // Primera carga al montar el componente
    obtenerPacientes();

    // Actualización automática en tiempo real cada 10 segundos
    const intervalo = setInterval(obtenerPacientes, 10000);

    // Manejar el cambio de tamaño de la ventana
    const handleResize = () => setEsMobil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Limpieza de eventos e intervalos al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalo);
    };
  }, []);

  // Función para cerrar sesión de forma segura
  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  // Cálculo dinámico del resumen basado en los datos devueltos por la base de datos
  const resumen = {
    Normal: pacientes.filter(p => p.estado === 'Normal').length,
    'Requiere atención': pacientes.filter(p => p.estado === 'Requiere atención').length,
    Crítico: pacientes.filter(p => p.estado === 'Crítico').length,
    Pendiente: pacientes.filter(p => p.estado === 'Pendiente').length,
  };

  return (
    <div style={estilos.pagina}>
      {/* Header del Dashboard */}
      <div style={estilos.header}>
        <div style={estilos.headerIzq}>
          <span style={{ fontSize: '24px' }}>⚕️</span>
          <span style={estilos.logoTexto}>VitalScan</span>
        </div>
        
        <div style={estilos.headerDer}>
          {/* Botón para Cerrar Sesión */}
          <button 
            onClick={cerrarSesion}
            style={{
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          >
            🚪 Salir
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ ...estilos.cuerpo, padding: esMobil ? '20px 16px' : '32px 40px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ ...estilos.titulo, fontSize: esMobil ? '22px' : '26px' }}>Panel de Monitoreo</h2>
          <p style={estilos.subtitulo}>Monitoreo de pacientes en tiempo real</p>
        </div>

        {/* Mensaje de error o de carga en caso sea necesario */}
        {error && (
          <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#64748b', fontWeight: '600' }}>
            Cargando información de pacientes...
          </div>
        ) : (
          <>
            {/* Fila de Tarjetas de Resumen */}
            <div style={{ ...estilos.resumenFila, flexDirection: esMobil ? 'column' : 'row' }}>
              {Object.entries(resumen).map(([estado, count]) => {
                const cfg = estadoConfig[estado];
                return (
                  <div key={estado} style={{
                    ...estilos.tarjetaResumen,
                    background: cfg.bg,
                    borderLeft: `4px solid ${cfg.borde}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ ...estilos.estadoCount, color: cfg.color }}>{count}</span>
                      <span style={{ fontSize: '24px' }}>{cfg.icono}</span>
                    </div>
                    <span style={{ ...estilos.estadoLabel, color: cfg.color }}>{estado}</span>
                  </div>
                );
              })}
              
              <div style={{ ...estilos.tarjetaResumen, background: 'linear-gradient(135deg, #1e3a5f, #1a6b8a)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...estilos.estadoCount, color: '#fff' }}>{pacientes.length}</span>
                  <span style={{ fontSize: '24px' }}>🏥</span>
                </div>
                <span style={{ ...estilos.estadoLabel, color: 'rgba(255,255,255,0.85)' }}>Total Pacientes</span>
              </div>
            </div>

            {/* Renderizado Condicional: Versión Móvil vs Versión Escritorio */}
            {esMobil ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pacientes.map((p, i) => {
                  const cfg = estadoConfig[p.estado];
                  return (
                    <div key={i} style={{ ...estilos.cardMobil, borderLeft: `4px solid ${cfg.borde}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={estilos.avatar}>{p.nombreCompleto ? p.nombreCompleto[0] : 'P'}</div>
                          <span style={{ fontWeight: '700', color: '#0f2944', fontSize: '15px' }}>{p.nombreCompleto}</span>
                        </div>
                        <span style={{ ...estilos.chip, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.borde}` }}>
                          {p.estado}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={estilos.cardStat}>
                          <span style={estilos.cardStatLabel}>🌡️ Temp</span>
                          <span style={estilos.cardStatValor}>{p.signosVitales?.temperatura || '—'}</span>
                        </div>
                        <div style={estilos.cardStat}>
                          <span style={estilos.cardStatLabel}>❤️ Pulso</span>
                          <span style={estilos.cardStatValor}>{p.signosVitales?.pulso || '—'}</span>
                        </div>
                        <div style={estilos.cardStat}>
                          <span style={estilos.cardStatLabel}>💧 O2</span>
                          <span style={estilos.cardStatValor}>{p.signosVitales?.saturacion_oxigeno || '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vista en Tabla para PC */
              <div style={estilos.tablaContenedor}>
                <table style={estilos.tabla}>
                  <thead>
                    <tr style={estilos.thead}>
                      <th style={estilos.th}>Paciente</th>
                      <th style={estilos.th}>DNI</th>
                      <th style={estilos.th}>Temperatura</th>
                      <th style={estilos.th}>Ritmo Cardíaco</th>
                      <th style={estilos.th}>Oxigenación</th>
                      <th style={estilos.th}>Estado / Triaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          No hay pacientes registrados en el sistema actualmente.
                        </td>
                      </tr>
                    ) : (
                      pacientes.map((p, i) => {
                        const cfg = estadoConfig[p.estado];
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                            <td style={estilos.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={estilos.avatar}>{p.nombreCompleto ? p.nombreCompleto[0] : 'P'}</div>
                                <span style={{ fontWeight: '600', color: '#0f2944' }}>{p.nombreCompleto}</span>
                              </div>
                            </td>
                            <td style={estilos.td}>{p.dni}</td>
                            <td style={estilos.td}>{p.signosVitales?.temperatura || '—'}</td>
                            <td style={estilos.td}>{p.signosVitales?.pulso || '—'}</td>
                            <td style={estilos.td}>{p.signosVitales?.saturacion_oxigeno || '—'}</td>
                            <td style={estilos.td}>
                              <span style={{ ...estilos.chip, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.borde}` }}>
                                {cfg.icono} {p.estado} {p.signosVitales?.nivelTriaje ? `(${p.signosVitales.nivelTriaje})` : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Mantenemos tus estilos estéticos originales intactos
const estilos = {
  pagina: { minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Georgia', 'Times New Roman', serif" },
  cuerpo: { maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  header: { background: 'linear-gradient(135deg, #1e3a5f, #1a6b8a)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerIzq: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerDer: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoTexto: { fontSize: '18px', fontWeight: '800', color: '#fff' },
  titulo: { fontWeight: '800', color: '#0f2944', margin: '0 0 4px', letterSpacing: '-0.5px' },
  subtitulo: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  resumenFila: { display: 'flex', gap: '16px', marginBottom: '28px' },
  tarjetaResumen: { flex: 1, padding: '20px 24px', borderRadius: '14px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  estadoCount: { fontSize: '32px', fontWeight: '900', display: 'block' },
  estadoLabel: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px', marginTop: '4px', display: 'block' },
  tablaContenedor: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'linear-gradient(135deg, #1e3a5f, #1a6b8a)' },
  th: { padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.6px', textTransform: 'uppercase' },
  td: { padding: '16px 18px', fontSize: '14px', color: '#334155' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justify_content: 'center', flexShrink: 0 },
  chip: { display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  cardMobil: { background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardStat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cardStatLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '600' },
  cardStatValor: { fontSize: '14px', color: '#0f2944', fontWeight: '700' },
};

export default Dashboard;
