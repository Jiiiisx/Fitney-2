"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Shadcn Tabs (pastikan ada atau pakai button biasa)
import { User, Shield, UserMinus, Loader2, Info } from "lucide-react";
import { useGroupMembers, kickMember } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useState } from "react";

// Fallback Tabs jika Shadcn Tabs tidak ada di project Anda
const SimpleTabs = ({ children }: { children: React.ReactNode }) => <div className="w-full">{children}</div>;
const SimpleTabsList = ({ children }: { children: React.ReactNode }) => <div className="flex border-b border-border mb-4">{children}</div>;
const SimpleTabsTrigger = ({ value, active, onClick, children }: any) => (
    <button 
        onClick={() => onClick(value)} 
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
        {children}
    </button>
);

export default function GroupDetailModal({ 
    children, 
    group 
}: { 
    children: React.ReactNode; 
    group: any; // Group Object
}) {
  const [activeTab, setActiveTab] = useState("members");
  const { members, isLoading, mutate } = useGroupMembers(group.id);
  const { user: currentUser } = useCurrentUser();

  // Cek apakah current user adalah admin dari list members (karena endpoint members return status admin)
  const myMembership = members?.find((m: any) => m.userId === currentUser?.userId || m.userId === currentUser?.id); // Handle ID structure
  const amIAdmin = myMembership?.isAdmin;

  const handleKick = async (userId: string, userName: string) => {
      if (confirm(`Are you sure you want to remove ${userName} from the group?`)) {
          try {
              await kickMember(group.id, userId);
              mutate(); // Refresh list
          } catch (e) {
              // Error handled in hook
          }
      }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3">
             {group.imageUrl ? (
                 <img src={group.imageUrl} className="w-10 h-10 rounded-full object-cover" />
             ) : (
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                     {group.name.charAt(0)}
                 </div>
             )}
             <span>{group.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col p-6 pt-0 overflow-hidden">
            <SimpleTabsList>
                <SimpleTabsTrigger value="info" active={activeTab} onClick={setActiveTab}>Info</SimpleTabsTrigger>
                <SimpleTabsTrigger value="members" active={activeTab} onClick={setActiveTab}>Members ({members?.length || 0})</SimpleTabsTrigger>
            </SimpleTabsList>

            <div className="flex-grow overflow-y-auto">
                {activeTab === 'info' && (
                    <div className="space-y-4 pt-2">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
                            <p className="text-foreground leading-relaxed">
                                {group.description || "No description provided."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                            <Info className="w-4 h-4" />
                            Created by Admin
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-3 pt-2">
                        {isLoading ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                        ) : (
                            members.map((member: any) => (
                                <div key={member.userId} className="flex items-center justify-between p-2 hover:bg-muted/40 rounded-lg transition-colors group/item">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {member.imageUrl ? (
                                                <img src={member.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                {member.fullName || member.username}
                                                {member.isAdmin && <Shield className="w-3 h-3 text-primary fill-primary/20" />}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    {amIAdmin && !member.isAdmin && (
                                        <button 
                                            onClick={() => handleKick(member.userId, member.fullName || member.username)}
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors opacity-0 group-hover/item:opacity-100"
                                            title="Kick Member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
