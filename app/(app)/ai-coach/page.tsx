"use client";

import { useState, useEffect } from "react";
import { 
    BrainCircuit, 
    Sparkles, 
    Bot, 
    Zap, 
    Utensils, 
    Dumbbell, 
    ShieldAlert, 
    Send,
    MessageSquare,
    ChevronRight,
    Activity,
    LineChart,
    RefreshCcw,
    HeartPulse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const AI_TOOLS = [
    { id: 'briefing', name: 'Daily Briefing', icon: HeartPulse, color: 'text-rose-500', desc: 'Predictive health analysis' },
    { id: 'fridge', name: 'Smart Fridge', icon: Utensils, color: 'text-amber-500', desc: 'Recipe from your ingredients' },
    { id: 'auditor', name: 'Workout Auditor', icon: Dumbbell, color: 'text-blue-500', desc: 'Optimize training volume' },
    { id: 'recovery', name: 'Recovery Scan', icon: Zap, color: 'text-purple-500', desc: 'Readiness to train score' }
];

// Contextual Templates (The Chips)
const QUICK_CHIPS: Record<string, string[]> = {
    briefing: [
        "What's my main focus today?",
        "Am I ready for a heavy workout?",
        "Summarize my week so far"
    ],
    fridge: [
        "Suggest a high protein dinner",
        "I have chicken and rice, what else?",
        "Quick snack under 200kcal"
    ],
    auditor: [
        "Is my leg volume too low?",
        "Fix my bench press plateau",
        "Suggest a substitute for Squats"
    ],
    recovery: [
        "My lower back feels tight",
        "Stretch routine for hips",
        "Why is my sleep score low?"
    ]
};

export default function AICoachHub() {
    const [activeTool, setActiveTool] = useState('briefing');
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isChatting, setIsChatting] = useState(false);
    
    // AI Data States
    const [briefing, setBriefing] = useState<any>(null);
    const [briefingError, setBriefingError] = useState(false);
    const [auditorData, setAuditorData] = useState<any>(null);
    const [recoveryData, setRecoveryData] = useState<any>(null);
    const [ingredients, setIngredients] = useState("");
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchBriefing = async () => {
        setBriefingError(false);
        try {
            const res = await fetch("/api/ai/briefing");
            if (res.ok) setBriefing(await res.json());
            else setBriefingError(true);
        } catch (e) { setBriefingError(true); }
    };

    const fetchAuditor = async () => {
        if (auditorData) return;
        setIsGenerating(true);
        try {
            const res = await fetch("/api/ai/auditor");
            if (res.ok) setAuditorData(await res.json());
        } catch (e) { }
        setIsGenerating(false);
    };

    const fetchRecovery = async () => {
        if (recoveryData) return;
        setIsGenerating(true);
        try {
            const res = await fetch("/api/ai/recovery");
            if (res.ok) setRecoveryData(await res.json());
        } catch (e) { }
        setIsGenerating(false);
    };

    useEffect(() => {
        if (activeTool === 'auditor') fetchAuditor();
        if (activeTool === 'recovery') fetchRecovery();
    }, [activeTool]);

    useEffect(() => {
        const init = async () => {
            try {
                const [dashRes] = await Promise.all([
                    fetch("/api/stats/dashboard")
                ]);
                
                if (dashRes.ok) {
                    const dData = await dashRes.json();
                    setIsPremium(dData.isPremium);
                }
                await fetchBriefing();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleSendMessage = async (msgOverride?: string) => {
        const text = msgOverride || chatInput;
        if (!text) return;

        const newMsg = { role: 'user' as const, content: text };
        // Create updated history locally to ensure we send the latest state
        const updatedHistory = [...messages, newMsg];
        
        setMessages(updatedHistory);
        setChatInput("");
        setIsChatting(true);

        try {
            // SEND MODE (activeTool) TO BACKEND
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ 
                    message: text, // Fallback
                    messages: updatedHistory,
                    mode: activeTool 
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
            }
        } catch (e) { }
        setIsChatting(false);
    };

    const handleFridgeSuggest = async () => {
        if (!ingredients) return;
        setIsGenerating(true);
        // We can now route this through the main chat for consistency, 
        // or keep the dedicated endpoint if it returns structured JSON recipes.
        // For now, let's assume the dedicated endpoint is for structured cards, 
        // but let's try to ask the Chatbot for a quick suggestion too.
        handleSendMessage(`I have these ingredients: ${ingredients}. Suggest a recipe.`);
        setIsGenerating(false);
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-ping"></div>
                <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col lg:flex-row bg-background overflow-hidden">
            {/* LEFT SIDEBAR: AI TOOLS */}
            {/* Added 'shrink-0' to prevent flex shrinking, and 'scrollbar-hide' class if available or custom css style */}
            <aside className="w-full lg:w-80 shrink-0 border-r border-border bg-muted/30 flex flex-col gap-6 overflow-y-auto z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6">
                <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-xl shadow-primary/30">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none">AI COACH</h1>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Intelligence</span>
                    </div>
                </div>

                <div className="space-y-2 shrink-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-4">Core Intelligence</p>
                    {AI_TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group ${
                                activeTool === tool.id 
                                ? 'bg-card border-primary/20 shadow-lg scale-[1.02]' 
                                : 'bg-transparent border-transparent hover:bg-card/50'
                            }`}
                        >
                            <div className={`p-2.5 rounded-xl bg-card shadow-sm group-hover:scale-110 transition-transform ${tool.color}`}>
                                <tool.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">{tool.name}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{tool.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-border shrink-0">
                    <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl shadow-primary/20">
                        <div className="absolute -top-4 -right-4 opacity-20"><BrainCircuit className="w-24 h-24" /></div>
                        <CardContent className="p-5 relative z-10">
                            <p className="text-xs font-bold mb-1">Weekly Insight</p>
                            <p className="text-[10px] opacity-90 leading-relaxed mb-4">Your cardio consistency is up by 12%. Body recovery is optimal for high intensity today.</p>
                            <Button size="sm" variant="secondary" className="w-full rounded-xl text-[10px] font-black h-8 uppercase tracking-widest">View Full Report</Button>
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* MAIN CONTENT: DYNAMIC VIEW AREA */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                
                <header className="h-20 border-b border-border/50 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Neural Link: Connected</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-muted rounded-xl transition-colors"><RefreshCcw className="w-4 h-4 text-muted-foreground" /></button>
                        <div className="h-8 w-px bg-border mx-2"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-bold">Fitney Brain V2.4</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                    <div className="max-w-4xl mx-auto space-y-8 pb-40">
                        
                        {activeTool === 'briefing' && briefingError && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Intelligence Link Interrupted</h3>
                                <p className="text-muted-foreground max-w-xs">We couldn't reach the AI Brain. This usually happens if the API Key is missing or invalid.</p>
                                <Button onClick={fetchBriefing} variant="outline" className="rounded-full px-8">Retry Connection</Button>
                            </div>
                        )}

                        {activeTool === 'briefing' && !briefing && !briefingError && (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <BrainCircuit className="w-12 h-12 text-primary mb-4" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Synchronizing Health Data...</p>
                            </div>
                        )}

                        {activeTool === 'briefing' && briefing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black mb-2 italic">Morning Intelligence Report</h2>
                                        <p className="text-muted-foreground">{briefing.date} • Predicting your performance peak.</p>
                                    </div>
                                    <div className="bg-primary/10 p-4 rounded-[2rem] border border-primary/20 text-center min-w-[120px]">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Readiness</p>
                                        <p className="text-4xl font-black text-primary">{briefing.readinessScore}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {briefing.signals.map((sig: any, idx: number) => (
                                        <Card key={idx} className="bg-card border-none shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden">
                                            <CardContent className="p-6">
                                                <h3 className={`font-bold flex items-center gap-2 mb-4 ${sig.status === 'critical' ? 'text-rose-500' : 'text-blue-500'}`}>
                                                    {sig.type === 'sleep' ? <HeartPulse className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                    {sig.type.toUpperCase()} Signal
                                                </h3>
                                                <p className="text-sm leading-relaxed text-muted-foreground">{sig.msg}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="p-8 bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-64 h-64" /></div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black mb-4">AI Recommended Strategy</h3>
                                        <ul className="space-y-3">
                                            {briefing.recommendations.map((rec: string, i: number) => (
                                                <li key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                                    <span className="text-sm font-medium">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTool === 'fridge' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 italic">Smart Fridge</h2>
                                    <p className="text-muted-foreground">Turn your leftovers into macro-perfect meals.</p>
                                </div>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        placeholder="Enter ingredients (e.g. Chicken, Spinach, Rice)..."
                                        className="flex-1 p-4 rounded-xl bg-card border border-border"
                                    />
                                    <Button onClick={handleFridgeSuggest} disabled={isGenerating} className="h-auto px-8 rounded-xl">
                                        {isGenerating ? <Bot className="animate-spin" /> : "Generate"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* CHAT MESSAGES DISPLAY */}
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                        : 'bg-card border border-border rounded-tl-none shadow-sm'
                                    }`}>
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm animate-pulse">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeTool === 'auditor' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 italic">Workout Balance Auditor</h2>
                                    <p className="text-muted-foreground">AI scans your exercise variety to detect muscle group neglect.</p>
                                </div>
                                {isGenerating ? (
                                    <div className="py-20 text-center animate-pulse"><BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />Analyzing Muscle Volume...</div>
                                ) : auditorData ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Card className="p-6 bg-card border-none shadow-xl text-center">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Balance Score</p>
                                                <p className="text-5xl font-black text-primary">{auditorData.score}%</p>
                                            </Card>
                                            <Card className="p-6 md:col-span-2 bg-card border-none shadow-xl flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${auditorData.status === 'Balanced' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    <ShieldAlert className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{auditorData.status} Training Pattern</p>
                                                    <p className="text-sm text-muted-foreground">{auditorData.analysis}</p>
                                                </div>
                                            </Card>
                                        </div>
                                        <div className="p-8 bg-primary rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/30">
                                            <h3 className="font-black text-xl mb-2 italic">Coach's Next Recommendation</h3>
                                            <p className="text-lg font-medium opacity-90">{auditorData.suggestion}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Button onClick={fetchAuditor} variant="outline" className="rounded-full px-10">Scan Training Volume</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTool === 'recovery' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 italic">Neural Recovery Scan</h2>
                                    <p className="text-muted-foreground">Evaluating nervous system readiness based on sleep and strain.</p>
                                </div>
                                {isGenerating ? (
                                    <div className="py-20 text-center animate-pulse"><Zap className="w-12 h-12 text-primary mx-auto mb-4" />Scanning Recovery Signals...</div>
                                ) : recoveryData ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative h-64 bg-card rounded-[2.5rem] flex items-center justify-center shadow-xl overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5"></div>
                                                <div className="relative text-center">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Recovery Capacity</p>
                                                    <p className="text-7xl font-black text-primary">{recoveryData.recoveryScore}%</p>
                                                    <p className="mt-2 font-bold text-primary/60 uppercase text-xs tracking-tighter">{recoveryData.status}</p>
                                                </div>
                                            </div>
                                            <Card className="p-8 bg-card border-none shadow-xl flex flex-col justify-center">
                                                <h3 className="font-black text-xl mb-4">Physiological Status</h3>
                                                <p className="text-muted-foreground leading-relaxed italic">"{recoveryData.detail}"</p>
                                                <div className="mt-6 pt-6 border-t border-border">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Action Required</p>
                                                    <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold">{recoveryData.action}</div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Button onClick={fetchRecovery} variant="outline" className="rounded-full px-10">Evaluate Body Readiness</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* BOTTOM CHAT INTERFACE */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-background via-background to-transparent z-30">
                    <div className="max-w-4xl mx-auto relative group">
                        
                        {/* QUICK CHIPS / SUGGESTIONS - DYNAMIC BASED ON ACTIVE TOOL */}
                        <div className="flex justify-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
                            <AnimatePresence mode="wait">
                                {QUICK_CHIPS[activeTool]?.map((chip, idx) => (
                                    <motion.button
                                        key={`${activeTool}-${idx}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleSendMessage(chip)}
                                        className="whitespace-nowrap px-4 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        {activeTool === 'fridge' && <Utensils className="w-3 h-3" />}
                                        {activeTool === 'auditor' && <Dumbbell className="w-3 h-3" />}
                                        {activeTool === 'recovery' && <HeartPulse className="w-3 h-3" />}
                                        {activeTool === 'briefing' && <Sparkles className="w-3 h-3" />}
                                        {chip}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="relative flex items-center gap-4 bg-card border-2 border-border p-2 pl-6 rounded-[2rem] shadow-2xl focus-within:border-primary/50 transition-all"
                        >
                            <Bot className="w-6 h-6 text-primary" />
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={`Ask your ${activeTool === 'briefing' ? 'Coach' : activeTool} anything...`}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-4"
                            />
                            <button 
                                type="submit"
                                disabled={isChatting}
                                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}