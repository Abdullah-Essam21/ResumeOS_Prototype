"use client";

import * as React from "react";
import {
  VaultItem,
  TimelineContent,
  RecordContent,
  TagsContent,
} from "@/lib/types/vault";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Trophy,
  Wrench,
  HelpCircle,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface VaultItemCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VaultItemCard({
  item,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: VaultItemCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "experience":
        return <Briefcase className="h-4 w-4" />;
      case "education":
        return <GraduationCap className="h-4 w-4" />;
      case "project":
        return <FolderGit2 className="h-4 w-4" />;
      case "certification":
        return <Award className="h-4 w-4" />;
      case "achievement":
        return <Trophy className="h-4 w-4" />;
      case "skill":
        return <Wrench className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const isArchived = Boolean(item.archivedAt);

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-all shadow-xs hover:shadow-md ${
        isArchived
          ? "border-slate-200 bg-slate-50/70 opacity-75"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={isArchived ? "secondary" : "default"}
            className="capitalize gap-1.5 py-1"
          >
            {getCategoryIcon(item.category)}
            {item.category}
          </Badge>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.layout}
          </span>
          {isArchived && (
            <Badge variant="accent" className="text-[10px]">
              Archived
            </Badge>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
            title="Edit item"
            className="h-8 w-8 text-slate-500 hover:text-slate-800"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          {isArchived ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUnarchive(item.id)}
              title="Restore to active vault"
              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onArchive(item.id)}
              title="Archive item"
              className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            title="Delete permanently"
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Layout Content Rendering */}
      {item.layout === "timeline" && (
        <TimelineView content={item.content as TimelineContent} />
      )}
      {item.layout === "record" && (
        <RecordView content={item.content as RecordContent} />
      )}
      {item.layout === "tags" && (
        <TagsView content={item.content as TagsContent} />
      )}
    </div>
  );
}

function TimelineView({ content }: { content: TimelineContent }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h4 className="font-semibold text-slate-900 text-base leading-snug">
          {content.title}
        </h4>
        {(content.startDate || content.endDate) && (
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Calendar className="h-3 w-3 text-slate-400" />
            {content.startDate} {content.startDate && content.endDate ? "–" : ""}{" "}
            {content.endDate}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
        <span className="text-indigo-700 font-semibold">{content.organization}</span>
        {content.location && (
          <span className="flex items-center gap-1 text-slate-500">
            <MapPin className="h-3 w-3 text-slate-400" />
            {content.location}
          </span>
        )}
      </div>

      {content.bullets && content.bullets.length > 0 && (
        <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-600 mt-2">
          {content.bullets.map((bullet, idx) => (
            <li key={idx} className="leading-relaxed">
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecordView({ content }: { content: RecordContent }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-slate-900 text-sm leading-snug">
            {content.title}
          </h4>
          {content.link && (
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              title="Open external link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {content.date && (
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {content.date}
          </span>
        )}
      </div>

      {content.issuer && (
        <p className="text-xs font-medium text-indigo-700">{content.issuer}</p>
      )}

      {content.description && (
        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          {content.description}
        </p>
      )}
    </div>
  );
}

function TagsView({ content }: { content: TagsContent }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-slate-800 text-xs tracking-wide uppercase">
        {content.category}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {content.tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
