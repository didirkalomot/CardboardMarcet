import { useForm, useWatch } from 'react-hook-form';
import { useCreateCardMutation } from '../../store/api';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Input,
} from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../store/store';

interface CardFormData {
  title: string;
  description: string;
  year: number;
  condition: string;
  price?: number;
  startPrice?: number;
  auctionEndDate?: string;
  isAuction: boolean;
}

export const CardForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const { register, handleSubmit, control } = useForm<CardFormData>({
    defaultValues: { isAuction: false }
  });
  
  const [createCard, { isLoading }] = useCreateCardMutation();
  const [images, setImages] = useState<File[]>([]);
  const isAuction = useWatch({ name: 'isAuction', control });

  // ПРОВЕРКА ПОСЛЕ ВСЕХ ХУКОВ
  if (!token) {
    return <Navigate to="/login" />;
  }

    const onSubmit = async (data: CardFormData) => {
      const cardData = {
        title: data.title,
        description: data.description,
        year: data.year,
        condition: data.condition as 'Mint' | 'Excellent' | 'Good',
        price: data.isAuction ? undefined : data.price,
        startPrice: data.isAuction ? data.startPrice : undefined,
        endTime: data.isAuction ? data.auctionEndDate : undefined,
      };

      await createCard({
        data: cardData,
        images: images,
      });
      alert('Карточка создана!');
    };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Создание карточки
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('title', { required: true })} label="Название" fullWidth margin="normal" />
          <TextField {...register('description')} label="Описание" multiline rows={3} fullWidth margin="normal" />
          <TextField {...register('year', { required: true })} type="number" label="Год выпуска" fullWidth margin="normal" />

          <Select {...register('condition', { required: true })} fullWidth sx={{ mt: 2 }}>
            <MenuItem value="Mint">Mint (Идеальное)</MenuItem>
            <MenuItem value="Excellent">Excellent (Отличное)</MenuItem>
            <MenuItem value="Good">Good (Хорошее)</MenuItem>
          </Select>

          <FormControlLabel
            control={<Switch {...register('isAuction')} />}
            label="Аукцион"
            sx={{ mt: 2 }}
          />

          {!isAuction ? (
            <TextField {...register('price')} type="number" label="Цена" fullWidth margin="normal" />
          ) : (
            <>
              <TextField {...register('startPrice')} type="number" label="Стартовая цена" fullWidth margin="normal" />
              <TextField {...register('auctionEndDate')} type="datetime-local" fullWidth margin="normal" />
            </>
          )}

          <Input
            type="file"
            inputProps={{ multiple: true, accept: 'image/*' }}
            onChange={(e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) setImages(Array.from(files));
            }}
            sx={{ mt: 2 }}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Создание...' : 'Создать карточку'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};