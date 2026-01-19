"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
        const token = localStorage.getItem("token");
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
        console.error("Failed to mark read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-[380px] border-0 shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Notifications</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
        <CardDescription>You have {unreadCount} unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {loading ? (
              <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
          ) : notifications.length > 0 ? (
            <div className="p-4 space-y-4">
                {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 border-b border-border/50 last:border-0 ${notification.isRead ? 'opacity-60' : ''}`}
                >
                    <span className={`flex h-2 w-2 translate-y-1 rounded-full ${notification.isRead ? 'bg-transparent border border-muted-foreground' : 'bg-sky-500'}`} />
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none capitalize">
                        {notification.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    </div>
                </div>
                ))}
            </div>
          ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                  No notifications yet.
              </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
