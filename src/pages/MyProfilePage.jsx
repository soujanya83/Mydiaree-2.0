import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Camera, Save, Lock, User, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profileService } from "@/services/admin/profileService";
import { useAuthStore } from "@/stores/authStore";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  contactNo: z.string().min(8, "Contact number is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
  new_password_confirmation: z.string().min(1, "Please confirm new password"),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords do not match",
  path: ["new_password_confirmation"],
});

function MyProfilePage() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refresh auth store user data
  const updateUser = useAuthStore((s) => s.updateUser);
  const authUser = useAuthStore((s) => s.user);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNo: "",
      gender: "",
      dob: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.success && res.user) {
        setProfile(res.user);
        profileForm.reset({
          name: res.user.name || "",
          email: res.user.email || "",
          contactNo: res.user.contactNo || "",
          gender: res.user.gender || "",
          dob: res.user.dob ? res.user.dob.split("T")[0] : "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageUrl", file);

    setIsUploading(true);
    try {
      const res = await profileService.uploadProfileImage(formData);
      if (res.success) {
        toast.success(res.message || "Profile image updated");
        // Re-fetch profile to get updated image
        await fetchProfile();
        // optionally update the global store if needed
        if (authUser) {
           updateUser({ ...authUser, imageUrl: res.image_url });
        }
      } else {
        toast.error(res.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
      console.error(error);
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onProfileSubmit = async (data) => {
    if (!profile?.id) return;
    
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("contactNo", data.contactNo);
    formData.append("gender", data.gender);
    if (data.dob) formData.append("dob", data.dob);

    try {
      const res = await profileService.updateProfile(profile.id, formData);
      if (res.success) {
        toast.success(res.message || "Profile updated successfully");
        setProfile(res.user);
        if (authUser) {
           updateUser({ ...authUser, name: res.user.name });
        }
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (!profile?.id) return;
    
    const formData = new FormData();
    formData.append("current_password", data.current_password);
    formData.append("new_password", data.new_password);
    formData.append("new_password_confirmation", data.new_password_confirmation);

    try {
      const res = await profileService.changePassword(profile.id, formData);
      // API returns success or status==="error"
      if (res.success || res.status === "success") {
        toast.success(res.message || "Password changed successfully");
        passwordForm.reset();
      } else {
        // Validation failed server side
        if (res.errors) {
           Object.values(res.errors).forEach(err => toast.error(err[0]));
        } else {
           toast.error(res.message || "Failed to change password");
        }
      }
    } catch (error) {
      toast.error("Failed to change password. Please check your current password.");
      console.error(error);
    }
  };

  const initials = profile?.name ? profile.name.substring(0, 2).toUpperCase() : "NA";
  const avatarUrl = profile?.imageUrl ? `https://mydiaree.com.au/${profile.imageUrl}` : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and security settings"
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Profile Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <SectionCard className="flex flex-col items-center justify-center py-10 text-center">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={profile?.name} />}
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2.5 text-primary-foreground shadow-md transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  aria-label="Upload profile picture"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-bold text-foreground">{profile?.name}</h3>
                <p className="mt-1 text-sm font-medium capitalize text-muted-foreground">{profile?.userType}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                    {profile?.status || "Active"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Center Status: {profile?.center_status === 1 ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Forms Area */}
          <div className="md:col-span-8 space-y-6">
            {/* Personal Details Form */}
            <SectionCard title="Personal Details" icon={User} accentTop="primary">
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                        className="pl-9"
                        placeholder="Enter full name"
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-[10px] text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                        className="pl-9"
                        placeholder="Enter email address"
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-[10px] text-destructive">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactNo"
                        {...profileForm.register("contactNo")}
                        className="pl-9"
                        placeholder="Enter contact number"
                      />
                    </div>
                    {profileForm.formState.errors.contactNo && (
                      <p className="text-[10px] text-destructive">{profileForm.formState.errors.contactNo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        {...profileForm.register("dob")}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileForm.watch("gender")}
                      onValueChange={(value) => profileForm.setValue("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {profileForm.formState.errors.gender && (
                      <p className="text-[10px] text-destructive">{profileForm.formState.errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={profileForm.formState.isSubmitting}
                    className="min-w-[120px]"
                  >
                    {profileForm.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Details
                  </Button>
                </div>
              </form>
            </SectionCard>

            {/* Change Password Form */}
            <SectionCard title="Security" icon={Lock} accentTop="destructive">
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      {...passwordForm.register("current_password")}
                      placeholder="Enter current password"
                    />
                    {passwordForm.formState.errors.current_password && (
                      <p className="text-[10px] text-destructive">{passwordForm.formState.errors.current_password.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        {...passwordForm.register("new_password")}
                        placeholder="Enter new password"
                      />
                      {passwordForm.formState.errors.new_password && (
                        <p className="text-[10px] text-destructive">{passwordForm.formState.errors.new_password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                      <Input
                        id="new_password_confirmation"
                        type="password"
                        {...passwordForm.register("new_password_confirmation")}
                        placeholder="Confirm new password"
                      />
                      {passwordForm.formState.errors.new_password_confirmation && (
                        <p className="text-[10px] text-destructive">{passwordForm.formState.errors.new_password_confirmation.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={passwordForm.formState.isSubmitting}
                    className="min-w-[150px]"
                  >
                    {passwordForm.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfilePage;
