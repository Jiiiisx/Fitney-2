"use client";

import { useEffect, useState, useCallback } from "react";
import { 
    Users, 
    MessageSquare, 
    Layers, 
    ArrowLeft, 
    Loader2, 
    UserPlus, 
    LayoutDashboard,
    Activity,
    TrendingUp,
    Search,
    Shield,
    Trash2,
    MoreVertical,
    ExternalLink,
    Crown,
    Settings,
    FileText,
    Users2,
    Dumbbell,
    Plus,
    Image as ImageIcon,
    Utensils,
    Zap,
    Beef,
    Wheat,
    Droplets,
    AlertTriangle,
    CheckCircle2,
    Megaphone,
    Menu,
    Edit3,
    ChevronLeft,
    ChevronRight,
    Tag,
    Star
} from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#a855f7', '#f97316', '#22c55e'];

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "community" | "exercises" | "nutrition" | "tags">("overview");
    const [data, setData] = useState<any>(null);
    const [userList, setUserList] = useState<any[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [userPage, setUserPage] = useState(1);

    const [tagList, setTagList] = useState<any[]>([]);
    const [totalTags, setTotalTags] = useState(0);
    const [tagPage, setTagPage] = useState(1);
    
    const [exerciseList, setExerciseList] = useState<any[]>([]);
    const [totalExercises, setTotalExercises] = useState(0);
    const [exercisePage, setExercisePage] = useState(1);

    const [foodList, setFoodList] = useState<any[]>([]);
    const [totalFoods, setTotalFoods] = useState(0);
    const [foodPage, setFoodPage] = useState(1);

    const [postList, setPostList] = useState<any[]>([]);
    const [groupList, setGroupList] = useState<any[]>([]);
    const [reportList, setReportList] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [globalSearch, setGlobalSearch] = useState("");
    const [globalResults, setGlobalResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Editing states
    const [editingExercise, setEditingExercise] = useState<any>(null);
    const [editingFood, setEditingFood] = useState<any>(null);

    // Items per page
    const LIMIT = 15;

    // Fetch Overview Stats
    const fetchStats = async () => {
        try {
            const result = await fetchWithAuth("/api/admin/stats");
            setData(result);
            // Also fetch announcements
            const ann = await fetchWithAuth("/api/admin/announcements");
            setAnnouncements(ann);
        } catch (err: any) {
            setError(err.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Users
    const fetchUsers = async (query = "", page = 1) => {
        setContentLoading(true);
        try {
            const offset = (page - 1) * LIMIT;
            const result = await fetchWithAuth(`/api/admin/users?q=${query}&limit=${LIMIT}&offset=${offset}`);
            setUserList(result.data);
            setTotalUsers(result.total);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setContentLoading(false);
        }
    };

    // Fetch Community Content
    const fetchCommunityContent = async () => {
        setContentLoading(true);
        try {
            const results = await Promise.allSettled([
                fetchWithAuth("/api/admin/community/posts"),
                fetchWithAuth("/api/admin/community/groups"),
                fetchWithAuth("/api/admin/community/reports")
            ]);
            
            if (results[0].status === 'fulfilled') setPostList(results[0].value);
            if (results[1].status === 'fulfilled') setGroupList(results[1].value);
            if (results[2].status === 'fulfilled') setReportList(results[2].value);

        } catch (err) {
            toast.error("Failed to load community content");
        } finally {
            setContentLoading(false);
        }
    };

    const handleResolveReport = async (reportId: number, status: string) => {
        try {
            await fetchWithAuth("/api/admin/community/reports", {
                method: "PATCH",
                body: JSON.stringify({ id: reportId, status })
            });
            toast.success(`Report marked as ${status}`);
            fetchCommunityContent();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    // Fetch Exercises
    const fetchExercises = async (query = "", page = 1) => {
        setContentLoading(true);
        try {
            const offset = (page - 1) * LIMIT;
            const [exResult, catResult] = await Promise.all([
                fetchWithAuth(`/api/admin/exercises?q=${query}&limit=${LIMIT}&offset=${offset}`),
                fetchWithAuth("/api/categories")
            ]);
            setExerciseList(exResult.data);
            setTotalExercises(exResult.total);
            setCategories(catResult);
        } catch (err) {
            toast.error("Failed to load exercises");
        } finally {
            setContentLoading(false);
        }
    };

    // Fetch Foods
    const fetchFoods = async (query = "", page = 1) => {
        setContentLoading(true);
        try {
            const offset = (page - 1) * LIMIT;
            const result = await fetchWithAuth(`/api/admin/foods?q=${query}&limit=${LIMIT}&offset=${offset}`);
            setFoodList(result.data);
            setTotalFoods(result.total);
        } catch (err) {
            toast.error("Failed to load foods");
        } finally {
            setContentLoading(false);
        }
    };

    // Fetch Tags
    const fetchTags = async (query = "", page = 1) => {
        setContentLoading(true);
        try {
            const offset = (page - 1) * LIMIT;
            const result = await fetchWithAuth(`/api/admin/tags?q=${query}&limit=${LIMIT}&offset=${offset}`);
            setTagList(result.data);
            setTotalTags(result.total);
        } catch (err) {
            toast.error("Failed to load tags");
        } finally {
            setContentLoading(false);
        }
    };

    const handleToggleFeaturedTag = async (id: number, currentStatus: boolean) => {
        try {
            await fetchWithAuth("/api/admin/tags", {
                method: "PATCH",
                body: JSON.stringify({ id, isFeatured: !currentStatus })
            });
            toast.success(currentStatus ? "Tag unfeatured" : "Tag featured!");
            fetchTags(searchQuery, tagPage);
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleDeleteTag = async (id: number) => {
        if(!confirm("Delete this tag?")) return;
        try {
            await fetchWithAuth(`/api/admin/tags?id=${id}`, { method: "DELETE" });
            toast.success("Tag deleted");
            fetchTags(searchQuery, tagPage);
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const [newExercise, setNewExercise] = useState({ name: "", description: "", categoryId: "", imageUrl: "" });
    const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });

    // Global Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (globalSearch.length > 1) {
                const results = await fetchWithAuth(`/api/admin/search?q=${globalSearch}`);
                setGlobalResults(results);
            } else {
                setGlobalResults(null);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [globalSearch]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers(searchQuery, userPage);
        } else if (activeTab === "community") {
            fetchCommunityContent();
        } else if (activeTab === "exercises") {
            fetchExercises(searchQuery, exercisePage);
        } else if (activeTab === "nutrition") {
            fetchFoods(searchQuery, foodPage);
        } else if (activeTab === "tags") {
            fetchTags(searchQuery, tagPage);
        }
    }, [activeTab, searchQuery, userPage, exercisePage, foodPage, tagPage]);

    const handleUpdateExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth("/api/admin/exercises", {
                method: "PATCH",
                body: JSON.stringify(editingExercise)
            });
            toast.success("Exercise updated");
            setEditingExercise(null);
            fetchExercises(searchQuery, exercisePage);
        } catch (err) {
            toast.error("Failed to update exercise");
        }
    };

    const handleUpdateFood = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth("/api/admin/foods", {
                method: "PATCH",
                body: JSON.stringify(editingFood)
            });
            toast.success("Food item updated");
            setEditingFood(null);
            fetchFoods(searchQuery, foodPage);
        } catch (err) {
            toast.error("Failed to update food");
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await fetchWithAuth(`/api/admin/users/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({ role: newRole })
            });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers(searchQuery);
        } catch (err) {
            toast.error("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId: string, name: string) => {
        if (!confirm(`Permanently delete user "${name}"?`)) return;
        try {
            await fetchWithAuth(`/api/admin/users/${userId}`, { method: "DELETE" });
            toast.success("User removed");
            fetchUsers(searchQuery);
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm("Delete this post permanently?")) return;
        try {
            await fetchWithAuth(`/api/admin/community/posts?id=${postId}`, { method: "DELETE" });
            toast.success("Post removed");
            fetchCommunityContent();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleDeleteGroup = async (groupId: number, name: string) => {
        if (!confirm(`Dissolve group "${name}"?`)) return;
        try {
            await fetchWithAuth(`/api/admin/community/groups?id=${groupId}`, { method: "DELETE" });
            toast.success("Group dissolved");
            fetchCommunityContent();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleCreateExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth("/api/admin/exercises", {
                method: "POST",
                body: JSON.stringify(newExercise)
            });
            toast.success("Exercise added");
            setNewExercise({ name: "", description: "", categoryId: "", imageUrl: "" });
            fetchExercises();
        } catch (err) {
            toast.error("Failed to add exercise");
        }
    };

    const handleDeleteExercise = async (id: number) => {
        if (!confirm("Remove this exercise from database?")) return;
        try {
            await fetchWithAuth(`/api/admin/exercises?id=${id}`, { method: "DELETE" });
            toast.success("Exercise deleted");
            fetchExercises();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleCreateFood = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth("/api/admin/foods", {
                method: "POST",
                body: JSON.stringify(newFood)
            });
            toast.success("Food item added");
            setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
            fetchFoods();
        } catch (err) {
            toast.error("Failed to add food");
        }
    };

    const handleDeleteFood = async (id: number) => {
        if (!confirm("Delete this food item?")) return;
        try {
            await fetchWithAuth(`/api/admin/foods?id=${id}`, { method: "DELETE" });
            toast.success("Food item removed");
            fetchFoods();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleAdjustXP = async (userId: string, currentName: string) => {
        const amount = prompt(`Enter XP amount to award to ${currentName} (e.g. 500):`);
        if (!amount || isNaN(parseInt(amount))) return;

        const reason = prompt("Enter reason (optional):");

        try {
            await fetchWithAuth(`/api/admin/users/${userId}/xp`, {
                method: "PATCH",
                body: JSON.stringify({ amount: parseInt(amount), reason })
            });
            toast.success(`Awarded ${amount} XP to ${currentName}`);
            fetchUsers(searchQuery);
        } catch (err) {
            toast.error("Failed to adjust XP");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">Establishing Admin Session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
                <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
                <p className="text-muted-foreground mb-8 max-w-md">Administrative privileges are required to view this console.</p>
                <Link href="/dashboard">
                    <Button size="lg" className="rounded-full px-10">Return to Safety</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-muted/30 dark:bg-black overflow-hidden font-poppins">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col h-full animate-in slide-in-from-left duration-300">
                         <div className="h-20 px-8 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-xl font-black tracking-tighter block leading-none">FITNEY</span>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Admin Panel</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                            <button onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </button>
                            <button onClick={() => { setActiveTab("users"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <Users className="w-5 h-5" /> User Directory
                            </button>
                            <button onClick={() => { setActiveTab("community"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'community' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <MessageSquare className="w-5 h-5" /> Moderation
                            </button>
                            <button onClick={() => { setActiveTab("exercises"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'exercises' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <Dumbbell className="w-5 h-5" /> Exercises
                            </button>
                            <button onClick={() => { setActiveTab("nutrition"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'nutrition' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <Utensils className="w-5 h-5" /> Nutrition
                            </button>
                            <button onClick={() => { setActiveTab("tags"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'tags' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <Tag className="w-5 h-5" /> Popular Tags
                            </button>
                        </nav>
                        
                        <div className="p-6 border-t border-border/50">
                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                <ArrowLeft className="w-4 h-4" /> Exit to App
                            </Link>
                        </div>
                    </aside>
                </div>
            )}

            {/* Sidebar Navigation (Desktop) */}
            <aside className="w-72 bg-card border-r border-border hidden lg:flex flex-col h-screen sticky top-0">
                <div className="h-20 px-8 border-b border-border/50 flex items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xl font-black tracking-tighter block leading-none">FITNEY</span>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button onClick={() => { setActiveTab("overview"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </button>
                    <button onClick={() => { setActiveTab("users"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <Users className="w-5 h-5" /> User Directory
                    </button>
                    <button onClick={() => { setActiveTab("community"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'community' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <MessageSquare className="w-5 h-5" /> Moderation
                    </button>
                    <button onClick={() => { setActiveTab("exercises"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'exercises' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <Dumbbell className="w-5 h-5" /> Exercises
                    </button>
                    <button onClick={() => { setActiveTab("nutrition"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'nutrition' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <Utensils className="w-5 h-5" /> Nutrition
                    </button>
                    <button onClick={() => { setActiveTab("tags"); setSearchQuery(""); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'tags' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <Tag className="w-5 h-5" /> Popular Tags
                    </button>
                </nav>

                <div className="p-6 border-t border-border/50">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <ArrowLeft className="w-4 h-4" /> Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Global Admin Header */}
                <header className="h-16 lg:h-20 bg-background border-b flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-foreground">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative w-full max-w-xs lg:max-w-md mx-auto lg:mx-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Global system search..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full bg-muted/50 border-none rounded-full pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                        />
                        {/* Global Search Results Dropdown */}
                        {globalResults && (
                            <div className="absolute top-full left-0 w-[500px] bg-card border rounded-2xl mt-2 shadow-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                                {globalResults.users.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Users</p>
                                        {globalResults.users.map((u: any) => (
                                            <div key={u.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-xl transition-all cursor-pointer group" onClick={() => { setActiveTab("users"); setSearchQuery(u.username); setGlobalSearch(""); }}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{u.username.charAt(0)}</div>
                                                    <span className="text-sm font-bold">{u.fullName || u.username}</span>
                                                </div>
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {globalResults.posts.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Posts</p>
                                        {globalResults.posts.map((p: any) => (
                                            <div key={p.id} className="p-2 hover:bg-muted rounded-xl transition-all cursor-pointer group" onClick={() => { setActiveTab("community"); setGlobalSearch(""); }}>
                                                <p className="text-sm line-clamp-1">{p.content}</p>
                                                <p className="text-[10px] text-muted-foreground">by {p.authorUsername}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {globalResults.users.length === 0 && globalResults.posts.length === 0 && globalResults.groups.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground py-4">No results found for "{globalSearch}"</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-foreground">Admin Mode</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Authorized Access</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </header>

                {/* Dynamic View Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
                        
                        {/* VIEW: OVERVIEW */}
                        {activeTab === "overview" && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard title="Active Users" value={data.stats.totalUsers} icon={Users} color="bg-blue-500" />
                                    <StatCard title="Total Posts" value={data.stats.totalPosts} icon={MessageSquare} color="bg-purple-500" />
                                    <StatCard title="Live Groups" value={data.stats.totalGroups} icon={Layers} color="bg-orange-500" />
                                    <StatCard title="Workout Logs" value={data.stats.totalWorkouts} icon={Activity} color="bg-green-500" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* User Growth Chart */}
                                    <div className="lg:col-span-2 bg-card border rounded-[2rem] p-8 shadow-sm">
                                        <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" /> User Acquisition
                                        </h3>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={data.growthData}>
                                                    <defs>
                                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fontWeight: 700 }}
                                                        dy={10}
                                                        tickFormatter={(str) => format(new Date(str), "MMM d")}
                                                    />
                                                    <YAxis 
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fontWeight: 700 }}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="count" 
                                                        stroke="hsl(var(--primary))" 
                                                        strokeWidth={4}
                                                        fillOpacity={1} 
                                                        fill="url(#colorCount)" 
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Content Distribution Pie */}
                                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm flex flex-col">
                                        <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-primary" /> Platform Content
                                        </h3>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.contentStats}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={8}
                                                            dataKey="value"
                                                        >
                                                            {data.contentStats.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-8 space-y-3">
                                                {data.contentStats.map((stat: any, index: number) => (
                                                    <div key={stat.name} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black">{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Announcement Manager */}
                                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm flex flex-col">
                                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                            <Megaphone className="w-5 h-5 text-primary" /> Global Alert
                                        </h3>
                                        <form className="space-y-4 mb-8" onSubmit={async (e) => {
                                            e.preventDefault();
                                            const content = (e.target as any).content.value;
                                            if (!content) return;
                                            await fetchWithAuth("/api/admin/announcements", {
                                                method: "POST",
                                                body: JSON.stringify({ content, type: "info" })
                                            });
                                            (e.target as any).content.value = "";
                                            fetchStats();
                                            toast.success("Announcement posted!");
                                        }}>
                                            <textarea 
                                                name="content"
                                                placeholder="Send a message to all users..."
                                                className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none resize-none"
                                                rows={3}
                                            />
                                            <Button type="submit" className="w-full rounded-2xl font-bold">Post Announcement</Button>
                                        </form>
                                        <div className="space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar">
                                            {announcements.map((a: any) => (
                                                <div key={a.id} className="p-4 bg-muted/30 rounded-2xl flex items-start justify-between group">
                                                    <p className="text-xs font-medium leading-relaxed pr-4">{a.content}</p>
                                                    <button onClick={async () => {
                                                        await fetchWithAuth(`/api/admin/announcements?id=${a.id}`, { method: "DELETE" });
                                                        fetchStats();
                                                        toast.success("Removed");
                                                    }} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 bg-card border rounded-3xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b flex items-center justify-between bg-muted/10">
                                            <h3 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Newest Members</h3>
                                            <button onClick={() => setActiveTab("users")} className="text-xs font-bold text-primary hover:underline">View All Directory</button>
                                        </div>
                                        <div className="p-6 space-y-1">
                                            {data.recentUsers.map((u: any) => (
                                                <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-muted border-2 border-background flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform uppercase">
                                                            {u.username.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{u.fullName || u.username}</p>
                                                            <p className="text-xs text-muted-foreground">@{u.username} • {u.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">{format(new Date(u.createdAt), "MMM d")}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-primary rounded-3xl p-8 text-primary-foreground flex flex-col justify-between shadow-2xl shadow-primary/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-40 h-40" /></div>
                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-black leading-tight">System<br/>Health</h3>
                                            <p className="text-primary-foreground/80 mt-2 text-sm">All services are currently operational and performing optimally.</p>
                                        </div>
                                        <div className="mt-8 space-y-4">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span>Server Load</span>
                                                <span>12%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                <div className="w-[12%] h-full bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: USER DIRECTORY */}
                        {activeTab === "users" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
                                    {/* Table Toolbar */}
                                    <div className="p-6 border-b border-border/50 bg-muted/5 flex items-center justify-between">
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                type="text" 
                                                placeholder="Filter by name, email, role..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted px-3 py-1 rounded-lg">
                                                {userList.length} Total Users
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                                                    <th className="px-8 py-6">User Identity</th>
                                                    <th className="px-8 py-6">Account Role</th>
                                                    <th className="px-8 py-6">Growth Rank</th>
                                                    <th className="px-8 py-6">Subscription Period</th>
                                                    <th className="px-8 py-6">Onboarding</th>
                                                    <th className="px-8 py-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {contentLoading ? (
                                                    <tr><td colSpan={6} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" /></td></tr>
                                                ) : userList.length > 0 ? (
                                                    userList.map((u: any) => (
                                                        <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-background flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                                        {u.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-foreground leading-tight">{u.fullName || u.username}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">@{u.username} • {u.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase border ${
                                                                    u.role === 'admin' 
                                                                        ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' 
                                                                        : u.role === 'elite'
                                                                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                                                            : u.role === 'pro' || u.role === 'premium'
                                                                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                                                : 'bg-muted text-muted-foreground border-border'
                                                                }`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="text-sm font-black">Level {u.level}</div>
                                                                <div className="w-24 h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                                                                    <div className="h-full bg-primary" style={{ width: `${(u.xp % 100)}%` }} />
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                {(u.role === 'pro' || u.role === 'elite' || u.role === 'premium') && u.premiumSince ? (
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Active</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">
                                                                            {format(new Date(u.premiumSince), "MMM d, yy")} - {u.premiumUntil ? format(new Date(u.premiumUntil), "MMM d, yy") : '∞'}
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground opacity-50">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="text-xs font-bold text-muted-foreground">{format(new Date(u.createdAt), "MMM dd, yyyy")}</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className="p-3 hover:bg-muted rounded-2xl transition-all active:scale-90">
                                                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-2">
                                                                        <DropdownMenuItem onClick={() => handleUpdateRole(u.id, "admin")} className="gap-3 py-3 rounded-xl cursor-pointer">
                                                                            <Shield className="w-4 h-4 text-orange-500" /> Make Admin
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleUpdateRole(u.id, "premium")} className="gap-3 py-3 rounded-xl cursor-pointer font-bold text-purple-600">
                                                                            <Crown className="w-4 h-4" /> Set Premium
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleUpdateRole(u.id, "user")} className="gap-3 py-3 rounded-xl cursor-pointer">
                                                                            <Users className="w-4 h-4" /> Set Regular
                                                                        </DropdownMenuItem>
                                                                        <div className="h-px bg-border my-2" />
                                                                        <DropdownMenuItem onClick={() => handleAdjustXP(u.id, u.fullName || u.username)} className="gap-3 py-3 rounded-xl cursor-pointer text-primary font-bold">
                                                                            <Zap className="w-4 h-4" /> Award Bonus XP
                                                                        </DropdownMenuItem>
                                                                        <div className="h-px bg-border my-2" />
                                                                        <DropdownMenuItem onClick={() => handleDeleteUser(u.id, u.fullName || u.username)} className="gap-3 py-3 rounded-xl cursor-pointer text-destructive focus:text-destructive font-bold">
                                                                            <Trash2 className="w-4 h-4" /> Permanently Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={5} className="py-32 text-center text-muted-foreground font-medium italic">No users found matching your search.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="p-6 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Showing {((userPage - 1) * LIMIT) + 1} - {Math.min(userPage * LIMIT, totalUsers)} of {totalUsers} users
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-xl"
                                                disabled={userPage === 1}
                                                onClick={() => setUserPage(p => p - 1)}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {[...Array(Math.ceil(totalUsers / LIMIT))].map((_, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setUserPage(i + 1)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${userPage === i + 1 ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                )).slice(Math.max(0, userPage - 3), Math.min(Math.ceil(totalUsers / LIMIT), userPage + 2))}
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-xl"
                                                disabled={userPage >= Math.ceil(totalUsers / LIMIT)}
                                                onClick={() => setUserPage(p => p + 1)}
                                            >
                                                Next <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: EXERCISES */}
                        {activeTab === "exercises" && (
                            <div className="animate-in fade-in slide-in-from-bottom-1 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                                    {/* Sticky Sidebar Area */}
                                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-2">
                                        {/* Search Exercises */}
                                        <div className="relative w-full">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                type="text" 
                                                placeholder="Search exercises..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-card focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Add Exercise Form */}
                                        <div className="bg-card border rounded-[2rem] p-8 shadow-xl">
                                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                                <Plus className="w-5 h-5 text-primary" /> Add New Movement
                                            </h3>
                                            <form onSubmit={handleCreateExercise} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Exercise Name</label>
                                                    <input 
                                                        required
                                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                                        placeholder="e.g. Diamond Pushups"
                                                        value={newExercise.name}
                                                        onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Category</label>
                                                    <select 
                                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                                        value={newExercise.categoryId}
                                                        onChange={e => setNewExercise({...newExercise, categoryId: e.target.value})}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((c: any) => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Image URL</label>
                                                    <input 
                                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                                        placeholder="https://..."
                                                        value={newExercise.imageUrl}
                                                        onChange={e => setNewExercise({...newExercise, imageUrl: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Instructions</label>
                                                    <textarea 
                                                        rows={4}
                                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none resize-none"
                                                        placeholder="Step by step guide..."
                                                        value={newExercise.description}
                                                        onChange={e => setNewExercise({...newExercise, description: e.target.value})}
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/20">
                                                    Save Exercise
                                                </Button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Exercise List Area */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <div className="bg-card border rounded-[2rem] shadow-xl overflow-hidden">
                                            {/* Header Table (Hidden on Mobile) */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <th className="px-8 py-6">Exercise</th>
                                                            <th className="px-8 py-6">Category</th>
                                                            <th className="px-8 py-6 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        {contentLoading ? (
                                                            <tr><td colSpan={3} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" /></td></tr>
                                                        ) : exerciseList.length > 0 ? (
                                                            exerciseList.map((ex: any) => (
                                                                <tr key={ex.id} className="hover:bg-muted/20 transition-colors group">
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden border-2 border-background flex items-center justify-center shrink-0">
                                                                                {ex.imageUrl ? (
                                                                                    <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-foreground leading-tight">{ex.name}</p>
                                                                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">{ex.description || 'No description provided.'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <span className="text-[10px] px-3 py-1 rounded-lg font-black uppercase bg-primary/10 text-primary border border-primary/20">
                                                                            {ex.categoryName || 'General'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-8 py-6 text-right">
                                                                        <button 
                                                                            onClick={() => handleDeleteExercise(ex.id)}
                                                                            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan={3} className="py-32 text-center text-muted-foreground font-medium italic">No exercises found.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card Layout (Visible on Mobile) */}
                                            <div className="md:hidden divide-y divide-border/50">
                                                {contentLoading ? (
                                                    <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-50" /></div>
                                                ) : exerciseList.length > 0 ? (
                                                    exerciseList.map((ex: any) => (
                                                        <div key={ex.id} className="p-6 space-y-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden border-2 border-background flex items-center justify-center shrink-0 shadow-sm">
                                                                    {ex.imageUrl ? (
                                                                        <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-foreground text-base leading-tight break-words">{ex.name}</p>
                                                                    <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-md font-black uppercase bg-primary/10 text-primary border border-primary/20">
                                                                        {ex.categoryName || 'General'}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDeleteExercise(ex.id)}
                                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic bg-muted/30 p-3 rounded-xl border border-border/50">
                                                                {ex.description || 'No instructions available.'}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-20 text-center text-muted-foreground italic text-sm">No exercises found.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Exercises Pagination */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border rounded-3xl p-6 shadow-sm">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                                Showing {((exercisePage - 1) * LIMIT) + 1} - {Math.min(exercisePage * LIMIT, totalExercises)} of {totalExercises}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl h-10 px-4 font-bold"
                                                    disabled={exercisePage === 1}
                                                    onClick={() => setExercisePage(p => p - 1)}
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                                </Button>
                                                <div className="hidden sm:flex items-center gap-1">
                                                    {[...Array(Math.ceil(totalExercises / LIMIT))].map((_, i) => (
                                                        <button 
                                                            key={i}
                                                            onClick={() => setExercisePage(i + 1)}
                                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${exercisePage === i + 1 ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    )).slice(Math.max(0, exercisePage - 3), Math.min(Math.ceil(totalExercises / LIMIT), exercisePage + 2))}
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl h-10 px-4 font-bold"
                                                    disabled={exercisePage >= Math.ceil(totalExercises / LIMIT)}
                                                    onClick={() => setExercisePage(p => p + 1)}
                                                >
                                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: NUTRITION */}
                        {activeTab === "nutrition" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                                    {/* Sticky Sidebar Area */}
                                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                                        {/* Search Foods */}
                                        <div className="relative w-full">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                type="text" 
                                                placeholder="Search food database..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-card focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Add Food Form */}
                                        <div className="bg-card border rounded-[2rem] p-8 shadow-xl">
                                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                                <Plus className="w-5 h-5 text-primary" /> New Food Entry
                                            </h3>
                                            <form onSubmit={handleCreateFood} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Food Name</label>
                                                    <input 
                                                        required
                                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                                        placeholder="e.g. Chicken Breast"
                                                        value={newFood.name}
                                                        onChange={e => setNewFood({...newFood, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Calories (100g)</label>
                                                        <div className="relative">
                                                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-yellow-500" />
                                                            <input 
                                                                type="number"
                                                                required
                                                                className="w-full bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                                                placeholder="0"
                                                                value={newFood.calories}
                                                                onChange={e => setNewFood({...newFood, calories: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Protein (g)</label>
                                                        <div className="relative">
                                                            <Beef className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-red-500" />
                                                            <input 
                                                                type="number"
                                                                required
                                                                className="w-full bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                                                placeholder="0"
                                                                value={newFood.protein}
                                                                onChange={e => setNewFood({...newFood, protein: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Carbs (g)</label>
                                                        <div className="relative">
                                                            <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-500" />
                                                            <input 
                                                                type="number"
                                                                required
                                                                className="w-full bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                                                placeholder="0"
                                                                value={newFood.carbs}
                                                                onChange={e => setNewFood({...newFood, carbs: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Fat (g)</label>
                                                        <div className="relative">
                                                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500" />
                                                            <input 
                                                                type="number"
                                                                required
                                                                className="w-full bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                                                placeholder="0"
                                                                value={newFood.fat}
                                                                onChange={e => setNewFood({...newFood, fat: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button type="submit" className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/20">
                                                    Save to Database
                                                </Button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Food List Area */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <div className="bg-card border rounded-[2rem] shadow-xl overflow-hidden">
                                            {/* Desktop Table (Hidden on Mobile) */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <th className="px-8 py-6">Food Item</th>
                                                            <th className="px-8 py-6">Calories</th>
                                                            <th className="px-8 py-6">P / C / F (100g)</th>
                                                            <th className="px-8 py-6 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        {contentLoading ? (
                                                            <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" /></td></tr>
                                                        ) : foodList.length > 0 ? (
                                                            foodList.map((food: any) => (
                                                                <tr key={food.id} className="hover:bg-muted/20 transition-colors group">
                                                                    <td className="px-8 py-6">
                                                                        <p className="font-bold text-foreground leading-tight">{food.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Per 100g serving</p>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-black">{Math.round(food.caloriesPer100g)}</span>
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">kcal</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex gap-4">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                                <span className="text-xs font-bold">{Math.round(food.proteinPer100g)}g</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                                <span className="text-xs font-bold">{Math.round(food.carbsPer100g)}g</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                                <span className="text-xs font-bold">{Math.round(food.fatPer100g)}g</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button 
                                                                                onClick={() => setEditingFood(food)}
                                                                                className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                                                                            >
                                                                                <Edit3 className="w-5 h-5" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteFood(food.id)}
                                                                                className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan={4} className="py-32 text-center text-muted-foreground font-medium italic">No food items found.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card Layout (Visible on Mobile) */}
                                            <div className="md:hidden divide-y divide-border/50">
                                                {contentLoading ? (
                                                    <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-50" /></div>
                                                ) : foodList.length > 0 ? (
                                                    foodList.map((food: any) => (
                                                        <div key={food.id} className="p-6 space-y-4">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-bold text-foreground text-base leading-tight break-words">{food.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">Per 100g serving</p>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => setEditingFood(food)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                                                                    <button onClick={() => handleDeleteFood(food.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 flex flex-col items-center justify-center">
                                                                    <span className="text-xl font-black text-neutral-900 dark:text-white">{Math.round(food.caloriesPer100g)}</span>
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Calories</span>
                                                                </div>
                                                                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 flex flex-col gap-1.5">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className="text-[8px] font-black uppercase text-red-500">Prot</span>
                                                                        <span className="text-[10px] font-black">{Math.round(food.proteinPer100g)}g</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className="text-[8px] font-black uppercase text-orange-500">Carb</span>
                                                                        <span className="text-[10px] font-black">{Math.round(food.carbsPer100g)}g</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className="text-[8px] font-black uppercase text-blue-500">Fat</span>
                                                                        <span className="text-[10px] font-black">{Math.round(food.fatPer100g)}g</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-20 text-center text-muted-foreground italic text-sm">No food items found.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nutrition Pagination */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border rounded-3xl p-6 shadow-sm">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                                Showing {((foodPage - 1) * LIMIT) + 1} - {Math.min(foodPage * LIMIT, totalFoods)} of {totalFoods}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl h-10 px-4 font-bold"
                                                    disabled={foodPage === 1}
                                                    onClick={() => setFoodPage(p => p - 1)}
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                                </Button>
                                                <div className="hidden sm:flex items-center gap-1">
                                                    {[...Array(Math.ceil(totalFoods / LIMIT))].map((_, i) => (
                                                        <button 
                                                            key={i}
                                                            onClick={() => setFoodPage(i + 1)}
                                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${foodPage === i + 1 ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    )).slice(Math.max(0, foodPage - 3), Math.min(Math.ceil(totalFoods / LIMIT), foodPage + 2))}
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="rounded-xl h-10 px-4 font-bold"
                                                    disabled={foodPage >= Math.ceil(totalFoods / LIMIT)}
                                                    onClick={() => setFoodPage(p => p + 1)}
                                                >
                                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: TAGS MANAGEMENT */}
                        {activeTab === "tags" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
                                    {/* Table Toolbar */}
                                    <div className="p-6 border-b border-border/50 bg-muted/5 flex items-center justify-between">
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                type="text" 
                                                placeholder="Search tags..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted px-3 py-1 rounded-lg">
                                                {totalTags} Total Tags
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                                                    <th className="px-8 py-6">Hashtag</th>
                                                    <th className="px-8 py-6">Post Volume</th>
                                                    <th className="px-8 py-6">Status</th>
                                                    <th className="px-8 py-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {contentLoading ? (
                                                    <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" /></td></tr>
                                                ) : tagList.length > 0 ? (
                                                    tagList.map((tag: any) => (
                                                        <tr key={tag.id} className="hover:bg-muted/20 transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <span className="font-black text-foreground">#{tag.tag}</span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-2">
                                                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="text-sm font-bold">{tag.postCount}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                {tag.isFeatured ? (
                                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[10px] font-black uppercase tracking-wider">
                                                                        <Star className="w-3 h-3 fill-yellow-600" /> Featured
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Standard</span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button 
                                                                        onClick={() => handleToggleFeaturedTag(tag.id, tag.isFeatured)}
                                                                        className={`p-3 rounded-2xl transition-all ${tag.isFeatured ? 'text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20' : 'text-muted-foreground hover:bg-muted'}`}
                                                                        title={tag.isFeatured ? "Unfeature Tag" : "Feature Tag"}
                                                                    >
                                                                        <Star className={`w-5 h-5 ${tag.isFeatured ? 'fill-yellow-600' : ''}`} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteTag(tag.id)}
                                                                        className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                                                                        title="Delete Tag"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={4} className="py-32 text-center text-muted-foreground font-medium italic">No tags found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    <div className="p-6 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            Page {tagPage} of {Math.ceil(totalTags / LIMIT) || 1}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" disabled={tagPage === 1} onClick={() => setTagPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" disabled={tagPage >= Math.ceil(totalTags / LIMIT)} onClick={() => setTagPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: MODERATION */}
                        {activeTab === "community" && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <Tabs defaultValue="posts" className="w-full">
                                    <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
                                        <TabsTrigger value="posts" className="rounded-xl px-10 h-full font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg flex gap-2">
                                            <FileText className="w-4 h-4" /> User Posts
                                        </TabsTrigger>
                                        <TabsTrigger value="groups" className="rounded-xl px-10 h-full font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg flex gap-2">
                                            <Users2 className="w-4 h-4" /> Active Groups
                                        </TabsTrigger>
                                        <TabsTrigger value="reports" className="rounded-xl px-10 h-full font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg flex gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" /> User Reports
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="reports" className="space-y-6 outline-none">
                                        <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
                                            <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <th className="px-8 py-6">Target</th>
                                                        <th className="px-8 py-6">Reason</th>
                                                        <th className="px-8 py-6">Reporter</th>
                                                        <th className="px-8 py-6">Status</th>
                                                        <th className="px-8 py-6 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {reportList.length > 0 ? (
                                                        reportList.map((report: any) => (
                                                            <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-8 py-6">
                                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-muted border border-border">
                                                                        {report.targetType} #{report.targetId}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <p className="text-sm font-medium text-foreground max-w-xs line-clamp-2">{report.reason}</p>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <p className="text-sm font-bold text-foreground">{report.reporterName || report.reporterUsername}</p>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase border ${
                                                                        report.status === 'pending' 
                                                                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
                                                                            : 'bg-green-500/10 text-green-600 border-green-500/20'
                                                                    }`}>
                                                                        {report.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    {report.status === 'pending' && (
                                                                        <div className="flex justify-end gap-2">
                                                                            <button 
                                                                                onClick={() => handleResolveReport(report.id, "resolved")}
                                                                                className="p-2 text-green-600 hover:bg-green-500/10 rounded-xl transition-all"
                                                                                title="Mark as Resolved"
                                                                            >
                                                                                <CheckCircle2 className="w-5 h-5" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleResolveReport(report.id, "dismissed")}
                                                                                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
                                                                                title="Dismiss Report"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan={5} className="py-32 text-center text-muted-foreground font-medium italic">All quiet! No active reports.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="posts" className="space-y-6 outline-none">
                                        {contentLoading ? (
                                            <div className="py-32 text-center">
                                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" />
                                                <p className="text-muted-foreground mt-4 font-medium">Fetching community posts...</p>
                                            </div>
                                        ) : postList.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {postList.map((post: any) => (
                                                    <div key={post.id} className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                                                        <button 
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                                {post.authorUsername?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold">{post.authorName || post.authorUsername || 'Deleted User'}</p>
                                                                <p className="text-[10px] text-muted-foreground">{format(new Date(post.createdAt), "MMM d, HH:mm")}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed mb-4 italic">"{post.content || 'Media content'}"</p>
                                                        <div className="flex justify-end">
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded tracking-widest">Post ID: #{post.id}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-32 text-center border-2 border-dashed rounded-[2rem]">
                                                <p className="text-muted-foreground font-medium italic">No community posts found.</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="groups" className="space-y-6 outline-none">
                                        <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
                                            <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <th className="px-8 py-6">Group Name</th>
                                                        <th className="px-8 py-6">Participants</th>
                                                        <th className="px-8 py-6">Owner</th>
                                                        <th className="px-8 py-6">Founded</th>
                                                        <th className="px-8 py-6 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {groupList.map((group: any) => (
                                                        <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-8 py-6">
                                                                <p className="font-bold text-foreground leading-tight">{group.name}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-1">{group.description || 'No description'}</p>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{group.memberCount}</div>
                                                                    <span className="text-xs font-bold text-muted-foreground">Members</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-sm font-bold text-foreground">{group.creatorName || 'System'}</p>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="text-xs font-bold text-muted-foreground">{format(new Date(group.createdAt), "MMM d, yyyy")}</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <button 
                                                                    onClick={() => handleDeleteGroup(group.id, group.name)}
                                                                    className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                    </div>
                </div>

                {/* EDIT EXERCISE DIALOG */}
                <Dialog open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black">Edit Movement</DialogTitle>
                        </DialogHeader>
                        {editingExercise && (
                            <form onSubmit={handleUpdateExercise} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Name</label>
                                    <input 
                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                        value={editingExercise.name}
                                        onChange={e => setEditingExercise({...editingExercise, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Category</label>
                                    <select 
                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                        value={editingExercise.categoryId || ""}
                                        onChange={e => setEditingExercise({...editingExercise, categoryId: e.target.value})}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Image URL</label>
                                    <input 
                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                        value={editingExercise.imageUrl || ""}
                                        onChange={e => setEditingExercise({...editingExercise, imageUrl: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Description</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none resize-none"
                                        value={editingExercise.description || ""}
                                        onChange={e => setEditingExercise({...editingExercise, description: e.target.value})}
                                    />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingExercise(null)}>Cancel</Button>
                                    <Button type="submit" className="rounded-xl px-8">Save Changes</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* EDIT FOOD DIALOG */}
                <Dialog open={!!editingFood} onOpenChange={(open) => !open && setEditingFood(null)}>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black">Edit Nutrition Data</DialogTitle>
                        </DialogHeader>
                        {editingFood && (
                            <form onSubmit={handleUpdateFood} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Food Name</label>
                                    <input 
                                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                        value={editingFood.name}
                                        onChange={e => setEditingFood({...editingFood, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Calories</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={editingFood.caloriesPer100g}
                                            onChange={e => setEditingFood({...editingFood, calories: e.target.value, caloriesPer100g: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Protein (g)</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={editingFood.proteinPer100g}
                                            onChange={e => setEditingFood({...editingFood, protein: e.target.value, proteinPer100g: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Carbs (g)</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={editingFood.carbsPer100g}
                                            onChange={e => setEditingFood({...editingFood, carbs: e.target.value, carbsPer100g: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Fat (g)</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={editingFood.fatPer100g}
                                            onChange={e => setEditingFood({...editingFood, fat: e.target.value, fatPer100g: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingFood(null)}>Cancel</Button>
                                    <Button type="submit" className="rounded-xl px-8">Save Changes</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
