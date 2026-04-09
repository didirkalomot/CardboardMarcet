import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store/store';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import axios from 'axios';

interface Auction {
  id: string;
  cardTitle: string;
  currentPrice: number;
  status: string;
  endTime: string;
  myBid?: number;
}

interface Chat {
  id: string;
  cardTitle: string;
  otherUserEmail: string;
  lastMessage: string;
  isCompleted: boolean;
}

interface Card {
  id: string;
  title: string;
  price: number;
  status: string;
}

interface ProfileData {
  email: string;
  ratingBuyer: number;
  ratingSeller?: number;
}

export const ProfilePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sellerCards, setSellerCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const isSeller = user?.role === 'verified_seller';

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch {
      setError('Ошибка загрузки профиля');
    }
  }, [token]);

  const fetchAuctions = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/profile/auctions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(response.data);
    } catch {
      setError('Ошибка загрузки аукционов');
    }
  }, [token]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/profile/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch {
      setError('Ошибка загрузки чатов');
    }
  }, [token]);

  const fetchSellerCards = useCallback(async () => {
    if (!isSeller) return;
    try {
      const response = await axios.get('http://localhost:3000/seller/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellerCards(response.data);
    } catch {
      setError('Ошибка загрузки карточек');
    }
  }, [token, isSeller]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchProfile(),
        fetchAuctions(),
        fetchChats(),
        fetchSellerCards(),
      ]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePasswordChange = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: 'Заполните оба поля' });
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      await axios.patch(
        'http://localhost:3000/profile/password',
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMessage({ type: 'success', text: 'Пароль успешно изменён' });
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch {
      setPasswordMessage({ type: 'error', text: 'Ошибка при смене пароля' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {passwordMessage && (
        <Alert severity={passwordMessage.type} sx={{ mb: 2 }} onClose={() => setPasswordMessage(null)}>
          {passwordMessage.text}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Профиль" />
          <Tab label="Мои ставки" />
          <Tab label="Чаты" />
          {isSeller && <Tab label="Мои карточки" />}
        </Tabs>

        {/* Вкладка Профиль */}
        <Box sx={{ p: 3, display: tabValue === 0 ? 'block' : 'none' }}>
          <Typography variant="h6">Email: {profile?.email}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Рейтинг как покупатель: {profile?.ratingBuyer || 0} ⭐
          </Typography>
          {isSeller && (
            <Typography variant="body1">
              Рейтинг как продавец: {profile?.ratingSeller || 0} ⭐
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Смена пароля</Typography>
          <Grid container spacing={2} sx={{ maxWidth: 400 }}>
            <Grid size={12}>
              <TextField
                type="password"
                label="Старый пароль"
                fullWidth
                size="small"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                type="password"
                label="Новый пароль"
                fullWidth
                size="small"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <Button 
                variant="contained" 
                onClick={handlePasswordChange}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Сохранение...' : 'Сменить пароль'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Вкладка Мои ставки */}
        <Box sx={{ p: 3, display: tabValue === 1 ? 'block' : 'none' }}>
          {auctions.length === 0 ? (
            <Typography>Вы ещё не участвовали в аукционах</Typography>
          ) : (
            <List>
              {auctions.map((auction) => (
                <ListItem key={auction.id} divider>
                  <ListItemText
                    primary={auction.cardTitle}
                    secondary={
                      <>
                        Моя ставка: {auction.myBid || '—'} ₽ | Текущая цена: {auction.currentPrice} ₽
                        <Chip
                          label={auction.status === 'active' ? 'Активен' : 'Завершён'}
                          size="small"
                          color={auction.status === 'active' ? 'success' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Вкладка Чаты */}
        <Box sx={{ p: 3, display: tabValue === 2 ? 'block' : 'none' }}>
          {chats.length === 0 ? (
            <Typography>Нет чатов</Typography>
          ) : (
            <List>
              {chats.map((chat) => (
                <ListItem 
                  key={chat.id} 
                  divider 
                  component={Link} 
                  to={`/chats/${chat.id}`}
                  sx={{ textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemText
                    primary={chat.cardTitle}
                    secondary={`${chat.otherUserEmail}: ${chat.lastMessage?.slice(0, 50) || 'Нет сообщений'}${chat.lastMessage?.length > 50 ? '...' : ''}`}
                  />
                  {chat.isCompleted && <Chip label="Сделка завершена" size="small" color="success" />}
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Вкладка Мои карточки (только для продавца) */}
        {isSeller && (
          <Box sx={{ p: 3, display: tabValue === 3 ? 'block' : 'none' }}>
            {sellerCards.length === 0 ? (
              <Typography>У вас нет выставленных карточек</Typography>
            ) : (
              <List>
                {sellerCards.map((card) => (
                  <ListItem key={card.id} divider>
                    <ListItemText
                      primary={card.title}
                      secondary={`Цена: ${card.price} ₽`}
                    />
                    <Chip
                      label={
                        card.status === 'active' ? 'Активна' :
                        card.status === 'moderation' ? 'На модерации' : 'Продана'
                      }
                      size="small"
                      color={
                        card.status === 'active' ? 'success' :
                        card.status === 'moderation' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};