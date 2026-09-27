"use client";

import * as React from "react";
import { User, Edit3 } from "lucide-react";
import { Profile } from "@/lib/types/profile";
import { ProfileModal } from "./profile-modal";
import { Button } from "./ui/button";
import { getProfileAction } from "@/lib/actions/profile.actions";

interface ProfileButtonProps {
  initialProfile?: Profile;
}

export function ProfileButton({ initialProfile }: ProfileButtonProps) {
  const [profile, setProfile] = React.useState<Profile>(
    initialProfile || {
      id: "default",
      fullName: "Your Name",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedinUrl: "",
      githubUrl: "",
    }
  );
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!initialProfile) {
      getProfileAction().then((res) => {
        if (res.success && res.data) {
          setProfile(res.data);
        }
      });
    }
  }, [initialProfile]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <User className="h-3 w-3" />
        </div>
        <span className="max-w-[120px] truncate">{profile.fullName}</span>
        <Edit3 className="h-3 w-3 text-slate-400" />
      </Button>

      <ProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </>
  );
}
