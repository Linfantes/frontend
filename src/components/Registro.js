import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeartIconComponent = ({ dim = 20, tint = '#fff' }) => (
  <svg
    width={dim}
    height={dim}
    viewBox="0 0 24 24"
    fill="none"
    stroke={tint}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const TagLateral = ({
  yPos,
  xPos,
  anim,
  icono,
  titulo,
  valor,
  estiloColor
}) => (
  <div
    className={`med-tag ${anim}`}
    style={{
      position: 'absolute',
      left: xPos || '40px',
      bottom: yPos || '320px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 18px',
      borderRadius: 14,
      background: estiloColor?.bk || 'rgba(255,255,255,0.10)',
      backdropFilter: 'blur(8px)',
      border: `1px solid ${
        estiloColor?.brd || 'rgba(255,255,255,0.18)'
      }`,
      zIndex: 20
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icono}
    </div>

    <div>
      <div
        style={{
          fontSize: 10,
          opacity: 0.8,
          textTransform: 'uppercase',
          fontWeight: 700
        }}
      >
        {titulo}
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
        {valor}
      </div>
    </div>
  </div>
);

const ModuloInscripcion = () => {
  const navigate = useNavigate();

  const [tipoPuesto, setTipoPuesto] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false); 

  const [campos, setCampos] = useState({
    nomUser: '',
    apeUser: '',
    dniUser: '',
    claveUser: '',
    especialidadMed: ''
  });

  const [esViewportAncho, setEsViewportAncho] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth < 768
      : false
  );

  useEffect(() => {
    const resizeControl = () =>
      setEsViewportAncho(window.innerWidth < 768);

    window.addEventListener('resize', resizeControl);

    return () =>
      window.removeEventListener('resize', resizeControl);
  }, []);

  const areas = [
    'Medicina General',
    'Cardiología',
    'Pediatría',
    'Neurología',
    'Traumatología',
    'Ginecología',
    'Cirugía General',
    'Odontología',
    'Medicina Interna',
    'Otro'
  ];

  const tiposRol = [
    { id: 'Doctor', tx: 'Doctor', em: '👨‍⚕️' },
    { id: 'Admision', tx: 'Admisión', em: '🗂️' },
    { id: 'Admin', tx: 'Admin', em: '⚙️' }
  ];

  const coords = {
    pc: { a: '400px', b: '320px', c: '240px' },
    mb: { a: '22vh', b: '16vh', c: '10vh' }
  };

  const manejarInput = (e) => {
    const { name, value } = e.target;

    if (name === 'dniUser') {
      const soloNumeros = value.replace(/\D/g, '');
      setCampos({ ...campos, [name]: soloNumeros });
      return;
    }

    if (name === 'nomUser' || name === 'apeUser') {
      const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      setCampos({ ...campos, [name]: soloLetras });
      return;
    }

    setCampos({ ...campos, [name]: value });
  };

  const ejecutarRegistro = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (campos.dniUser.length !== 8) {
      alert('El DNI debe tener exactamente 8 números');
      return;
    }

    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

    if (!regexPassword.test(campos.claveUser)) {
      alert(
        'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://backend-46yr.onrender.com/api/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: campos.nomUser,
            apellido: campos.apeUser,
            dni: campos.dniUser,
            password: campos.claveUser,
            rol: tipoPuesto,
            especialidad: campos.especialidadMed
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Usuario registrado correctamente');
        setCampos({
          nomUser: '',
          apeUser: '',
          dniUser: '',
          claveUser: '',
          especialidadMed: ''
        });
      } else {
        alert('Error al registrar');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  const calcY = (key) =>
    esViewportAncho ? coords.mb[key] : coords.pc[key];

  return (
    <div style={mEstilos.wrapPpal}>
      <style>{`
        @keyframes floatEffect1 {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-10px)}
        }
        @keyframes floatEffect2 {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-14px)}
        }
        @keyframes floatEffect3 {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
        .m1{animation:floatEffect1 4s ease-in-out infinite}
        .m2{animation:floatEffect2 5s ease-in-out infinite}
        .m3{animation:floatEffect3 3.5s ease-in-out infinite}

        .tit-dinamico {
          font-weight: 900;
          margin: 0 0 6px;
          font-size: clamp(24px, 5vw, 38px);
          line-height: 1.05;
          color: #0f2944;
          font-family: inherit;
        }

        /* --- CORRECCIÓN: Eliminado width fijo de PC --- */
        .panel-form {
          /* width: 520px; <-- Eliminado */
        }

        .inner-form {
          width: 100%;
          /* --- CORRECCIÓN: Aumentado max-width de 380px a 500px --- */
          max-width: 500px; 
          padding: 18px;
          box-sizing: border-box;
          /* --- CORRECCIÓN: Centrado horizontal automático --- */
          margin: 0 auto; 
        }

        @media (max-width: 767px) {
          .tit-dinamico {
            font-size: 26px !important;
          }
          .panel-form {
            width: 100% !important;
            height: auto !important;
            padding-top: 15px !important;
          }
          .inner-form {
            max-width: 95% !important;
            padding: 12px !important;
          }
          .med-tag {
            padding: 10px 14px !important;
            border-radius: 12px !important;
          }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {!esViewportAncho && (
        <div style={mEstilos.ladoAzul}>
          <div style={mEstilos.capaContent}>
            <div style={mEstilos.brandHdr}>
              <span style={{ fontSize: 28 }}>⚕️</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>VitalScan</span>
            </div>
            <div style={{ marginTop: '10px' }}>
              <h2 className="tit-dinamico" style={{ color: '#fff' }}>Sistema de Triaje Inteligente</h2>
              <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '360px' }}>Gestión avanzada de pacientes en el proceso de triaje.</p>
            </div>
          </div>
          <TagLateral anim="m1" yPos="140px" xPos="40px" icono={<HeartIconComponent />} titulo="Pulso promedio" valor="78 bpm" estiloColor={{ bk: 'rgba(255,255,255,0.12)', brd: 'rgba(255,255,255,0.2)' }} />
          <TagLateral anim="m2" yPos={calcY('b')} xPos="70px" icono={<span style={{ fontSize: 18 }}>🌡️</span>} titulo="Temperatura" valor="36.5 °C" estiloColor={{ bk: 'rgba(245,158,11,0.2)', brd: 'rgba(245,158,11,0.4)' }} />
          <TagLateral anim="m3" yPos={calcY('c')} xPos="40px" icono={<span style={{ fontSize: 18 }}>💧</span>} titulo="Oxigenación" valor="98%" estiloColor={{ bk: 'rgba(255,255,255,0.12)', brd: 'rgba(255,255,255,0.2)' }} />
          <div style={mEstilos.shapeOverlay} />
        </div>
      )}

      <div className="panel-form" style={mEstilos.ladoBlanco}>
        <div className="inner-form" style={mEstilos.boxForm}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: '10px' }}>
            <div>
              <h2 className="tit-dinamico">Crear cuenta</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Registrar usuarios</p>
            </div>
            
            <button
              type="button"
              onClick={cerrarSesion}
              style={{
                padding: '6px 12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap' // Evita que el texto se rompa en dos líneas
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
            >
              <span>🚪</span> Salir
            </button>
          </div>

          <form onSubmit={ejecutarRegistro} style={mEstilos.stackInputs}>
            <div style={mEstilos.grpInput}>
              <label style={mEstilos.lblTxt}>Selecciona el rol</label>
              <div style={mEstilos.filaRoles}>
                {tiposRol.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTipoPuesto(r.id)}
                    style={{
                      ...mEstilos.btRol,
                      ...(tipoPuesto === r.id ? mEstilos.btRolOn : {})
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{r.em}</span>
                    <span style={{ fontSize: 11, fontWeight: '700' }}>{r.tx}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={mEstilos.lblTxt}>Nombre</label>
                <input name="nomUser" style={mEstilos.inputBox} placeholder="Nombre" value={campos.nomUser} onChange={manejarInput} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={mEstilos.lblTxt}>Apellido</label>
                <input name="apeUser" style={mEstilos.inputBox} placeholder="Apellido" value={campos.apeUser} onChange={manejarInput} required />
              </div>
            </div>

            {tipoPuesto === 'Doctor' && (
              <div style={mEstilos.grpInput}>
                <label style={mEstilos.lblTxt}>Especialidad</label>
                <select name="especialidadMed" style={mEstilos.inputBox} value={campos.especialidadMed} onChange={manejarInput} required>
                  <option value="">Selección...</option>
                  {areas.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={mEstilos.grpInput}>
              <label style={mEstilos.lblTxt}>DNI</label>
              <input name="dniUser" type="text" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} minLength={8} style={mEstilos.inputBox} placeholder="DNI" value={campos.dniUser} onChange={manejarInput} required />
            </div>

            <div style={mEstilos.grpInput}>
              <label style={mEstilos.lblTxt}>Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  name="claveUser"
                  type={mostrarClave ? "text" : "password"}
                  style={{ ...mEstilos.inputBox, width: '100%', paddingRight: '40px' }}
                  placeholder="Mínimo 8 caracteres"
                  value={campos.claveUser}
                  onChange={manejarInput}
                  required
                  minLength={8}
                />
                
                <button
                  type="button"
                  onClick={() => setMostrarClave(!mostrarClave)}
                  style={{
                    position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '16px', color: '#64748b', padding: 0, outline: 'none'
                  }}
                >
                  {mostrarClave ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...mEstilos.btnSubmit,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Completar Registro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const mEstilos = {
  wrapPpal: { display: 'flex', minHeight: '100vh', fontFamily: 'serif', backgroundColor: '#f8fafc', overflow: 'hidden' },
  ladoAzul: { flex: 1, background: 'linear-gradient(145deg, #1e3a5f 0%, #1a5276 40%, #1a6b8a 100%)', position: 'sticky', top: 0, height: '100vh', padding: '40px', color: 'white', display: 'flex', flexDirection: 'column' },
  capaContent: { zIndex: 10, display: 'flex', flexDirection: 'column' },
  brandHdr: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  /* --- CORRECCIÓN: Cambiado flex-start a center, eliminado paddingTop excesivo --- */
  ladoBlanco: { flex: 1, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' },
  boxForm: { display: 'flex', flexDirection: 'column' },
  stackInputs: { display: 'flex', flexDirection: 'column', gap: '8px' },
  grpInput: { display: 'flex', flexDirection: 'column', gap: '6px' },
  lblTxt: { fontSize: '12px', fontWeight: '700', color: '#334155' },
  inputBox: { padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
  filaRoles: { display: 'flex', gap: '8px' },
  btRol: { flex: 1, padding: '8px', border: '2px solid #e2e8f0', borderRadius: '10px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' },
  btRolOn: { borderColor: '#f59e0b', background: '#fffbeb', color: '#b45309' },
  btnSubmit: { padding: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', marginTop: '6px' },
  footLink: { textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#94a3b8' },
  shapeOverlay: { position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: '-48px', right: '-48px' }
};

export default ModuloInscripcion;
