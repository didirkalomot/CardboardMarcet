import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'collector' | 'verified_seller' | 'moderator' | 'admin';
  isVerified: boolean;
  rating: number;
}

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isAdmin = currentUser?.role === 'admin';

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch {
      setMessage({ type: 'error', text: 'Ошибка загрузки пользователей' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      await axios.patch(
        `http://localhost:3000/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Роль пользователя обновлена' });
      fetchUsers();
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при обновлении роли' });
    }
  }, [token, fetchUsers]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      case 'verified_seller': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      case 'verified_seller': return 'Продавец';
      default: return 'Коллекционер';
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">У вас нет прав доступа к этой странице</Typography>
        <Button href="/" sx={{ mt: 2 }}>Вернуться на главную</Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Верифицирован</TableCell>
              <TableCell>Рейтинг</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.isVerified ? 'Да' : 'Нет'}</TableCell>
                <TableCell>{user.rating}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                    disabled={user.id === currentUser?.id}
                  >
                    <MenuItem value="collector">Коллекционер</MenuItem>
                    <MenuItem value="verified_seller">Продавец</MenuItem>
                    <MenuItem value="moderator">Модератор</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};