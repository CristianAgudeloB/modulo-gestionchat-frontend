import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ubicacionService } from "../services/ubicacionService";
import "./Login.css";

const Login: React.FC = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [ubicaciones, setUbicaciones] = useState<Array<{ CODUBICA: string; NOMUBICA: string }>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const data = await ubicacionService.getUbicaciones();
        setUbicaciones(data);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
        setError("Error al cargar las ubicaciones");
        setLoading(false);
      }
    };
    fetchUbicaciones();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      navigate('/chats');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error en el inicio de sesión");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const signupData = {
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        ubicacion
      };
      const { token } = await authService.signup(signupData);
      localStorage.setItem('token', token);
      navigate('/chats');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error en el registro");
    }
  };

  return (
    <div className="login-outer-wrapper">
      <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`}>
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Registro</h1>
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              maxLength={25}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
              maxLength={25}
            />
            <input
              type="text"
              placeholder="Nombre de Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={6}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Celular"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="[0-9]{10,16}"
              title="Número de celular (10-16 dígitos)"
            />
            
            <div className="select-container">
              <select
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
                className="custom-select"
                disabled={loading}
              >
                <option value="">{loading ? "Cargando ubicaciones..." : "Selecciona una ubicación"}</option>
                {!loading && ubicaciones.map((ubic, index) => {
                  const uniqueKey = ubic.CODUBICA ? `${ubic.CODUBICA}-${index}` : `no-cod-${index}`;
                  
                  return (
                    <option key={uniqueKey} value={ubic.CODUBICA}>
                      {ubic.NOMUBICA}
                    </option>
                  );
                })}
              </select>
              <div className="select-arrow"></div>
            </div>
            
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="submit">Registrarse</button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Iniciar Sesión</h1>
            {error && <div className="error-message">{error}</div>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de Vuelta!</h1>
              <p>Ingresa tus datos para acceder a tu cuenta</p>
              <button className="ghost" onClick={() => setIsSignUpActive(false)}>
                Iniciar Sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¿Nuevo por aquí?</h1>
              <p>Regístrate y comienza a usar nuestro servicio</p>
              <button className="ghost" onClick={() => setIsSignUpActive(true)}>
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;