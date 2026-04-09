import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';

interface CardListing {
  id: string;
  title: string;
  description: string;
  year: number;
  condition: string;
  price: number;
  images: string[];
  status: string;
  sellerId: string;
  seller: {
    id: string;
    email: string;
  };
}

export const CardDetailsPage = () => {
  const { cardName } = useParams<{ cardName: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [listings, setListings] = useState<CardListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingsByCardName = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/cards/search?title=${encodeURIComponent(cardName!)}`);
      setListings(response.data);
    } catch {
      setError('Ошибка загрузки объявлений');
    } finally {
      setLoading(false);
    }
  }, [cardName]);

  useEffect(() => {
    if (cardName) {
      fetchListingsByCardName();
    }
  }, [cardName, fetchListingsByCardName]);

  const startChat = async (sellerId: string, cardId: string) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/chats',
        { sellerId, cardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chats/${response.data.id}`);
    } catch {
      console.error('Ошибка создания чата');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Вернуться в каталог</Button>
      </Box>
    );
  }

  if (listings.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Нет активных объявлений для карты "{cardName}"</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Вернуться в каталог</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>← Назад</Button>
      
      <Typography variant="h4" gutterBottom>
        {listings[0]?.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {listings[0]?.description}
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Предложения от продавцов ({listings.length})
      </Typography>

      <Grid container spacing={3}>
        {listings.map((listing) => {
          const isOwnListing = user?.id === listing.sellerId;
          const isLoggedIn = !!token;
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {listing.images?.[0] && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.images[0]}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar>{listing.seller.email[0].toUpperCase()}</Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {listing.seller.email}
                        </Typography>
                        {isOwnListing && (
                          <Chip label="Вы" size="small" color="primary" />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Состояние:</strong> {listing.condition}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Год:</strong> {listing.year}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {listing.price} ₽
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  {isOwnListing ? (
                    <Button variant="outlined" fullWidth disabled>
                      Ваше объявление
                    </Button>
                  ) : !isLoggedIn ? (
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={() => navigate('/login')}
                    >
                      Войдите, чтобы купить
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={() => startChat(listing.sellerId, listing.id)}
                    >
                      Купить
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};