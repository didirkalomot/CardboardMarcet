import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../../store/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { TextField, Button, Box, Paper, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  data?: {
    message?: string;
  };
}

export const LoginForm = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.access_token }));
      navigate('/');  // ← ПЕРЕХОД НА ГЛАВНУЮ ПОСЛЕ ВХОДА
    } catch (err) {
      const error = err as LoginError;
      setError(error.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Вход
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
            {...register('password', { required: true })}
            type="password"
            label="Пароль"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2 }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};