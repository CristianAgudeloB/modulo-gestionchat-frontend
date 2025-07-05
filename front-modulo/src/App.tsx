import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
        {/* Otras rutas según necesites */}
      </Routes>
    </Router>
  );
}

export default App;
