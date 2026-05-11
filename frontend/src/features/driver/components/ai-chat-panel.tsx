import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { aiApi, incidentsApi, workflowApi } from "@/lib/api/incidents";
import type { ChatMessage } from "@/lib/types";

interface AiChatPanelProps {
  complaintId: number | null;
  userId: number;
  vehicleId: string;
  initialQuestion: string;
  onConcluded?: (outcome: "resolved" | "escalated") => void;
}

const MAX_AI_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000; // After 60s, slow polling down (don't give up).
const SLOW_POLL_INTERVAL_MS = 10000; // 10s between checks after the initial window.
const PLACEHOLDER_DELAY_MS = 15000; // Show "preparing response" message after 15s.

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Backend records AI answers inside workSummary as text blocks. An AI block
 * looks roughly like:
 *
 *   HH:MM AM — AI Suggestion
 *   AI Assistant
 *   Remarks: "...the answer, possibly multi-line, possibly with fenced ```json..."
 *
 * Returns the last AI Suggestion's remark text, or null if none found yet.
 */
function extractLatestAiRemark(workSummary: string | null | undefined): string | null {
  if (!workSummary) return null;
  const aiSegments = workSummary.split(/—\s*AI Suggestion/);
  if (aiSegments.length < 2) return null;
  const lastSegment = aiSegments[aiSegments.length - 1];
  const remarksMatch = lastSegment.match(
    /Remarks:\s*"([\s\S]*?)"\s*(?:\n\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*—|$)/,
  );
  if (!remarksMatch) {
    const loose = lastSegment.match(/Remarks:\s*"([\s\S]*)$/);
    if (!loose) return null;
    return loose[1].replace(/"\s*$/, "").trim();
  }
  return remarksMatch[1].trim();
}

/**
 * Some AI answers come back as a fenced ```json block. If so, format them
 * readably. Otherwise return the raw text.
 */
function formatAiAnswer(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonText = fenced ? fenced[1] : trimmed;
  try {
    const obj = JSON.parse(jsonText) as Record<string, unknown>;
    const parts: string[] = [];
    if (obj.identified_issue) parts.push(`Issue: ${String(obj.identified_issue)}`);
    if (Array.isArray(obj.possible_causes) && obj.possible_causes.length > 0) {
      parts.push(`Possible causes:\n${obj.possible_causes.map((c) => `• ${c}`).join("\n")}`);
    }
    if (Array.isArray(obj.recommended_steps) && obj.recommended_steps.length > 0) {
      parts.push(`Try this:\n${obj.recommended_steps.map((s) => `• ${s}`).join("\n")}`);
    }
    if (parts.length === 0) return raw;
    return parts.join("\n\n");
  } catch {
    return raw;
  }
}

const WAITING_PLACEHOLDER_ID = "waiting-placeholder";

export function AiChatPanel({
  complaintId,
  userId,
  vehicleId,
  initialQuestion,
  onConcluded,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [conclusion, setConclusion] = useState<"resolved" | "escalated" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seenRemarksRef = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const cancelPollingRef = useRef(false);

  // Auto-scroll on new messages.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /**
   * Poll the complaint's workSummary forever until a new AI remark appears.
   * Starts fast (2s), slows to 10s after 60s. Stops if cancelled (e.g.
   * complaint changes) or on auth failure.
   */
  const pollForAiAnswer = async (id: number) => {
    const startedAt = Date.now();
    let pollCount = 0;
    let intervalMs = POLL_INTERVAL_MS;
    cancelPollingRef.current = false;

    while (!cancelPollingRef.current) {
      pollCount++;
      try {
        const incident = await incidentsApi.getById(id);
        const latest = extractLatestAiRemark(incident.workSummary);
        if (latest && !seenRemarksRef.current.has(latest)) {
          seenRemarksRef.current.add(latest);
          const isError = /unavailable|error|failed/i.test(latest);
          const content = isError ? latest : formatAiAnswer(latest);
          const aiMsg: ChatMessage = {
            id: makeId(),
            role: "ai",
            content,
            timestamp: new Date().toISOString(),
          };
          // Remove waiting placeholder if present, then add the real reply.
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== WAITING_PLACEHOLDER_ID),
            aiMsg,
          ]);
          setAttemptCount((n) => n + 1);
          return;
        }
      } catch (e) {
        // Stop if token is dead — user needs to re-auth.
        if (e instanceof Error && /401|unauthor/i.test(e.message)) {
          setError("Your session has expired. Please reload and log in again.");
          return;
        }
        // Otherwise ignore transient errors and keep polling.
      }

      // After the initial window, slow the polling down so we don't hammer
      // the backend while waiting for a delayed AI response.
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        intervalMs = SLOW_POLL_INTERVAL_MS;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  // Reset chat state every time a new complaint is opened.
  useEffect(() => {
    if (!complaintId) return;
    cancelPollingRef.current = true; // stop any in-flight polling loop
    seededRef.current = false;
    seenRemarksRef.current = new Set();
    setMessages([]);
    setAttemptCount(0);
    setConclusion(null);
    setError(null);
  }, [complaintId]);

  // Seed the chat with the driver's first question and start polling.
  useEffect(() => {
    if (seededRef.current) return;
    if (!initialQuestion || !complaintId) return;
    seededRef.current = true;

    const driverMsg: ChatMessage = {
      id: makeId(),
      role: "driver",
      content: initialQuestion,
      timestamp: new Date().toISOString(),
    };
    setMessages([driverMsg]);
    setBusy(true);
    setError(null);

    // Show a friendly waiting message after 15s so the panel doesn't look frozen.
    const placeholderTimer = setTimeout(() => {
      setMessages((prev) =>
        prev.some((m) => m.id === WAITING_PLACEHOLDER_ID)
          ? prev
          : [
              ...prev,
              {
                id: WAITING_PLACEHOLDER_ID,
                role: "ai",
                content:
                  "AI is preparing a response. This can take 30–90 seconds. The answer will appear here as soon as it's ready — you can also check the History page.",
                timestamp: new Date().toISOString(),
              },
            ],
      );
    }, PLACEHOLDER_DELAY_MS);

    void pollForAiAnswer(complaintId).finally(() => {
      clearTimeout(placeholderTimer);
      setBusy(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, complaintId]);

  // Stop polling if the component unmounts.
  useEffect(() => {
    return () => {
      cancelPollingRef.current = true;
    };
  }, []);

  const askFollowUp = async (question: string) => {
    if (!complaintId) return;
    setBusy(true);
    setError(null);
    const driverMsg: ChatMessage = {
      id: makeId(),
      role: "driver",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, driverMsg]);
    try {
      await aiApi.createQuery({ userId, vehicleId, question });

      // Show the same waiting placeholder for follow-ups too.
      const placeholderTimer = setTimeout(() => {
        setMessages((prev) =>
          prev.some((m) => m.id === WAITING_PLACEHOLDER_ID)
            ? prev
            : [
                ...prev,
                {
                  id: WAITING_PLACEHOLDER_ID,
                  role: "ai",
                  content:
                    "AI is preparing a response. This can take 30–90 seconds.",
                  timestamp: new Date().toISOString(),
                },
              ],
        );
      }, PLACEHOLDER_DELAY_MS);

      try {
        await pollForAiAnswer(complaintId);
      } finally {
        clearTimeout(placeholderTimer);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = () => {
    const q = draft.trim();
    if (!q || busy || conclusion) return;
    setDraft("");
    void askFollowUp(q);
  };

  const submitWorkflow = async (resolved: boolean, continueAi: boolean) => {
    if (!complaintId) return;
    setBusy(true);
    setError(null);
    try {
      await workflowApi.submitDriverResponse({ complaintId, resolved, continueAi });
      if (resolved) {
        setConclusion("resolved");
        onConcluded?.("resolved");
      } else if (!continueAi) {
        setConclusion("escalated");
        onConcluded?.("escalated");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Workflow update failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const canContinueAi = attemptCount < MAX_AI_ATTEMPTS;
  // The action prompt (Yes/Keep trying/Escalate) only appears after a REAL AI
  // reply has been received — not after the placeholder.
  const lastRealAi = [...messages].reverse().find(
    (m) => m.role === "ai" && m.id !== WAITING_PLACEHOLDER_ID,
  );
  const showActionPrompt = !conclusion && !busy && !!lastRealAi;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" /> AI assistant
        </CardTitle>
        {conclusion === "resolved" && <Badge variant="secondary">Resolved</Badge>}
        {conclusion === "escalated" && <Badge variant="destructive">Escalated to vendor</Badge>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto rounded border bg-muted/30 p-3"
          style={{ minHeight: 280 }}
        >
          {messages.length === 0 && !busy && (
            <p className="text-sm text-muted-foreground">
              {complaintId
                ? "Waiting for AI to respond..."
                : "Submit the incident form to start the conversation."}
            </p>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking...
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {showActionPrompt && (
          <div className="rounded border border-dashed p-3">
            <p className="mb-2 text-sm font-medium">Did this resolve your issue?</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => submitWorkflow(true, false)} disabled={busy}>
                <ThumbsUp className="mr-1 h-3 w-3" /> Yes, resolved
              </Button>
              {canContinueAi && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => submitWorkflow(false, true)}
                  disabled={busy}
                >
                  Keep trying ({MAX_AI_ATTEMPTS - attemptCount} left)
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => submitWorkflow(false, false)}
                disabled={busy}
              >
                <ThumbsDown className="mr-1 h-3 w-3" /> Escalate to vendor
              </Button>
            </div>
          </div>
        )}

        {!conclusion && (
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a follow-up question..."
              disabled={busy || !complaintId}
            />
            <Button onClick={handleSend} disabled={busy || !draft.trim() || !complaintId}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isDriver = message.role === "driver";
  return (
    <div className={`flex gap-2 ${isDriver ? "justify-end" : "justify-start"}`}>
      {!isDriver && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
          isDriver ? "bg-primary text-primary-foreground" : "bg-background"
        }`}
      >
        {message.content}
      </div>
      {isDriver && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}