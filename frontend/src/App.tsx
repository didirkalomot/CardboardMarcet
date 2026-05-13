import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import type { RootState } from './store/store';
import { CatalogPage } from './pages/CatalogPage';
import { AuctionPage } from './pages/AuctionPage';
import { AuthForm } from './components/Auth/AuthForm';
import { CardForm } from './components/Card/CardForm';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/auction/:id" element={<AuctionPage />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/create-card" element={<PrivateRoute><CardForm /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;