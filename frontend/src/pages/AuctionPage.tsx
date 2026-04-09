import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetAuctionQuery, usePlaceBidMutation } from '../store/api';
import { RootState } from '../store/store';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';

interface Bid {
  id: string;
  amount: number;
  userId: string;
  createdAt: string;
  user?: { email: string };
}

export const AuctionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: auction, isLoading, error } = useGetAuctionQuery(id!);
  const [placeBid, { isLoading: isBidding }] = usePlaceBidMutation();
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // WebSocket подключение
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      socketRef.current?.emit('joinAuction', id);
    });

    socketRef.current.on('newBid', (data: { currentPrice: number; bid: Bid }) => {
      setCurrentPrice(data.currentPrice);
      setBids((prev) => [data.bid, ...prev]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  // Таймер окончания аукциона
  useEffect(() => {
    if (auction?.endTime) {
      const timer = setInterval(() => {
        const end = new Date(auction.endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('Аукцион завершён');
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (3600000)) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction?.endTime]);

  const handlePlaceBid = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;

    try {
      await placeBid({ auctionId: id!, data: { amount } }).unwrap();
      setBidAmount('');
    } catch {
      console.error('Bid failed');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Ошибка загрузки аукциона</Typography>
        <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
      </Box>
    );
  }

  const currentPriceValue = currentPrice || auction?.currentPrice || auction?.startPrice || 0;
  const minBid = currentPriceValue + (auction?.minBidStep || 0);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        ← Назад к каталогу
      </Button>

      <Typography variant="h4" gutterBottom>
        {auction?.card?.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Левая колонка — фото */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          {auction?.card?.images?.[0] ? (
            <img
              src={auction.card.images[0]}
              alt={auction.card.title}
              style={{ width: '100%', borderRadius: 8 }}
            />
          ) : (
            <Paper sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>Нет фото</Typography>
            </Paper>
          )}
        </Box>

        {/* Правая колонка — ставки */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Текущая ставка: {currentPriceValue} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Минимальная следующая ставка: {minBid} ₽
            </Typography>
            <Typography variant="body2" gutterBottom>
              Шаг ставки: {auction?.minBidStep} ₽
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: timeLeft === 'Аукцион завершён' ? 'error.main' : 'success.main' }}>
              {timeLeft || 'Загрузка...'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {token ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="number"
                  label="Ваша ставка"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handlePlaceBid}
                  disabled={isBidding || timeLeft === 'Аукцион завершён'}
                >
                  {isBidding ? 'Отправка...' : 'Сделать ставку'}
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" fullWidth onClick={() => navigate('/login')}>
                Войдите, чтобы сделать ставку
              </Button>
            )}
          </Paper>

          {/* История ставок */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>История ставок</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(bids.length > 0 ? bids : (auction?.bids || [])).length === 0 && (
                <ListItem>
                  <ListItemText primary="Пока нет ставок" />
                </ListItem>
              )}
              {(bids.length > 0 ? bids : (auction?.bids || [])).map((bid, idx) => (
                <ListItem key={bid.id || idx} divider>
                  <ListItemText
                    primary={`${bid.amount} ₽`}
                    secondary={`Пользователь: ${bid.user?.email || 'Аноним'} — ${new Date(bid.createdAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};