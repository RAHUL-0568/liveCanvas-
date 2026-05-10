"use client";

import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Settings, 
  Shield, 
  Users, 
  Palette,
  Mail,
  UserCircle,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Camera,
  Loader2
} from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileListContext } from "@/app/_context/FileListContext";

import { useAuth } from "@/hooks/useAuth";

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const context = useContext(FileListContext);
  const activeTeam = context?.activeTeam;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [privatePin, setPrivatePin] = useState("");
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const updateUserProfile = useMutation(api.user.updateUserProfile);
  const updateUserImage = useMutation(api.user.updateUserImage);
  const deleteWorkspace = useMutation(api.teams.deleteTeamAndCleanup);
  const updatePin = useMutation(api.user.setPrivatePin);
  const convexUser = useQuery(api.user.getUserByEmail, user?.email ? { email: user.email } : "skip");

  const memoUser = useMemo(() => {
    return user ? {
      email: user.email || "",
      name: user.displayName || "User",
      image: convexUser?.image || user.photoURL
    } : null;
  }, [user, convexUser]);

  useEffect(() => {
    const nameParts = (memoUser?.name || "").trim().split(/\s+/);
    const authFirstName = nameParts[0] || "";
    const authLastName = nameParts.slice(1).join(" ");

    if (convexUser) {
      setFirstName(convexUser.firstName || authFirstName);
      setLastName(convexUser.lastName || authLastName);
    } else if (memoUser) {
      setFirstName(authFirstName);
      setLastName(authLastName);
    }
  }, [memoUser, convexUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for dataURL storage
      toast.error("Image size must be less than 1MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploadingImage(true);
      const reader = new FileReader();
      
      const dataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const dataUrl = await dataUrlPromise;

      await updateUserImage({
        email: user?.email!,
        image: dataUrl
      });

      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdatePin = async () => {
    const existingPin = convexUser?.privatePin;
    
    // If a PIN exists, require current PIN to match
    if (existingPin && existingPin !== currentPinInput) {
      toast.error("Incorrect current PIN");
      return;
    }

    if (existingPin && existingPin === privatePin) {
      toast.error("New PIN must be different from current PIN");
      return;
    }

    if (privatePin.length < 4) {
      toast.error("New PIN must be 4 digits");
      return;
    }
    try {
      setIsUpdatingPin(true);
      await updatePin({
        email: user?.email!,
        pin: privatePin
      });
      toast.success("Private Vault PIN updated");
      setCurrentPinInput("");
      setPrivatePin("");
    } catch (error) {
      toast.error("Failed to update PIN");
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName.trim()) {
      toast.error("First name cannot be empty");
      return;
    }

    if (!memoUser?.email) {
      toast.error("Email not found");
      return;
    }

    try {
      setIsSaving(true);
      
      await updateUserProfile({
        email: memoUser.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeTeam) {
      toast.error("No active workspace selected");
      return;
    }

    if (!user?.email) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${activeTeam.teamName}"? This will permanently delete ALL your created files and remove you from shared files.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteWorkspace({
        teamId: activeTeam._id as any,
        userEmail: user.email,
      });
      
      if (result) {
        toast.success("Workspace and associated data deleted successfully");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      const errorMessage = error.message || "Failed to delete workspace";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto relative">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => router.back()}
        className="absolute top-10 right-10 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <UserCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div className="relative">
                <img
                  src={memoUser?.image || "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg"}
                  alt="Profile"
                  className={`w-24 h-24 rounded-full object-cover border-4 border-primary/10 transition-opacity ${isUploadingImage ? 'opacity-50' : 'opacity-100'}`}
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
                {!isUploadingImage && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-white">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium uppercase">Change</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid gap-4 w-full">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </Label>
                <Input 
                  id="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-muted/50" 
                />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed. It&apos;s managed by your Google account.</p>
              </div>
              <Button 
                className="w-fit" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </section>

        {/* Security Section - PIN Lock */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Security (Private Vault)</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">Vault PIN</h3>
              <p className="text-xs text-muted-foreground">
                {convexUser?.privatePin 
                  ? "Enter your current PIN to set a new one." 
                  : "Set a 4-digit PIN to secure the Private Files section."}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {convexUser?.privatePin && (
                <div className="space-y-2">
                  <Label htmlFor="current-pin" className="text-xs">Current PIN</Label>
                  <Input
                    id="current-pin"
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    className="w-32 text-center font-mono text-xl tracking-widest"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-pin" className="text-xs">{convexUser?.privatePin ? "New PIN" : "Set PIN"}</Label>
                <Input
                  id="new-pin"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  className="w-32 text-center font-mono text-xl tracking-widest"
                  value={privatePin}
                  onChange={(e) => setPrivatePin(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button 
                onClick={handleUpdatePin}
                disabled={isUpdatingPin || privatePin.length < 4 || (convexUser?.privatePin && currentPinInput.length < 4)}
                className="md:mb-0"
              >
                {isUpdatingPin ? "Updating..." : convexUser?.privatePin ? "Update PIN" : "Set PIN"}
              </Button>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">Application Theme</h3>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark modes.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Workspace & Team Section */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Workspace Settings</h2>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">Team Name</h3>
                  <p className="text-xs text-muted-foreground">{activeTeam?.teamName || "No Team Selected"}</p>
                </div>
                <Button variant="outline" size="sm">Rename</Button>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">Active Members</h3>
                  <p className="text-xs text-muted-foreground">Members in this workspace</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
             </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-destructive/10 pb-4">
            <Shield className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">Delete Workspace</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete this workspace and all its data.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteWorkspace}
              disabled={isDeleting || !activeTeam}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
