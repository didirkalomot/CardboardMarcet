import { useForm } from 'react-hook-form';
import { useCreateCardMutation } from '../../store/api';
import { TextField, Button, Select, MenuItem, Box, Paper, Typography, Input } from '@mui/material';
import { useState } from 'react';

interface CardFormData {
  title: string; description: string; year: number; condition: string;
  price?: number; startPrice?: number; auctionEndDate?: string; isAuction: boolean;
}

export const CardForm = () => {
  const { register, handleSubmit, watch } = useForm<CardFormData>({ defaultValues: { isAuction: false } });
  const [createCard, { isLoading }] = useCreateCardMutation();
  const [images, setImages] = useState<File[]>([]);
  const isAuction = watch('isAuction');

  const onSubmit = async (data: CardFormData) => {
    const formData = new FormData();
    Object.entries({ ...data, isAuction: data.isAuction.toString(), year: data.year?.toString() })
      .forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v.toString()); });
    images.forEach((img) => formData.append('images', img));
    await createCard(formData);
    alert('Карточка создана!');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Создать карточку</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('title', { required: true })} label="Название" fullWidth margin="normal" />
          <TextField {...register('description')} label="Описание" multiline rows={3} fullWidth margin="normal" />
          <TextField {...register('year', { required: true })} type="number" label="Год" fullWidth margin="normal" />
          <Select {...register('condition', { required: true })} fullWidth sx={{ mt: 2 }} defaultValue="Mint">
            <MenuItem value="Mint">Mint</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
          </Select>
          <Button component="label" variant="outlined" fullWidth sx={{ mt: 2 }}>
            Загрузить фото
            <Input type="file" inputProps={{ multiple: true, accept: 'image/*' }} hidden onChange={(e) => setImages(Array.from((e.target as HTMLInputElement).files || []))} />
          </Button>
          <Select {...register('isAuction')} fullWidth sx={{ mt: 2 }} defaultValue={false}>
            <MenuItem value={false}>Продажа</MenuItem>
            <MenuItem value={true}>Аукцион</MenuItem>
          </Select>
          {!isAuction ? (
            <TextField {...register('price')} type="number" label="Цена" fullWidth margin="normal" />
          ) : (
            <>
              <TextField {...register('startPrice')} type="number" label="Стартовая цена" fullWidth margin="normal" />
              <TextField {...register('auctionEndDate')} type="datetime-local" fullWidth margin="normal" />
            </>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Создание...' : 'Создать'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
