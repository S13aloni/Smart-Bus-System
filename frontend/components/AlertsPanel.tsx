'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Bus, Route, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { enhancedDataService, Alert } from '@/lib/enhancedDataService';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateAlerts = () => {
      const currentAlerts = enhancedDataService.getAlerts();
      setAlerts(currentAlerts);
    };

    updateAlerts();
    const interval = setInterval(updateAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass = `h-4 w-4 ${
      severity === 'critical' ? 'text-red-500' :
      severity === 'high' ? 'text-orange-500' :
      severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
    }`;

    switch (type) {
      case 'delay':
        return <Clock className={iconClass} />;
      case 'cancellation':
        return <X className={iconClass} />;
      case 'reschedule':
        return <Route className={iconClass} />;
      case 'congestion':
        return <AlertTriangle className={iconClass} />;
      case 'maintenance':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const resolveAlert = (alertId: string) => {
    enhancedDataService.resolveAlert(alertId);
    setAlerts(enhancedDataService.getAlerts());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const otherAlerts = alerts.filter(alert => alert.severity !== 'critical');

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {alerts.length > 0 && (
              <span className="text-sm text-gray-500">
                {criticalAlerts.length} critical
              </span>
            )}
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {alerts.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-sm text-gray-500">All systems operating normally</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Critical Alerts First */}
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Route {alert.route_id}</span>
                          {alert.bus_id && <span>Bus {alert.bus_id}</span>}
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveAlert(alert.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Other Alerts */}
              {otherAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} hover:bg-gray-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Route {alert.route_id}</span>
                          {alert.bus_id && <span>Bus {alert.bus_id}</span>}
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveAlert(alert.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
