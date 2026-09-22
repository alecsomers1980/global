import { fromJsonSchema, type McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractFacts } from "@/lib/ai/facts";
import { createOutbox } from "@/lib/spine/outbox";
import { answerQuestions, cleanAnswers } from "@/lib/spine/questions";
import { proposeFacts } from "@/lib/spine/record";
import { createRequest, getRequest, listRequests, transition } from "@/lib/spine/requests";
import { queuePosition } from "@/lib/spine/state";
import { triageAndQueue } from "@/lib/spine/triageRun";
import { StaleWriteError } from "@/lib/spine/types";
import { logMcpAudit } from "./audit";
import type { Identity } from "./tools";
import { respond, toolError } from "./untrusted";

export function registerWriteTools(server: McpServer, db: SupabaseClient, identity: Identity): void {
  server.registerTool(
    "submit_request",
    {
      description:
        "Log a new request for Ember Automations to estimate. A good request has: the goal, the area of the business or website it touches (affected_area), why it matters now, an example of the current pain, and any date it must be done by. Ask the user for anything missing before submitting. Ember reviews every request; you will get an estimate (in credits) or a few questions back — check with get_request or list_requests later.",
      inputSchema: fromJsonSchema<{
        title: string;
        description: string;
        why_it_matters: string;
        affected_area: string;
        examples?: string;
        deadline?: string;
        catalogue_item_id?: string;
      }>({
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 120 },
          description: { type: "string", minLength: 20 },
          why_it_matters: { type: "string", minLength: 10 },
          affected_area: { type: "string", minLength: 1, maxLength: 80 },
          examples: { type: "string" },
          deadline: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          catalogue_item_id: { type: "string", format: "uuid" },
        },
        required: ["title", "description", "why_it_matters", "affected_area"],
        additionalProperties: false,
      }),
    },
    async (args: {
      title: string;
      description: string;
      why_it_matters: string;
      affected_area: string;
      examples?: string;
      deadline?: string;
      catalogue_item_id?: string;
    }) => {
      try {
        const client = identity.client;

        if (client.status === "paused") {
          return toolError("This account is paused; Ember isn't taking new requests until it's resumed.");
        }

        const row = await createRequest(db, {
          ...args,
          client_id: client.id,
          source: "mcp",
          submitted_by: identity.email,
        });

        try {
          await triageAndQueue(db, row.id);
        } catch (error) {
          console.error(error);
        }
        // Triage moves it to "triaged"; report the status Claude will see on get_request.
        const status = (await getRequest(db, row.id))?.status ?? row.status;

        await logMcpAudit(db, {
          userId: identity.userId,
          clientId: client.id,
          action: "tool_call",
          tool: "submit_request",
          args,
          summary: `Claude submitted request ${row.id}`,
        });

        return respond(
          {
            id: row.id,
            status,
            message: "Ember will review this and come back to you with an estimate or a few questions.",
          },
          []
        );
      } catch (error) {
        return toolError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  server.registerTool(
    "approve_estimate",
    {
      description:
        "Accept an estimate on a request whose status is 'estimated'. Show the user the estimate summary, credits and due date from get_request and get their explicit yes first. Pass the updated_at you were given by get_request.",
      inputSchema: fromJsonSchema<{ request_id: string; updated_at: string }>({
        type: "object",
        properties: {
          request_id: { type: "string" },
          updated_at: { type: "string" },
        },
        required: ["request_id", "updated_at"],
        additionalProperties: false,
      }),
    },
    async (args: { request_id: string; updated_at: string }) => {
      try {
        const client = identity.client;
        const row = await getRequest(db, args.request_id);

        if (!row || row.client_id !== client.id) {
          return toolError("No request with that id.");
        }

        let updated;
        try {
          updated = await transition(db, row.id, "client_approved", "client", {
            expectedUpdatedAt: args.updated_at,
          });
        } catch (error) {
          if (error instanceof StaleWriteError) {
            return toolError(
              `This request changed since you read it. Call get_request again and retry with updated_at = ${error.current}.`
            );
          }

          if (error instanceof Error && error.message.startsWith("cannot move")) {
            return toolError(`This request isn't waiting for approval (status: ${row.status}).`);
          }

          throw error;
        }

        const all = await listRequests(db, client.id);
        const queue_position = queuePosition(all, row.id);

        await logMcpAudit(db, {
          userId: identity.userId,
          clientId: client.id,
          action: "tool_call",
          tool: "approve_estimate",
          args,
          summary: `Claude approved estimate on ${row.id}`,
        });

        return respond(
          {
            id: row.id,
            status: updated.status,
            queue_position,
            message: "Approved. Ember will schedule it and let you know.",
          },
          []
        );
      } catch (error) {
        return toolError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  server.registerTool(
    "decline_estimate",
    {
      description: "Turn down an estimate with a short reason so Ember can revise it. Confirm with the user first.",
      inputSchema: fromJsonSchema<{ request_id: string; updated_at: string; reason: string }>({
        type: "object",
        properties: {
          request_id: { type: "string" },
          updated_at: { type: "string" },
          reason: { type: "string", minLength: 3 },
        },
        required: ["request_id", "updated_at", "reason"],
        additionalProperties: false,
      }),
    },
    async (args: { request_id: string; updated_at: string; reason: string }) => {
      try {
        const client = identity.client;
        const row = await getRequest(db, args.request_id);

        if (!row || row.client_id !== client.id) {
          return toolError("No request with that id.");
        }

        let updated;
        try {
          updated = await transition(db, row.id, "declined", "client", {
            expectedUpdatedAt: args.updated_at,
            payload: { reason: args.reason },
          });
        } catch (error) {
          if (error instanceof StaleWriteError) {
            return toolError(
              `This request changed since you read it. Call get_request again and retry with updated_at = ${error.current}.`
            );
          }

          if (error instanceof Error && error.message.startsWith("cannot move")) {
            return toolError(`This request isn't waiting for approval (status: ${row.status}).`);
          }

          throw error;
        }

        await logMcpAudit(db, {
          userId: identity.userId,
          clientId: client.id,
          action: "tool_call",
          tool: "decline_estimate",
          args,
          summary: `Claude declined estimate on ${row.id}`,
        });

        return respond(
          {
            id: row.id,
            status: updated.status,
            message: "Declined. Ember will read your reason and may come back with a revised estimate.",
          },
          []
        );
      } catch (error) {
        return toolError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  server.registerTool(
    "answer_questions",
    {
      description:
        "Send answers to questions Ember has asked (from get_open_questions). Ask the user before answering on their behalf.",
      inputSchema: fromJsonSchema<{ answers: { question_id: string; answer: string }[] }>({
        type: "object",
        properties: {
          answers: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                question_id: { type: "string" },
                answer: { type: "string" },
              },
              required: ["question_id", "answer"],
              additionalProperties: false,
            },
          },
        },
        required: ["answers"],
        additionalProperties: false,
      }),
    },
    async (args: { answers: { question_id: string; answer: string }[] }) => {
      try {
        const client = identity.client;
        const cleaned = cleanAnswers(args.answers);

        if (cleaned.length === 0) {
          return toolError("No non-empty answers given.");
        }

        const result = await answerQuestions(db, client.id, cleaned, "mcp");

        if (result.retriageId) {
          try {
            await triageAndQueue(db, result.retriageId);
          } catch (error) {
            console.error(error);
          }
        }

        await logMcpAudit(db, {
          userId: identity.userId,
          clientId: client.id,
          action: "tool_call",
          tool: "answer_questions",
          args,
          summary: `Claude answered ${result.answered} question(s)`,
        });

        return respond(
          {
            answered: result.answered,
            message: "Thanks — Ember has your answers.",
          },
          []
        );
      } catch (error) {
        return toolError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  server.registerTool(
    "share_business_info",
    {
      description:
        "Tell Ember something about how the business works — systems used, who signs what off, a process, a rule. Ember's assistant turns it into short factual statements that Alec reviews before they join your business record.",
      inputSchema: fromJsonSchema<{ text: string }>({
        type: "object",
        properties: {
          text: { type: "string", minLength: 20, maxLength: 4000 },
        },
        required: ["text"],
        additionalProperties: false,
      }),
    },
    async (args: { text: string }) => {
      try {
        const client = identity.client;
        const facts = await extractFacts(client.ai_provider, client.name, args.text);

        if (facts.length === 0) {
          await logMcpAudit(db, {
            userId: identity.userId,
            clientId: client.id,
            action: "tool_call",
            tool: "share_business_info",
            args,
            summary: "Claude shared business info",
          });

          return respond({ noted: 0, message: "Nothing factual to record from that, but thanks." }, []);
        }

        const rows = await proposeFacts(db, client.id, facts, "mcp", identity.userId);

        await createOutbox(db, {
          client_id: client.id,
          kind: "fact_update",
          ref_table: "client_facts",
          ref_id: rows[0].id,
          draft: {
            title: "Business info shared via Claude",
            statements: facts,
            fact_ids: rows.map((r) => r.id),
            text: args.text,
          },
        });

        await logMcpAudit(db, {
          userId: identity.userId,
          clientId: client.id,
          action: "tool_call",
          tool: "share_business_info",
          args,
          summary: `Claude shared ${facts.length} business fact(s)`,
        });

        return respond(
          {
            noted: facts.length,
            message: "Thanks — noted for Alec to review before it goes on your record.",
          },
          []
        );
      } catch (error) {
        return toolError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
}

