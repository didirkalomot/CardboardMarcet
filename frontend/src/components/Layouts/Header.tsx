import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { clearCredentials } from '../../store/authSlice';
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from '@mui/material';
import { Logout, Login, Person, AdminPanelSettings, Gavel, Home } from '@mui/icons-material';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Хук для получения текущего пути
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/');
  };

  // Проверяем, находимся ли мы сейчас на главной странице
  const isOnCatalog = location.pathname === '/';

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
        >
          CardboardMarket
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          
          {/* Кнопка КАТАЛОГ (видна всем, кроме тех, кто уже в каталоге) */}
          {!isOnCatalog && (
            <Button 
              startIcon={<Home />} 
              variant="outlined" 
              onClick={() => navigate('/')}
            >
              Каталог
            </Button>
          )}

          {/* Если НЕ авторизован -> Показываем Вход */}
          {!token && (
            <Button 
              startIcon={<Login />} 
              variant="contained" 
              onClick={() => navigate('/login')}
            >
              Вход
            </Button>
          )}

          {/* Если авторизован -> Показываем меню */}
          {token && user && (
            <>
              {/* Кнопка Продать карточку (только для collector и verified_seller) */}
              {(user.role === 'collector' || user.role === 'verified_seller') && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/create-card')}
                >
                  Продать карточку
                </Button>
              )}

              <Button startIcon={<Person />} onClick={() => navigate('/profile')}>
                Личный кабинет
              </Button>

              {user.role === 'moderator' && (
                <Button startIcon={<Gavel />} color="warning" onClick={() => navigate('/moderation')}>
                  Модерация
                </Button>
              )}

              {user.role === 'admin' && (
                <Button startIcon={<AdminPanelSettings />} color="error" onClick={() => navigate('/admin')}>
                  Админ-панель
                </Button>
              )}

              <IconButton onClick={handleLogout} color="default" title="Выйти">
                <Logout />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};