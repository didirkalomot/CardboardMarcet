import { useForm } from 'react-hook-form';
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
  const { register, handleSubmit, watch } = useForm<CardFormData>({
    defaultValues: { isAuction: false }
  });
  const [createCard, { isLoading }] = useCreateCardMutation();
  const [images, setImages] = useState<File[]>([]);
  const isAuction = watch('isAuction');

  const onSubmit = async (data: CardFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('year', data.year.toString());
    formData.append('condition', data.condition);
    formData.append('isAuction', data.isAuction.toString());
    
    if (!data.isAuction && data.price) {
      formData.append('price', data.price.toString());
    }
    
    if (data.isAuction) {
      if (data.startPrice) formData.append('startPrice', data.startPrice.toString());
      if (data.auctionEndDate) formData.append('endTime', data.auctionEndDate);
    }
    
    images.forEach((img) => formData.append('images', img));
    
    await createCard(formData);
    alert('Card created!');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Create Card</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('title', { required: true })} label="Card Title" fullWidth margin="normal" />
          <TextField {...register('description')} label="Description" multiline rows={3} fullWidth margin="normal" />
          <TextField {...register('year', { required: true })} type="number" label="Year" fullWidth margin="normal" />
          
          <Select {...register('condition', { required: true })} fullWidth sx={{ mt: 2 }}>
            <MenuItem value="Mint">Mint</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
          </Select>
          
          <FormControlLabel
            control={<Switch {...register('isAuction')} />}
            label="Auction"
            sx={{ mt: 2 }}
          />
          
          {!isAuction ? (
            <TextField {...register('price')} type="number" label="Price" fullWidth margin="normal" />
          ) : (
            <>
              <TextField {...register('startPrice')} type="number" label="Start Price" fullWidth margin="normal" />
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
            {isLoading ? 'Creating...' : 'Create Card'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
