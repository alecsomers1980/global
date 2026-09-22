import { fromJsonSchema, type McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parsePlan, creditsFor } from "@/lib/spine/plan";
import { activeCount, creditBalance, getRequest, listRequests } from "@/lib/spine/requests";
import { queuePosition } from "@/lib/spine/state";
import type { CatalogueItem, Client, Question, RequestRow, RequestStatus } from "@/lib/spine/types";
import { logMcpAudit } from "./audit";
import { respond, toolError, wrapUntrusted } from "./untrusted";
import { registerWriteTools } from "./write-tools";

export type Identity = {
  userId: string;
  email: string;
  client: Client;
};

const REQUEST_STATUSES: RequestStatus[] = [
  "submitted",
  "triaged",
  "needs_info",
  "estimated",
  "client_approved",
  "scheduled",
  "in_progress",
  "delivered",
  "closed",
  "declined",
  "cancelled",
];

function unexpectedError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return toolError(`Something went wrong: ${message}`);
}

export function registerTools(server: McpServer, db: SupabaseClient, identity: Identity): void {
  const { client, userId } = identity;

  server.registerTool(
    "get_account",
    {
      description:
        "Your Ember plan: monthly credits, balance, how many requests are active or queued, open questions and estimates waiting for your decision. Call this first in a conversation about Ember work.",
      inputSchema: fromJsonSchema<Record<string, never>>({
        type: "object",
        properties: {},
        additionalProperties: false,
      }),
    },
    async (args: Record<string, never>) => {
      try {
        const plan = parsePlan(client.plan);
        const [active, balance, pendingEstimates, allRequests, openQuestions] = await Promise.all([
          activeCount(db, client.id),
          creditBalance(db, client),
          listRequests(db, client.id, "estimated"),
          listRequests(db, client.id),
          (async () => {
            const { count, error } = await db
              .from("questions")
              .select("id", { count: "exact", head: true })
              .eq("client_id", client.id)
              .eq("status", "sent");
            if (error) throw new Error(error.message);
            return count ?? 0;
          })(),
        ]);

        const queued = allRequests.filter((r) => r.status === "client_approved").length;

        const structured = {
          business: client.name,
          vertical: client.vertical,
          status: client.status,
          plan: {
            monthly_credits: plan.monthly_credits,
            max_active: plan.max_active,
            credit_sizes: plan.credit_sizes,
            turnaround: plan.turnaround,
          },
          credit_balance: balance,
          active_requests: active,
          queued_requests: queued,
          open_questions: openQuestions,
          pending_estimates: pendingEstimates.map((r) => ({
            id: r.id,
            credits: r.credits,
            due_by: r.estimate?.due_by ?? null,
            updated_at: r.updated_at,
          })),
        };

        await logMcpAudit(db, {
          userId,
          clientId: client.id,
          action: "tool_call",
          tool: "get_account",
          args,
          summary: `Claude read account ${client.name}`,
        });

        return respond(
          structured,
          pendingEstimates.map((r, i) => wrapUntrusted(`pending_estimates[${i}].title`, r.title))
        );
      } catch (err) {
        return unexpectedError(err);
      }
    }
  );

  server.registerTool(
    "list_catalogue",
    {
      description:
        "Things Ember can build for businesses like yours, each with a size (S/M/L) and credit price. Use it to suggest what to ask for, or pass catalogue_item_id to submit_request.",
      inputSchema: fromJsonSchema<Record<string, never>>({
        type: "object",
        properties: {},
        additionalProperties: false,
      }),
    },
    async (args: Record<string, never>) => {
      try {
        const { data, error } = await db
          .from("catalogue_items")
          .select("*")
          .eq("active", true)
          .order("sort_order");
        if (error) throw new Error(error.message);

        const rows: CatalogueItem[] = (data ?? []) as CatalogueItem[];
        const visible = rows.filter(
          (r) =>
            r.verticals.length === 0 ||
            (client.vertical !== null && r.verticals.includes(client.vertical))
        );
        const plan = parsePlan(client.plan);

        const structured = {
          count: visible.length,
          items: visible.map((r) => ({
            id: r.id,
            size: r.size,
            credits: creditsFor(plan, r.size),
            description: r.description,
          })),
        };

        await logMcpAudit(db, {
          userId,
          clientId: client.id,
          action: "tool_call",
          tool: "list_catalogue",
          args,
          summary: `Claude listed ${visible.length} catalogue item(s)`,
        });

        return respond(
          structured,
          visible.map((r, i) => wrapUntrusted(`items[${i}].name`, r.name))
        );
      } catch (err) {
        return unexpectedError(err);
      }
    }
  );

  server.registerTool(
    "list_requests",
    {
      description:
        "Your requests, newest first, with status, size, credits, queue position and due date. Filter by status if asked.",
      inputSchema: fromJsonSchema<{ status?: RequestStatus }>({
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: REQUEST_STATUSES,
          },
        },
        additionalProperties: false,
      }),
    },
    async (args: { status?: RequestStatus }) => {
      try {
        const [requests, all] = await Promise.all([
          listRequests(db, client.id, args.status),
          listRequests(db, client.id),
        ]);

        const structured = {
          count: requests.length,
          requests: requests.map((r) => ({
            id: r.id,
            status: r.status,
            size: r.size,
            credits: r.credits,
            queue_position: queuePosition(all, r.id),
            due_by: r.estimate?.due_by ?? null,
            created_at: r.created_at,
            updated_at: r.updated_at,
          })),
        };

        await logMcpAudit(db, {
          userId,
          clientId: client.id,
          action: "tool_call",
          tool: "list_requests",
          args,
          summary: `Claude listed ${requests.length} request(s)`,
        });

        return respond(
          structured,
          requests.map((r, i) => wrapUntrusted(`requests[${i}].title`, r.title))
        );
      } catch (err) {
        return unexpectedError(err);
      }
    }
  );

  server.registerTool(
    "get_request",
    {
      description:
        "One request in full: the description as submitted, the estimate (once Ember has sent one), any questions Ember asked, and the updated_at you need to approve or decline.",
      inputSchema: fromJsonSchema<{ id: string }>({
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      }),
    },
    async (args: { id: string }) => {
      try {
        const row = await getRequest(db, args.id);
        if (!row || row.client_id !== client.id) {
          return toolError("No request with that id.");
        }

        const { data: outboxData, error: outboxError } = await db
          .from("outbox")
          .select("id, draft")
          .eq("ref_table", "requests")
          .eq("ref_id", args.id)
          .eq("kind", "question_batch");
        if (outboxError) throw new Error(outboxError.message);

        const questionIds = (outboxData ?? []).flatMap((entry) => {
          const draft = entry.draft as { question_ids?: unknown } | null;
          if (!draft || !Array.isArray(draft.question_ids)) return [];
          return draft.question_ids.filter((x): x is string => typeof x === "string");
        });
        const uniqueQuestionIds = [...new Set(questionIds)];

        let questionRows: Question[] = [];
        if (uniqueQuestionIds.length > 0) {
          const { data: questionsData, error: questionsError } = await db
            .from("questions")
            .select("*")
            .in("id", uniqueQuestionIds)
            .order("created_at");
          if (questionsError) throw new Error(questionsError.message);
          questionRows = (questionsData ?? []) as Question[];
        }

        const all = await listRequests(db, client.id);
        const sentQuestions = questionRows.filter((q) => q.status === "sent");
        const next_step =
          row.status === "estimated"
            ? "Approve or decline with approve_estimate / decline_estimate, passing this updated_at."
            : sentQuestions.length > 0
              ? "Answer the open questions with answer_questions."
              : "Nothing needed from you right now.";

        const structured = {
          id: row.id,
          status: row.status,
          size: row.size,
          credits: row.credits,
          queue_position: queuePosition(all, row.id),
          deadline: row.deadline,
          catalogue_item_id: row.catalogue_item_id,
          estimate: row.estimate
            ? {
                credits: row.estimate.credits,
                due_by: row.estimate.due_by,
              }
            : null,
          questions: questionRows.map((q) => ({
            id: q.id,
            status: q.status,
            answered_at: q.answered_at,
          })),
          updated_at: row.updated_at,
          next_step,
        };

        await logMcpAudit(db, {
          userId,
          clientId: client.id,
          action: "tool_call",
          tool: "get_request",
          args,
          summary: `Claude read request ${row.id}`,
        });

        const untrusted = [
          wrapUntrusted("title", row.title),
          wrapUntrusted("description", row.description),
          wrapUntrusted("why_it_matters", row.why_it_matters),
          wrapUntrusted("examples", row.examples),
        ];

        if (row.estimate) {
          untrusted.push(wrapUntrusted("estimate.summary", row.estimate.summary));
          untrusted.push(wrapUntrusted("estimate.assumptions", row.estimate.assumptions.join("\n")));
        }

        questionRows.forEach((q, i) => {
          untrusted.push(wrapUntrusted(`questions[${i}].text`, q.text));
          untrusted.push(wrapUntrusted(`questions[${i}].why`, q.why));
          untrusted.push(wrapUntrusted(`questions[${i}].answer`, q.answer));
        });

        return respond(structured, untrusted);
      } catch (err) {
        return unexpectedError(err);
      }
    }
  );

  server.registerTool(
    "get_open_questions",
    {
      description:
        "Questions Ember has sent and is waiting on. Read them to the user and gather answers, then call answer_questions.",
      inputSchema: fromJsonSchema<Record<string, never>>({
        type: "object",
        properties: {},
        additionalProperties: false,
      }),
    },
    async (args: Record<string, never>) => {
      try {
        const { data, error } = await db
          .from("questions")
          .select("*")
          .eq("client_id", client.id)
          .eq("status", "sent")
          .order("created_at");
        if (error) throw new Error(error.message);

        const questions: Question[] = (data ?? []) as Question[];

        const structured = {
          count: questions.length,
          questions: questions.map((q) => ({
            id: q.id,
            batch_id: q.batch_id,
            created_at: q.created_at,
          })),
        };

        await logMcpAudit(db, {
          userId,
          clientId: client.id,
          action: "tool_call",
          tool: "get_open_questions",
          args,
          summary: `Claude listed ${questions.length} open question(s)`,
        });

        return respond(
          structured,
          questions.flatMap((q, i) => [
            wrapUntrusted(`questions[${i}].text`, q.text),
            wrapUntrusted(`questions[${i}].why`, q.why),
          ])
        );
      } catch (err) {
        return unexpectedError(err);
      }
    }
  );

  registerWriteTools(server, db, identity);
}

