"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, User, Lock, Calendar, Weight, Ruler, PersonStanding, Loader } from "lucide-react";
import { fetchWithAuth } from "@/app/lib/fetch-helper";

const SettingsCard = ({
  title,
  description,
  children,
  footer,
  isLoading = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
}) => (
  <div className="bg-card border rounded-xl relative">
    {isLoading && (
      <div className="absolute inset-0 bg-card/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <Loader className="animate-spin text-primary" />
      </div>
    )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    dob: "",
    gender: "",
    height: "",
    weight: "",
    imageUrl: "",
  });
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth('/api/users/profile');
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswords(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await fetchWithAuth("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profile.fullName,
          dob: profile.dob,
          gender: profile.gender,
          height: Number(profile.height),
          weight: Number(profile.weight),
        }),
      });

      toast.success("Profile updated succesfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);

    try {
      // Manual fetch for FormData, fetchWithAuth defaults to JSON
      const res = await fetch("/api/users/profile/photo", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setProfile((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success("Photo updated!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    
    setIsLoading(true);
    try {
        await fetchWithAuth("/api/users/profile/photo", {
            method: "DELETE"
        });
        setProfile(prev => ({ ...prev, imageUrl: "" }));
        toast.success("Photo removed");
    } catch (err) {
        console.error(err);
        toast.error("Failed to remove photo");
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
        toast.error("New passwords do not match");
        return;
    }

    if (passwords.new.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
    }

    setIsUpdatingPassword(true);
    try {
        await fetchWithAuth("/api/auth/update-password", {
            method: "POST",
            body: JSON.stringify({
                currentPassword: passwords.current,
                newPassword: passwords.new
            })
        });
        toast.success("Password updated successfully");
        setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
        toast.error(err.message || "Failed to update password");
    } finally {
        setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Personal Information Card */}
      <SettingsCard
        title="Personal Information"
        description="Update your photo and personal details here."
        footer={<Button className="font-semibold" onClick={handleUpdateProfile} disabled={isLoading}>Update Profile</Button>}
        isLoading={isLoading}
      >
        <div className="flex items-center gap-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            aria-label="Upload profile picture"
          />
          <img
            src={profile.imageUrl || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=random`}
            alt="Your avatar"
            className="w-20 h-20 rounded-full border-2 p-1 object-cover bg-muted"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isLoading}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                disabled={isLoading || !profile.imageUrl}
                onClick={handleRemovePhoto}
            >
                Remove
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-medium">Full Name</Label>
            <InputWithIcon icon={<User size={16} />} id="fullName" value={profile.fullName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email Address</Label>
            <InputWithIcon icon={<Mail size={16} />} id="email" type="email" value={profile.email} onChange={handleInputChange} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob" className="font-medium">Date of Birth</Label>
            <InputWithIcon icon={<Calendar size={16} />} id="dob" type="date" value={profile.dob} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="font-medium">Gender</Label>
            <Select value={profile.gender} onValueChange={(value) => handleSelectChange('gender', value)} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-3 ml-1">
                  <PersonStanding size={16} className="text-muted-foreground" />
                  <SelectValue placeholder="Select gender" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="font-medium">Height (cm)</Label>
            <InputWithIcon icon={<Ruler size={16} />} id="height" type="number" value={profile.height} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="font-medium">Weight (kg)</Label>
            <InputWithIcon icon={<Weight size={16} />} id="weight" type="number" value={profile.weight} onChange={handleInputChange} />
          </div>
        </div>
      </SettingsCard>

      {/* Password Card */}
      <SettingsCard
        title="Password"
        description="Manage your password. A strong password is recommended."
        footer={
            <Button 
                className="font-semibold" 
                onClick={handleUpdatePassword} 
                disabled={isUpdatingPassword || !passwords.current || !passwords.new}
            >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
        }
        isLoading={isUpdatingPassword}
      >
        <div className="space-y-2">
          <Label htmlFor="current">Current Password</Label>
          <InputWithIcon icon={<Lock size={16} />} id="current" type="password" value={passwords.current} onChange={handlePasswordChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <InputWithIcon icon={<Lock size={16} />} id="new" type="password" value={passwords.new} onChange={handlePasswordChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <InputWithIcon icon={<Lock size={16} />} id="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}