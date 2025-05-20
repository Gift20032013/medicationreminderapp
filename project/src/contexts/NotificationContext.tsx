import React, { createContext, useContext, useState, useEffect } from "react";
import { AppNotification } from "../types";
import { generateId } from "../utils/helpers";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    data: Omit<AppNotification, "id" | "time" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load notifications from localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      const storedNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      ) as AppNotification[];
      setNotifications(
        storedNotifications.filter((n) => n.userId === currentUser.id)
      );
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (currentUser) {
      const allNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      ) as AppNotification[];
      const otherNotifications = allNotifications.filter(
        (n) => n.userId !== currentUser.id
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify([...otherNotifications, ...notifications])
      );
    }
  }, [notifications, currentUser]);

  // Request notification permission
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (
    data: Omit<AppNotification, "id" | "time" | "read">
  ) => {
    if (!currentUser) return;

    const newNotification: AppNotification = {
      ...data,
      id: generateId(),
      time: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Show browser notification if permission is granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(data.title, {
        body: data.message,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
