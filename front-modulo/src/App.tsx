import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatLayout />} />
        {/* Otras rutas según necesites */}
      </Routes>
    </Router>
  );
}

export default App;
