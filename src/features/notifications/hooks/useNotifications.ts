import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const NOTIFICATIONS_KEY = ['notifications'];

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: (msg: string) => notificationService.sendNotification(msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markReadMutation.mutate,
    sendTest: sendTestMutation.mutate
  };
}
