// src/components/ui/NewsCard.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NewsItem } from '@/src/interfaces/interfaces';
import moment from 'moment';
import { useAppSelector } from '@/src/store/hooks';
import { useLikeNewsMutation, useDislikeNewsMutation, useViewNewsMutation } from '@/src/api/newsApi';

export default function NewsCard({ item }: { item: NewsItem }) {
  const { theme } = useTheme();
  const userId = useAppSelector((state) => state.auth.currentUser?._id);
  const [like] = useLikeNewsMutation();
  const [dislike] = useDislikeNewsMutation();
  const [view] = useViewNewsMutation();

  const hasViewed = userId ? item.views.includes(userId) : false;
  const hasLiked = userId ? item.likes.includes(userId) : false;
  const hasDisliked = userId ? item.dislikes.includes(userId) : false;

  // Trigger view once when card mounts
  useEffect(() => {
    if (userId && !hasViewed) {
      view(item._id);
    }
  }, [userId, hasViewed, item._id, view]);

  // ... rest of UI (like/dislike buttons)
}