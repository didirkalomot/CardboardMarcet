import { useForm } from 'react-hook-form';
import { useRegisterMutation, useLoginMutation } from '../../store/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { TextField, Button, Box, Paper, Typography, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
  email: string;
  password: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

export const RegisterForm = () => {
  const { register, handleSubmit } = useForm<RegisterFormData>();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // 1. Регистрация
      await registerUser(data).unwrap();
      
      // 2. Показываем уведомление
      setOpenSnackbar(true);
      
      // 3. Автоматический вход
      const loginResult = await login(data).unwrap();
      dispatch(setCredentials({ user: loginResult.user, token: loginResult.access_token }));
      
      // 4. Перенаправление на каталог через 2 секунды
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Регистрация
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('email', { required: true })}
            label="Email"
            fullWidth
            margin="normal"
          />
          <TextField
            {...register('password', { required: true, minLength: 6 })}
            type="password"
            label="Пароль (минимум 6 символов)"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isRegistering || isLoggingIn}>
            {isRegistering || isLoggingIn ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </Paper>
      
      {/* Уведомление об успешной регистрации */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Регистрация успешна! Перенаправление на главную...
        </Alert>
      </Snackbar>
    </Box>
  );
};