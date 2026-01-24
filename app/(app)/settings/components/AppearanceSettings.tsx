"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Ruler, Weight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { fetchWithAuth } from "@/app/lib/fetch-helper";

const SettingsCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
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
  const [units, setUnits] = useState("metric");
  const [loading, setLoading] = useState(true);

  // Apply font size class to document root
  const applyFontSize = useCallback((size: string) => {
    document.documentElement.classList.remove("text-size-sm", "text-size-md", "text-size-lg");
    document.documentElement.classList.add(size);
    setFontSize(size);
  }, []);

  // Fetch initial settings from DB
  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await fetchWithAuth("/api/users/settings");
        
        // Sync DB settings with local state
        if (data.theme) setTheme(data.theme);
        if (data.measurementUnits) setUnits(data.measurementUnits);
        if (data.fontSize) {
            applyFontSize(data.fontSize);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [setTheme, applyFontSize]);

  const updateSettings = async (updates: any) => {
    try {
      await fetchWithAuth("/api/users/settings", {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error("Failed to update settings", error);
      toast.error("Failed to save settings");
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const handleUnitChange = (newUnit: string) => {
    setUnits(newUnit);
    updateSettings({ measurementUnits: newUnit });
    toast.success(`Units updated to ${newUnit === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}`);
  };

  const handleFontSizeChange = (size: string) => {
    applyFontSize(size);
    updateSettings({ fontSize: size });
  };

  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "system", label: "System", icon: Laptop },
  ];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading appearance settings...</div>;
  }

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
              onClick={() => handleThemeChange(t.name)}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${theme === t.name
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
        title="Measurement Units"
        description="Choose your preferred system of measurement for weight and height."
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleUnitChange("metric")}
            className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${units === "metric"
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50 hover:border-muted-foreground"
              }`}
          >
            <div className="flex gap-2">
              <Weight className="w-5 h-5" />
              <Ruler className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block font-semibold text-sm text-foreground">Metric</span>
              <span className="text-xs text-muted-foreground">kg, cm, ml</span>
            </div>
          </button>

          <button
            onClick={() => handleUnitChange("imperial")}
            className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${units === "imperial"
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50 hover:border-muted-foreground"
              }`}
          >
            <div className="flex gap-2">
              <Weight className="w-5 h-5" />
              <Ruler className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block font-semibold text-sm text-foreground">Imperial</span>
              <span className="text-xs text-muted-foreground">lbs, ft/in, oz</span>
            </div>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Font Size"
        description="Adjust the text size for better readability across the application."
      >
        <div className="max-w-xs">
          <Label htmlFor="font-size-select" className="sr-only">Font Size</Label>
          <Select value={fontSize} onValueChange={(val) => handleFontSizeChange(val)}>
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