import React, { useState, useEffect } from 'react';
const PacientePanel = () => {
const [triageData, setTriageData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [patientInfo, setPatientInfo] = useState(null);
const [countdown, setCountdown] = useState(0);
const [isMeasuring, setIsMeasuring] = useState(false);
const [progreso, setProgreso] = useState(0);
const [esMobil, setEsMobil] = useState(window.innerWidth < 768);
const dni = localStorage.getItem('dniUsuario');
  useEffect(() => {
    const handleResize = () => setEsMobil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPatientInfo = async () => {
    try {
      const response = await fetch(
        `https://backend-46yr.onrender.com/api/paciente/dni/${dni}`
      );
      if (!response.ok) {
        throw new Error(`Error al obtener paciente: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
      setPatientInfo(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  };

  const sendTriageData = async (data) => {
    try {
      if (!data.id_paciente || !data.dni_paciente) {
        console.error('Datos incompletos. Cancelando envío.');
        return;
      }
      const response = await fetch(
        'https://vitalsmedic-production.up.railway.app/api/triaje',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) {
        throw new Error(`Error al guardar: ${response.status}`);
      }
      const result = await response.json();
      console.log('Datos guardados:', result);
    } catch (err) {
      console.error('Error enviando datos:', err);
    }
  };

  const fetchTriageData = async () => {
    if (!dni) {
      setError('DNI no encontrado');
      return;
    }
    if (loading || isMeasuring) {
      return;
    }

    setIsMeasuring(true);
    setLoading(true);
    setError(null);
    setCountdown(3);
    setProgreso(0);
    const interval = setInterval(() => {
    setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    let valor = 0;
    const progressInterval = setInterval(() => {
      valor += 10;
      setProgreso(valor);
      if (valor >= 100) {
        clearInterval(progressInterval);
      }
    }, 300);
    setTimeout(async () => {
      try {
        const response = await fetch('http://172.20.10.9/datos');
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }

        const data = await response.json();
        if (data.triage === 'ESPERANDO') {
          setError(
            'Por favor coloque correctamente el dedo y vuelva a intentar'
          );
          setTriageData(null);
          return;
        }
        const patient = patientInfo || await fetchPatientInfo();
        if (!patient || !patient.id_paciente) {
          throw new Error(
            'No se pudo obtener información del paciente'
          );
        }
        const enrichedData = {
          ...data,
          id_paciente: patient.id_paciente,
          dni_paciente: patient.dni,
          timestamp: new Date().toISOString()
        };
        setTriageData(enrichedData);
        await sendTriageData(enrichedData);

      } catch (err) {

        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
        setIsMeasuring(false);
      }
    }, 3000);
  };
  useEffect(() => {
    if (!dni) {
      setError('DNI no encontrado');
      return;
    }
    fetchPatientInfo();
  }, [dni]);
  const radio = 54;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (progreso / 100) * circunferencia;
  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <div style={estilos.headerIzq}>
          <span style={{ fontSize: '24px' }}>⚕️</span>
          <span style={estilos.logoTexto}>VitalScan</span>
        </div>
      </div>
      <div
        style={{
          ...estilos.cuerpo,
          flexDirection: esMobil ? 'column' : 'row'
        }}
      >
        <div
          style={{
            ...estilos.panelIzquierdo,
            padding: esMobil ? '28px 20px' : '48px 44px',
          }}
        >
          <div style={estilos.panelIzqInner}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              🫳
            </div>
            <h2 style={estilos.panelTitulo}>
              Mida sus signos vitales
            </h2>
            <p style={estilos.panelDesc}>
              Coloque su dedo en el sensor y espere unos segundos.
            </p>
            <button
              onClick={fetchTriageData}
              disabled={loading || isMeasuring}
              style={{
                ...estilos.boton,
                opacity: loading || isMeasuring ? 0.7 : 1
              }}
            >
              {
                isMeasuring
                  ? `Midiendo... ${countdown}s`
                  : 'Iniciar Medición'
              }
            </button>
          </div>
        </div>
        <div style={estilos.panelDerecho}>
          <div style={estilos.circuloContenedor}>
            <svg
              width="140"
              height="140"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="70"
                cy="70"
                r={radio}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              <circle
                cx="70"
                cy="70"
                r={radio}
                fill="none"
                stroke={
                  triageData?.triage?.toLowerCase() === 'rojo'
                    ? '#dc2626'
                    : triageData?.triage?.toLowerCase() === 'amarillo'
                      ? '#d97706'
                      : '#1a6b8a'
                }
                strokeWidth="10"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div style={estilos.circuloTexto}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#1a6b8a',
                  textAlign: 'center',
                  width: '120px',
                  display: 'block'
                }}
              >
                {
                  loading || isMeasuring
                    ? 'Midiendo...'
                    : triageData
                      ? `Triage ${triageData.triage}`
                      : 'Esperando medición'
                }

              </span>
            </div>
          </div>
          {error && (
            <div style={estilos.error}>
              {error}
            </div>
          )}
          <div
            style={{
              ...estilos.tarjetasFila,
              flexDirection: esMobil ? 'column' : 'row'
            }}
          >
            <div
              style={{
                ...estilos.tarjeta,
                background: '#fffbeb',
                border: '1.5px solid #fde68a'
              }}
            >
              <span style={estilos.icono}>🌡️</span>
              <div style={estilos.valorContainer}>
                <span
                  style={{
                    ...estilos.valor,
                    color: '#d97706'
                  }}
                >
                  {triageData?.temperatura ?? '--'}
                </span>
                <span
                  style={{
                    ...estilos.unidad,
                    color: '#d97706'
                  }}
                >
                  °C
                </span>
              </div>
              <p style={estilos.label}>
                Temperatura corporal
              </p>
            </div>
            <div
              style={{
                ...estilos.tarjeta,
                background: '#fef2f2',
                border: '1.5px solid #fca5a5'
              }}
            >
              <span style={estilos.icono}>❤️</span>
              <div style={estilos.valorContainer}>
                <span
                  style={{
                    ...estilos.valor,
                    color: '#dc2626'
                  }}
                >
                  {triageData?.pulso ?? '--'}
                </span>
                <span
                  style={{
                    ...estilos.unidad,
                    color: '#dc2626'
                  }}
                >
                  bpm
                </span>
              </div>
              <p style={estilos.label}>
                Pulso
              </p>
            </div>
            <div
              style={{
                ...estilos.tarjeta,
                background: '#f0f9ff',
                border: '1.5px solid #7dd3fc'
              }}
            >
              <span style={estilos.icono}>💧</span>
              <div style={estilos.valorContainer}>
                <span
                  style={{
                    ...estilos.valor,
                    color: '#1a6b8a'
                  }}
                >
                  {triageData?.spo2 ?? '--'}
                </span>
                <span
                  style={{
                    ...estilos.unidad,
                    color: '#1a6b8a'
                  }}
                >
                  %
                </span>
              </div>
              <p style={estilos.label}>
                Oxigenación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const estilos = {
  pagina: {
    minHeight: '100vh',
    background: '#f0f4f8',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  cuerpo: {
    display: 'flex',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f, #1a6b8a)',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
  },
  headerIzq: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoTexto: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
  },

  panelIzquierdo: {
    width: '380px',
    background: 'linear-gradient(145deg, #1e3a5f, #1a6b8a)',
    color: '#fff',
    minHeight: 'calc(100vh - 56px)',
  },

  panelIzqInner: {
    width: '100%',
  },

  panelTitulo: {
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '10px',
  },

  panelDesc: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.6,
    marginBottom: '20px',
  },

  boton: {
    background: '#fff',
    color: '#1a6b8a',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
  },

  panelDerecho: {
    flex: 1,
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '28px',
    padding: '40px',
  },

  circuloContenedor: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circuloTexto: {
    position: 'absolute',
  },

  tarjetasFila: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '520px',
  },

  tarjeta: {
    flex: 1,
    borderRadius: '16px',
    padding: '20px 14px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },

  icono: {
    fontSize: '28px',
    marginBottom: '10px',
    display: 'block',
  },

  valorContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '3px',
    marginBottom: '6px',
  },

  valor: {
    fontSize: '32px',
    fontWeight: '900',
    lineHeight: 1,
  },

  unidad: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '4px',
  },

  label: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    fontWeight: '600',
  },

  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '520px',
    textAlign: 'center',
  }

};

export default PacientePanel;
