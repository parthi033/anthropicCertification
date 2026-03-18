"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const filename = args.path
    ? String(args.path).split("/").pop() || "file"
    : "file";

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    switch (command) {
      case "create":
        return isDone ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return isDone ? `Modified ${filename}` : `Modifying ${filename}`;
      case "view":
        return isDone ? `Read ${filename}` : `Reading ${filename}`;
      default:
        return isDone ? `Updated ${filename}` : `Updating ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    switch (command) {
      case "rename":
        return isDone ? `Renamed ${filename}` : `Renaming ${filename}`;
      case "delete":
        return isDone ? `Deleted ${filename}` : `Deleting ${filename}`;
      default:
        return isDone ? `Updated ${filename}` : `Updating ${filename}`;
    }
  }

  return isDone ? "Done" : "Working...";
}

export function ToolInvocationBadge({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) {
  const isDone =
    toolInvocation.state === "result" && !!toolInvocation.result;
  const label = getToolLabel(
    toolInvocation.toolName,
    (toolInvocation.args as Record<string, unknown>) ?? {},
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
