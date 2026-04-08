import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../../store/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { TextField, Button, Box, Paper, Typography, Alert } from '@mui/material';
import { useState } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      // Бэкенд возвращает { access_token, user }
      dispatch(setCredentials({ user: result.user, token: result.access_token }));
    } catch (err: any) {
      setError(err.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" mb={2}>Login</Typography>
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
            label="Password"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};