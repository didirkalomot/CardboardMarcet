import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  isSystem?: boolean;
}

// Исправленный интерфейс: добавлено поле card и убрано cardTitle (так как его нет в ответе API напрямую)
interface Chat {
  id: string;
  cardId: string;
  sellerId: string;
  sellerEmail: string; // Может быть undefined, если данные неполные
  buyerId: string;
  buyerEmail: string; // Может быть undefined
  messages: Message[];
  isCompleted?: boolean;
  card?: {
    id: string;
    title: string;
    price: string;
    images: string[];
  };
}

export const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchChats = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchChats();

      socketRef.current = io('http://localhost:3000', {
        auth: { token }
      });

      socketRef.current.on('newMessage', (message: Message) => {
        // Обновляем сообщения в выбранном чате, если пришло сообщение для него
        setSelectedChat(prev => {
          if (!prev || prev.id !== message.id) return prev; // Простая проверка, в реальном проекте лучше проверять chatId внутри message если он там есть
          return {
            ...prev,
            messages: [...prev.messages, message]
          };
        });

        // Также можно обновить список чатов, чтобы поднять активный чат вверх (опционально)
        setChats(prevChats => prevChats.map(c => c.id === selectedChat?.id ? {...c, messages: [...c.messages, message]} : c));
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token, fetchChats, selectedChat?.id]);

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedChat(prev => prev ? { ...prev, messages: response.data } : prev);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  }, [token]);

  const selectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  }, [fetchMessages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(
        `http://localhost:3000/chats/${selectedChat.id}/messages`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socketRef.current?.emit('sendMessage', {
        chatId: selectedChat.id,
        text: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  }, [newMessage, selectedChat, token]);

  if (!token) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Войдите, чтобы просмотреть чаты</Typography>
        <Button href="/login" sx={{ mt: 2 }}>Войти</Button>
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Список чатов */}
      <Paper sx={{ width: 320, overflow: 'auto', borderRadius: 0 }}>
        <List>
          {chats.length === 0 && (
            <ListItem>
              <ListItemText primary="Нет чатов" />
            </ListItem>
          )}
          {chats.map((chat) => {
            // Безопасное получение названия карточки
            const cardTitle = chat.card ? chat.card.title : 'Карточка удалена';

            // Определение собеседника
            const isSeller = user?.id === chat.sellerId;
            const otherUserEmail = isSeller ? chat.buyerEmail : chat.sellerEmail;

            const isSelected = selectedChat?.id === chat.id;

            return (
              <ListItem
                key={chat.id}
                onClick={() => selectChat(chat)}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  py: 2
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {cardTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {otherUserEmail || 'Собеседник'}
                </Typography>
                {chat.isCompleted && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    ✓ Сделка завершена
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Окно чата */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <Paper sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {selectedChat.card ? selectedChat.card.title : 'Чат'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Чат с {user?.id === selectedChat.sellerId ? selectedChat.buyerEmail : selectedChat.sellerEmail}
              </Typography>
            </Paper>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f9f9f9' }}>
              {selectedChat.messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                  <Typography>История сообщений пуста</Typography>
                  <Typography variant="caption">Напишите первое сообщение!</Typography>
                </Box>
              ) : (
                selectedChat.messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: msg.isSystem ? '#f0f0f0' : (msg.senderId === user?.id ? '#1976d2' : '#ffffff'),
                        boxShadow: msg.isSystem ? 'none' : 1
                      }}
                      elevation={msg.isSystem ? 0 : 1}
                    >
                      {!msg.isSystem && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: msg.senderId === user?.id ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                          {msg.senderId === user?.id ? 'Вы' : 'Собеседник'}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{
                          color: msg.isSystem ? 'text.secondary' : (msg.senderId === user?.id ? 'white' : 'text.primary'),
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.text}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: msg.senderId === user?.id ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
            </Box>

            <Paper sx={{ p: 2, display: 'flex', gap: 1, borderTop: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={selectedChat.isCompleted ? "Сделка завершена" : "Введите сообщение..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={selectedChat.isCompleted}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!newMessage.trim() || selectedChat.isCompleted}
              >
                Отправить
              </Button>
            </Paper>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#fafafa' }}>
            <Typography color="text.secondary" variant="h6">Выберите чат слева, чтобы начать общение</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
