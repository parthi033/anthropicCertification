import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel pure function tests ---

test("getToolLabel: str_replace_editor create in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/Card.tsx" }, false)).toBe("Creating Card.tsx");
});

test("getToolLabel: str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/Card.tsx" }, true)).toBe("Created Card.tsx");
});

test("getToolLabel: str_replace_editor str_replace in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/Button.tsx" }, false)).toBe("Modifying Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/Button.tsx" }, true)).toBe("Modified Button.tsx");
});

test("getToolLabel: str_replace_editor insert in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/App.tsx" }, false)).toBe("Modifying App.tsx");
});

test("getToolLabel: str_replace_editor insert done", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/App.tsx" }, true)).toBe("Modified App.tsx");
});

test("getToolLabel: str_replace_editor view in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/src/index.ts" }, false)).toBe("Reading index.ts");
});

test("getToolLabel: str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/src/index.ts" }, true)).toBe("Read index.ts");
});

test("getToolLabel: str_replace_editor unknown command in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown", path: "/src/Foo.tsx" }, false)).toBe("Updating Foo.tsx");
});

test("getToolLabel: str_replace_editor unknown command done", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown", path: "/src/Foo.tsx" }, true)).toBe("Updated Foo.tsx");
});

test("getToolLabel: str_replace_editor no path falls back to 'file'", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe("Creating file");
});

test("getToolLabel: str_replace_editor no command, no path", () => {
  expect(getToolLabel("str_replace_editor", {}, true)).toBe("Updated file");
});

test("getToolLabel: file_manager rename in-progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/src/Old.tsx" }, false)).toBe("Renaming Old.tsx");
});

test("getToolLabel: file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/src/Old.tsx" }, true)).toBe("Renamed Old.tsx");
});

test("getToolLabel: file_manager delete in-progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/Dead.tsx" }, false)).toBe("Deleting Dead.tsx");
});

test("getToolLabel: file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/Dead.tsx" }, true)).toBe("Deleted Dead.tsx");
});

test("getToolLabel: file_manager default command done", () => {
  expect(getToolLabel("file_manager", { command: "other", path: "/src/File.tsx" }, true)).toBe("Updated File.tsx");
});

test("getToolLabel: unknown tool in-progress", () => {
  expect(getToolLabel("some_other_tool", { path: "/src/X.tsx" }, false)).toBe("Working...");
});

test("getToolLabel: unknown tool done", () => {
  expect(getToolLabel("some_other_tool", { path: "/src/X.tsx" }, true)).toBe("Done");
});

// --- Component rendering tests ---

test("ToolInvocationBadge shows spinner when state is 'call'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("ToolInvocationBadge shows spinner when state is 'partial-call'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: {},
    state: "partial-call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("ToolInvocationBadge shows green dot when state is 'result' with result", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge shows spinner when state is 'result' but result is falsy", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/Card.tsx" },
    state: "result",
    result: "",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("ToolInvocationBadge renders correct label text", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/Button.tsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("ToolInvocationBadge renders in-progress label", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "6",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/src/Form.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Modifying Form.tsx")).toBeDefined();
});
