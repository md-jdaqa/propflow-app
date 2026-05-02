"use client";
import { useState } from "react";
import { CheckSquare, Plus, Sparkles, Circle, CheckCircle2, Clock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Priority = "HIGH" | "MEDIUM" | "LOW";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description?: string;
  property?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  aiGenerated?: boolean;
}

const MOCK_TASKS: Task[] = [
  {
    id: "T-001", title: "Send lease renewal to Jake Tenant",
    description: "Lease expires May 31. Send renewal notice with updated rent.",
    property: "406 Oak St", assignedTo: "Arif", dueDate: "2026-05-10",
    priority: "HIGH", status: "TODO", category: "Leases", aiGenerated: true,
  },
  {
    id: "T-002", title: "Schedule boiler inspection — 880 Airport Blvd",
    description: "Annual boiler inspection due per city code.",
    property: "880 Airport Blvd", dueDate: "2026-05-20",
    priority: "MEDIUM", status: "IN_PROGRESS", category: "Maintenance",
  },
  {
    id: "T-003", title: "File 1099-NEC for Joseph Neff",
    description: "Management fees paid YTD exceed $600.",
    dueDate: "2026-01-31", priority: "HIGH", status: "DONE", category: "Tax",
  },
  {
    id: "T-004", title: "Update tenant portal link for Sarah Chen",
    property: "880 Airport Blvd", priority: "LOW", status: "TODO", category: "Admin",
  },
  {
    id: "T-005", title: "Review and approve Marcus maintenance estimate",
    description: "Contractor submitted $890 estimate for lock replacement.",
    property: "33 Orchard Plaza", dueDate: "2026-05-05",
    priority: "HIGH", status: "TODO", category: "Maintenance", aiGenerated: true,
  },
];

const PRIORITY_CFG: Record<Priority, { color: string; bg: string; label: string }> = {
  HIGH:   { color: "var(--danger)",  bg: "rgba(239,68,68,0.1)",  label: "High" },
  MEDIUM: { color: "#ca8a04",        bg: "rgba(234,179,8,0.1)",  label: "Medium" },
  LOW:    { color: "var(--muted)",   bg: "var(--surface-2)",     label: "Low" },
};

let nextIdCounter = 6;

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [aiCommand, setAiCommand] = useState("");

  // Add task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("MEDIUM");
  const [newCategory, setNewCategory] = useState("");

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  function toggleStatus(id: string) {
    setTasks((prev) => prev.map((t) =>
      t.id === id
        ? { ...t, status: t.status === "TODO" ? "IN_PROGRESS" : t.status === "IN_PROGRESS" ? "DONE" : "TODO" }
        : t
    ));
  }

  function createTask() {
    if (!newTitle.trim()) return;
    const newTask: Task = {
      id: `T-${String(nextIdCounter++).padStart(3, "0")}`,
      title: newTitle.trim(),
      priority: newPriority,
      status: "TODO",
      category: newCategory.trim() || "General",
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewPriority("MEDIUM");
    setNewCategory("");
    setShowAddForm(false);
  }

  function createAiTask() {
    if (!aiCommand.trim()) return;
    const newTask: Task = {
      id: `T-${String(nextIdCounter++).padStart(3, "0")}`,
      title: aiCommand.trim(),
      priority: "MEDIUM",
      status: "TODO",
      category: "AI",
      aiGenerated: true,
    };
    setTasks((prev) => [newTask, ...prev]);
    setAiCommand("");
  }

  return (
    <div data-testid="tasks-page" className="space-y-5 pb-28 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Tasks
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            AI-generated action items · manual tasks · team assignments
          </p>
        </div>
        <button
          type="button"
          className="pf-btn pf-btn-primary text-sm"
          data-testid="add-task-btn"
          onClick={() => {
            setShowAddForm((v) => !v);
          }}
        >
          <Plus size={15} /> Add Task
        </button>
      </header>

      {/* Inline Add Task Form */}
      {showAddForm && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>New Task</p>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{ color: "var(--muted)" }}
            >
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            className="pf-input w-full text-sm py-2"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTask()}
            autoFocus
          />
          <div className="flex gap-2">
            <select
              className="pf-input text-sm py-2 flex-1"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <input
              type="text"
              className="pf-input text-sm py-2 flex-1"
              placeholder="Category (e.g. Maintenance)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="pf-btn pf-btn-primary text-sm"
              onClick={createTask}
            >
              Create
            </button>
            <button
              type="button"
              className="pf-btn pf-btn-secondary text-sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI task creator */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(14,165,160,0.05) 100%)",
          border: "1.5px solid rgba(79,110,247,0.25)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} style={{ color: "var(--primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>Create task with AI</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createAiTask()}
            placeholder='Ask AI to create a task…'
            className="pf-input flex-1 text-sm py-2"
          />
          <button
            type="button"
            className="pf-btn pf-btn-primary text-sm flex-shrink-0"
            onClick={createAiTask}
          >
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "To Do",      value: todo,       color: "var(--primary)" },
          { label: "In Progress", value: inProgress, color: "#ca8a04" },
          { label: "Done",       value: done,       color: "var(--success)" },
        ].map((s) => (
          <Card key={s.label} testId={`task-stat-${s.label}`}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto flex-nowrap pb-1">
        {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 whitespace-nowrap"
            style={
              filter === f
                ? { background: "var(--primary)", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--muted)" }
            }
          >
            {f === "ALL" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => {
          const priCfg = PRIORITY_CFG[task.priority];
          const isDone = task.status === "DONE";
          return (
            <div
              key={task.id}
              data-testid={`task-row-${task.id}`}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {/* Status toggle */}
              <button
                type="button"
                onClick={() => toggleStatus(task.id)}
                className="flex-shrink-0 mt-0.5"
                style={{ color: isDone ? "var(--success)" : task.status === "IN_PROGRESS" ? "#ca8a04" : "var(--muted)" }}
              >
                {isDone ? <CheckCircle2 size={18} /> : task.status === "IN_PROGRESS" ? <Clock size={18} /> : <Circle size={18} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p
                    className={`text-sm font-medium ${isDone ? "line-through" : ""}`}
                    style={{ color: isDone ? "var(--muted)" : "var(--heading)" }}
                  >
                    {task.title}
                  </p>
                  {task.aiGenerated && (
                    <span
                      className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: "rgba(79,110,247,0.12)", color: "var(--primary)" }}
                    >
                      <Sparkles size={8} /> AI
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                  {task.property && <span>{task.property}</span>}
                  {task.assignedTo && <span>→ {task.assignedTo}</span>}
                  {task.dueDate && (
                    <span
                      style={{
                        color: new Date(task.dueDate) < new Date() && !isDone ? "var(--danger)" : "var(--muted)",
                        fontWeight: new Date(task.dueDate) < new Date() && !isDone ? 600 : 400,
                      }}
                    >
                      Due: {task.dueDate}
                    </span>
                  )}
                  <span
                    className="px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: priCfg.bg, color: priCfg.color }}
                  >
                    {priCfg.label}
                  </span>
                  <span>{task.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
