import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
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

interface Chat {
  id: string;
  cardId: string;
  cardTitle: string;
  sellerId: string;
  sellerEmail: string;
  buyerId: string;
  buyerEmail: string;
  messages: Message[];
  isCompleted?: boolean;
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
        headers: { Authorization: `Bearer ${token}` }
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
        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message]
        } : prev);
      });
      
      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token, fetchChats]);

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
            const otherUser = user?.id === chat.sellerId ? chat.buyerEmail : chat.sellerEmail;
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
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {chat.cardTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {otherUser}
                </Typography>
                {chat.isCompleted && (
                  <Typography variant="caption" color="success.main">
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
            <Paper sx={{ p: 2, borderRadius: 0 }}>
              <Typography variant="h6">{selectedChat.cardTitle}</Typography>
              <Typography variant="caption">
                Чат с {user?.id === selectedChat.sellerId ? selectedChat.buyerEmail : selectedChat.sellerEmail}
              </Typography>
            </Paper>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {selectedChat.messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper sx={{ p: 1, maxWidth: '70%', bgcolor: msg.isSystem ? '#f5f5f5' : (msg.senderId === user?.id ? '#1976d2' : '#e0e0e0') }}>
                    {!msg.isSystem && (
                      <Typography variant="caption" color="text.secondary">
                        {msg.senderId === user?.id ? 'Вы' : 'Собеседник'}
                      </Typography>
                    )}
                    <Typography color={msg.isSystem ? 'text.secondary' : (msg.senderId === user?.id ? 'white' : 'text.primary')}>
                      {msg.text}
                    </Typography>
                    <Typography variant="caption" color={msg.senderId === user?.id ? 'white' : 'text.secondary'}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            
            <Paper sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={selectedChat.isCompleted}
              />
              <Button variant="contained" onClick={sendMessage} disabled={selectedChat.isCompleted}>
                Отправить
              </Button>
            </Paper>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">Выберите чат</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};