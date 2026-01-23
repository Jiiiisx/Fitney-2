"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, Heart, MessageSquare, UserPlus, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  message: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
  sender?: {
      id: string;
      username: string;
      fullName: string | null;
      imageUrl: string | null;
  }
}

export function NotificationPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
      // Mark as read in DB
      if (!notification.isRead) {
          try {
              const token = localStorage.getItem("token");
              await fetch("/api/notifications", {
                  method: "PATCH",
                  headers: { 
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}` 
                  },
                  body: JSON.stringify({ notificationId: notification.id })
              });
              // Local update
              setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
          } catch (e) {}
      }

      // Navigate
      if (notification.linkUrl) {
          router.push(notification.linkUrl);
      }
  };

  const markAllAsRead = async () => {
    try {
        const token = localStorage.getItem("token");
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ all: true })
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
        console.error("Failed to mark read", error);
    }
  };

  const getIcon = (type: string) => {
      switch (type) {
          case 'like': return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
          case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500 fill-blue-500" />;
          case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
          default: return <Bell className="w-4 h-4 text-primary" />;
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-[400px] border border-border shadow-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Notifications</CardTitle>
          {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
          )}
        </div>
        <CardDescription>
            {unreadCount > 0 
                ? `You have ${unreadCount} new interactions.` 
                : "You're all caught up!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading your updates...</p>
              </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-border">
                {notifications.map((notification) => (
                <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors relative ${!notification.isRead ? 'bg-primary/5' : ''}`}
                >
                    <div className="relative">
                        <Avatar className="h-11 w-11 border border-border">
                            <AvatarImage src={notification.sender?.imageUrl || ""} />
                            <AvatarFallback className="bg-muted text-xs">
                                {notification.sender?.username?.slice(0, 2).toUpperCase() || <Bell className="w-4 h-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border">
                            {getIcon(notification.type)}
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                        <p className="text-sm leading-snug">
                            <span className="font-bold text-foreground">
                                {notification.sender?.fullName || notification.sender?.username || "System"}
                            </span>{" "}
                            <span className="text-muted-foreground">{notification.message}</span>
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>

                    {!notification.isRead && (
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                    )}
                </div>
                ))}
            </div>
          ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When someone interacts with you, it will show up here.</p>
              </div>
          )}
        </ScrollArea>
      </CardContent>
      {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/10 text-center">
              <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                  View all notifications
              </Button>
          </div>
      )}
    </Card>
  );
}
