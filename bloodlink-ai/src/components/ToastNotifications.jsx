/**
 * Toast Notifications Component
 * 
 * Renders notification toasts in the top-right corner.
 * Supports success, warning, and error types.
 */

import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastNotifications() {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type}`}
          onClick={() => dismissNotification(notification.id)}
          role="alert"
        >
          <span className="toast-icon">
            {notification.type === 'success' ? '✅' :
             notification.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <div className="toast-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
