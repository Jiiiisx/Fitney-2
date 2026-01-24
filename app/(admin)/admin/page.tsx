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
    Image as ImageIcon
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "community" | "exercises">("overview");
    const [data, setData] = useState<any>(null);
    const [userList, setUserList] = useState<any[]>([]);
    const [postList, setPostList] = useState<any[]>([]);
    const [groupList, setGroupList] = useState<any[]>([]);
    const [exerciseList, setExerciseList] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [globalSearch, setGlobalSearch] = useState("");
    const [globalResults, setGlobalResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states for new exercise
    const [newExercise, setNewExercise] = useState({ name: "", description: "", categoryId: "", imageUrl: "" });

    // Fetch Overview Stats
    const fetchStats = async () => {
        try {
            const result = await fetchWithAuth("/api/admin/stats");
            setData(result);
        } catch (err: any) {
            setError(err.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Users
    const fetchUsers = async (query = "") => {
        setContentLoading(true);
        try {
            const result = await fetchWithAuth(`/api/admin/users?q=${query}`);
            setUserList(result);
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
            const [posts, groups] = await Promise.all([
                fetchWithAuth("/api/admin/community/posts"),
                fetchWithAuth("/api/admin/community/groups")
            ]);
            setPostList(posts);
            setGroupList(groups);
        } catch (err) {
            toast.error("Failed to load community content");
        } finally {
            setContentLoading(false);
        }
    };

    // Fetch Exercises
    const fetchExercises = async (query = "") => {
        setContentLoading(true);
        try {
            const [exResult, catResult] = await Promise.all([
                fetchWithAuth(`/api/admin/exercises?q=${query}`),
                fetchWithAuth("/api/categories")
            ]);
            setExerciseList(exResult);
            setCategories(catResult);
        } catch (err) {
            toast.error("Failed to load exercises");
        } finally {
            setContentLoading(false);
        }
    };

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
            fetchUsers(searchQuery);
        } else if (activeTab === "community") {
            fetchCommunityContent();
        } else if (activeTab === "exercises") {
            fetchExercises(searchQuery);
        }
    }, [activeTab, searchQuery]);

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
            {/* Sidebar Navigation */}
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
                <header className="h-20 bg-background border-b flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="relative w-96">
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
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-40 h-40" /></div>
                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-black leading-tight">Growth<br/>Momentum</h3>
                                            <p className="text-primary-foreground/80 mt-2 text-sm">Application engagement is up by 12% this week.</p>
                                        </div>
                                        <Link href="/dashboard" className="mt-8">
                                            <Button variant="secondary" className="w-full rounded-2xl font-bold py-6">Check Full Reports</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: USER DIRECTORY */}
                        {activeTab === "users" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-end justify-start gap-6">
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input 
                                            type="text" 
                                            placeholder="Filter by name, email, role..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-card focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-muted/50 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                                                    <th className="px-8 py-6">User Identity</th>
                                                    <th className="px-8 py-6">Account Role</th>
                                                    <th className="px-8 py-6">Growth Rank</th>
                                                    <th className="px-8 py-6">Onboarding</th>
                                                    <th className="px-8 py-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {contentLoading ? (
                                                    <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" /></td></tr>
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
                                                                        : u.role === 'premium'
                                                                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
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
                                </div>
                            </div>
                        )}

                        {/* VIEW: EXERCISES */}
                        {activeTab === "exercises" && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-end justify-start gap-6">
                                    <div className="flex gap-4">
                                        <div className="relative w-full md:w-80">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                type="text" 
                                                placeholder="Search exercises..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-card focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    {/* Add Exercise Form */}
                                    <div className="bg-card border rounded-[2rem] p-8 shadow-xl h-fit sticky top-28 lg:col-span-1">
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

                                    {/* Exercise List Table */}
                                    <div className="lg:col-span-3 bg-card border rounded-[2rem] shadow-xl overflow-hidden">
                                        <div className="overflow-x-auto">
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
                                    </TabsList>

                                    <TabsContent value="posts" className="space-y-6 outline-none">
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
                                                            <p className="text-xs font-bold">{post.authorName || 'Deleted User'}</p>
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
                                    </TabsContent>

                                    <TabsContent value="groups" className="space-y-6 outline-none">
                                        <div className="bg-card border rounded-[2rem] shadow-xl shadow-muted/50 overflow-hidden">
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
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
