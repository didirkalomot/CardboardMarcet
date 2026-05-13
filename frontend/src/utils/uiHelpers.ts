import type { CardStatus, User } from '../types';

export const getStatusColor = (status: CardStatus | string) => {
  switch (status) {
    case 'active': return 'success';
    case 'sold': return 'error';
    default: return 'default';
  }
};

export const getStatusText = (status: CardStatus | string) => {
  switch (status) {
    case 'active': return 'В продаже';
    case 'sold': return 'Продано';
    default: return status;
  }
};

export const getRoleColor = (role: User['role']) => {
  switch (role) {
    case 'admin': return 'error';
    case 'moderator': return 'warning';
    case 'verified_seller': return 'primary';
    default: return 'default';
  }
};

export const getRoleLabel = (role: User['role']) => {
  switch (role) {
    case 'admin': return 'Администратор';
    case 'moderator': return 'Модератор';
    case 'verified_seller': return 'Проверенный продавец';
    default: return 'Коллекционер';
  }
};
