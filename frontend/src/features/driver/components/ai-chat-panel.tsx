import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { incidentsApi, workflowApi } from "@/lib/api/incidents";
import type { AiChatMessage } from "@/lib/types";

interface AiChatPanelProps {
  complaintId: number | null;
  /** The driver's original complaint description — shown as the first USER
   *  bubble since the backend's ai-chat endpoint doesn't include it. */
  initialQuestion: string;
  onConcluded?: (outcome: "resolved" | "escalated") => void;
  /** Read-only mode: hides input, action prompt, and counter. Just renders
   *  the conversation. Used by the history detail view. */
  readOnly?: boolean;
}

const MAX_AI_ATTEMPTS = 3;
const POLL_INTERVAL_MS = 2000;
const SLOW_POLL_INTERVAL_MS = 10000;
const POLL_FAST_WINDOW_MS = 60000;

/**
 * Some AI answers come back as a fenced ```json block with structured fields.
 * If so, format them readably. Otherwise return the raw text.
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

function messageKey(m: AiChatMessage, index: number): string {
  return `${m.sender}|${m.timestamp}|${m.attemptCount ?? "x"}|${index}`;
}

export function AiChatPanel({
  complaintId,
  initialQuestion,
  onConcluded,
  readOnly = false,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [waitingForAi, setWaitingForAi] = useState(false);
  const [conclusion, setConclusion] = useState<"resolved" | "escalated" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const cancelPollingRef = useRef(false);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, waitingForAi]);

  useEffect(() => {
    cancelPollingRef.current = false;
    setMessages([]);
    setConclusion(null);
    setError(null);
    setWaitingForAi(false);
    return () => {
      cancelPollingRef.current = true;
    };
  }, [complaintId]);

  const pollForNewMessages = async (id: number, expectedMin: number) => {
    const startedAt = Date.now();
    let intervalMs = POLL_INTERVAL_MS;

    while (!cancelPollingRef.current) {
      try {
        const chat = await incidentsApi.getAiChat(id);
        if (chat.length >= expectedMin) {
          setMessages(chat);
          return;
        }
      } catch (e) {
        if (e instanceof Error && /401|unauthor/i.test(e.message)) {
          setError("Your session has expired. Please reload and log in again.");
          return;
        }
      }
      if (Date.now() - startedAt > POLL_FAST_WINDOW_MS) {
        intervalMs = SLOW_POLL_INTERVAL_MS;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  useEffect(() => {
    if (!complaintId) return;
    let cancelled = false;

    const init = async () => {
      setBusy(true);
      setError(null);
      try {
        const initial = await incidentsApi.getAiChat(complaintId);
        if (cancelled) return;
        setMessages(initial);

        // In read-only mode, just fetch once. In interactive mode, poll if empty.
        if (initial.length === 0 && !readOnly) {
          setWaitingForAi(true);
          await pollForNewMessages(complaintId, 1);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load chat";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
          setWaitingForAi(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId, readOnly]);

  const aiAttempts = messages.filter((m) => m.sender === "AI").length;
  const canContinueAi = aiAttempts < MAX_AI_ATTEMPTS;
  const lastMessage = messages[messages.length - 1];
  const showActionPrompt =
    !readOnly &&
    !conclusion &&
    !busy &&
    !waitingForAi &&
    lastMessage?.sender === "AI";

  const askFollowUp = async (question: string) => {
    if (!complaintId) return;
    setBusy(true);
    setError(null);

    const optimisticUser: AiChatMessage = {
      sender: "USER",
      message: question,
      confidence: null,
      timestamp: new Date().toISOString(),
      attemptCount: null,
    };
    const previousCount = messages.length;
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      await workflowApi.submitDriverResponse({
        complaintId,
        resolved: false,
        continueAi: true,
        userFollowUp: question,
      });
      setWaitingForAi(true);
      await pollForNewMessages(complaintId, previousCount + 2);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Follow-up failed";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m !== optimisticUser));
    } finally {
      setBusy(false);
      setWaitingForAi(false);
    }
  };

  const handleSend = () => {
    const q = draft.trim();
    if (!q || busy || conclusion || !canContinueAi) return;
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

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" /> AI assistant
        </CardTitle>
        {conclusion === "resolved" && <Badge variant="secondary">Resolved</Badge>}
        {conclusion === "escalated" && (
          <Badge variant="destructive">Escalated to vendor</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto rounded border bg-muted/30 p-3"
        >
          {!complaintId && (
            <p className="text-sm text-muted-foreground">
              Submit the incident form to start the conversation.
            </p>
          )}

          {complaintId &&
            messages.length === 0 &&
            !waitingForAi &&
            !busy &&
            !error && (
              <p className="text-sm text-muted-foreground">
                {readOnly
                  ? "No AI conversation recorded for this incident."
                  : "Loading chat history…"}
              </p>
            )}

          {complaintId && initialQuestion && (
            <MessageBubble
              key="initial-question"
              message={{
                sender: "USER",
                message: initialQuestion,
                confidence: null,
                timestamp: "",
                attemptCount: null,
              }}
            />
          )}

          {messages.map((m, i) => (
            <MessageBubble key={messageKey(m, i)} message={m} />
          ))}

          {waitingForAi && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking…
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive shrink-0">{error}</p>}

        {showActionPrompt && (
          <div className="rounded border border-dashed p-3 shrink-0">
            <p className="mb-2 text-sm font-medium">Did this resolve your issue?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => submitWorkflow(true, false)}
                disabled={busy}
              >
                <ThumbsUp className="mr-1 h-3 w-3" /> Yes, resolved
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => submitWorkflow(false, false)}
                disabled={busy}
              >
                <ThumbsDown className="mr-1 h-3 w-3" /> Escalate to vendor
              </Button>
              {!canContinueAi && (
                <p className="w-full text-xs text-muted-foreground">
                  Maximum {MAX_AI_ATTEMPTS} AI attempts reached. Resolve or
                  escalate to continue.
                </p>
              )}
            </div>
          </div>
        )}

        {!readOnly && !conclusion && (
          <div className="space-y-2 shrink-0">
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
                placeholder={
                  canContinueAi
                    ? "Ask a follow-up question..."
                    : "AI attempts used. Resolve or escalate."
                }
                disabled={busy || !complaintId || !canContinueAi}
              />
              <Button
                onClick={handleSend}
                disabled={busy || !draft.trim() || !complaintId || !canContinueAi}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {complaintId && canContinueAi && (
              <p className="text-xs text-muted-foreground">
                {MAX_AI_ATTEMPTS - aiAttempts} AI{" "}
                {MAX_AI_ATTEMPTS - aiAttempts === 1 ? "attempt" : "attempts"} left.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: AiChatMessage }) {
  const isUser = message.sender === "USER";
  const content = isUser ? message.message : formatAiAnswer(message.message);

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-background"
        }`}
      >
        {content}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}