"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Re-using the SettingsCard structure from ProfileSettings.
// In a real app, this would be a shared component.
const SettingsCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description:string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border rounded-xl">
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState("text-size-md");

  // Effect to set initial font size from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem("font-size") || "text-size-md";
    handleFontSizeChange(savedSize);
  }, []);

  const handleFontSizeChange = (size: string) => {
    document.documentElement.classList.remove("text-size-sm", "text-size-md", "text-size-lg");
    document.documentElement.classList.add(size);
    localStorage.setItem("font-size", size);
    setFontSize(size);
  };

  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "system", label: "System", icon: Laptop },
  ];

  return (
    <div className="space-y-10">
      <SettingsCard
        title="Theme"
        description="Select how you want Fitney to appear. 'System' will match your OS settings."
      >
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${
                theme === t.name
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/50 hover:border-muted-foreground"
              }`}
            >
              <t.icon className="w-7 h-7 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Font Size"
        description="Adjust the text size for better readability across the application."
      >
        <div className="max-w-xs">
          <Label htmlFor="font-size-select" className="sr-only">Font Size</Label>
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger id="font-size-select">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-size-sm">Small</SelectItem>
              <SelectItem value="text-size-md">Medium (Default)</SelectItem>
              <SelectItem value="text-size-lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsCard>
    </div>
  );
}
