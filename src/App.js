import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, onValue, push, ref, set } from "firebase/database";
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyD2kzJwTVJfd_4vYtI8pqE0zQ1xxqiKvOo",
  authDomain: "malas-practicas.firebaseapp.com",
  databaseURL: "https://malas-practicas-default-rtdb.firebaseio.com",
  projectId: "malas-practicas",
  storageBucket: "malas-practicas.firebasestorage.app",
  messagingSenderId: "1077058440703",
  appId: "1:1077058440703:web:b56d7ef5575e5e5becabca",
  measurementId: "G-7S327PFC74"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let analytics = null;

try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log('analytics no jalo', e);
}

function App() {
  const [x, setX] = useState('login');
  const [u, setU] = useState(() => JSON.parse(localStorage.getItem('usuariosxxx') || '[]'));
  const [a, setA] = useState(() => JSON.parse(localStorage.getItem('catalogoxxx') || '[]'));
  const [b, setB] = useState(() => JSON.parse(localStorage.getItem('movimientosxxx') || '[]'));
  const [z, setZ] = useState(() => JSON.parse(localStorage.getItem('actualxxx') || 'null'));
  const [f, setF] = useState({
    usuario: '',
    clave: '',
    correo: '',
    confirmar: '',
    nombre: '',
    apellidos: ''
  });
  const [c, setC] = useState({ codigo: '', nombre: '', tipo: 'Activo' });
  const [d, setD] = useState({ fecha: '', detalle: '', cuenta: '', monto: '', tipo: 'Debe' });
  const [q, setQ] = useState({ desde: '', hasta: '', usuario: '' });
  const [m, setM] = useState('');

  // esto guarda cosas
  useEffect(() => {
    localStorage.setItem('usuariosxxx', JSON.stringify(u));
    localStorage.setItem('catalogoxxx', JSON.stringify(a));
    localStorage.setItem('movimientosxxx', JSON.stringify(b));
    localStorage.setItem('actualxxx', JSON.stringify(z));
  }, [u, a, b, z]);

  // lee firebase aunque tambien se usa localStorage y eso esta mal
  useEffect(() => {
    const s1 = onValue(ref(db, 'usuarios_demo'), (snap) => {
      const v = snap.val();
      if (v) {
        setU(Object.keys(v).map((k) => ({ ...v[k], firebaseId: k })));
      }
    });
    const s2 = onValue(ref(db, 'catalogo_demo'), (snap) => {
      const v = snap.val();
      if (v) {
        setA(Object.keys(v).map((k) => ({ ...v[k], firebaseId: k })));
      }
    });
    const s3 = onValue(ref(db, 'transacciones_demo'), (snap) => {
      const v = snap.val();
      if (v) {
        setB(Object.keys(v).map((k) => ({ ...v[k], firebaseId: k })));
      }
    });

    return () => {
      s1();
      s2();
      s3();
    };
  }, []);

  // esto hace algo
  const h = (e) => {
    const { name, value } = e.target;
    setF({ ...f, [name]: value });
  };

  // esto hace algo tambien
  const h2 = (e) => {
    const { name, value } = e.target;
    setC({ ...c, [name]: value });
  };

  // aqui pasa otra cosa
  const h3 = (e) => {
    const { name, value } = e.target;
    setD({ ...d, [name]: value });
  };

  // filtro
  const h4 = (e) => {
    const { name, value } = e.target;
    setQ({ ...q, [name]: value });
  };

  // login o registro o lo que sea
  const kk = (modo) => {
    setM('');

    if (modo === 'registro') {
      if (!f.usuario || !f.correo || !f.clave || !f.confirmar || !f.nombre || !f.apellidos) {
        setM('Llena todo');
        return;
      }

      if (f.clave !== f.confirmar) {
        setM('Las claves no son iguales');
        return;
      }

      if (u.some((r) => r.usuario === f.usuario || r.correo === f.correo)) {
        setM('Ya existe');
        return;
      }

      const nuevo = {
        id: Date.now(),
        usuario: f.usuario,
        correo: f.correo,
        clave: f.clave,
        nombre: f.nombre,
        apellidos: f.apellidos,
        creado: new Date().toISOString().slice(0, 10),
        logins: 0,
        catalogos: 0,
        transacciones: 0,
        eventos: [
          { fecha: new Date().toISOString().slice(0, 10), tipo: 'registro', valor: 1 }
        ]
      };

      const todo = [...u, nuevo];
      setU(todo);
      set(push(ref(db, 'usuarios_demo')), nuevo).catch(() => {
        console.log('firebase usuarios fallo');
      });
      setX('login');
      setM('Registro creado, ahora entra');
      setF({ usuario: '', clave: '', correo: '', confirmar: '', nombre: '', apellidos: '' });
      return;
    }

    const encontrado = u.find((r) => r.usuario === f.usuario && r.clave === f.clave);

    if (!encontrado) {
      setM('No entro');
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const nuevosUsuarios = u.map((r) => {
      if (r.id === encontrado.id) {
        return {
          ...r,
          logins: (r.logins || 0) + 1,
          ultimo: hoy,
          eventos: [...(r.eventos || []), { fecha: hoy, tipo: 'login', valor: 1 }]
        };
      }
      return r;
    });

    const usuarioActual = nuevosUsuarios.find((r) => r.id === encontrado.id);
    setU(nuevosUsuarios);
    set(ref(db, `usuarios_demo/${encontrado.firebaseId || encontrado.id}`), usuarioActual).catch(() => {
      console.log('firebase login fallo');
    });
    setZ(usuarioActual);
    setX('dashboard');
    setM('');
  };

  // guarda catalogo y toca usuario y mensajes de una vez
  const jj = (e) => {
    e.preventDefault();

    if (!c.codigo || !c.nombre || !c.tipo || !z) {
      setM('Falta catalogo o usuario');
      return;
    }

    const cosa = {
      id: Date.now(),
      codigo: c.codigo,
      nombre: c.nombre,
      tipo: c.tipo,
      usuario: z.usuario,
      fecha: new Date().toISOString().slice(0, 10)
    };

    setA([...a, cosa]);
    set(push(ref(db, 'catalogo_demo')), cosa).catch(() => {
      console.log('firebase catalogo fallo');
    });

    const hoy = new Date().toISOString().slice(0, 10);
    const nuevosUsuarios = u.map((r) => {
      if (r.id === z.id) {
        return {
          ...r,
          catalogos: (r.catalogos || 0) + 1,
          eventos: [...(r.eventos || []), { fecha: hoy, tipo: 'catalogo', valor: 1 }]
        };
      }
      return r;
    });

    const usuarioActual = nuevosUsuarios.find((r) => r.id === z.id);
    setU(nuevosUsuarios);
    set(ref(db, `usuarios_demo/${z.firebaseId || z.id}`), usuarioActual).catch(() => {
      console.log('firebase usuario catalogo fallo');
    });
    setZ(usuarioActual);
    setC({ codigo: '', nombre: '', tipo: 'Activo' });
    setM('Catalogo guardado');
  };

  // guarda transaccion y hace mas cosas
  const ll = (e) => {
    e.preventDefault();

    if (!d.fecha || !d.detalle || !d.cuenta || !d.monto || !z) {
      setM('Falta transaccion o usuario');
      return;
    }

    const cosa = {
      id: Date.now(),
      fecha: d.fecha,
      detalle: d.detalle,
      cuenta: d.cuenta,
      monto: Number(d.monto),
      tipo: d.tipo,
      usuario: z.usuario
    };

    setB([...b, cosa]);
    set(push(ref(db, 'transacciones_demo')), cosa).catch(() => {
      console.log('firebase transaccion fallo');
    });

    const nuevosUsuarios = u.map((r) => {
      if (r.id === z.id) {
        return {
          ...r,
          transacciones: (r.transacciones || 0) + 1,
          eventos: [...(r.eventos || []), { fecha: d.fecha, tipo: 'transaccion', valor: Number(d.monto) }]
        };
      }
      return r;
    });

    const usuarioActual = nuevosUsuarios.find((r) => r.id === z.id);
    setU(nuevosUsuarios);
    set(ref(db, `usuarios_demo/${z.firebaseId || z.id}`), usuarioActual).catch(() => {
      console.log('firebase usuario transaccion fallo');
    });
    setZ(usuarioActual);
    setD({ fecha: '', detalle: '', cuenta: '', monto: '', tipo: 'Debe' });
    setM('Transaccion guardada');
  };

  // sale
  const bye = () => {
    setZ(null);
    setX('login');
    setM('');
    setF({ usuario: '', clave: '', correo: '', confirmar: '', nombre: '', apellidos: '' });
  };

  const uu = u.filter((r) => {
    const fechaOk = (!q.desde || r.creado >= q.desde) && (!q.hasta || r.creado <= q.hasta);
    const usuarioOk = !q.usuario || r.usuario.toLowerCase().includes(q.usuario.toLowerCase());
    return fechaOk && usuarioOk;
  });

  const totalUsuarios = uu.length;
  const totalCatalogos = a.filter((r) => !q.usuario || r.usuario.toLowerCase().includes(q.usuario.toLowerCase())).length;
  const totalMovimientos = b.filter((r) => {
    const fechaOk = (!q.desde || r.fecha >= q.desde) && (!q.hasta || r.fecha <= q.hasta);
    const usuarioOk = !q.usuario || r.usuario.toLowerCase().includes(q.usuario.toLowerCase());
    return fechaOk && usuarioOk;
  }).length;
  const montoTotal = b
    .filter((r) => {
      const fechaOk = (!q.desde || r.fecha >= q.desde) && (!q.hasta || r.fecha <= q.hasta);
      const usuarioOk = !q.usuario || r.usuario.toLowerCase().includes(q.usuario.toLowerCase());
      return fechaOk && usuarioOk;
    })
    .reduce((n, r) => n + Number(r.monto || 0), 0);

  const barras = uu.map((r) => ({
    nombre: r.usuario,
    valor: (r.logins || 0) + (r.catalogos || 0) + (r.transacciones || 0)
  }));

  const top = Math.max(...barras.map((r) => r.valor), 1);

  if (x !== 'dashboard' || !z) {
    return (
      <div className="c1">
        <div className="c2">
          <div className="c3">
            <h1>App Contable</h1>            
          </div>

          <div className="c4">
            <button className={x === 'login' ? 'on' : ''} onClick={() => { setX('login'); setM(''); }}>
              Login
            </button>
            <button className={x === 'registro' ? 'on' : ''} onClick={() => { setX('registro'); setM(''); }}>
              Registro
            </button>
          </div>

          {m ? <div className="m">{m}</div> : null}

          <div className="c5">
            <div className="dos">
              <label>Usuario</label>
              <input name="usuario" value={f.usuario} onChange={h} placeholder="usuario" />
            </div>

            {x === 'registro' ? (
              <>
                <div className="dos">
                  <label>Correo</label>
                  <input name="correo" value={f.correo} onChange={h} placeholder="correo" />
                </div>
                <div className="dos">
                  <label>Nombre</label>
                  <input name="nombre" value={f.nombre} onChange={h} placeholder="nombre" />
                </div>
                <div className="dos">
                  <label>Apellidos</label>
                  <input name="apellidos" value={f.apellidos} onChange={h} placeholder="apellidos" />
                </div>
              </>
            ) : null}

            <div className="dos">
              <label>Contrasena</label>
              <input type="password" name="clave" value={f.clave} onChange={h} placeholder="contrasena" />
            </div>

            {x === 'registro' ? (
              <div className="dos">
                <label>Confirmar Contrasena</label>
                <input type="password" name="confirmar" value={f.confirmar} onChange={h} placeholder="confirmar" />
              </div>
            ) : null}

            <button className="big" onClick={() => kk(x)}>
              {x === 'login' ? 'Entrar' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>{z.nombre} {z.apellidos} ({z.usuario})</p>
        </div>
        <button onClick={bye}>Salir</button>
      </div>

      {m ? <div className="m m2">{m}</div> : null}

      <div className="grid4">
        <div className="card"><span>Usuarios</span><strong>{totalUsuarios}</strong></div>
        <div className="card"><span>Catalogos</span><strong>{totalCatalogos}</strong></div>
        <div className="card"><span>Transacciones</span><strong>{totalMovimientos}</strong></div>
        <div className="card"><span>Monto</span><strong>${montoTotal.toFixed(2)}</strong></div>
      </div>

      <div className="card space">
        <h2>Filtros</h2>
        <div className="grid3">
          <div className="dos">
            <label>Desde</label>
            <input type="date" name="desde" value={q.desde} onChange={h4} />
          </div>
          <div className="dos">
            <label>Hasta</label>
            <input type="date" name="hasta" value={q.hasta} onChange={h4} />
          </div>
          <div className="dos">
            <label>Usuario</label>
            <input name="usuario" value={q.usuario} onChange={h4} placeholder="filtrar usuario" />
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card space">
          <h2>Comportamiento de usuarios</h2>
          <div className="chart">
            {barras.length ? barras.map((r) => (
              <div className="barRow" key={r.nombre}>
                <div className="barLabel">{r.nombre}</div>
                <div className="barBack">
                  <div className="barFront" style={{ width: `${(r.valor / top) * 100}%` }} />
                </div>
                <div className="barValue">{r.valor}</div>
              </div>
            )) : <p>No hay datos</p>}
          </div>
        </div>

        <div className="card space">
          <h2>Usuarios registrados</h2>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Creado</th>
                <th>Logins</th>
                <th>Catalogos</th>
                <th>Transacciones</th>
              </tr>
            </thead>
            <tbody>
              {uu.map((r) => (
                <tr key={r.id}>
                  <td>{r.usuario}</td>
                  <td>{r.nombre} {r.apellidos}</td>
                  <td>{r.creado}</td>
                  <td>{r.logins || 0}</td>
                  <td>{r.catalogos || 0}</td>
                  <td>{r.transacciones || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid2">
        <form className="card space" onSubmit={jj}>
          <h2>Registrar catalogo contable</h2>
          <div className="dos">
            <label>Codigo</label>
            <input name="codigo" value={c.codigo} onChange={h2} />
          </div>
          <div className="dos">
            <label>Nombre</label>
            <input name="nombre" value={c.nombre} onChange={h2} />
          </div>
          <div className="dos">
            <label>Tipo</label>
            <select name="tipo" value={c.tipo} onChange={h2}>
              <option>Activo</option>
              <option>Pasivo</option>
              <option>Patrimonio</option>
              <option>Ingreso</option>
              <option>Gasto</option>
            </select>
          </div>
          <button className="big" type="submit">Guardar catalogo</button>
        </form>

        <form className="card space" onSubmit={ll}>
          <h2>Registrar transaccion contable</h2>
          <div className="dos">
            <label>Fecha</label>
            <input type="date" name="fecha" value={d.fecha} onChange={h3} />
          </div>
          <div className="dos">
            <label>Detalle</label>
            <input name="detalle" value={d.detalle} onChange={h3} />
          </div>
          <div className="dos">
            <label>Cuenta</label>
            <select name="cuenta" value={d.cuenta} onChange={h3}>
              <option value="">Escoge una cuenta</option>
              {a.map((r) => (
                <option key={r.id} value={r.codigo}>{r.codigo} - {r.nombre}</option>
              ))}
            </select>
          </div>
          <div className="dos">
            <label>Monto</label>
            <input type="number" name="monto" value={d.monto} onChange={h3} />
          </div>
          <div className="dos">
            <label>Tipo</label>
            <select name="tipo" value={d.tipo} onChange={h3}>
              <option>Debe</option>
              <option>Haber</option>
            </select>
          </div>
          <button className="big" type="submit">Guardar transaccion</button>
        </form>
      </div>

      <div className="grid2 last">
        <div className="card space">
          <h2>Catalogo contable</h2>
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {a.map((r) => (
                <tr key={r.id}>
                  <td>{r.codigo}</td>
                  <td>{r.nombre}</td>
                  <td>{r.tipo}</td>
                  <td>{r.usuario}</td>
                  <td>{r.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card space">
          <h2>Transacciones</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {b.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.detalle}</td>
                  <td>{r.cuenta}</td>
                  <td>{r.tipo}</td>
                  <td>${Number(r.monto).toFixed(2)}</td>
                  <td>{r.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
