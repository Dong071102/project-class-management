import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, description: string) => void;
  removeNotification: (id: number) => void;
}

// Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (title: string, description: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      description,
      date: new Date().toLocaleString(),
    };
    setNotifications((prev) => [...prev, newNotification]);

    // Tự động xóa thông báo sau 5 giây
    setTimeout(() => removeNotification(newNotification.id), 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
