"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
  {
    title: "New Achievement Unlocked!",
    description: "You've just earned the 'Early Bird' badge. Keep it up!",
    time: "15 min ago",
  },
  {
    title: "Workout Reminder",
    description: "Your 'Leg Day' workout is scheduled in 1 hour.",
    time: "45 min ago",
  },
  {
    title: "Friend Request",
    description: "Sarah J. wants to connect with you.",
    time: "2 hours ago",
  },
  {
    title: "Weekly Summary Ready",
    description: "Your weekly progress report is now available.",
    time: "1 day ago",
  },
    {
    title: "Goal Achieved!",
    description: "Congratulations! You've completed your goal to run 100km.",
    time: "2 days ago",
  },
];

export function NotificationPopup() {
  return (
    <Card className="w-[380px] border-0 shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Notifications</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
        <CardDescription>You have {notifications.length} unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
