import { useForm } from 'react-hook-form';
import { useLoginMutation, useRegisterMutation } from '../../store/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { TextField, Button, Box, Paper, Alert, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData { email: string; password: string; }

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface LoginError {
  data?: {
    message?: string;
  };
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const { register, handleSubmit } = useForm<FormData>();
  const [login, { isLoading: loadingLogin }] = useLoginMutation();
  const [registerMut, { isLoading: loadingRegister }] = useRegisterMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const result = await (isLogin ? login : registerMut)(data).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.access_token }));
      navigate('/');
    } catch (err) {
      const error = err as LoginError;
      setError(error.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        <Tabs value={isLogin ? 0 : 1} onChange={(_, v) => setIsLogin(v === 0)} centered sx={{ mb: 2 }}>
          <Tab label="Вход" />
          <Tab label="Регистрация" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('email', { required: true })} label="Email" fullWidth margin="normal" />
          <TextField {...register('password', { required: true })} type="password" label="Пароль" fullWidth margin="normal" />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loadingLogin || loadingRegister}>
            {loadingLogin || loadingRegister ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};