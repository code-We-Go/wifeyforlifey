"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, UserMinus, Clock, CheckCircle, XCircle } from "lucide-react";

interface SubSubscription {
  _id: string;
  role: "groom" | "bridesmaids";
  inviteeEmail: string;
  status: "pending" | "accepted" | "revoked";
  inviteeUser?: {
    firstName: string;
    lastName: string;
    imageURL?: string;
  };
  createdAt: string;
}

const InvitationsTab = ({ subscriptionDoc }: { subscriptionDoc: any }) => {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<SubSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newInviteName, setNewInviteName] = useState("");
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"groom" | "bridesmaids">("groom");
  const [newInviteMessage, setNewInviteMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract slot config from package
  const pkg = subscriptionDoc?.packageID;
  const slotsConfig = pkg?.subSubscriptionSlots || [];
  
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/sub-subscriptions");
      setInvitations(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
      toast({
        title: "Error",
        description: "Failed to load your invitations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchInvitations();
    }
  }, [session?.user?.email]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post("/api/sub-subscriptions", {
        role: newInviteRole,
        inviteeName: newInviteName,
        inviteeEmail: newInviteEmail,
        parentSubscriptionId: subscriptionDoc._id,
        inviteMessage: newInviteMessage,
      });

      toast({
        title: "Invitation Sent",
        description: `Successfully sent invitation to ${newInviteEmail}`,
        variant: "added",
      });
      
      setNewInviteName("");
      setNewInviteEmail("");
      setNewInviteMessage("");
      fetchInvitations();
    } catch (error: any) {
      console.error("Failed to send invite:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send invitation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleRevoke = async (id: string) => {
  //   try {
  //     await axios.patch("/api/sub-subscriptions", {
  //       id,
  //       action: "revoke"
  //     });
      
  //     toast({
  //       title: "Invitation Revoked",
  //       description: "The invitation access has been removed.",
  //       variant: "added",
  //     });
      
  //     fetchInvitations();
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to revoke invitation.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  if (loading) {
    return <div className="text-center py-8 text-lovely animate-pulse">Loading your invitations details...</div>;
  }

  // Calculate used slots
  const usedSlots = {
    groom: invitations.filter(i => i.role === "groom" && i.status !== "revoked").length,
    bridesmaids: invitations.filter(i => i.role === "bridesmaids" && i.status !== "revoked").length,
  };

  const getSlotConfig = (role: string) => slotsConfig.find((s: any) => s.role === role);
  const groomConfig = getSlotConfig("groom");
  const bridesmaidsConfig = getSlotConfig("bridesmaids");

  const groomRemaining = groomConfig ? groomConfig.maxCount - usedSlots.groom : 0;
  const bridesmaidsRemaining = bridesmaidsConfig ? bridesmaidsConfig.maxCount - usedSlots.bridesmaids : 0;

  if (!slotsConfig.length) {
    return (
      <div className="text-center py-8 text-lovely/80">
        <h3 className="text-xl font-medium mb-2">No Sub-Subscriptions Available</h3>
        <p>Your current package does not include invitations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-lovely mb-2">Your Package Invitations</h2>
        <p className="text-lovely/80 mb-6">
          Invite your groom and bridesmaids to get their own accounts and access exclusive content tailored just for them!
        </p>

        {/* Slot Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {groomConfig && (
            <div className="bg-creamey p-4 rounded-xl border border-lovely/20 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lovely text-lg">Groom Slot</h3>
                <p className="text-sm text-lovely/70">
                  {groomRemaining > 0 ? `${groomRemaining} invite remaining` : "Slot filled"}
                </p>
              </div>
              <div className="bg-lovely text-creamey h-10 w-10 rounded-full flex items-center justify-center font-bold">
                {usedSlots.groom}/{groomConfig.maxCount}
              </div>
            </div>
          )}
          {bridesmaidsConfig && (
            <div className="bg-creamey p-4 rounded-xl border border-lovely/20 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lovely text-lg">Bridesmaids Slots</h3>
                <p className="text-sm text-lovely/70">
                  {bridesmaidsRemaining > 0 ? `${bridesmaidsRemaining} invites remaining` : "All slots filled"}
                </p>
              </div>
              <div className="bg-lovely text-creamey h-10 w-10 rounded-full flex items-center justify-center font-bold">
                {usedSlots.bridesmaids}/{bridesmaidsConfig.maxCount}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Form */}
      {(groomRemaining > 0 || bridesmaidsRemaining > 0) && (
        <div className="bg-creamey p-6 rounded-xl border border-lovely/20 shadow-sm">
          <h3 className="text-lg font-semibold text-lovely mb-4">Send New Invitation</h3>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 space-y-2 w-full placeholder:text-lovely/80">
                <Label htmlFor="inviteName" className="text-lovely font-medium">Invitee Name</Label>
                <Input 
                  id="inviteName"
                  type="text"
                  placeholder="Invitee Name"
                  value={newInviteName}
                  onChange={(e) => setNewInviteName(e.target.value)}
                  required
                  className="bg-white placeholder:text-lovely/60 text-lovely border-lovely/30"
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="inviteEmail" className="text-lovely font-medium">Invitee Email</Label>
                <Input 
                  id="inviteEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  required
                  className="bg-white placeholder:text-lovely/60 text-lovely border-lovely/30"
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="inviteRole" className="text-lovely font-medium">Role</Label>
                <select 
                  id="inviteRole"
                  value={newInviteRole}
                  onChange={(e) => setNewInviteRole(e.target.value as "groom" | "bridesmaids")}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-lovely/30 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-lovely"
                >
                  {groomRemaining > 0 && <option value="groom">Groom</option>}
                  {bridesmaidsRemaining > 0 && <option value="bridesmaids">Bridesmaid</option>}
                </select>
              </div>
            </div>
            
            <div className="space-y-2 w-full">
              <Label htmlFor="inviteMessage" className="text-lovely font-medium">Message (Optional)</Label>
              <textarea 
                id="inviteMessage"
                placeholder="Write a personal message to your invitee..."
                value={newInviteMessage}
                onChange={(e) => setNewInviteMessage(e.target.value)}
                className="flex min-h-[80px] w-full placeholder:text-lovely/60 rounded-md border border-lovely/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-lovely"
              />
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || !newInviteEmail || !newInviteName}
                className="bg-lovely text-white hover:bg-lovely/90 w-full md:w-auto"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sent Invitations List */}
      <div>
        <h3 className="text-lg font-semibold text-lovely mb-4">Your Invitations List</h3>
        {invitations.length === 0 ? (
          <p className="text-lovely/70 italic text-sm">No invitations sent yet.</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite._id} className="bg-creamey p-4 rounded-xl border border-lovely/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-lovely/10 flex items-center justify-center text-lovely flex-shrink-0">
                    <span className="font-bold uppercase">{invite.role.substring(0, 1)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-lovely">
                      {invite.inviteeUser ? `${invite.inviteeUser.firstName} ${invite.inviteeUser.lastName}` : invite.inviteeEmail}
                    </p>
                    <p className="text-xs text-lovely/70 capitalize flex items-center gap-2">
                      {invite.role} • Sent {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border">
                    {invite.status === "accepted" && <><CheckCircle className="h-3 w-3 text-green-500" /> <span className="text-green-700">Active</span></>}
                    {invite.status === "pending" && <><Clock className="h-3 w-3 text-yellow-500" /> <span className="text-yellow-700">Pending</span></>}
                    {invite.status === "revoked" && <><XCircle className="h-3 w-3 text-red-500" /> <span className="text-red-700">Revoked</span></>}
                  </div>

                  {/* Revoke Button */}
                  {/* {invite.status !== "revoked" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRevoke(invite._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsTab;
