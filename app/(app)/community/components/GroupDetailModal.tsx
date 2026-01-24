"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { User, Shield, UserMinus, Loader2, Info, Camera, Pencil, LogOut, Search, MoreVertical, Plus, Check, ArrowLeft } from "lucide-react";
import { useGroupMembers, kickMember, addMember, useFriends } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GroupDetailModal({ 
    children, 
    group 
}: { 
    children: React.ReactNode; 
    group: any; // Group Object
}) {
  const { members, isLoading, mutate } = useGroupMembers(group.id);
  const { friends, isLoading: loadingFriends } = useFriends();
  const { user: currentUser } = useCurrentUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(group.name);
  const [isAddingMode, setIsAddingMode] = useState(false); // New State

  // Cek apakah current user adalah admin
  const myMembership = members?.find((m: any) => m.userId === currentUser?.userId || m.userId === currentUser?.id);
  const amIAdmin = myMembership?.isAdmin;

  const handleKick = async (userId: string, userName: string) => {
      if (confirm(`Are you sure you want to remove ${userName} from the group?`)) {
          try {
              await kickMember(group.id, userId);
              mutate(); 
          } catch (e) {
              console.error(e);
          }
      }
  };

  const handleAddMember = async (userId: string) => {
      await addMember(group.id, userId);
      setIsAddingMode(false);
      mutate();
  };

  // Filter teman yang BELUM masuk grup
  const availableFriends = friends?.filter((f: any) => !members?.some((m: any) => m.userId === f.id)) || [];

  return (
    <Dialog onOpenChange={(open) => { if(!open) setIsAddingMode(false); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] h-[85vh] p-0 gap-0 overflow-hidden bg-[#f0f2f5] dark:bg-background border-none shadow-2xl flex flex-col">
        {/* Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">Group Info</DialogTitle>
        
        {/* Custom Header */}
        <div className="bg-background dark:bg-card px-4 py-3 flex items-center shadow-sm z-10 sticky top-0 gap-3">
             {isAddingMode && (
                 <button onClick={() => setIsAddingMode(false)} className="p-1 -ml-2 rounded-full hover:bg-muted">
                     <ArrowLeft className="w-5 h-5" />
                 </button>
             )}
             <h2 className="font-semibold text-lg flex-grow">{isAddingMode ? "Add Participants" : "Group Info"}</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto scrollbar-hide">
            
            {!isAddingMode ? (
            <>
            {/* Section 1: Hero (Image & Name) */}
            <div className="bg-background dark:bg-card pb-6 pt-4 flex flex-col items-center shadow-sm mb-3">
                <div className="relative group cursor-pointer mb-4">
                     <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted/20">
                        {group.imageUrl ? (
                             <img src={group.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                                 {group.name.charAt(0)}
                             </div>
                        )}
                     </div>
                     {amIAdmin && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                     )}
                </div>

                <div className="flex items-center gap-2 px-8 w-full justify-center">
                    {isEditingName ? (
                        <Input 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)} 
                            className="text-center text-xl font-bold h-auto py-1"
                            onBlur={() => setIsEditingName(false)} // Save logic later
                            autoFocus
                        />
                    ) : (
                        <h2 className="text-2xl font-bold text-center text-foreground truncate">{group.name}</h2>
                    )}
                    
                    {amIAdmin && !isEditingName && (
                        <button onClick={() => setIsEditingName(true)} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                <p className="text-muted-foreground mt-1 text-sm">
                    Group · {members?.length || 0} participants
                </p>
            </div>

            {/* Section 2: Description */}
            <div className="bg-background dark:bg-card p-4 shadow-sm mb-3">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-primary">Description</h3>
                    {amIAdmin && (
                        <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {group.description || "Add a group description..."}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    <span>Created by {members?.find((m: any) => m.isAdmin)?.fullName || 'Admin'}</span>
                </div>
            </div>

            {/* Section 3: Participants */}
            <div className="bg-background dark:bg-card p-4 shadow-sm flex-grow min-h-[300px]">
                <div className="flex items-center justify-between mb-4">
                     <span className="text-sm font-medium text-muted-foreground">{members?.length} Participants</span>
                     <Search className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Add Member Button (Admin Only) */}
                {amIAdmin && (
                    <div onClick={() => setIsAddingMode(true)} className="flex items-center gap-4 py-3 cursor-pointer hover:bg-muted/30 -mx-4 px-4 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground">Add Participants</span>
                    </div>
                )}

                <div className="space-y-1 mt-2">
                    {isLoading ? (
                        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                        members.map((member: any) => {
                             const isMe = member.userId === currentUser?.userId || member.userId === currentUser?.id;
                             return (
                                <div key={member.userId} className="flex items-center justify-between py-3 hover:bg-muted/30 -mx-4 px-4 transition-colors group/item">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                                            {member.imageUrl ? (
                                                <img src={member.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium flex items-center gap-1.5 text-foreground truncate">
                                                {isMe ? "You" : (member.fullName || member.username)}
                                                {member.isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Group Admin</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.isAdmin ? "Admin" : "Member"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Admin Actions */}
                                    {amIAdmin && !isMe && (
                                        <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => handleKick(member.userId, member.fullName || member.username)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                title="Remove from group"
                                             >
                                                <UserMinus className="w-4 h-4" />
                                             </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Section 4: Exit Group */}
            <div className="bg-background dark:bg-card p-4 mt-3 shadow-sm mb-6">
                <button className="flex items-center gap-3 text-red-500 font-semibold w-full py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors px-2">
                    <LogOut className="w-5 h-5" />
                    Exit Group
                </button>
            </div>
            </>
            ) : (
                // --- ADD MEMBER VIEW ---
                <div className="bg-background dark:bg-card h-full p-4">
                     <p className="text-sm text-muted-foreground mb-4">Select friends to add to this group</p>
                     
                     {availableFriends.length > 0 ? (
                        <div className="space-y-1">
                            {availableFriends.map((friend: any) => (
                                <div 
                                    key={friend.id} 
                                    onClick={() => handleAddMember(friend.id)}
                                    className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                                            {friend.imageUrl ? (
                                                <img src={friend.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{friend.fullName || friend.username}</p>
                                            <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-transparent hover:text-primary hover:border-primary">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                         <div className="text-center py-10 text-muted-foreground">
                             <UserMinus className="w-10 h-10 mx-auto mb-3 opacity-50" />
                             <p>No friends available to add.</p>
                             <p className="text-xs mt-1">They might be already in the group.</p>
                         </div>
                     )}
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}