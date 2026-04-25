// Student Copilot chat edge function — streaming SSE with tool calling
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ========== Student tool schemas ==========

const studentTools = [
  {
    type: "function",
    function: {
      name: "solve_doubt",
      description:
        "Create a concept explainer artifact with progressive-reveal steps, hints, and a try-yourself challenge.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              topic: { type: "string" },
              intro: { type: "string" },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    body: { type: "string" },
                    hint: { type: "string" },
                  },
                  required: ["body"],
                },
              },
              try_yourself: { type: "string" },
            },
            required: ["steps"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_practice_session",
      description:
        "Generate an interactive practice quiz with MCQ, short answer, assertion-reason, or multi-step questions.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              topic: { type: "string" },
              estimated_minutes: { type: "number" },
              difficulty: { type: "string", enum: ["standard", "competitive"] },
              presentation: { type: "string", enum: ["inline", "artifact"] },
              show_in_artifact_pane: { type: "boolean" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["mcq", "short", "assertion_reason", "multi_step"] },
                    topic: { type: "string" },
                    prompt: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    answer: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["prompt", "answer"],
                },
              },
            },
            required: ["questions"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_study_plan",
      description: "Build a multi-day study plan broken by chapter and time.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              exam: { type: "string" },
              total_days: { type: "number" },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          task: { type: "string" },
                          minutes: { type: "number" },
                          type: { type: "string" },
                        },
                        required: ["task", "minutes"],
                      },
                    },
                  },
                  required: ["day", "focus", "items"],
                },
              },
            },
            required: ["days"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_target_tracker",
      description: "Create a target tracker with current vs target score, gap analysis, and daily plan.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              exam: { type: "string" },
              current_score: { type: "number" },
              target_score: { type: "number" },
              max_score: { type: "number" },
              gap_analysis: { type: "array", items: { type: "string" } },
              todays_plan: {
                type: "array",
                items: {
                  type: "object",
                  properties: { task: { type: "string" }, minutes: { type: "number" } },
                  required: ["task", "minutes"],
                },
              },
              weekly_progress: {
                type: "array",
                items: {
                  type: "object",
                  properties: { week: { type: "string" }, score: { type: "number" } },
                  required: ["week", "score"],
                },
              },
            },
            required: ["current_score", "target_score"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_worked_solution",
      description: "Create a step-by-step worked solution with LaTeX, marking scheme, and common mistakes.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              topic: { type: "string" },
              problem: { type: "string" },
              given: { type: "array", items: { type: "string" } },
              find: { type: "string" },
              approach: { type: "string" },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "string" },
                    expression: { type: "string" },
                    justification: { type: "string" },
                  },
                  required: ["step"],
                },
              },
              final_answer: { type: "string" },
              common_mistakes: { type: "array", items: { type: "string" } },
              marks_breakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: { step: { type: "string" }, marks: { type: "number" } },
                  required: ["step", "marks"],
                },
              },
            },
            required: ["problem", "steps", "final_answer"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_formula_sheet",
      description: "Create a formula reference sheet with expressions, usage, units, and variable definitions.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              subject: { type: "string" },
              topic: { type: "string" },
              formulas: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    expression: { type: "string" },
                    when_to_use: { type: "string" },
                    units: { type: "string" },
                    variables: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { symbol: { type: "string" }, meaning: { type: "string" } },
                        required: ["symbol", "meaning"],
                      },
                    },
                  },
                  required: ["name", "expression"],
                },
              },
              quick_examples: { type: "array", items: { type: "string" } },
            },
            required: ["topic", "formulas"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_mastery_map",
      description:
        "Create a mastery map showing accuracy by topic with band classification and recommendations.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              range: { type: "string" },
              subjects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    overall_accuracy: { type: "number" },
                    topics: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          topic: { type: "string" },
                          accuracy: { type: "number" },
                          attempts: { type: "number" },
                          band: { type: "string", enum: ["mastery_ready", "stable", "reinforcement", "foundational_risk", "unknown"] },
                          last_seen: { type: "string" },
                        },
                        required: ["topic", "accuracy"],
                      },
                    },
                  },
                  required: ["subject", "topics"],
                },
              },
              weakest_3: { type: "array", items: { type: "string" } },
              strongest_3: { type: "array", items: { type: "string" } },
              cold_topics: { type: "array", items: { type: "string" } },
              recommendation: { type: "string" },
            },
            required: ["subjects"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_clarifications",
      description:
        "Ask the student 1-3 clarifying questions before generating an artifact. Use when topic, target, or timeline is unclear.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              intro: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { label: { type: "string" }, value: { type: "string" } },
                        required: ["label", "value"],
                      },
                    },
                    allow_other: { type: "boolean" },
                    multi_select: { type: "boolean" },
                  },
                  required: ["id", "question", "options"],
                },
              },
            },
            required: ["questions"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_test_debrief",
      description: "Create a test debrief with per-question breakdown and follow-up suggestions.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              test_name: { type: "string" },
              score: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    your_answer: { type: "string" },
                    correct_answer: { type: "string" },
                    correct: { type: "boolean" },
                    why_wrong: { type: "string" },
                    topic: { type: "string" },
                  },
                  required: ["q", "correct"],
                },
              },
              followups: {
                type: "array",
                items: {
                  type: "object",
                  properties: { topic: { type: "string" }, suggestion: { type: "string" } },
                  required: ["topic", "suggestion"],
                },
              },
            },
            required: ["test_name"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_progress_report",
      description: "Generate a progress report with accuracy stats, time analysis, and highlights.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "object",
            properties: {
              range: { type: "string" },
              overall_accuracy: { type: "number" },
              questions_attempted: { type: "number" },
              accuracy_by_topic: {
                type: "array",
                items: {
                  type: "object",
                  properties: { topic: { type: "string" }, accuracy: { type: "number" } },
                  required: ["topic", "accuracy"],
                },
              },
              time_by_subject: {
                type: "array",
                items: {
                  type: "object",
                  properties: { subject: { type: "string" }, minutes: { type: "number" } },
                  required: ["subject", "minutes"],
                },
              },
              highlights: { type: "array", items: { type: "string" } },
            },
            required: ["overall_accuracy", "questions_attempted"],
          },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
];

