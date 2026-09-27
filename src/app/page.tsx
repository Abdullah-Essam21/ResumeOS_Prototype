import Link from "next/link";
import {
  Database,
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  Layers,
  Printer,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge
              variant="outline"
              className="border-indigo-400/40 text-indigo-200 bg-indigo-950/40"
            >
              ResumeOS Prototype
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Assemble, customize, and export tailored resumes.
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Store your professional history once in your Career Vault. Assemble
              targeted variants for any role with a few clicks without manual Word
              editing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/resumes/new">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-md">
                <Plus className="h-5 w-5 mr-1" />
                Create Resume
              </Button>
            </Link>
            <Link href="/vault">
              <Button size="lg" variant="outline" className="border-indigo-400/40 text-white hover:bg-white/10 bg-transparent">
                <Database className="h-5 w-5 mr-1" />
                Open Vault
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Vault & Resumes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Career Vault Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="secondary">Single Source of Truth</Badge>
            </div>
            <CardTitle className="text-xl mt-3">Career Vault</CardTitle>
            <CardDescription>
              Your central repository for all professional experiences, education,
              projects, certifications, achievements, and skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-4 text-center border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500">Items</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">0</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Categories</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">6</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Storage</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">SQLite</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Link href="/vault" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>Manage Vault Items</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* My Resumes Card */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="secondary">Variants</Badge>
            </div>
            <CardTitle className="text-xl mt-3">My Resumes</CardTitle>
            <CardDescription>
              Create and manage targeted resume configurations. Duplicate existing
              resumes into new variants in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-4 text-center border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500">Active</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">0</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Templates</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">1</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Versions</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">0</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Link href="/resumes" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>View All Resumes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Product Workflow Principles Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Core Prototype Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Database className="h-4 w-4 text-indigo-600" />
              1. Vault Reusability
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain professional data once; reference it across multiple resumes.
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Layers className="h-4 w-4 text-indigo-600" />
              2. Fast Duplication
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fork a resume variant with a click. Changing one never alters another.
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <History className="h-4 w-4 text-indigo-600" />
              3. Immutable Snapshots
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Saved versions are immutable and independent of subsequent vault edits.
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Printer className="h-4 w-4 text-indigo-600" />
              4. Direct Print & PDF
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              High fidelity browser print and PDF export with CSS paged media.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
