import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {authService} from "../services/authService"; // Asegúrate de que la ruta sea correcta
import "./Login.css"; // Asegúrate de que la ruta sea correcta

const Login: React.FC = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { user, token } = await authService.login(email, password);
      // Guardar token y datos de usuario en el estado/contexto/localStorage
      localStorage.setItem('token', token);
      // Redirigir al dashboard
      navigate('/chats');
    } catch (error) {
      // Mostrar error al usuario
      alert(error);
    }
  };
  const handleSignUpClick = () => {
    setIsSignUpActive(true);
  };

  const handleSignInClick = () => {
    setIsSignUpActive(false);
  };

  return (
    <div
      className={`container ${isSignUpActive ? "right-panel-active" : ""}`}
      id="container"
    >
      <div className="form-container sign-up-container">
        <form action="#">
          <h1>Crea una cuenta</h1>
          <span></span>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="button">Sign Up</button>
        </form>
      </div>

      <div className="form-container sign-in-container">
        <form action="#">
          <h1>Login</h1>
          <span></span>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="button">Iniciar Sesión</button>
        </form>
      </div>

      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Bienvenido de Vuelta!</h1>
            <button className="ghost" onClick={handleSignInClick}>
              Iniciar Sesión
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Crea una cuenta!</h1>
            <button className="ghost" onClick={handleSignUpClick}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