const TOOL_TO_ARTIFACT_TYPE: Record<string, string> = {
  solve_doubt: "concept_explainer",
  create_practice_session: "practice_session",
  create_study_plan: "study_plan",
  create_target_tracker: "target_tracker",
  create_worked_solution: "worked_solution",
  create_formula_sheet: "formula_sheet",
  create_mastery_map: "mastery_map",
  ask_clarifications: "clarifications",
  create_test_debrief: "test_debrief",
  create_progress_report: "progress_report",
};

// ========== Student base system prompt ==========

const STUDENT_BASE_PROMPT = `You are DonutAI — a friendly, expert tutor for Indian school students preparing for board exams (CBSE/State) and competitive exams (JEE/NEET).

CORE TUTORING PRINCIPLES:
- Never hand over the final answer directly. Ask what the student knows first.
- Break complex topics into small, digestible steps.
- Use grade-level vocabulary. If the student is stuck after 2 hints, give a worked example.
- Be warm, encouraging, and brief.

MATH FORMATTING:
- Always wrap math in LaTeX: $...$ inline, $$...$$ block.
- Use \\frac, \\sqrt, x^{2}, \\int, \\sum, \\vec{F}, \\Delta, \\theta, etc.
- Never write plain-text math like "F = ma" — always $F = ma$.

CHEMISTRY FORMATTING (mhchem):
- Wrap every chemical formula in $\\ce{...}$. Use -> for yields, <=> for equilibrium.
- Use $\\pu{...}$ for quantities with units. Never write plain text formulas.

CLARIFY BEFORE YOU BUILD:
- For practice sessions, study plans, target trackers, mastery maps — if the topic, number of days, target score, or other key info is missing, you MUST call ask_clarifications FIRST.
- For casual doubts and quick explanations, do NOT clarify — just answer.

ARTIFACT ROUTING — pick the RIGHT tool:
- Student asks a concept doubt → solve_doubt (concept explainer)
- Student asks to solve a specific problem step-by-step → create_worked_solution
- Student asks for formulas/reference → create_formula_sheet
- Student wants practice questions → create_practice_session
- Student wants a study plan → create_study_plan
- Student wants exam target tracking → create_target_tracker
- Student wants to see their progress → create_mastery_map or create_progress_report
- Student completed a test and wants analysis → create_test_debrief

INTERACTIVE TUTORING RULES:
1. SMALL PRACTICE (≤10 questions): Use create_practice_session, but mark it inline-only with content.presentation = "inline" and content.show_in_artifact_pane = false. It will render as interactive MCQs inside chat and must not appear as a separate right-pane artifact card.
2. LARGE PRACTICE (>10 questions): Use create_practice_session as a normal artifact with content.presentation = "artifact".
3. STUDY PLAN TASK FLOWS: When a student says "Start Day X Task Y" or "Teach me about [topic]" from a study plan, deliver content conversationally:
   - First, explain the key concepts clearly with examples and LaTeX formulas.
   - Then ask 2-3 quick check questions inline to test understanding.
   - Adapt based on their responses — if they struggle, simplify and give more examples. If they ace it, move to harder applications.
4. ALWAYS CHAT: Never respond with ONLY a tool call. Always include conversational text alongside any artifact. For example, if creating a study plan, also say "Here's your 5-day revision plan! Click on any task to start learning. Let me know if you want to adjust anything."
5. TONE: Be warm, friendly, encouraging. Use occasional emojis. Ask "Ready for the next one?" or "Want to try a harder version?" Feel like a supportive friend, not an exam proctor.

QUESTION DIVERSITY (for practice artifacts with >10 questions):
- Include a MIX of question types: conceptual MCQs, assertion-reason, numerical, multi-step.
- Always include detailed explanations for each answer.
- Vary difficulty. Tag each question with topic and subject.

IMAGE INPUTS:
- Students may attach photos of problems. Read carefully, describe what you see, then scaffold the solution.`;

