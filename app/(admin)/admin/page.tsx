"use client";

import { useEffect, useState } from "react";
import { 
    Users, 
    MessageSquare, 
    Layers, 
    TrendingUp, 
    ArrowLeft, 
    Loader2, 
    UserPlus, 
    LayoutDashboard,
    Activity
} from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import { format } from "date-fns";

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
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Authenticating Admin...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6 max-w-md">
                    You do not have permission to view this page. If you believe this is an error, please contact the system administrator.
                </p>
                <Link href="/dashboard">
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    const stats = data.stats;

    return (
        <div className="min-h-screen bg-muted/30 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-primary" />
                            Admin Console
                        </h1>
                        <p className="text-muted-foreground mt-1">Global overview of Fitney's platform activity.</p>
                    </div>
                    <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                        View App <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Users" 
                        value={stats.totalUsers} 
                        icon={Users} 
                        color="bg-blue-500" 
                    />
                    <StatCard 
                        title="Total Posts" 
                        value={stats.totalPosts} 
                        icon={MessageSquare} 
                        color="bg-purple-500" 
                    />
                    <StatCard 
                        title="Community Groups" 
                        value={stats.totalGroups} 
                        icon={Layers} 
                        color="bg-orange-500" 
                    />
                    <StatCard 
                        title="Workouts Logged" 
                        value={stats.totalWorkouts} 
                        icon={Activity} 
                        color="bg-green-500" 
                    />
                </div>

                {/* Recent Activity Table */}
                <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between bg-muted/10">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Recent Users
                        </h3>
                        <button className="text-xs font-semibold text-primary hover:underline">View All Users</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.recentUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {user.fullName || user.username}
                                            <p className="text-[10px] text-muted-foreground font-normal">@{user.username}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            <span className="text-xs font-medium text-foreground">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
