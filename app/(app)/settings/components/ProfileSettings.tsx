"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, User, Lock, Calendar, Weight, Ruler, PersonStanding, Loader } from "lucide-react";

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
        <Loader className="animate-spin text-muted-foreground" />
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
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    dob: "",
    gender: "",
    height: "",
    weight: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch profile", response.statusText);
        }
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

  const handleSelectChange = (id: string, value: string) => {
    setProfile(prev => ({ ...prev, [id]: value }));
  };
  
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not looged in!");
        return;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          dob: profile.dob,
          gender: profile.gender,
          height: Number(profile.height),
          weight: Number(profile.weight),
        }),
      });

      if(!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated succesfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
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
          <img
            src="/assets/Testimonial/michael-b.jpg" // Placeholder image
            alt="Your avatar"
            className="w-20 h-20 rounded-full border-2 p-1"
          />
          <div className="flex gap-2">
            <Button variant="outline" disabled={isLoading}>Change</Button>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isLoading}>Remove</Button>
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