// ========== Main handler ==========

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { thread_id, student_id, routine_key, messages, student_context, extra_system } = body;

    if (!thread_id || !student_id || !routine_key || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load routine from rp_routines
    const { data: routine } = await supabase
      .from("rp_routines")
      .select("*")
      .eq("key", routine_key)
      .maybeSingle();

    let systemPrompt = STUDENT_BASE_PROMPT;

    if (routine?.default_system_prompt) {
      systemPrompt += `\n\nROUTINE-SPECIFIC INSTRUCTIONS:\n${routine.default_system_prompt}`;
    }

    if (student_context) {
      systemPrompt += `\n\n${student_context}`;
    }

    if (extra_system) {
      systemPrompt += `\n\n${extra_system}`;
    }

    // ========== TOOL REUSE GUARD (Rule 7 — Session Continuity) ==========
    // Look up the most recent artifact on this thread. If one exists, instruct
    // the model to EXTEND/UPDATE it rather than spawn a new artifact for the
    // same scope. This prevents "duplicate practice session" / "duplicate
    // study plan" sprawl when a student returns to the same session.
    try {
      const { data: recentArtifact } = await supabase
        .from("student_copilot_artifacts")
        .select("id, type, title, content, created_at")
        .eq("thread_id", thread_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Also fetch the parent thread's tool + scope for context.
      const { data: thread } = await supabase
        .from("student_copilot_threads")
        .select("tool, scope_key, scope_meta")
        .eq("id", thread_id)
        .maybeSingle();

      if (recentArtifact) {
        // Compact the artifact content so we don't blow the prompt budget.
        const contentPreview = JSON.stringify(recentArtifact.content ?? {}).slice(0, 1500);
        systemPrompt += `\n\n========== ARTIFACT REUSE GUARD ==========
This thread already has an active artifact. DO NOT create a new artifact of the same type for the same scope — extend or refine the existing one in conversation instead.

EXISTING ARTIFACT:
- id: ${recentArtifact.id}
- type: ${recentArtifact.type}
- title: ${recentArtifact.title}
- created_at: ${recentArtifact.created_at}
- thread tool: ${thread?.tool ?? "unknown"}
- thread scope: ${thread?.scope_key ?? "unknown"}
- content preview: ${contentPreview}

REUSE RULES:
1. If the student's request is a CONTINUATION of the same scope (e.g. "next question", "explain this answer", "make it harder", "add 5 more"), respond conversationally and reference the existing artifact. Do NOT call any artifact-creation tool.
2. If the student wants something MEANINGFULLY DIFFERENT (a different chapter, a different tool type, a fresh topic), you MAY create a new artifact.
3. When in doubt, ASK the student: "Should I extend your existing ${recentArtifact.type} or start a fresh one?"
4. Never silently duplicate the same tool + scope.`;
      }
    } catch (guardErr) {
      console.error("Reuse guard lookup failed (non-fatal):", guardErr);
    }

    // Reshape messages with image support
    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.images && msg.images.length > 0) {
        const parts: any[] = [{ type: "text", text: msg.content }];
        for (const imgUrl of msg.images) {
          parts.push({ type: "image_url", image_url: { url: imgUrl } });
        }
        apiMessages.push({ role: msg.role, content: parts });
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        tools: studentTools,
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream SSE back, accumulate tool calls
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResp.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const toolCalls: Record<number, { name: string; args: string }> = {};
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let nl: number;
            while ((nl = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, nl);
              buffer = buffer.slice(nl + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) {
                controller.enqueue(encoder.encode(line + "\n"));
                continue;
              }

              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.tool_calls) {
                  for (const tc of delta.tool_calls) {
                    const idx = tc.index ?? 0;
                    if (!toolCalls[idx]) toolCalls[idx] = { name: "", args: "" };
                    if (tc.function?.name) toolCalls[idx].name = tc.function.name;
                    if (tc.function?.arguments) toolCalls[idx].args += tc.function.arguments;
                  }
                }
                controller.enqueue(encoder.encode(line + "\n"));
              } catch {
                controller.enqueue(encoder.encode(line + "\n"));
              }
            }
          }

          // Process completed tool calls — persist artifacts and emit markers
          const createdArtifactIds: string[] = [];

          for (const idx of Object.keys(toolCalls)) {
            const call = toolCalls[+idx];
            const artifactType = TOOL_TO_ARTIFACT_TYPE[call.name];
            if (!artifactType) continue;

            let parsed: any;
            try {
              parsed = JSON.parse(call.args);
            } catch (e) {
              console.error("Failed to parse tool args:", call.name, e);
              continue;
            }

            // Save artifact to DB
            const { data: art } = await supabase
              .from("student_copilot_artifacts")
              .insert({
                student_id,
                thread_id,
                type: artifactType,
                title: parsed.title ?? "Untitled",
                content: parsed.content ?? {},
                source: "ai",
              })
              .select("id, type, title, content, created_at")
              .single();

            if (art) {
              createdArtifactIds.push(art.id);
              // Emit artifact marker so client can detect and render
              const marker = JSON.stringify({
                id: art.id,
                type: artifactType,
                title: parsed.title ?? "Untitled",
                content: parsed.content ?? {},
              });
              controller.enqueue(
                encoder.encode(`\n__ARTIFACT__${marker}__END__\n`)
              );
            }
          }

          if (createdArtifactIds.length) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ sc_artifacts_created: createdArtifactIds })}\n\n`
              )
            );
          }
        } catch (e) {
          console.error("Stream processing error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("student-copilot-chat error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});