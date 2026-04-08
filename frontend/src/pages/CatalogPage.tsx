import { useState } from 'react';
import { useGetCardsQuery } from '../store/api';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
});

export const CatalogPage = () => {
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');

  const { data: cards, isLoading, error } = useGetCardsQuery();

  const getStatusColor = (cardStatus: string) => {
    switch (cardStatus) {
      case 'active':
        return 'success';
      case 'sold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (cardStatus: string) => {
    switch (cardStatus) {
      case 'active':
        return 'В продаже';
      case 'sold':
        return 'Продано';
      default:
        return cardStatus;
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">Ошибка загрузки карточек. Убедитесь, что бэкенд запущен.</Typography>
      </Box>
    );
  }

  const filteredCards = cards?.filter((card) => {
    const matchSearch = card.title.toLowerCase().includes(search.toLowerCase());
    const matchCondition = condition ? card.condition === condition : true;
    return matchSearch && matchCondition;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Коллекционные карточки
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          label="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Состояние</InputLabel>
          <Select value={condition} onChange={(e) => setCondition(e.target.value)} label="Состояние">
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="Mint">Mint</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
          </Select>
        </FormControl>

        {(search || condition) && (
          <Button onClick={() => { setSearch(''); setCondition(''); }}>
            Сбросить
          </Button>
        )}
      </Box>

      {filteredCards?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography variant="h6" color="text.secondary">
            Карточки не найдены
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCards?.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
              <StyledCard>
                {card.status && (
                  <StatusChip
                    label={getStatusText(card.status)}
                    color={getStatusColor(card.status)}
                    size="small"
                  />
                )}
                {card.images?.[0] ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={card.images[0]}
                    alt={card.title}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Нет фото</Typography>
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>{card.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Год: {card.year || '?'} | {card.condition}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {card.price ? `${card.price} ₽` : 'Цена не указана'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button variant="contained" fullWidth disabled={card.status === 'sold'}>
                    {card.status === 'active' ? 'Купить' : 'Подробнее'}
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};