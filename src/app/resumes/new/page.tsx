import Link from "next/link";
import { FilePlus, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function NewResumePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/resumes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resumes
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create New Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose whether to build a fresh resume or fork an existing variant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Option 1: Create Blank */}
        <Card className="hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-2">
              <FilePlus className="h-5 w-5" />
            </div>
            <CardTitle>Create Blank Resume</CardTitle>
            <CardDescription>
              Start with an empty draft and select reusable items from your Career Vault.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Blank</Button>
          </CardContent>
        </Card>

        {/* Option 2: Duplicate / Create Variant */}
        <Card className="hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-2">
              <Copy className="h-5 w-5" />
            </div>
            <CardTitle>Create From Variant</CardTitle>
            <CardDescription>
              Clone an existing resume draft into an independent new configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Select Existing Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
