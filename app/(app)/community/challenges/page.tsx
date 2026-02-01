"use client";

import { useEffect, useState } from "react";
import { 
    Trophy, 
    Flame, 
    Users, 
    Plus, 
    Calendar,
    Target,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { getActiveChallenges, joinChallenge, createChallenge } from "@/app/actions/community";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const data = await getActiveChallenges();
            setChallenges(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreating(true);
        const formData = new FormData(e.currentTarget);
        
        const res = await createChallenge(formData);
        if (res.success) {
            toast.success("Challenge Created!");
            loadChallenges();
        } else {
            toast.error("Failed to create challenge");
        }
        setIsCreating(false);
    };

    const handleJoin = async (id: number) => {
        const res = await joinChallenge(id);
        if (res.success) {
            toast.success("Joined Challenge!");
            loadChallenges();
        } else {
            toast.error("Already joined or error");
        }
    };

    return (
        <div className="space-y-8 pb-24">
            {/* HERO HEADER */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white overflow-hidden shadow-xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="w-64 h-64" /></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-md border border-white/20">
                        <Flame className="w-3 h-3 text-yellow-300" />
                        <span>COMMUNITY BATTLES</span>
                    </div>
                    <h1 className="text-4xl font-black mb-2 italic tracking-tight">PUSH YOUR LIMITS</h1>
                    <p className="font-medium opacity-90 max-w-lg mb-8">Join global challenges, compete with friends, and earn exclusive badges. Consistency starts here.</p>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-black rounded-xl">
                                <Plus className="w-5 h-5 mr-2" /> CREATE CHALLENGE
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic">New Challenge</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Challenge Title</Label>
                                    <Input name="title" placeholder="e.g., 100 Pushups Daily" required className="rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select name="type" required>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="frequency">Frequency (Workouts)</SelectItem>
                                                <SelectItem value="distance">Distance (KM)</SelectItem>
                                                <SelectItem value="volume">Volume (KG)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Goal</Label>
                                        <Input name="goalValue" type="number" placeholder="e.g. 100" required className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (Days)</Label>
                                    <Select name="durationDays" defaultValue="7">
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select duration" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Days (Blitz)</SelectItem>
                                            <SelectItem value="7">7 Days (Weekly)</SelectItem>
                                            <SelectItem value="30">30 Days (Monthly)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white" disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Launch Challenge"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* CHALLENGE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge, idx) => (
                    <motion.div 
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="rounded-[2rem] border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden bg-card relative">
                            <div className={`absolute top-0 left-0 w-full h-2 ${
                                challenge.type === 'frequency' ? 'bg-blue-500' : 
                                challenge.type === 'distance' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}></div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${
                                        challenge.type === 'frequency' ? 'bg-blue-500/10 text-blue-500' : 
                                        challenge.type === 'distance' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                        {challenge.type === 'frequency' && <Calendar className="w-6 h-6" />}
                                        {challenge.type === 'distance' && <ArrowRight className="w-6 h-6" />}
                                        {challenge.type === 'volume' && <Target className="w-6 h-6" />}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                        <Users className="w-3 h-3" />
                                        <span>{challenge.participants.length}</span>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black italic mb-1">{challenge.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Goal: <span className="font-bold text-foreground">{challenge.goalValue} {challenge.type === 'distance' ? 'km' : challenge.type === 'volume' ? 'kg' : 'workouts'}</span> 
                                    {' '} • {challenge.durationDays} Days left
                                </p>

                                <div className="flex items-center gap-3">
                                    <Button onClick={() => handleJoin(challenge.id)} className="flex-1 rounded-xl font-bold" variant="outline">
                                        Join Challenge
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
