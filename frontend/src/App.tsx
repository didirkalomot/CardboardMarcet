import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { Header } from './components/Layouts/Header'; // Проверьте путь!

// Остальные импорты страниц...
import { CatalogPage } from './pages/CatalogPage';
import { AuctionPage } from './pages/AuctionPage';
import { AuthForm } from './components/Auth/AuthForm';
import { CardForm } from './components/Card/CardForm';
import { CardDetailsPage } from './pages/CardDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatPage } from './pages/ChatPage';
import { AdminPanel } from './pages/AdminPanel';
import { ModerationPage } from './pages/ModerationPage';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactElement; allowedRoles: string[] }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/" />;
};

function App() {
  return (
    // Header должен быть ВНУТРИ BrowserRouter
    <BrowserRouter>
      <Header /> 
      
      <div style={{ marginTop: '64px' }}> {/* Отступ для фиксированной шапки */}
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/card/:id" element={<CardDetailsPage />} />
          <Route path="/auction/:id" element={<AuctionPage />} />
          
          <Route path="/create-card" element={<PrivateRoute><CardForm /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          
          <Route path="/moderation" element={<RoleRoute allowedRoles={['moderator']}><ModerationPage /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminPanel /></RoleRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;