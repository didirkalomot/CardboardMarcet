import { useForm } from 'react-hook-form';
import { useRegisterMutation } from '../../store/api';
import { TextField, Button, Box, Paper, Typography, Alert } from '@mui/material';
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
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data).unwrap();
      navigate('/login');
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
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};