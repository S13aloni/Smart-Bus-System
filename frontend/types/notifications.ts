export interface Notification {
  id: string;
  busId: string;
  routeNumber: string;
  alertType: 'delay' | 'breakdown' | 'emergency' | 'maintenance' | 'traffic' | 'weather';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  timestamp: Date;
  location?: string;
  estimatedResolution?: Date;
  isRead: boolean;
  isActive: boolean;
  autoExpiry: Date; // 1 hour from creation
}

export interface NotificationStats {
  total: number;
  critical: number;
  major: number;
  minor: number;
  unread: number;
}

export type AlertType = Notification['alertType'];
export type Severity = Notification['severity'];
