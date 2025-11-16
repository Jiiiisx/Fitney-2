"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  description: string;
  weeks: number;
  schedule: {
    day: number;
    name: string;
    description: string | null;
    exercises: {
      name: string;
      sets: number | null;
      reps: string | null;
      duration_seconds: number | null;
    }[];
  }[];
}

interface WorkoutTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanStarted: () => void;
}

export function WorkoutTemplates({ open, onOpenChange, onPlanStarted }: WorkoutTemplatesProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setSelectedProgram(null);
      setStartError(null);

      async function fetchPrograms() {
        try {
          const response = await fetch('/api/workout-programs');
          if (!response.ok) {
            throw new Error('Failed to fetch workout programs');
          }
          const data = await response.json();
          setPrograms(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
      fetchPrograms();
    }
  }, [open]);

  const handleStartProgram = async () => {
    if (!selectedProgram) return;

    setIsStarting(true);
    setStartError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized. Please log in again.');
      }

      const response = await fetch('/api/users/me/active-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ programId: selectedProgram.id }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to start program.');
      }
      
      onPlanStarted();
      onOpenChange(false);
      
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsStarting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">Loading programs...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    if (selectedProgram) {
      return (
        <div>
          <Button onClick={() => setSelectedProgram(null)} variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Button>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <CardHeader className="px-1">
              <CardTitle>{selectedProgram.name}</CardTitle>
              <CardDescription>{selectedProgram.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <div className="space-y-4">
                <h3 className="font-semibold">Schedule ({selectedProgram.weeks} Week{selectedProgram.weeks > 1 ? 's' : ''}):</h3>
                <ul className="space-y-3">
                  {selectedProgram.schedule.map((day) => (
                    <li key={day.day} className="p-3 border rounded-md bg-gray-50/50">
                      <p className="font-bold">Day {day.day}: {day.name}</p>
                      <p className="text-sm text-gray-500">{day.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {startError && <p className="text-sm text-red-500 mt-4">{startError}</p>}
              <Button onClick={handleStartProgram} disabled={isStarting} className="w-full mt-6">
                {isStarting ? 'Starting...' : 'Start This Program'}
              </Button>
            </CardContent>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
        {programs.map((program) => (
          <Card key={program.id} className="flex flex-col transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-gray-500">
                <p>Duration: {program.weeks} week{program.weeks > 1 ? 's' : ''}</p>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={() => setSelectedProgram(program)} className="w-full">
                View Program
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold">Workout Templates</DialogTitle>
          <DialogDescription>Choose a pre-made plan to kickstart your journey.</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
