import { Database, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VaultPage() {
  const categories = [
    "All",
    "Experience",
    "Education",
    "Projects",
    "Certifications",
    "Achievements",
    "Skills",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Database className="h-6 w-6 text-indigo-600" />
            Career Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Store and manage reusable professional records used across all your resumes.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Vault Item
        </Button>
      </div>

      {/* Categories & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((category, idx) => (
            <button
              key={category}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                idx === 0
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vault..."
              className="h-8.5 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Empty State / Initial Placeholder */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
          <Database className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Career Vault Ready</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Phase 1 app setup complete. Career Vault SQLite tables and persistence will be connected in Phase 2 & 3.
        </p>
        <div className="mt-6">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Create First Record
          </Button>
        </div>
      </div>
    </div>
  );
}
