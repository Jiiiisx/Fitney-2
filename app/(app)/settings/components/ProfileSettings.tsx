"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock } from "lucide-react";

const SettingsCard = ({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <div className="bg-card border rounded-xl">
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="p-6 space-y-6">{children}</div>
    {footer && (
      <div className="bg-muted/50 px-6 py-4 text-right rounded-b-xl">
        {footer}
      </div>
    )}
  </div>
);

const InputWithIcon = ({ icon, ...props }: { icon: React.ReactNode } & React.ComponentProps<typeof Input>) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
        </div>
        <Input className="pl-10" {...props} />
    </div>
);


export default function ProfileSettings() {
  return (
    <div className="space-y-10">
      {/* Personal Information Card */}
      <SettingsCard
        title="Personal Information"
        description="Update your photo and personal details here."
        footer={<Button className="font-semibold">Update Profile</Button>}
      >
        <div className="flex items-center gap-6">
          <img
            src="/assets/Testimonial/michael-b.jpg" // Placeholder image
            alt="Your avatar"
            className="w-20 h-20 rounded-full border-2 p-1"
          />
          <div className="flex gap-2">
            <Button variant="outline">Change</Button>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">Remove</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-medium">Full Name</Label>
            <InputWithIcon icon={<User size={16} />} id="fullName" defaultValue="Michael B." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email Address</Label>
            <InputWithIcon icon={<Mail size={16} />} id="email" type="email" defaultValue="michael.b@example.com" />
          </div>
        </div>
      </SettingsCard>

      {/* Password Card */}
      <SettingsCard
        title="Password"
        description="Manage your password. A strong password is recommended."
        footer={<Button className="font-semibold">Update Password</Button>}
      >
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <InputWithIcon icon={<Lock size={16} />} id="currentPassword" type="password" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <InputWithIcon icon={<Lock size={16} />} id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <InputWithIcon icon={<Lock size={16} />} id="confirmPassword" type="password" />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
