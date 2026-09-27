"use client";

import * as React from "react";
import { User, Mail, Phone, MapPin, Globe, Link2, Code2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile, UpdateProfileInput } from "@/lib/types/profile";
import { updateProfileAction } from "@/lib/actions/profile.actions";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onProfileUpdated?: (updated: Profile) => void;
}

function ProfileForm({
  profile,
  onClose,
  onProfileUpdated,
}: {
  profile: Profile;
  onClose: () => void;
  onProfileUpdated?: (updated: Profile) => void;
}) {
  const [formData, setFormData] = React.useState<UpdateProfileInput>({
    fullName: profile.fullName,
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    website: profile.website || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await updateProfileAction(formData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      onProfileUpdated?.(res.data);
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name *</Label>
        <div className="relative">
          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            id="fullName"
            required
            className="pl-9"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="e.g. Abdullah Essam"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              className="pl-9"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g. user@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="phone"
              className="pl-9"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="e.g. +20 100 000 0000"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="location"
              className="pl-9"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Cairo, Egypt"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website / Portfolio</Label>
          <div className="relative">
            <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="website"
              className="pl-9"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://yourportfolio.dev"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <div className="relative">
            <Link2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="linkedinUrl"
              className="pl-9"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <div className="relative">
            <Code2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="githubUrl"
              className="pl-9"
              value={formData.githubUrl}
              onChange={(e) =>
                setFormData({ ...formData, githubUrl: e.target.value })
              }
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProfileModal({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}: ProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Personal Profile</DialogTitle>
              <DialogDescription>
                Your base contact info used across all assembled resumes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <ProfileForm
            profile={profile}
            onClose={() => onOpenChange(false)}
            onProfileUpdated={onProfileUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
