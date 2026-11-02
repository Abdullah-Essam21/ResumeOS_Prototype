"use client";

import * as React from "react";
import { saveResumeVersionAction } from "@/lib/actions/versions.actions";
import { Button } from "@/components/ui/button";
import { Bookmark, Check, Loader2 } from "lucide-react";

export function SaveVersionButton({ resumeId }: { resumeId: string }) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState<number | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(null);
    try {
      const res = await saveResumeVersionAction(resumeId);
      if (res.success && res.data) {
        setSavedSuccess(res.data.versionNumber);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        alert(res.error || "Failed to save version snapshot");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleSave}
      disabled={isSaving}
      className={`gap-1.5 transition-all ${
        savedSuccess !== null ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
      }`}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Saving…</span>
        </>
      ) : savedSuccess !== null ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Saved v{savedSuccess}!</span>
        </>
      ) : (
        <>
          <Bookmark className="h-3.5 w-3.5" />
          <span>Save Version</span>
        </>
      )}
    </Button>
  );
}
