import { Notification, NotificationStats, AlertType, Severity } from '@/types/notifications';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private autoExpiryInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSampleData();
    this.startAutoExpiryCheck();
  }

  private initializeSampleData() {
    const now = new Date();
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        busId: 'BUS-001',
        routeNumber: 'Route 42',
        alertType: 'emergency',
        severity: 'critical',
        message: 'Emergency stop activated - passenger medical emergency',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
        location: 'Downtown Station',
        isRead: false,
        isActive: true,
        autoExpiry: new Date(now.getTime() + 55 * 60 * 1000) // 55 minutes from now
      },
      {
        id: '2',
        busId: 'BUS-015',
        routeNumber: 'Route 28',
        alertType: 'breakdown',
        severity: 'major',
        message: 'Engine overheating - bus pulled over for safety',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        location: 'Highway 101, Mile 23',
        estimatedResolution: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
        isRead: false,
        isActive: true,
        autoExpiry: new Date(now.getTime() + 45 * 60 * 1000) // 45 minutes from now
      },
      {
        id: '3',
        busId: 'BUS-007',
        routeNumber: 'Route 15',
        alertType: 'delay',
        severity: 'minor',
        message: 'Traffic congestion causing 10-minute delay',
        timestamp: new Date(now.getTime() - 8 * 60 * 1000), // 8 minutes ago
        location: 'Main Street & 5th Avenue',
        isRead: true,
        isActive: true,
        autoExpiry: new Date(now.getTime() + 52 * 60 * 1000) // 52 minutes from now
      }
    ];

    this.notifications = sampleNotifications;
  }

  private startAutoExpiryCheck() {
    this.autoExpiryInterval = setInterval(() => {
      const now = new Date();
      const initialCount = this.notifications.length;
      
      this.notifications = this.notifications.filter(notification => 
        notification.autoExpiry > now
      );

      if (this.notifications.length !== initialCount) {
        this.notifyListeners();
      }
    }, 1000); // Check every second
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getNotificationStats(): NotificationStats {
    const total = this.notifications.length;
    const critical = this.notifications.filter(n => n.severity === 'critical').length;
    const major = this.notifications.filter(n => n.severity === 'major').length;
    const minor = this.notifications.filter(n => n.severity === 'minor').length;
    const unread = this.notifications.filter(n => !n.isRead).length;

    return { total, critical, major, minor, unread };
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.notifyListeners();
  }

  dismissNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'autoExpiry' | 'isRead' | 'isActive'>) {
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: now,
      autoExpiry: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      isRead: false,
      isActive: true
    };

    this.notifications.unshift(newNotification); // Add to beginning
    this.notifyListeners();
  }

  getSeverityColor(severity: Severity): string {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'major':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'minor':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  }

  getAlertTypeIcon(alertType: AlertType): string {
    switch (alertType) {
      case 'emergency':
        return '🚨';
      case 'breakdown':
        return '🔧';
      case 'delay':
        return '⏰';
      case 'maintenance':
        return '🛠️';
      case 'traffic':
        return '🚦';
      case 'weather':
        return '🌧️';
      default:
        return '📢';
    }
  }

  destroy() {
    if (this.autoExpiryInterval) {
      clearInterval(this.autoExpiryInterval);
    }
  }
}

export const notificationService = new NotificationService();
