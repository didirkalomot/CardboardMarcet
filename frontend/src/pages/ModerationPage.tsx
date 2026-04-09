import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CardType {
  id: string;
  title: string;
  description: string;
  year: number;
  condition: string;
  price: number;
  images?: string[];
  sellerId: string;
  seller?: {
    email: string;
  };
}

interface VerificationRequest {
  id: string;
  userId: string;
  cardId: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ModerationPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingCards, setPendingCards] = useState<CardType[]>([]);
  const [pendingSellers, setPendingSellers] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  const isModerator = user?.role === 'moderator' || user?.role === 'admin';

  const fetchPendingCards = useCallback(async () => {
    try {
      const response = await axios.get<CardType[]>('http://localhost:3000/moderation/pending-cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingCards(response.data);
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при загрузке карточек' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPendingSellers = useCallback(async () => {
    try {
      const response = await axios.get<VerificationRequest[]>(
        'http://localhost:3000/moderation/pending-verifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingSellers(response.data);
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при загрузке заявок' });
    }
  }, [token]);

  useEffect(() => {
    if (isModerator) {
      fetchPendingCards();
      fetchPendingSellers();
    }
  }, [isModerator, fetchPendingCards, fetchPendingSellers]);

  const approveCard = useCallback(async (cardId: string) => {
    try {
      await axios.post(
        `http://localhost:3000/moderation/cards/${cardId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Карточка одобрена' });
      fetchPendingCards();
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при одобрении' });
    }
  }, [token, fetchPendingCards]);

  const rejectCard = useCallback(async (cardId: string) => {
    try {
      await axios.post(
        `http://localhost:3000/moderation/cards/${cardId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Карточка отклонена' });
      setDialogOpen(false);
      setRejectReason('');
      fetchPendingCards();
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при отклонении' });
    }
  }, [token, rejectReason, fetchPendingCards]);

  const approveSeller = useCallback(async (userId: string) => {
    try {
      await axios.post(
        `http://localhost:3000/moderation/verify-user/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Продавец верифицирован' });
      fetchPendingSellers();
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при верификации' });
    }
  }, [token, fetchPendingSellers]);

  if (!isModerator) {
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
        Панель модерации
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Карточки на модерацию (${pendingCards.length})`} />
          <Tab label={`Заявки на верификацию (${pendingSellers.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {pendingCards.length === 0 ? (
              <Typography sx={{ p: 3 }}>Нет карточек на модерацию</Typography>
            ) : (
              pendingCards.map((card) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={card.id}>
                  <Card>
                    {card.images?.[0] && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={card.images[0]}
                        alt={card.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6">{card.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Год:</strong> {card.year}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Состояние:</strong> {card.condition}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Цена:</strong> {card.price} ₽
                      </Typography>
                      <Typography variant="body2">
                        <strong>Продавец:</strong> {card.seller?.email || card.sellerId}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => approveCard(card.id)}
                      >
                        Одобрить
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => {
                          setSelectedCard(card);
                          setDialogOpen(true);
                        }}
                      >
                        Отклонить
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {pendingSellers.length === 0 ? (
              <Typography sx={{ p: 3 }}>Нет заявок на верификацию</Typography>
            ) : (
              pendingSellers.map((req) => (
                <Grid size={{ xs: 12, md: 6 }} key={req.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{req.user?.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Запрос от {new Date(req.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Карточка ID:</strong> {req.cardId}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => approveSeller(req.userId)}
                      >
                        Подтвердить продавца
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Отклонить карточку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Причина отклонения"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={() => selectedCard && rejectCard(selectedCard.id)} color="error">
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};