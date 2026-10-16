"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resume } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  createResumeAction,
  duplicateResumeAction,
} from "@/lib/actions/resumes.actions";
import {
  FilePlus,
  Copy,
  ArrowLeft,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";

interface CreateResumeFormProps {
  existingResumes: Resume[];
}

export function CreateResumeForm({ existingResumes }: CreateResumeFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"blank" | "variant">("blank");

  // Blank mode fields
  const [blankName, setBlankName] = React.useState("");
  const [blankTitle, setBlankTitle] = React.useState("");

  // Variant mode fields
  const [selectedBaseId, setSelectedBaseId] = React.useState<string>(() => {
    return existingResumes.length > 0 ? existingResumes[0].id : "";
  });
  const [variantName, setVariantName] = React.useState("");
  const [variantTitle, setVariantTitle] = React.useState(() => {
    return existingResumes.length > 0 ? existingResumes[0].draft.professionalTitle || "" : "";
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const selectedBaseResume = existingResumes.find((r) => r.id === selectedBaseId);

  // When selected base resume changes, auto-suggest variant name and title
  const handleBaseChange = (id: string) => {
    setSelectedBaseId(id);
    const match = existingResumes.find((r) => r.id === id);
    if (match) {
      setVariantName(`${match.name} (Variant)`);
      setVariantTitle(match.draft.professionalTitle || "");
    }
  };

  const handleCreateBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blankName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createResumeAction({
      name: blankName.trim(),
      templateId: "classic",
      templateVersion: 1,
      draft: {
        professionalTitle: blankTitle.trim(),
        sections: [
          {
            id: "experience",
            type: "experience",
            displayName: "Work Experience",
            visible: true,
            items: [],
          },
          {
            id: "projects",
            type: "projects",
            displayName: "Key Projects",
            visible: true,
            items: [],
          },
          {
            id: "education",
            type: "education",
            displayName: "Education",
            visible: true,
            items: [],
          },
          {
            id: "skills",
            type: "skills",
            displayName: "Technical Skills",
            visible: true,
            items: [],
          },
          {
            id: "certifications",
            type: "certifications",
            displayName: "Certifications",
            visible: true,
            items: [],
          },
          {
            id: "achievements",
            type: "achievements",
            displayName: "Achievements & Honors",
            visible: true,
            items: [],
          },
        ],
      },
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/resumes/${res.data.id}/builder`);
    } else {
      setErrorMsg(res.error || "Failed to create resume");
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBaseId) {
      setErrorMsg("Please select an existing resume to duplicate.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await duplicateResumeAction(selectedBaseId, {
      name: variantName.trim() || undefined,
      professionalTitle: variantTitle.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/resumes/${res.data.id}/builder`);
    } else {
      setErrorMsg(res.error || "Failed to fork resume variant");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <Link href="/resumes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resumes
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          Create Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Start from scratch with standard sections or fork an existing variant with one click.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Mode Switch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("blank")}
          className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === "blank"
              ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              activeTab === "blank"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <FilePlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Blank Resume
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Start with standard sections ready to assemble reusable items from your Career Vault.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (existingResumes.length === 0) return;
            setActiveTab("variant");
            if (selectedBaseResume && !variantName) {
              setVariantName(`${selectedBaseResume.name} (Variant)`);
            }
          }}
          disabled={existingResumes.length === 0}
          className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === "variant"
              ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              activeTab === "variant"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Copy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">
                Fork Variant
              </h3>
              {existingResumes.length === 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  No existing resumes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Clone an existing resume into an independent variant and adjust a few items.
            </p>
          </div>
        </button>
      </div>

      {/* Form Pane */}
      {activeTab === "blank" && (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Configure Blank Resume</CardTitle>
            <CardDescription>
              Name your resume and specify its target professional role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBlank} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="blankName">Resume Name *</Label>
                <Input
                  id="blankName"
                  required
                  value={blankName}
                  onChange={(e) => setBlankName(e.target.value)}
                  placeholder="e.g. Data Analyst Resume"
                />
                <p className="text-[11px] text-slate-500">
                  Internal identifier for this variant (e.g. &quot;Power BI Developer&quot;, &quot;General Analyst&quot;).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="blankTitle">Professional Target Title</Label>
                <Input
                  id="blankTitle"
                  value={blankTitle}
                  onChange={(e) => setBlankTitle(e.target.value)}
                  placeholder="e.g. Junior Data Analyst"
                />
                <p className="text-[11px] text-slate-500">
                  Header title that will be displayed on the generated resume.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Link href="/resumes">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Creating...
                    </>
                  ) : (
                    "Create & Open Builder"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "variant" && existingResumes.length > 0 && (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Fork Existing Variant</CardTitle>
            <CardDescription>
              Select an existing configuration as the base. The new variant will be completely independent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateVariant} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="baseResume">Select Base Resume *</Label>
                <select
                  id="baseResume"
                  value={selectedBaseId}
                  onChange={(e) => handleBaseChange(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {existingResumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ({r.draft.professionalTitle || "No title specified"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBaseResume && (
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-600" />
                      Base: {selectedBaseResume.name}
                    </p>
                    <p className="text-slate-500">
                      Title: {selectedBaseResume.draft.professionalTitle || "None"}
                    </p>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {selectedBaseResume.draft.sections.length} sections
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="variantName">New Resume Variant Name *</Label>
                <Input
                  id="variantName"
                  required
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="e.g. Power BI Developer Resume"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="variantTitle">Target Professional Title</Label>
                <Input
                  id="variantTitle"
                  value={variantTitle}
                  onChange={(e) => setVariantTitle(e.target.value)}
                  placeholder="e.g. Power BI Developer"
                />
                <p className="text-[11px] text-slate-500">
                  Headline displayed on the top of the resume variant.
                </p>
              </div>

              <div className="rounded-lg bg-indigo-50/60 p-3 text-[11px] text-indigo-900 border border-indigo-100 leading-relaxed">
                💡 <strong>Invariant 2:</strong> Changes made to this new variant will never alter the base resume.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Link href="/resumes">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Forking...
                    </>
                  ) : (
                    "Fork & Open Builder"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
