"use client";

import { useState, useEffect, useRef } from "react";
import { 
    BrainCircuit, 
    Sparkles, 
    Bot, 
    Zap, 
    Utensils, 
    Dumbbell, 
    ShieldAlert, 
    Send,
    Activity,
    RefreshCcw,
    HeartPulse,
    X,
    Plus,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";

const AI_TOOLS = [
    { id: 'briefing', name: 'Daily Briefing', icon: HeartPulse, color: 'text-rose-500', desc: 'Predictive health analysis' },
    { id: 'fridge', name: 'Smart Fridge', icon: Utensils, color: 'text-amber-500', desc: 'Recipe from your ingredients' },
    { id: 'auditor', name: 'Workout Auditor', icon: Dumbbell, color: 'text-blue-500', desc: 'Optimize training volume' },
    { id: 'recovery', name: 'Recovery Scan', icon: Zap, color: 'text-purple-500', desc: 'Readiness to train score' }
];

const QUICK_CHIPS: Record<string, string[]> = {
    briefing: [
        "What's my main focus today?",
        "Am I ready for a heavy workout?",
        "Summarize my week so far"
    ],
    fridge: [
        "Suggest a high protein dinner",
        "Quick snack under 200kcal",
        "Meal prep ideas for 3 days"
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
    const [loading, setLoading] = useState(true);
    const [isChatting, setIsChatting] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    // AI Data States
    const [briefing, setBriefing] = useState<any>(null);
    const [briefingError, setBriefingError] = useState(false);
    const [auditorData, setAuditorData] = useState<any>(null);
    const [recoveryData, setRecoveryData] = useState<any>(null);
    
    // Smart Fridge Tags State
    const [ingredientTags, setIngredientTags] = useState<string[]>([]);
    const [ingredientInput, setIngredientInput] = useState("");
    
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isChatting]);

    // --- FETCHING LOGIC ---
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
                await fetchBriefing();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // --- CHAT LOGIC ---
    const handleSendMessage = async (msgOverride?: string) => {
        const text = msgOverride || chatInput;
        if (!text) return;

        const newMsg = { role: 'user' as const, content: text };
        const updatedHistory = [...messages, newMsg];
        
        setMessages(updatedHistory);
        setChatInput("");
        setIsChatting(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ 
                    message: text,
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

    // --- FRIDGE TAG LOGIC ---
    const addIngredientTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && ingredientInput.trim()) {
            e.preventDefault();
            if (!ingredientTags.includes(ingredientInput.trim())) {
                setIngredientTags([...ingredientTags, ingredientInput.trim()]);
            }
            setIngredientInput("");
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setIngredientTags(ingredientTags.filter(tag => tag !== tagToRemove));
    };

    const handleFridgeGenerate = () => {
        if (ingredientTags.length === 0) return;
        const prompt = `I have these ingredients: ${ingredientTags.join(", ")}. Suggest a recipe.`;
        handleSendMessage(prompt);
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
            {/* LEFT SIDEBAR */}
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

            {/* MAIN CONTENT */}
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

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10 scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-8 pb-40">
                        
                        {/* 1. DAILY BRIEFING VIEW */}
                        {activeTool === 'briefing' && briefing && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
                                            <div className={`absolute top-0 left-0 w-1 h-full ${sig.status === 'critical' ? 'bg-rose-500' : sig.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                            <CardContent className="p-6">
                                                <h3 className={`font-bold flex items-center gap-2 mb-4 ${sig.status === 'critical' ? 'text-rose-500' : sig.status === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
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
                                                    <span className="text-sm font-medium">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. SMART FRIDGE VIEW */}
                        {activeTool === 'fridge' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                                        <Utensils className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic">Smart Fridge</h2>
                                    <p className="text-muted-foreground">What's in your kitchen? Let AI handle the macros.</p>
                                </div>
                                
                                <Card className="p-2 border-2 border-border/60 shadow-xl rounded-[1.5rem] bg-card/50 backdrop-blur-sm">
                                    <div className="flex flex-wrap gap-2 p-2 min-h-[3rem] items-center">
                                        <AnimatePresence>
                                            {ingredientTags.map((tag, i) => (
                                                <motion.div 
                                                    key={tag}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                    className="pl-3 pr-2 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-xl flex items-center gap-1 group"
                                                >
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="p-0.5 hover:bg-primary/20 rounded-full transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <input 
                                            type="text" 
                                            value={ingredientInput}
                                            onChange={(e) => setIngredientInput(e.target.value)}
                                            onKeyDown={addIngredientTag}
                                            placeholder={ingredientTags.length > 0 ? "Add another..." : "Type ingredient and hit Enter (e.g. Chicken, Rice)..."}
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium p-2 min-w-[150px]"
                                        />
                                    </div>
                                    <div className="p-2 border-t border-border/50 flex justify-end">
                                        <Button 
                                            onClick={handleFridgeGenerate} 
                                            disabled={ingredientTags.length === 0 || isChatting} 
                                            className="rounded-xl px-6 font-bold"
                                        >
                                            {isChatting ? <Bot className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            Generate Recipe
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* 3. WORKOUT AUDITOR V2 (Muscle Balance) */}
                        {activeTool === 'auditor' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 italic">Muscle Variety Audit</h2>
                                    <p className="text-muted-foreground">Detecting muscle group neglect from your last 14 days.</p>
                                </div>
                                {isGenerating ? (
                                    <div className="py-20 text-center animate-pulse"><BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />Analyzing Biomechanics...</div>
                                ) : auditorData ? (
                                    <div className="space-y-8">
                                        {/* Muscle Balance Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {auditorData.muscleBalance?.map((m: any) => (
                                                <Card key={m.muscle} className="p-4 bg-card/50 border-border/40 overflow-hidden relative">
                                                    <div 
                                                        className="absolute bottom-0 left-0 h-1 bg-primary/40 transition-all duration-1000" 
                                                        style={{ width: `${m.score}%` }}
                                                    ></div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{m.muscle}</p>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-2xl font-black">{m.score}%</p>
                                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${m.score > 70 ? 'bg-green-500/10 text-green-500' : m.score < 30 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            {m.score > 70 ? 'OPTIMAL' : m.score < 30 ? 'NEGLECTED' : 'FAIR'}
                                                        </span>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Card className="p-6 bg-card border-none shadow-xl text-center">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Symmetry Score</p>
                                                <p className="text-5xl font-black text-primary">{auditorData.score}%</p>
                                            </Card>
                                            <Card className="p-6 md:col-span-2 bg-card border-none shadow-xl flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${auditorData.status.includes('Balanced') ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    <ShieldAlert className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{auditorData.status}</p>
                                                    <p className="text-sm text-muted-foreground">{auditorData.analysis}</p>
                                                </div>
                                            </Card>
                                        </div>

                                        <div className="p-8 bg-primary rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/30">
                                            <h3 className="font-black text-xl mb-2 italic">Training Tip</h3>
                                            <p className="text-lg font-medium opacity-90">{auditorData.suggestion}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Button onClick={fetchAuditor} variant="outline" className="rounded-full px-10">Start Biomechanical Audit</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* 4. RECOVERY SCAN V2 (CNS Fatigue & Injury Risk) */}
                        {activeTool === 'recovery' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 italic">Neural Recovery & Injury Risk</h2>
                                    <p className="text-muted-foreground">Monitoring central nervous system strain to prevent burnout.</p>
                                </div>
                                {isGenerating ? (
                                    <div className="py-20 text-center animate-pulse"><Zap className="w-12 h-12 text-primary mx-auto mb-4" />Scanning Neural Signals...</div>
                                ) : recoveryData ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="p-8 bg-card border-none shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="w-32 h-32" /></div>
                                                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">Physiological Load</h3>
                                                
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-xs font-bold uppercase">CNS Fatigue</span>
                                                            <span className="text-xs font-black">{recoveryData.cnsFatigue}%</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }} 
                                                                animate={{ width: `${recoveryData.cnsFatigue}%` }}
                                                                className={`h-full ${recoveryData.cnsFatigue > 70 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                            ></motion.div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-xs font-bold uppercase">Injury Risk</span>
                                                            <span className="text-xs font-black">{recoveryData.injuryRisk}%</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }} 
                                                                animate={{ width: `${recoveryData.injuryRisk}%` }}
                                                                className={`h-full ${recoveryData.injuryRisk > 60 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                            ></motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                            <Card className="p-8 bg-card border-none shadow-xl flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-4">
                                                    {recoveryData.injuryRisk > 50 ? <AlertTriangle className="w-6 h-6 text-orange-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                                    <h3 className="font-black text-xl">{recoveryData.status}</h3>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed italic mb-6">"{recoveryData.detail}"</p>
                                                <div className="pt-6 border-t border-border">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Action Recommendation</p>
                                                    <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold">{recoveryData.action}</div>
                                                </div>
                                            </Card>
                                        </div>

                                        <div className="p-8 bg-amber-500/10 border-2 border-amber-500/20 rounded-[2.5rem] flex items-start gap-4">
                                            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="font-black text-amber-500 uppercase text-xs tracking-widest mb-1">Injury Prevention Tip</p>
                                                <p className="text-lg font-bold text-foreground/80 leading-tight">{recoveryData.preventionTip}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Button onClick={fetchRecovery} variant="outline" className="rounded-full px-10">Evaluate Body Readiness</Button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* --- CHAT MESSAGES --- */}
                        <div className="space-y-4 pt-8 border-t border-border/30">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                        : 'bg-card border border-border/60 rounded-tl-none shadow-sm backdrop-blur-md'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <Typewriter text={msg.content} speed={10} className="text-sm font-medium leading-relaxed" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm animate-pulse flex items-center gap-2">
                                        <Bot className="w-4 h-4 text-muted-foreground" />
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* BOTTOM INPUT AREA */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-background via-background/95 to-transparent z-30">
                    <div className="max-w-4xl mx-auto relative group">
                        
                        {/* QUICK CHIPS */}
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

                        <div className="absolute inset-0 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity bg-primary/20"></div>
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
                                className="w-12 h-12 text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 bg-primary shadow-primary/30"
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