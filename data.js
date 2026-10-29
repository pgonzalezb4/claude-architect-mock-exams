window.DATA = {
 "scenarios": [
  {
   "id": 1,
   "title": "Customer Support Resolution Agent",
   "domains": [
    1,
    2,
    5
   ],
   "context": "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate."
  },
  {
   "id": 2,
   "title": "Code Generation with Claude Code",
   "domains": [
    3,
    5
   ],
   "context": "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution."
  },
  {
   "id": 3,
   "title": "Multi-Agent Research System",
   "domains": [
    1,
    2,
    5
   ],
   "context": "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports."
  },
  {
   "id": 4,
   "title": "Developer Productivity with Claude",
   "domains": [
    2,
    3,
    1
   ],
   "context": "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers."
  },
  {
   "id": 5,
   "title": "Claude Code for Continuous Integration",
   "domains": [
    3,
    4
   ],
   "context": "You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives."
  },
  {
   "id": 6,
   "title": "Structured Data Extraction",
   "domains": [
    4,
    5
   ],
   "context": "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems."
  }
 ],
 "exams": [
  {
   "id": "exam1",
   "title": "Mock Exam 1",
   "scenarioIds": [
    1,
    2,
    3,
    6
   ],
   "questions": [
    {
     "n": 1,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Loop terminates on stop_reason, not on presence of text content",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your support agent's loop exits early in about 30% of conversations, before any tool has run. The loop code is:\n\n```python\nwhile True:\n    response = client.messages.create(model=MODEL, tools=tools, messages=messages)\n    if any(block.type == \"text\" for block in response.content):\n        return response  # assume text means the answer is final\n    # otherwise execute tool_use blocks and continue\n```\n\nLogs show these responses contain a text block (\"Let me pull up your order.\") followed by a `tool_use` block for `lookup_order`. What is the correct fix?",
     "options": [
      {
       "id": "A",
       "text": "Instruct the model in the system prompt never to write text in a turn that also calls a tool, so the text check stays valid."
      },
      {
       "id": "B",
       "text": "Control the loop with `response.stop_reason`: continue (execute the tools, append the results) while it is `\"tool_use\"`, and finish when it is `\"end_turn\"`."
      },
      {
       "id": "C",
       "text": "Keep the text check but add a maximum of 10 iterations so runaway loops are impossible."
      },
      {
       "id": "D",
       "text": "Parse the response text for closing phrases such as \"anything else I can help with\" and treat those as the signal that the conversation is complete and the loop may exit."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The agentic loop lifecycle is driven by `stop_reason`. A response can legitimately contain both text and a `tool_use` block, so text content is not a completion signal.",
      "wrong": {
       "A": "Relies on probabilistic prompt compliance to protect a fragile completion check; the loop should not depend on the model's formatting habits at all.",
       "C": "An iteration cap is a safety net, not the primary stopping mechanism, and it does nothing to stop the premature exit described.",
       "D": "Parsing natural-language signals to detect completion is a named anti-pattern; phrasing varies and the loop would still mis-terminate."
      }
     },
     "studyRef": "Task Statement 1.1 (study the stop_reason loop and the three loop-control anti-patterns)"
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Programmatic prerequisite that checks ownership, not just that verification happened",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You already block `lookup_order` and `process_refund` until `get_customer` has returned a verified customer ID for the session. An audit still finds that about 2% of refunds were issued for correctly verified customers (for example verified as `C-1042`) against orders belonging to other accounts (for example order `#88231`, owned by `C-2210`) because the customer typed in someone else's order number. The business requirement is that a refund can never be issued on an order the verified customer does not own. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "In the `process_refund` gate, compare the `customer_id` on the order returned by `lookup_order` with the session's verified customer ID and reject the call on mismatch before it executes."
      },
      {
       "id": "B",
       "text": "Add a line to the system prompt stating that the agent must confirm the order belongs to the verified customer before issuing any refund."
      },
      {
       "id": "C",
       "text": "Add few-shot examples in which the agent notices an order/customer mismatch and escalates."
      },
      {
       "id": "D",
       "text": "Require `get_customer` to be called again immediately before every `process_refund`."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Hard business rules need deterministic enforcement. The existing gate proves that identity was verified, but not that the order belongs to that identity, so the gate must check ownership programmatically.",
      "wrong": {
       "B": "Relies on probabilistic compliance for a financial control; the 2% failure rate is exactly what a prompt-only rule leaves behind.",
       "C": "Examples improve the odds but cannot guarantee the check happens on every call; the rule requires deterministic enforcement.",
       "D": "Re-verifying identity addresses a different problem (freshness of verification). The customer is already correctly verified; the missing check is order ownership."
      }
     },
     "studyRef": "Task Statement 1.4 (programmatic prerequisites and gates for financial operations)"
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "PostToolUse hook to normalize heterogeneous formats from MCP tools",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`get_customer` returns `last_login` as an ISO 8601 string, while `lookup_order` (owned by another team, which cannot change it this quarter) returns `created_at` as Unix epoch seconds and `status` as a numeric code (`1`=processing, `2`=shipped, `3`=delivered, `4`=returned). The agent frequently miscalculates \"delivered X days ago\" and sometimes misreports order status. What is the most reliable fix?",
     "options": [
      {
       "id": "A",
       "text": "Document the epoch format and the status-code table in the system prompt, and instruct the agent to convert every timestamp and status itself before it reasons about the order."
      },
      {
       "id": "B",
       "text": "Create a normalization subagent that the agent must call after every tool result and wait for its cleaned output."
      },
      {
       "id": "C",
       "text": "Add a `PostToolUse` hook that converts timestamps to ISO 8601 and maps status codes to labels."
      },
      {
       "id": "D",
       "text": "Wait for the owning team to change `lookup_order` to emit ISO 8601 timestamps and string statuses in their next release."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`PostToolUse` hooks transform tool results deterministically before the model processes them, so the model always reasons over one consistent format regardless of which MCP tool produced the data.",
      "wrong": {
       "A": "Asks the model to do date arithmetic and table lookups on every turn; compliance is probabilistic and the existing errors show it is already unreliable.",
       "B": "Over-engineered: adds a model call and latency per tool result to do a simple deterministic transformation that a hook performs for free.",
       "D": "Blocks on a dependency outside your control; the stem states the other team cannot change it, and the hook solves it on your side immediately."
      }
     },
     "studyRef": "Task Statement 1.5 (PostToolUse normalization of timestamps and status codes)"
    },
    {
     "n": 4,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Decompose multi-concern requests, investigate in parallel with shared context, synthesize",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "A customer writes: \"I was double-charged on order #5521, the blender from order #5530 arrived cracked, and I also need to change the shipping address on #5544.\" Which TWO design choices best handle this multi-concern request? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Resolve only the first issue in the message and ask the customer to send the others as separate messages to keep each conversation focused."
      },
      {
       "id": "B",
       "text": "Split the message into its three distinct issues, verify the customer once, and investigate the independent issues concurrently using that shared verified context."
      },
      {
       "id": "C",
       "text": "Start three independent conversations, one per issue, each of which repeats identity verification and cannot see the others' findings."
      },
      {
       "id": "D",
       "text": "Wait until all three investigations return, then synthesize one unified response that gives the resolution or next step for each issue."
      },
      {
       "id": "E",
       "text": "Escalate any message containing more than one issue, since multi-concern requests exceed autonomous capability."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "Multi-concern requests should be decomposed into distinct items, investigated in parallel using shared context (customer identity is verified once), and then synthesized into a single coherent resolution.",
      "wrong": {
       "A": "Pushes work back to the customer and hurts first-contact resolution; the agent is capable of handling all three.",
       "C": "Throws away shared context, duplicates verification and tool calls, and risks contradictory answers.",
       "E": "Complexity alone is not an escalation trigger; all three issues are within the agent's tools and policy."
      }
     },
     "studyRef": "Task Statement 1.4 (decompose multi-concern requests, parallel investigation, unified synthesis)"
    },
    {
     "n": 5,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "System prompt wording can override well-written tool descriptions",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You added a `get_invoice` tool with a detailed description (\"Use for charge disputes, duplicate charges, and line-item questions; takes an invoice ID or order ID...\"). It was selected correctly in testing. After a system-prompt revision that included the line \"When customers ask about charges or billing, always look up their order first to confirm the details,\" the agent now calls `lookup_order` for about 70% of billing questions that need invoice line items. What is the most likely cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "The `get_invoice` description is still too short; expand it with more example queries and an explicit note on when to prefer it over `lookup_order` in billing conversations, then re-test."
      },
      {
       "id": "B",
       "text": "Merge `get_invoice` into `lookup_order` so there is no choice to make, returning invoice and order data from one generic lookup."
      },
      {
       "id": "C",
       "text": "Add a routing layer that parses each billing request and pre-selects the tool from detected keywords and invoice-ID patterns."
      },
      {
       "id": "D",
       "text": "The new billing-keyword sentence in the system prompt overrides the tool descriptions; reword or remove it."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "System prompt wording can create unintended tool associations that override tool descriptions. The regression appeared exactly when the instruction was added, and the description had worked before.",
      "wrong": {
       "A": "The description already worked before the prompt change; this fixes a different problem than the one that was introduced.",
       "B": "Consolidation is a larger change that does not address why selection regressed; it also sacrifices a clean purpose-specific tool.",
       "C": "Over-engineered; a simple wording review of the prompt is the proportionate first step."
      }
     },
     "studyRef": "Task Statement 2.1 (keyword-sensitive system prompt instructions vs tool descriptions)"
    },
    {
     "n": 6,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Structured error metadata vs uniform 'Operation failed'",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`process_refund` returns `{\"isError\": true, \"content\": \"Operation failed\"}` for every failure: gateway timeouts (about 3% of calls), refunds outside the 30-day window (about 9%), and permission problems for the service account. The agent retries all of them three times, then tells customers \"something went wrong.\" What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Tell the agent in the system prompt to retry a failed `process_refund` call only when the failure message suggests that the problem is temporary, and otherwise to apologize to the customer and stop."
      },
      {
       "id": "B",
       "text": "Return structured errors with an `errorCategory` (transient, business, permission), an `isRetryable` flag, and a human-readable description, including a customer-friendly explanation for business-rule violations."
      },
      {
       "id": "C",
       "text": "Add exponential-backoff retries inside the tool for every failure type."
      },
      {
       "id": "D",
       "text": "Throw an unhandled exception so the SDK run terminates and pages an engineer."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Uniform errors strip the agent of what it needs to choose a recovery path. Category plus retryability lets it retry timeouts, explain policy limits, and escalate permission failures.",
      "wrong": {
       "A": "With a uniform \"Operation failed\" message there is nothing to tell temporary from permanent, so the instruction cannot be followed reliably.",
       "C": "Retrying business-rule and permission failures is pointless and delays the customer; retryability must differ by error type.",
       "D": "Terminates the conversation for failures the agent could recover from or explain, and hides context instead of exposing it."
      }
     },
     "studyRef": "Task Statement 2.2 (errorCategory, isRetryable, business-rule explanations)"
    },
    {
     "n": 7,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "Interception hook that blocks a policy violation and redirects to escalation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Policy requires human approval for refunds over $500. The system prompt says so, yet an audit finds about 1.5% of refunds above that amount (for example $640) were processed autonomously. You want these cases to reach a human with context instead. Which implementation best meets the requirement?",
     "options": [
      {
       "id": "A",
       "text": "Intercept `process_refund` with a hook; if `amount > 500`, block it and direct the agent to `escalate_to_human`."
      },
      {
       "id": "B",
       "text": "Rewrite the system prompt rule in capital letters and add three few-shot examples of $500+ refunds being escalated to a human."
      },
      {
       "id": "C",
       "text": "Add a `PostToolUse` hook that detects refunds over $500 after they complete and queues them for reversal by the finance team."
      },
      {
       "id": "D",
       "text": "Place the $500 threshold as the final sentence of the `process_refund` tool description, since models attend most to the end of text, and state that larger refunds must be escalated to a human agent."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A pre-execution interception hook (`PreToolUse` in the Agent SDK) gives deterministic compliance and can redirect to an alternative workflow, which a prompt rule cannot guarantee.",
      "wrong": {
       "B": "Still probabilistic. A non-zero failure rate on a financial control is not acceptable when deterministic enforcement is available.",
       "C": "Runs after the money has moved and relies on reversal; the requirement is to prevent the action and redirect it before execution.",
       "D": "A tool description is guidance, not enforcement; the model can still call the tool with an out-of-policy amount."
      }
     },
     "studyRef": "Task Statement 1.5 (tool call interception hooks vs prompt-based enforcement)"
    },
    {
     "n": 8,
     "scenario": 1,
     "domain": 2,
     "ts": "2.4",
     "tests": "Choose an existing community MCP server over a custom one for a standard integration",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your team wants the support agent to log every escalation as a ticket in Jira (create issue, search for duplicates, transition status). An engineer proposes writing a custom Jira MCP server, estimated at three weeks. A maintained community Jira MCP server already exposes create, search, and transition tools. Your only custom MCP server today wraps your internal order and refund backend. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Build the custom Jira server anyway so you control the tool descriptions and error formats."
      },
      {
       "id": "B",
       "text": "Have the agent call the Jira REST API through the Bash tool, with the API usage documented in the system prompt."
      },
      {
       "id": "C",
       "text": "Fork the community Jira server and rewrite its tools to match the naming used by your internal order tools, then maintain the fork."
      },
      {
       "id": "D",
       "text": "Adopt the community Jira server in the project `.mcp.json` (token via `${JIRA_TOKEN}`) and reserve custom servers for team-specific workflows such as the order and refund backend."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "For standard integrations such as Jira, prefer an existing community MCP server and reserve custom servers for team-specific workflows. This avoids weeks of build and maintenance for no functional gain.",
      "wrong": {
       "A": "Duplicates a maintained integration; tool descriptions can be improved on the community server's side only if a gap actually appears.",
       "B": "Bypasses MCP tools, giving the agent unstructured REST calls with no tool boundaries or structured error handling, and relies on prompt documentation.",
       "C": "Forking creates a maintenance burden and diverges from upstream fixes for a purely cosmetic naming benefit."
      }
     },
     "studyRef": "Task Statement 2.4 (community MCP servers for standard integrations; custom servers for team-specific workflows)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Honor an explicit request for a human immediately",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In a sampled week, 22% of customers who wrote messages like \"Just transfer me to a human\" had the agent run `get_customer` and `lookup_order` and offer a refund before escalating, and CSAT for those conversations is low. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Add sentiment analysis to the pipeline and automatically escalate whenever the detected frustration in the customer's messages crosses a tuned negativity threshold, since angry customers are the ones who most want a person."
      },
      {
       "id": "B",
       "text": "Have the agent self-report a confidence score from 1 to 10 before each response and escalate automatically when it falls below a threshold."
      },
      {
       "id": "C",
       "text": "Add a system prompt rule: when a customer explicitly asks for a human, call `escalate_to_human` immediately with a summary."
      },
      {
       "id": "D",
       "text": "Let the agent attempt up to three tool calls first so the human receives a richer case."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Explicit customer requests for a human are a clear escalation trigger and should be honored immediately. An explicit rule removes the ambiguity that causes the investigate-first behavior.",
      "wrong": {
       "A": "Sentiment is an unreliable proxy and solves a different problem; these customers have already stated what they want.",
       "B": "Self-reported confidence is poorly calibrated and unrelated to whether the customer asked for a human.",
       "D": "Overrides the customer's stated preference and adds delay; the handoff summary can be built from what is already known."
      }
     },
     "studyRef": "Task Statement 5.2 (escalation triggers; honoring explicit human requests)"
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 2,
     "ts": "2.3",
     "tests": "Forced tool_choice for first turn, then auto",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Every new conversation must begin with a `classify_request` call (returns intent and urgency) before any other tool is used, but the model sometimes skips it and answers directly. After the classification step the agent should operate normally and be able to end with a text reply. Which configuration achieves this?",
     "options": [
      {
       "id": "A",
       "text": "Set `tool_choice` to `\"any\"` on the first request."
      },
      {
       "id": "B",
       "text": "Set `tool_choice` to `{\"type\": \"tool\", \"name\": \"classify_request\"}` on the first request only, then use `\"auto\"` on follow-up turns."
      },
      {
       "id": "C",
       "text": "Add \"ALWAYS call classify_request first, before any other tool, at the start of every new conversation\" to the top of the system prompt in bold capital letters."
      },
      {
       "id": "D",
       "text": "Force `classify_request` on every request in the loop."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Forced tool selection guarantees a specific tool runs first. Subsequent turns return to `\"auto\"` so the loop can call other tools and finish with text. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "`\"any\"` guarantees some tool call, but the model could choose `get_customer` or another tool instead of `classify_request`.",
       "C": "Probabilistic compliance; the requirement is a guarantee, which `tool_choice` provides.",
       "D": "The model would be forced to call the classifier on every turn and could never call other tools or produce a final text answer."
      }
     },
     "studyRef": "Task Statement 2.3 (tool_choice auto / any / forced selection)"
    },
    {
     "n": 11,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Structured handoff summary for humans without transcript access",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Today `escalate_to_human` receives only `{\"customer_message\": \"<last message>\"}`. Human agents cannot see the conversation transcript and report spending 4 to 6 minutes re-asking customers for information the agent already gathered. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Attach the full raw conversation JSON, including every tool call and result, to every escalation so humans can read what was said."
      },
      {
       "id": "B",
       "text": "Have the human agents call `get_customer` and `lookup_order` themselves when they pick up each escalated case, so they can rebuild the context from the backend systems directly."
      },
      {
       "id": "C",
       "text": "Include a sentiment score and a self-reported confidence value with each escalation so that humans can prioritize their queue."
      },
      {
       "id": "D",
       "text": "Have the agent pass a structured summary (customer ID, root cause, amount, next step) in the payload."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When humans lack transcript access, the escalation must carry a compact, structured summary containing the facts needed to act immediately.",
      "wrong": {
       "A": "Gives the human a long raw artifact to dig through instead of the specific facts and recommended action they need.",
       "B": "Duplicates work already done and still omits the root cause analysis and the recommended action.",
       "C": "These are unreliable signals and not actionable; they do not replace customer ID, root cause, amount, and next step."
      }
     },
     "studyRef": "Task Statement 1.4 (structured handoff protocols for escalation)"
    },
    {
     "n": 12,
     "scenario": 1,
     "domain": 2,
     "ts": "2.4",
     "tests": "Project .mcp.json with environment variable expansion",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team develops the support agent in Claude Code and all engineers need the shared orders MCP server. Currently each engineer hand-edits a personal config with their own API token, and a token was once committed by mistake. You want the server configuration in the repository without committing secrets. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Define the server in the project-scoped `.mcp.json` with the token referenced as `${ORDERS_API_TOKEN}`, and have each engineer set that environment variable locally."
      },
      {
       "id": "B",
       "text": "Commit the token directly in `.mcp.json`, since the repository is private."
      },
      {
       "id": "C",
       "text": "Keep each engineer's personal `~/.claude.json` entry with their own token, and document the setup steps and required variables in the repository README for new hires to follow."
      },
      {
       "id": "D",
       "text": "Paste the server definition and token into `CLAUDE.md` and reference it with `@import`."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Project-scoped `.mcp.json` shares team tooling through version control, and environment variable expansion keeps credentials out of the repository.",
      "wrong": {
       "B": "Commits a secret to version control; private repos still leak credentials through clones, forks, and history.",
       "C": "User scope is for personal or experimental servers; this leaves shared tooling unversioned and inconsistent.",
       "D": "`CLAUDE.md` holds instructions and context, not MCP server definitions, and would also expose the token."
      }
     },
     "studyRef": "Task Statement 2.4 (.mcp.json vs ~/.claude.json; ${ENV_VAR} expansion)"
    },
    {
     "n": 13,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Multiple customer matches require clarification, not heuristics",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`get_customer(name=\"Maria Santos\")` returns three records. The agent currently picks the one with the most recent order and proceeds. In an audit of 60 such conversations, 7 were the wrong customer, and order details were disclosed. Company policy forbids revealing any account details until the caller has been identified. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Select the match with the highest relevance score returned by the tool."
      },
      {
       "id": "B",
       "text": "List the matching accounts with their addresses and recent orders, and ask the customer to choose the one that is theirs from the displayed list before continuing with the request."
      },
      {
       "id": "C",
       "text": "Instruct the agent to ask the customer for an additional identifier (such as email, phone last four, or an order number) whenever a lookup returns multiple matches."
      },
      {
       "id": "D",
       "text": "Escalate every multi-match lookup to a human agent."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Multiple matches require clarification via additional identifiers rather than heuristic selection, which silently risks the wrong account.",
      "wrong": {
       "A": "Still a heuristic choice among legitimately different customers; relevance to a name does not establish identity.",
       "B": "Discloses other customers' personal data before identity is established.",
       "D": "Unnecessary: one extra identifier from the customer usually resolves it, preserving first-contact resolution."
      }
     },
     "studyRef": "Task Statement 5.2 (ambiguity resolution when tools return multiple matches)"
    },
    {
     "n": 14,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Append assistant turn and tool results to history each iteration",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The agent repeatedly calls `lookup_order` for the same order ID six to ten times before answering. Your loop rebuilds the request each iteration like this:\n\n```python\nmessages = [{\"role\": \"user\", \"content\": user_msg}]\nwhile True:\n    resp = client.messages.create(model=MODEL, tools=tools, messages=messages)\n    if resp.stop_reason == \"end_turn\":\n        break\n    results = [run_tool(b) for b in resp.content if b.type == \"tool_use\"]\n    messages = [{\"role\": \"user\", \"content\": user_msg + \"\\nLatest tool output: \" + str(results)}]\n```\n\nWhat is the root cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "Add an iteration cap of 5 so repeated calls stop sooner."
      },
      {
       "id": "B",
       "text": "The loop discards history each iteration, so the model never sees its prior tool calls; append the assistant response and the `tool_result` blocks to the running `messages` list instead."
      },
      {
       "id": "C",
       "text": "Add a system prompt instruction: \"Never call the same tool twice.\""
      },
      {
       "id": "D",
       "text": "Cache `lookup_order` results by argument in the tool layer so that repeated calls return quickly and do not hit the order database more than once per conversation or per customer."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The model reasons from the conversation history. Tool results must be appended (with the assistant turn that requested them) so each iteration builds on what was learned previously.",
      "wrong": {
       "A": "A cap hides the symptom and can cut off legitimate work; it does not give the model its missing context.",
       "C": "The model cannot comply sensibly when it cannot see earlier calls; this also forbids legitimate repeated calls with different arguments.",
       "D": "Makes the redundant calls cheaper but leaves the reasoning defect: the model still does not know it already has the data."
      }
     },
     "studyRef": "Task Statement 1.1 (tool results appended to conversation history)"
    },
    {
     "n": 15,
     "scenario": 1,
     "domain": 2,
     "ts": "2.3",
     "tests": "Scope tool access per agent; route out-of-role needs elsewhere",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "The support agent is configured with 18 tools: the four customer-facing tools plus 14 internal tools for inventory adjustments, pricing overrides, and fraud review. Tool selection errors have risen to 11%, and the agent occasionally calls internal tools in customer chats. Which TWO changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Restrict the support agent to the four or five tools its role needs."
      },
      {
       "id": "B",
       "text": "Keep all 18 tools and add a long tool-selection guide to the system prompt."
      },
      {
       "id": "C",
       "text": "Route the rare cases that need internal tools to a separate specialized agent (or the coordinator) that owns those tools."
      },
      {
       "id": "D",
       "text": "Set `tool_choice` to `\"any\"` so the agent always calls a tool."
      },
      {
       "id": "E",
       "text": "Add one few-shot example per tool, 18 in total, to the system prompt."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "Too many tools degrade selection reliability and invite out-of-role misuse. Scope each agent to its role and route uncommon needs through a specialized agent.",
      "wrong": {
       "B": "More text does not reduce decision complexity and remains probabilistic; the agent can still call tools it should not have.",
       "D": "Forces a tool call on every turn without improving which tool is selected, and prevents plain-text replies.",
       "E": "Adds heavy token overhead and still leaves 18 competing options; it does not remove the out-of-role tools."
      }
     },
     "studyRef": "Task Statement 2.3 (too many tools degrade selection; scoped tool access)"
    },
    {
     "n": 16,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Diagnose user-level vs project-level CLAUDE.md placement",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A senior engineer added \"Use pnpm, never npm; run `pnpm test:unit` before committing\" to `~/.claude/CLAUDE.md`. Claude Code follows it on her machine, but a new teammate who just cloned the repository finds Claude running `npm install`. What is the cause and the fix?",
     "options": [
      {
       "id": "A",
       "text": "The new teammate must run `/init` so Claude regenerates the instructions from the codebase."
      },
      {
       "id": "B",
       "text": "Ask the teammate to copy the senior engineer's `~/.claude/CLAUDE.md` into their own home directory, and to refresh that copy by hand whenever the original file changes."
      },
      {
       "id": "C",
       "text": "Add the rule to a `.claude/config.json` file that Claude Code reads on startup."
      },
      {
       "id": "D",
       "text": "User-level `~/.claude/CLAUDE.md` is personal and not shared through version control; move the instruction to the project-level `CLAUDE.md` (or `.claude/CLAUDE.md`) and commit it."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The CLAUDE.md hierarchy has user, project, and directory levels. Only project-level files travel with the repository, so team-wide standards belong there.",
      "wrong": {
       "A": "`/init` generates a starter CLAUDE.md from the code; it cannot recover instructions that exist only in someone else's home directory.",
       "B": "Manual copying is fragile and drifts; it reproduces the problem for the next hire instead of fixing where the rule lives.",
       "C": "Describes a configuration file that does not exist in Claude Code."
      }
     },
     "studyRef": "Task Statement 3.1 (CLAUDE.md hierarchy: user vs project vs directory)"
    },
    {
     "n": 17,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Selective @import of standards per package",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your monorepo has `packages/web`, `packages/api`, and `packages/mobile`, and a `standards/` folder with `typescript.md`, `react.md`, `rest-api.md`, and `db.md`. The root `CLAUDE.md` currently `@import`s all four, so every session carries all standards even when working in a single package. What is the best restructure?",
     "options": [
      {
       "id": "A",
       "text": "Keep the root-level imports of all four files and add a note telling Claude to disregard any imported standards that do not apply to the package it is working in."
      },
      {
       "id": "B",
       "text": "Remove the imports from the root file and, in each package's `CLAUDE.md`, `@import` only the standards files relevant to that package."
      },
      {
       "id": "C",
       "text": "Copy the text of each relevant standards file into every package's `CLAUDE.md`."
      },
      {
       "id": "D",
       "text": "Move all standards into each developer's `~/.claude/CLAUDE.md`."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`@import` keeps CLAUDE.md modular, and per-package imports let each package load only the standards that apply to it, based on maintainers' domain knowledge.",
      "wrong": {
       "A": "Still loads everything into context and depends on the model ignoring irrelevant text.",
       "C": "Duplicates content that will drift; `@import` exists to reference a single source of truth.",
       "D": "User-level files are not shared via version control, so standards would no longer be consistent across the team."
      }
     },
     "studyRef": "Task Statement 3.1 (@import syntax for modular CLAUDE.md)"
    },
    {
     "n": 18,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Use /memory and hierarchy knowledge to diagnose inconsistent behavior",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Two developers on the same repository report that Claude applies the \"use `Result<T>` for errors\" convention in some sessions and ignores it in others. Which TWO steps are the most effective for diagnosing the cause? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Run `/memory` in a consistent and an inconsistent session and compare which memory files are loaded."
      },
      {
       "id": "B",
       "text": "Add \"IMPORTANT\" and repeat the convention three times in the file that is already loaded."
      },
      {
       "id": "C",
       "text": "Delete every `CLAUDE.md` and rerun `/init` to rebuild the configuration from scratch."
      },
      {
       "id": "D",
       "text": "Assume the variation is model nondeterminism and enable extended thinking in the failing sessions."
      },
      {
       "id": "E",
       "text": "Check whether the convention lives only in a user-level file or in a subdirectory `CLAUDE.md` instead of the project-level file."
      }
     ],
     "answer": [
      "A",
      "E"
     ],
     "explanation": {
      "correct": "`/memory` reveals which memory files are actually loaded in a session. Hierarchy placement explains inconsistency: user-level files are personal, and directory-level files load when Claude works in that directory. Current-docs note: `/memory` lists and opens the memory files for the user and project scopes, and `/context` shows which CLAUDE.md and rules files loaded at launch. The Exam Guide attributes the diagnosis to `/memory`.",
      "wrong": {
       "B": "Emphasis does not diagnose anything, and if the file is not loaded in the failing session it has no effect.",
       "C": "Destroys the existing configuration and does not identify why behavior varied.",
       "D": "Skips the configuration check; variation that tracks which directory or user is involved points to loaded-file differences, not randomness."
      }
     },
     "studyRef": "Task Statement 3.1 (/memory command and configuration hierarchy diagnosis)"
    },
    {
     "n": 19,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "context: fork for verbose skill output",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team's `/analyze-architecture` skill reads hundreds of files and prints several thousand tokens of notes. After running it, the developer's main session is cluttered and later answers degrade, though they only needed a 10-line summary. What is the best change to the skill?",
     "options": [
      {
       "id": "A",
       "text": "Add `context: fork` to the SKILL.md frontmatter so it runs in an isolated subagent."
      },
      {
       "id": "B",
       "text": "Add `allowed-tools: Read` to the frontmatter."
      },
      {
       "id": "C",
       "text": "Move the skill's instructions into the project `CLAUDE.md` so they are always loaded and available to every developer in every session of the repository."
      },
      {
       "id": "D",
       "text": "Add an `argument-hint` so developers are prompted for a narrower directory to analyze when they invoke the skill."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`context: fork` runs the skill in an isolated context, which keeps verbose or exploratory output out of the main conversation.",
      "wrong": {
       "B": "`allowed-tools` controls tool permissions during the skill; it does not isolate its output from the main conversation.",
       "C": "Always-loaded context makes the clutter worse and is meant for universal standards, not task workflows.",
       "D": "`argument-hint` only prompts for arguments; it does not stop the output from entering the main context."
      }
     },
     "studyRef": "Task Statement 3.2 (context: fork, allowed-tools, argument-hint)"
    },
    {
     "n": 20,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Personal skill variant with a different name",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The team's project skill `.claude/skills/review/SKILL.md` is committed to the repository. A developer wants to customize it for personal preferences without affecting teammates. What should they do?",
     "options": [
      {
       "id": "A",
       "text": "Edit the project SKILL.md locally and never commit the change."
      },
      {
       "id": "B",
       "text": "Add a `personal: true` field to the project SKILL.md frontmatter."
      },
      {
       "id": "C",
       "text": "Create a personal variant under `~/.claude/skills/` with a different name, such as `review-mine`."
      },
      {
       "id": "D",
       "text": "Add their personal preferences to the project `CLAUDE.md` under a clearly labelled \"personal\" heading so they are easy to find."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Personal skills live in `~/.claude/skills/` and are not shared; using a different name avoids colliding with or altering the team's project skill.",
      "wrong": {
       "A": "Local edits to a tracked file conflict on pulls and risk being committed accidentally.",
       "B": "There is no such frontmatter field; it would also still change the shared file.",
       "D": "Project CLAUDE.md is shared with the whole team, so it would affect everyone."
      }
     },
     "studyRef": "Task Statement 3.2 (project vs personal skills and commands)"
    },
    {
     "n": 21,
     "scenario": 2,
     "domain": 3,
     "ts": "3.3",
     "tests": "Path-scoped rule for scattered file types",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Terraform files live in `infra/terraform/`, `services/payments/deploy/`, and `services/search/deploy/`. The 35 lines of Terraform conventions currently sit in a 400-line root `CLAUDE.md` and are irrelevant to most sessions. You want them applied only when Claude edits Terraform files. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Create `.claude/rules/terraform.md` with frontmatter `paths: [\"**/*.tf\"]` containing the conventions."
      },
      {
       "id": "B",
       "text": "Create a `CLAUDE.md` in `infra/terraform/` with the conventions."
      },
      {
       "id": "C",
       "text": "Create a `/terraform-conventions` skill that developers invoke manually before they start editing any infrastructure code."
      },
      {
       "id": "D",
       "text": "Keep the lines in the root `CLAUDE.md` and prefix them with \"Only apply when editing .tf files\" so Claude skips them for other work."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Path-scoped rules load only when matching files are in play, and glob patterns work across directories, which suits files scattered through the repository.",
      "wrong": {
       "B": "Directory-level files are bound to their directory and would miss the `services/*/deploy/` Terraform files.",
       "C": "Requires manual invocation, so the conventions would not apply automatically when a developer forgets.",
       "D": "The text still loads into every session and relies on the model to self-filter."
      }
     },
     "studyRef": "Task Statement 3.3 (.claude/rules/ with paths frontmatter)"
    },
    {
     "n": 22,
     "scenario": 2,
     "domain": 3,
     "ts": "3.3",
     "tests": "Overlapping path-scoped rules are additive",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You need API conventions applied to `src/api/**/*.ts` and testing conventions applied to every `**/*.test.ts` in the repository. The file `src/api/users/users.test.ts` should receive both sets. Which setup works best?",
     "options": [
      {
       "id": "A",
       "text": "Put both sets of conventions in one rule file whose `paths` list contains both globs."
      },
      {
       "id": "B",
       "text": "Create `CLAUDE.md` files in `src/api/` and `src/api/users/` to cover the API tests."
      },
      {
       "id": "C",
       "text": "Create a third rule file for `src/api/**/*.test.ts`, because only one path-scoped rule can match a given file."
      },
      {
       "id": "D",
       "text": "Create two rule files in `.claude/rules/`, `api-conventions.md` with `paths: [\"src/api/**/*.ts\"]` and `testing.md` with `paths: [\"**/*.test.ts\"]`; both load when editing `users.test.ts`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Rule files are additive, and each loads when its glob matches. Two focused rules give the overlap file both sets while keeping each convention out of unrelated files.",
      "wrong": {
       "A": "Loads API conventions when editing tests outside `src/api`, and testing conventions when editing API code, wasting context.",
       "B": "Directory-level files cannot cover test files spread across the repository outside those directories.",
       "C": "Incorrect premise: multiple matching rules all load, so no combined third file is required."
      }
     },
     "studyRef": "Task Statement 3.3 (glob rules vs directory CLAUDE.md)"
    },
    {
     "n": 23,
     "scenario": 2,
     "domain": 3,
     "ts": "3.4",
     "tests": "Direct execution for a small, well-scoped fix",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A production stack trace points to `parseInvoiceDate()` in `src/billing/dates.ts:88`, which throws on an empty string. The fix is to add a guard that returns `null` for empty input. How should you approach this task?",
     "options": [
      {
       "id": "A",
       "text": "Enter plan mode and use Explore subagents to map every caller of `parseInvoiceDate()` before touching the file."
      },
      {
       "id": "B",
       "text": "Enter plan mode because every production bug fix deserves a written design first."
      },
      {
       "id": "C",
       "text": "Use direct execution: the change is well scoped, with a clear location and fix."
      },
      {
       "id": "D",
       "text": "Run the interview pattern so Claude asks about caching and failure modes before editing."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Direct execution suits simple, well-understood changes such as a single guard in one function. Plan mode would add overhead without reducing risk.",
      "wrong": {
       "A": "Over-investigation for a one-function guard; plan mode is for complex, multi-file, or architectural work.",
       "B": "Plan mode is selected by task complexity, not applied universally.",
       "D": "The interview pattern targets unfamiliar design domains, not a straightforward null guard."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode vs direct execution)"
    },
    {
     "n": 24,
     "scenario": 2,
     "domain": 3,
     "ts": "3.4",
     "tests": "Detailed upfront instructions in direct execution assume the structure is known; plan mode explores and revises first",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A senior engineer wrote a 40-step prompt telling Claude Code exactly how to split the 3,200-line `OrderService` class into `PricingEngine`, `InventoryReserver`, `PaymentCoordinator`, and `OrderNotifier`, including which methods move where. She wrote it from memory: she last worked on the class eight months ago, and other engineers have pushed 23 commits to it since. She wants direct execution \"because the design is already done.\" How should you proceed?",
     "options": [
      {
       "id": "A",
       "text": "Run her prompt in direct execution as written; a 40-step specification is detailed enough that exploring the class adds nothing."
      },
      {
       "id": "B",
       "text": "Use plan mode: have Claude explore the current class and its callers, check her design against them, and revise it first."
      },
      {
       "id": "C",
       "text": "Have the Explore subagent summarize the current class, then run her 40-step prompt unchanged in direct execution."
      },
      {
       "id": "D",
       "text": "Run her steps one at a time in direct execution, and switch to plan mode only if one of the steps fails to apply cleanly to the code."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Detailed upfront instructions assume the right structure is already known. This design comes from an eight-month-old memory of code that has had 23 commits since, so it must be checked against the code as it is now. Plan mode lets Claude explore the class and its callers and revise the design before any file changes, avoiding costly rework.",
      "wrong": {
       "A": "Detail is not accuracy. The steps may reference methods that have moved, been renamed, or gained new callers, and direct execution would discover that mid-refactor.",
       "C": "This explores the code but then ignores what it finds: running the prompt unchanged still applies a design that was never checked against the current class.",
       "D": "The complexity is stated up front: a 3,200-line class split four ways from a stale design. Waiting for a step to fail discovers design problems mid-refactor, and a step can apply cleanly yet still be wrong."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode for complex changes; explore before committing to a design)"
    },
    {
     "n": 25,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Concrete input/output examples for ambiguous transformations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A `/normalize-logs` command is described in prose (\"convert the timestamp and clean up the level field\"). Results vary between runs: sometimes the timezone is dropped, sometimes level names are uppercased and sometimes not. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Lengthen the prose description with more adjectives such as \"precisely\" and \"consistently.\""
      },
      {
       "id": "B",
       "text": "Run the command three times on each input and keep whichever output appears most often among the runs."
      },
      {
       "id": "C",
       "text": "Switch to plan mode for every run of the command."
      },
      {
       "id": "D",
       "text": "Add two or three concrete input/output examples of the exact transformation to the command."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When prose is interpreted inconsistently, concrete input/output examples are the most effective way to communicate the expected transformation.",
      "wrong": {
       "A": "More prose of the same kind keeps the ambiguity that causes inconsistent interpretation.",
       "B": "Triples the cost without fixing the unclear specification.",
       "C": "Plan mode addresses task complexity, not an ambiguous transformation spec."
      }
     },
     "studyRef": "Task Statement 3.5 (input/output examples for iterative refinement)"
    },
    {
     "n": 26,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Interview pattern for unfamiliar design domains",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A developer who has never built one must add a caching layer to a pricing service. Previous attempts at similar features skipped cache invalidation and failure handling until production incidents. Which approach is most likely to surface these considerations before code is written?",
     "options": [
      {
       "id": "A",
       "text": "Ask Claude to interview the developer first, asking about invalidation strategy, consistency needs, and failure modes, before implementing."
      },
      {
       "id": "B",
       "text": "Start implementing right away and fix cache invalidation and failure-handling problems one at a time, as they show up in production incidents after release."
      },
      {
       "id": "C",
       "text": "Give Claude three best-practice bullet points copied from a blog post and ask it to implement them."
      },
      {
       "id": "D",
       "text": "Ask Claude to implement everything in one pass and \"think harder\" about edge cases."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The interview pattern has Claude ask questions that surface design considerations the developer may not have anticipated, particularly in unfamiliar domains.",
      "wrong": {
       "B": "Discovers the problems after incidents, which is exactly the outcome to avoid.",
       "C": "Covers only what the blog author considered, not the service-specific tradeoffs.",
       "D": "Without the developer's answers about requirements, additional thinking cannot supply the missing constraints."
      }
     },
     "studyRef": "Task Statement 3.5 (interview pattern)"
    },
    {
     "n": 27,
     "scenario": 2,
     "domain": 3,
     "ts": "3.6",
     "tests": "Prior findings in context to avoid duplicate review comments",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your CI job runs `claude -p` to review each pull request on every push. Developers complain that after each new commit the bot re-posts comments for issues it already raised or that have been fixed. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Delete all of the bot's earlier review comments before every run so that duplicates can no longer accumulate on the pull request page."
      },
      {
       "id": "B",
       "text": "Run the review only on the first push of each pull request, and let developers request later reviews manually."
      },
      {
       "id": "C",
       "text": "Give each re-run the prior findings and ask for only new or unaddressed issues."
      },
      {
       "id": "D",
       "text": "Move the review to a nightly job so that there are fewer runs and the bot posts one consolidated set of comments."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Providing prior findings lets the review distinguish new, unresolved, and fixed issues, which avoids duplicate comments.",
      "wrong": {
       "A": "Removes useful history and does not stop the model from re-reporting fixed or repeated issues in the new output.",
       "B": "Stops reviewing new code introduced by later commits.",
       "D": "Fewer runs reduce frequency but not duplication, and delay feedback."
      }
     },
     "studyRef": "Task Statement 3.6 (re-running reviews with prior findings)"
    },
    {
     "n": 28,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Scratchpad files counteract context degradation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Three hours into exploring a legacy payments codebase, Claude begins answering with phrases like \"typically there is a `PaymentProcessor` class that...\" even though it earlier found the actual class `StripeChargeService` in `billing/gateways/`. What is the best technique to counteract this?",
     "options": [
      {
       "id": "A",
       "text": "Switch to a model with a larger context window so that the specific classes found earlier stay in view for the remainder of the long exploration session."
      },
      {
       "id": "B",
       "text": "Have Claude keep a scratchpad file of key findings (class names, paths, flows) and consult it for later questions."
      },
      {
       "id": "C",
       "text": "Remind Claude in each prompt to \"remember what you found earlier\" and to prefer the specific classes it already discovered."
      },
      {
       "id": "D",
       "text": "Re-read every file in the module before each new question."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Extended sessions degrade into generic \"typical patterns\" instead of specific discoveries. A scratchpad file persists key findings across context boundaries.",
      "wrong": {
       "A": "A larger window does not prevent degraded attention to earlier details.",
       "C": "Cannot restore details that are no longer reliably attended to; the specifics need to be externalized.",
       "D": "Re-fills the context with the same verbose content and accelerates the degradation."
      }
     },
     "studyRef": "Task Statement 5.4 (scratchpad files, context degradation)"
    },
    {
     "n": 29,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Explore subagent isolates verbose discovery",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You need to trace the refund flow across 200+ files. Running Grep and Read in the main session fills the context with discovery output, and later design discussion degrades. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Read all 200 files into the main context first, then ask questions about the refund flow from there."
      },
      {
       "id": "B",
       "text": "Disable Grep so Claude can only use Read for targeted lookups of files it already knows about."
      },
      {
       "id": "C",
       "text": "Continue investigating in the main session with Grep and Read until the context eventually auto-truncates, then re-ask the questions that were lost."
      },
      {
       "id": "D",
       "text": "Delegate discovery to an Explore subagent that returns a summary; run `/compact` if needed."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagent delegation isolates verbose exploration while the main session keeps high-level coordination. `/compact` reduces context when it fills during long exploration.",
      "wrong": {
       "A": "Consumes the context budget with content mostly irrelevant to the question.",
       "B": "Removes the efficient search tool and does not solve context accumulation.",
       "C": "Allows degradation to happen uncontrolled and loses earlier findings unpredictably."
      }
     },
     "studyRef": "Task Statement 5.4 (Explore subagent, /compact; also 3.4)"
    },
    {
     "n": 30,
     "scenario": 2,
     "domain": 1,
     "ts": "1.7",
     "tests": "Resume a named session and inform it of file changes",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You investigated the payments module in a named session. Two days later teammates changed 3 of the roughly 40 files analyzed (`RefundService.java` and two files in `ledger/`). You want to continue the work with minimal rework. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Resume with `--resume <session-name>` and tell Claude which files changed."
      },
      {
       "id": "B",
       "text": "Resume the session without mentioning the changes and rely on Claude to notice them."
      },
      {
       "id": "C",
       "text": "Start a brand-new session with no context and re-explore all 40 files from the entrypoints down."
      },
      {
       "id": "D",
       "text": "Use `fork_session` from the old session and continue in the forked branch as if none of the files had changed since the analysis."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "When prior context is mostly valid, resume it and explicitly inform the agent about changes for targeted re-analysis instead of re-exploring everything.",
      "wrong": {
       "B": "Claude would reason from stale tool results for the modified files and could return confident but outdated analysis.",
       "C": "Wasteful when only 3 files changed; a fresh start with a summary is for cases where most prior results are stale.",
       "D": "Forking branches the baseline for exploring alternatives; it does not refresh stale file contents."
      }
     },
     "studyRef": "Task Statement 1.7 (--resume, informing the session of file changes, fork_session)"
    },
    {
     "n": 31,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Coordinator selects subagents dynamically by query complexity",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your coordinator always invokes all four subagents (web search, document analysis, synthesis, report) in sequence. For a simple query such as \"What year was the transformer architecture introduced?\" this takes about four minutes and costs many times what a direct answer would. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Train a separate classifier on historical queries labeled with the subagents that were needed, and run it to pick the subagents before the coordinator starts working."
      },
      {
       "id": "B",
       "text": "Remove the synthesis and report subagents permanently so every query is cheap."
      },
      {
       "id": "C",
       "text": "Have the coordinator analyze each query's requirements and dynamically choose which subagents to invoke, using one search subagent or none for simple factual questions."
      },
      {
       "id": "D",
       "text": "Run the four subagents in parallel to cut wall-clock time."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Coordinators should decide which subagents to invoke based on query complexity instead of routing everything through the full pipeline.",
      "wrong": {
       "A": "Over-engineered; the coordinator is already an LLM that can assess complexity from the query.",
       "B": "Breaks complex, multi-source research that actually needs synthesis and reports.",
       "D": "Synthesis and report depend on earlier outputs, and parallelism does not remove the unnecessary work or cost."
      }
     },
     "studyRef": "Task Statement 1.2 (dynamic subagent selection by complexity)"
    },
    {
     "n": 32,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Partition scope to minimize duplicated work",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two web-search subagents are both told to research \"renewable energy adoption.\" Their results overlap by about 60%, so you pay twice for the same sources. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Have the coordinator assign each subagent distinct subtopics or source types (e.g. policy vs market data, regions)."
      },
      {
       "id": "B",
       "text": "Add a deduplication step in the synthesis subagent."
      },
      {
       "id": "C",
       "text": "Let the two subagents message each other directly to coordinate which queries each covers and so avoid overlapping work."
      },
      {
       "id": "D",
       "text": "Run the two subagents sequentially, passing the first subagent's results to the second so it can avoid repeating the same sources, accepting the loss of parallelism."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Partitioning research scope across subagents minimizes duplication at the source and keeps the coordinator in charge of decomposition.",
      "wrong": {
       "B": "Removes duplicates after you have already paid for them; it treats the symptom, not the overlapping assignment.",
       "C": "Bypasses coordinator-routed communication, reducing observability and controlled information flow.",
       "D": "Technically reduces overlap but gives up parallelism; assigning distinct scopes does both."
      }
     },
     "studyRef": "Task Statement 1.2 (partitioning research scope; routing through the coordinator)"
    },
    {
     "n": 33,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Iterative refinement loop driven by the coordinator",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Stakeholders require coverage of all major regions. The synthesis subagent returns a draft with the note \"No evidence found for Southeast Asia; no 2024 market-size figures.\" Currently the coordinator forwards drafts straight to the report subagent. What should the coordinator do?",
     "options": [
      {
       "id": "A",
       "text": "Give the synthesis subagent its own web search tool so it can fill the gaps itself."
      },
      {
       "id": "B",
       "text": "Evaluate the draft for gaps, re-delegate targeted queries for the missing areas to the search and analysis subagents, and re-invoke synthesis, repeating until coverage is sufficient."
      },
      {
       "id": "C",
       "text": "Rerun the entire pipeline from the original topic with broader keywords, and use the new combined results to produce the report without separately checking the regional gaps."
      },
      {
       "id": "D",
       "text": "Pass the draft to the report subagent and add a generic limitations paragraph."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "An iterative refinement loop, controlled by the coordinator, closes identified coverage gaps with targeted follow-up work before the report is produced.",
      "wrong": {
       "A": "Breaks role separation and tool scoping, and moves coordination logic out of the coordinator.",
       "C": "Repeats work that was already successful and does not target the specific gaps.",
       "D": "Ignores a stated coverage requirement when the gap could have been closed."
      }
     },
     "studyRef": "Task Statement 1.2 (iterative refinement loops)"
    },
    {
     "n": 34,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Task tool must be in allowedTools",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You defined four subagents with `AgentDefinition`s, but the coordinator, configured with `allowedTools=[\"WebSearch\", \"Read\"]`, answers every query itself and never delegates. What is the most likely cause?",
     "options": [
      {
       "id": "A",
       "text": "The subagent descriptions are too long, so the coordinator cannot read them well enough to decide which one to delegate to."
      },
      {
       "id": "B",
       "text": "The subagents must be launched in parallel before the coordinator is able to use them for any form of delegation."
      },
      {
       "id": "C",
       "text": "Each subagent's own `tools` list must include `\"Task\"`."
      },
      {
       "id": "D",
       "text": "The coordinator's `allowedTools` lacks `\"Task\"`, which is required to spawn subagents."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagents are spawned through the Task tool, so the coordinator must be allowed to use it. Naming note: the Exam Guide calls this the Task tool. Current Agent SDK versions name it `Agent` in `allowedTools` and in `tool_use` blocks (older versions used `Task`, and it still appears as `Task` in the init tools list). On the exam, use the guide's name.",
      "wrong": {
       "A": "Description length does not prevent spawning; the coordinator lacks the tool to spawn at all.",
       "B": "Parallel launching is an optimization; it is not a prerequisite for delegation.",
       "C": "The invoking coordinator, not the subagents, needs the Task tool."
      }
     },
     "studyRef": "Task Statement 1.3 (Task tool and allowedTools)"
    },
    {
     "n": 35,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Pass complete findings explicitly to subagents",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The coordinator spawns the synthesis subagent with the prompt \"Synthesize the findings from the earlier agents into a report on lithium supply.\" The synthesis subagent replies that it has no findings and writes from general knowledge. What is the fix?",
     "options": [
      {
       "id": "A",
       "text": "Enable shared memory between the subagents so that the synthesis agent can read whatever the earlier agents produced."
      },
      {
       "id": "B",
       "text": "Increase the synthesis subagent's `max_tokens` so it can recall prior outputs."
      },
      {
       "id": "C",
       "text": "Put the complete search and analysis findings directly in the synthesis subagent's prompt."
      },
      {
       "id": "D",
       "text": "Give the synthesis subagent a web search tool so it can regenerate the findings itself when they are missing from its prompt."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Subagents have isolated context and do not inherit the coordinator's history or share memory, so everything they need must be passed in their prompt.",
      "wrong": {
       "A": "Subagents do not share memory; context must be provided explicitly.",
       "B": "Output length has no effect on what information the subagent can see.",
       "D": "Duplicates work, violates role scoping, and ignores the findings already collected."
      }
     },
     "studyRef": "Task Statement 1.3 (explicit context passing to subagents)"
    },
    {
     "n": 36,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Parallel spawning via multiple Task calls in one response",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The coordinator needs three independent search subagents. It currently spawns one per turn, waits for the result, then spawns the next, taking 90 seconds in total. How do you reduce latency?",
     "options": [
      {
       "id": "A",
       "text": "Emit all three Task calls in a single coordinator response so they run in parallel."
      },
      {
       "id": "B",
       "text": "Reduce to one search subagent that handles all three topics sequentially, trading breadth for fewer calls."
      },
      {
       "id": "C",
       "text": "Add `parallel=true` to each AgentDefinition so the SDK runs the three subagents concurrently."
      },
      {
       "id": "D",
       "text": "Run each subagent in a separate external process and merge their logs afterwards to reconstruct the results."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Parallel subagents are created by emitting multiple Task calls in one coordinator response, not across separate turns. Naming note: the Exam Guide calls this the Task tool. Current Agent SDK versions name it `Agent` in `allowedTools` and in `tool_use` blocks (older versions used `Task`, and it still appears as `Task` in the init tools list). On the exam, use the guide's name.",
      "wrong": {
       "B": "Does not improve latency and removes the benefit of specialization.",
       "C": "Invents a configuration option that does not exist.",
       "D": "Bypasses the SDK's coordinator and loses observability and controlled information flow."
      }
     },
     "studyRef": "Task Statement 1.3 (parallel Task calls)"
    },
    {
     "n": 37,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Coordinator prompts specify goals and quality criteria, not procedures",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your coordinator prompt prescribes: \"Step 1: run exactly three searches with these templates. Step 2: open the first five results. Step 3: ...\" For niche topics, the templates return nothing and subagents still follow the steps mechanically, producing empty reports. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Add more steps covering each niche-topic contingency you can think of."
      },
      {
       "id": "B",
       "text": "Add a fallback step list covering every failure you can think of, and require subagents to follow that list in order whenever a step returns nothing useful at all."
      },
      {
       "id": "C",
       "text": "Lower the sampling temperature so subagents follow the steps more consistently."
      },
      {
       "id": "D",
       "text": "Describe the research goals and quality criteria (for example at least three independent sources, with publication dates) and let subagents adapt their approach."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Goal- and criteria-oriented prompts enable subagent adaptability, whereas rigid step-by-step procedures break on cases the author did not anticipate.",
      "wrong": {
       "A": "Creates brittle, ever-growing procedures that still fail on unforeseen cases.",
       "B": "Still procedural; adds maintenance burden without enabling adaptation.",
       "C": "More consistent execution of a flawed procedure does not fix the empty results."
      }
     },
     "studyRef": "Task Statement 1.3 (coordinator prompts: goals and quality criteria)"
    },
    {
     "n": 38,
     "scenario": 3,
     "domain": 1,
     "ts": "1.6",
     "tests": "Adaptive decomposition for open-ended research",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You are asked for a competitive landscape of AI chip startups. Which companies matter, and what sub-questions are important, cannot be known until initial research is done. A teammate proposes a fixed five-step pipeline with ten predetermined company profiles. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Use a fixed prompt chain so results are reproducible from run to run, with each step feeding the next in a predetermined order, regardless of what the early searches turn up."
      },
      {
       "id": "B",
       "text": "Adaptive decomposition: map the landscape first, then generate subtasks from what is found."
      },
      {
       "id": "C",
       "text": "Run the ten predetermined company profiles in parallel and synthesize them into one landscape report."
      },
      {
       "id": "D",
       "text": "Use a single agent with no decomposition and let it research the whole landscape until it decides it is done."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Open-ended investigations need dynamic decomposition based on intermediate findings. Fixed prompt chains fit predictable, multi-aspect workflows.",
      "wrong": {
       "A": "Reproducibility is not the goal; a predetermined sequence cannot cover companies and questions discovered during research.",
       "C": "Hard-codes scope up front and will miss important companies not on the list.",
       "D": "Loses prioritization, coverage tracking, and delegation that decomposition provides for a broad task."
      }
     },
     "studyRef": "Task Statement 1.6 (prompt chaining vs dynamic decomposition)"
    },
    {
     "n": 39,
     "scenario": 3,
     "domain": 2,
     "ts": "2.1",
     "tests": "Split a generic tool into purpose-specific tools",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent has one tool, `analyze_document(doc_id, instruction)`, used for pulling figures, summarizing, and fact-checking claims. Output shape varies widely by instruction and the synthesis agent cannot reliably parse it. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Keep the single tool and add few-shot examples to the `instruction` argument."
      },
      {
       "id": "B",
       "text": "Add a free-text `mode` parameter to the existing tool."
      },
      {
       "id": "C",
       "text": "Split it into purpose-specific tools such as `extract_data_points`, `summarize_content`, and `verify_claim_against_source`, each with a defined input/output contract."
      },
      {
       "id": "D",
       "text": "Expand the tool's description to several paragraphs covering each use case, its expected arguments, and the output shape for every one of them in the same description."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Splitting generic tools into purpose-specific ones with clear contracts improves selection and yields predictable output shapes.",
      "wrong": {
       "A": "Examples cannot create a stable output contract for three different jobs behind one tool.",
       "B": "Still one overloaded tool with an unstructured switch; contracts remain loose.",
       "D": "Better descriptions help, but one tool still returns different shapes; the problem is the missing contracts."
      }
     },
     "studyRef": "Task Statement 2.1 (purpose-specific tools with input/output contracts)"
    },
    {
     "n": 40,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "Replace generic fetch with constrained tool",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent uses a generic `fetch_url` tool and often fetches marketing pages, login walls, and dead links instead of the research documents. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Replace `fetch_url` with a constrained `load_document` tool that validates document URLs and types."
      },
      {
       "id": "B",
       "text": "Add a line to the system prompt instructing the agent to fetch only PDFs and reports, and to skip anything that looks like a web page."
      },
      {
       "id": "C",
       "text": "Give the subagent a Bash tool so it can use `curl` with custom options."
      },
      {
       "id": "D",
       "text": "Add a second generic tool, `fetch_url_safe`, alongside `fetch_url`."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Replacing generic tools with constrained alternatives prevents misuse and gives the agent a reliable interface for its specific job.",
      "wrong": {
       "B": "Probabilistic guidance; the tool still accepts any URL.",
       "C": "Broadens access and misuse risk instead of narrowing it.",
       "D": "Two overlapping generic tools add selection ambiguity without constraining either."
      }
     },
     "studyRef": "Task Statement 2.3 (constrained tool alternatives)"
    },
    {
     "n": 41,
     "scenario": 3,
     "domain": 2,
     "ts": "2.4",
     "tests": "Expose a catalog as an MCP resource",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Each time it runs, the document-analysis agent makes five to eight exploratory `search_documents` and `list_folder` calls just to find out what documents exist. How can you reduce these calls?",
     "options": [
      {
       "id": "A",
       "text": "Raise the agent's maximum number of tool calls per run so exploration is never cut off."
      },
      {
       "id": "B",
       "text": "Add a `list_everything` tool that returns the full text of every document so that the agent can see all of the corpus at once."
      },
      {
       "id": "C",
       "text": "Paste the entire corpus into the system prompt so no discovery calls are needed."
      },
      {
       "id": "D",
       "text": "Expose the corpus catalog (titles, IDs, dates) as an MCP resource."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "MCP resources expose content catalogs, which reduces exploratory tool calls.",
      "wrong": {
       "A": "Allows more exploration instead of removing the need for it.",
       "B": "Floods context with content and still needs a tool call.",
       "C": "Consumes context and does not scale; a lightweight catalog is enough."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources for content catalogs)"
    },
    {
     "n": 42,
     "scenario": 3,
     "domain": 2,
     "ts": "2.4",
     "tests": "Enhance MCP tool descriptions so the agent prefers them over built-ins",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A new MCP server exposes `query_research_db`, which supports full-text and semantic search with date and source filters. The agent keeps using the built-in Grep on exported text files instead. What is the best first step?",
     "options": [
      {
       "id": "A",
       "text": "Remove Grep from every agent's allowed tools."
      },
      {
       "id": "B",
       "text": "Rewrite the MCP tool's description: capabilities, outputs, and when to prefer it over Grep."
      },
      {
       "id": "C",
       "text": "Also register the server in `~/.claude.json`, since project-level servers' tools are not discovered until first used."
      },
      {
       "id": "D",
       "text": "Configure only one MCP server at a time so the agent can focus on that server's tools instead of competing built-ins."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Detailed descriptions help the agent understand what the MCP tool offers and avoid defaulting to a familiar built-in tool.",
      "wrong": {
       "A": "Heavy-handed; other tasks legitimately need Grep, and the real problem is that the agent does not know the MCP tool's value.",
       "C": "Tools from all configured MCP servers are discovered at connection time; scope is not the issue.",
       "D": "Tools from all configured servers are available simultaneously; limiting servers is unnecessary."
      }
     },
     "studyRef": "Task Statement 2.4 (enhancing MCP tool descriptions)"
    },
    {
     "n": 43,
     "scenario": 3,
     "domain": 2,
     "ts": "2.5",
     "tests": "Grep for content, Glob for file name patterns",
     "difficulty": "easy",
     "type": "multi",
     "select": 2,
     "stem": "The document-analysis subagent has Read, Grep, and Glob. It must (1) find every file in `/corpus` (about 400 text files) that mentions \"EBITDA margin,\" and (2) list every file named like `<company>_q3_2025.txt`. Which TWO calls are the right tools for these jobs? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Glob with `**/*EBITDA*` to find files that mention EBITDA margin."
      },
      {
       "id": "B",
       "text": "Grep for the pattern \"EBITDA margin\" across `/corpus`."
      },
      {
       "id": "C",
       "text": "Read all 400 files and scan them for the phrase."
      },
      {
       "id": "D",
       "text": "Grep for `_q3_2025` to locate the files by their names."
      },
      {
       "id": "E",
       "text": "Glob with the pattern `**/*_q3_2025.txt`."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "Grep searches file contents; Glob matches file path patterns. Use each for what it is designed for rather than reading everything.",
      "wrong": {
       "A": "Glob matches file names, not contents, so it would only find files with \"EBITDA\" in their name.",
       "C": "Wasteful and context-heavy when Grep can search contents directly.",
       "D": "Grep searches contents, not file names, so it would miss files whose names match but contents do not."
      }
     },
     "studyRef": "Task Statement 2.5 (Grep vs Glob)"
    },
    {
     "n": 44,
     "scenario": 3,
     "domain": 5,
     "ts": "5.3",
     "tests": "Coverage annotations for gaps from unavailable sources",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A research run on global lithium supply finishes with partial results: the \"South American production\" search subagent exhausted local retries because its main sources were unavailable, and returned a structured error. Other topics succeeded. How should the final report handle this?",
     "options": [
      {
       "id": "A",
       "text": "Abort the whole research run and tell the user it failed."
      },
      {
       "id": "B",
       "text": "Omit the South American section from the report without comment and present the result as a complete, comprehensive treatment of global lithium supply for the reader."
      },
      {
       "id": "C",
       "text": "Proceed with the partial results, and have the synthesis annotate coverage: which findings are well supported and which topic areas have gaps due to unavailable sources."
      },
      {
       "id": "D",
       "text": "Fill the gap from the synthesis model's background knowledge without marking it."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Structured error context lets the coordinator proceed with partial results while the output clearly labels gaps instead of hiding them.",
      "wrong": {
       "A": "Terminating the workflow on a single failure discards good results from other topics.",
       "B": "Suppresses the failure and misleads readers about coverage.",
       "D": "Unsourced, unmarked content breaks provenance and presents unverified claims as findings."
      }
     },
     "studyRef": "Task Statement 5.3 (partial results and coverage annotations)"
    },
    {
     "n": 45,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Dates and claim-source mappings for conflicting statistics",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The web search subagent reports \"global EV share: 14%\" (industry body, data for 2022) and the document subagent reports \"18%\" (government report, data for 2023). The synthesis agent presents them as a contradiction and picks one. What change best fixes this?",
     "options": [
      {
       "id": "A",
       "text": "Require subagents to output claim-source mappings with publication or data collection dates, and have synthesis present both values with attribution and dates."
      },
      {
       "id": "B",
       "text": "Have synthesis keep the value from the single most credible source and drop the other, noting in a footnote only that the sources disagreed on this figure."
      },
      {
       "id": "C",
       "text": "Average the two figures and report 16%."
      },
      {
       "id": "D",
       "text": "Send every statistical discrepancy to human review before synthesis."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Dates in structured outputs prevent temporal differences from being misread as contradictions, and attribution lets conflicts be shown rather than arbitrarily resolved.",
      "wrong": {
       "B": "Silently discards a valid data point and the context needed to interpret it.",
       "C": "Creates a number no source reported and ignores that the data is from different years.",
       "D": "Does not address the root cause, missing dates, and adds review load for resolvable differences."
      }
     },
     "studyRef": "Task Statement 5.6 (temporal data and conflict annotation)"
    },
    {
     "n": 46,
     "scenario": 6,
     "domain": 4,
     "ts": "4.1",
     "tests": "Explicit categorical criteria over vague confidence instructions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your extraction pipeline includes a QA prompt: \"Flag any suspicious line items, but be conservative and only flag when you are highly confident.\" Reviewers dismiss about 45% of flags as noise. What change most improves precision?",
     "options": [
      {
       "id": "A",
       "text": "Strengthen it to \"be extremely conservative\" and only flag at 95% confidence."
      },
      {
       "id": "B",
       "text": "Have the model output a confidence number and filter flags below 0.9 in code."
      },
      {
       "id": "C",
       "text": "Run the QA prompt three times and keep flags that appear at least twice."
      },
      {
       "id": "D",
       "text": "Replace the instruction with specific categorical criteria, for example flag when quantity x unit price does not equal the line total or the currency differs from the header, and skip rounding differences under $0.01."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Explicit criteria defining what to report and what to skip outperform general instructions like \"be conservative\" or confidence-based filtering.",
      "wrong": {
       "A": "General conservatism and confidence language do not define which findings are valid, so precision does not reliably improve.",
       "B": "Self-reported confidence is poorly calibrated, and filtering on it does not teach the model what counts as a real issue.",
       "C": "Consensus filtering may suppress real but intermittent issues and does not address the vague criteria."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit criteria vs confidence-based filtering)"
    },
    {
     "n": 47,
     "scenario": 6,
     "domain": 4,
     "ts": "4.1",
     "tests": "Temporarily disable a high false-positive category",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your validator emits five flag categories. `date_plausibility` has a 55% false positive rate while `total_mismatch` is 96% precise. Reviewers have begun ignoring all flags, including `total_mismatch`. What is the best immediate action?",
     "options": [
      {
       "id": "A",
       "text": "Leave all categories enabled and add a banner telling reviewers to simply ignore the date flags until the prompt has been improved."
      },
      {
       "id": "B",
       "text": "Temporarily disable the `date_plausibility` category while refining its criteria, and keep the accurate categories active."
      },
      {
       "id": "C",
       "text": "Downgrade every category's severity to \"info\" so none seem urgent."
      },
      {
       "id": "D",
       "text": "Disable all flags until every category exceeds 95% precision."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "High false-positive categories undermine trust in accurate ones. Disabling the noisy category restores confidence while you improve its prompt.",
      "wrong": {
       "A": "Keeps the noise in front of reviewers and relies on them to filter it.",
       "C": "Reduces the value of precise flags such as `total_mismatch` too.",
       "D": "Throws away the accurate categories and the value they already provide."
      }
     },
     "studyRef": "Task Statement 4.1 (restoring trust by disabling noisy categories)"
    },
    {
     "n": 48,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples with reasoning for ambiguous cases",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Documents titled \"Statement\" may be bank statements, account statements, or payment reminders. Despite a long list of classification rules, the model's `document_type` is inconsistent on these ambiguous cases. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Add twenty more classification rules, one for each variant of a statement-style document the pipeline has seen."
      },
      {
       "id": "B",
       "text": "Train a separate classifier model on historical documents and run it before extraction to predict the document type for each file."
      },
      {
       "id": "C",
       "text": "Add three or four few-shot examples of the ambiguous cases showing why one type beat the alternatives."
      },
      {
       "id": "D",
       "text": "Run each document three times and use the majority answer."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Targeted few-shot examples with reasoning for ambiguous cases generalize judgment better than adding more rules.",
      "wrong": {
       "A": "More rules still leave boundary cases unclear and are brittle to novel variants.",
       "B": "Over-engineered when prompt-level examples have not been tried.",
       "D": "Triples cost; the model may be consistently wrong because the decision boundary is not demonstrated."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples for ambiguous cases)"
    },
    {
     "n": 49,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples for varied document formats to fix null extractions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The required field `po_number` comes back `null` for 18% of invoices. Manual review shows the number is present in all of them, but in a footer or a free-text \"Ref:\" line instead of the header table. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add few-shot examples of extraction from varied layouts, including PO numbers in footers and Ref lines."
      },
      {
       "id": "B",
       "text": "Make `po_number` a required string so the model must always produce a value for it, even when it cannot find one anywhere in the document."
      },
      {
       "id": "C",
       "text": "Retry null results by appending the validation error \"po_number is null\" and asking the model to look again carefully."
      },
      {
       "id": "D",
       "text": "Switch the pipeline to the Message Batches API."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Few-shot examples of varied formats address empty or null extraction of fields that are present but located differently.",
      "wrong": {
       "B": "Required fields push the model to fabricate when truly absent and does not teach it where to look.",
       "C": "Without showing the variant layouts, the retry carries no new information about where the value appears.",
       "D": "Changes cost and latency characteristics, not extraction accuracy."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot for varied formats; null extraction)"
    },
    {
     "n": 50,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Tool use with JSON schema for guaranteed structure",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your extraction prompt says \"Respond with JSON only.\" About 3% of responses wrap the JSON in markdown fences or add commentary, causing parse failures. What is the most robust fix?",
     "options": [
      {
       "id": "A",
       "text": "Strip markdown fences with a regular expression before parsing."
      },
      {
       "id": "B",
       "text": "Retry on parse failures up to three times, appending the parse error to the prompt each time, until the response finally comes back as valid JSON."
      },
      {
       "id": "C",
       "text": "Add \"Do not use markdown\" to the prompt in capital letters."
      },
      {
       "id": "D",
       "text": "Define an extraction tool whose input is the JSON schema, force it with `tool_choice`, and read the structured data from the `tool_use` block."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool use with a JSON schema is the most reliable way to get schema-compliant structured output and removes JSON syntax and formatting problems. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "Handles one symptom of unstructured text output and is fragile against other deviations.",
       "B": "Adds cost and latency, and leaves a failure rate that structured output avoids.",
       "C": "Prompt-based compliance remains probabilistic."
      }
     },
     "studyRef": "Task Statement 4.3 (tool_use with JSON schemas)"
    },
    {
     "n": 51,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Format normalization rules in the prompt alongside a strict output schema",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your extraction tool schema declares `invoice_date` and `phone` as plain strings and uses strict tool use, so every response is schema-valid. Downstream systems still reject records because source formats leak through: dates arrive as `3rd March '25`, `03/04/25`, or `2025-03-03`, and phones as `(415) 555-0100` or `+1 415 555 0100`. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Enable stricter schema validation, since strict mode guarantees every string follows one consistent format."
      },
      {
       "id": "B",
       "text": "Add explicit normalization rules to the prompt (dates as ISO 8601, phones as E.164) alongside the schema."
      },
      {
       "id": "C",
       "text": "Re-run every document through a second model call that rewrites each field, regardless of whether it already conforms."
      },
      {
       "id": "D",
       "text": "Have each downstream system parse all observed formats and update its parser when a new one appears."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Strict schemas guarantee structure, not the formatting conventions inside string values. Format normalization rules in the prompt, alongside the schema, handle inconsistent source formatting.",
      "wrong": {
       "A": "Strict mode eliminates syntax errors only; a plain string field accepts any string, so formats stay inconsistent.",
       "C": "Doubles cost and latency for every document, including those that are already correct, when a prompt rule handles it in one pass.",
       "D": "Pushes the problem onto every consumer and breaks whenever a new variant appears; normalization belongs at extraction."
      }
     },
     "studyRef": "Task Statement 4.3 (format normalization rules alongside strict schemas)"
    },
    {
     "n": 52,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Nullable fields and enum with other + detail",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "A schema marks `tax_id` as a required string and defines `expense_category` as an enum of eight values. For documents without a tax ID, the model sometimes invents plausible IDs (6% of cases), and for unusual expense types it picks the nearest enum value. Which TWO schema changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Keep `tax_id` required and add \"never guess\" to the prompt."
      },
      {
       "id": "B",
       "text": "Add a retry that tells the model \"tax_id is missing\" when it returns an empty value."
      },
      {
       "id": "C",
       "text": "Make `tax_id` optional or nullable so the model can return null when the source has none."
      },
      {
       "id": "D",
       "text": "Add an `\"other\"` enum value with a companion `expense_category_detail` string for unlisted categories."
      },
      {
       "id": "E",
       "text": "Add forty more enum values to cover every possible expense type."
      }
     ],
     "answer": [
      "C",
      "D"
     ],
     "explanation": {
      "correct": "Nullable or optional fields prevent fabrication when information may be absent. An `\"other\"` plus detail pattern handles extensible categories without forcing a wrong value.",
      "wrong": {
       "A": "Prompt-only guidance is probabilistic, and a required field still pressures the model to produce a value.",
       "B": "Retries are ineffective when the information is absent from the source and encourage fabrication.",
       "E": "Cannot be exhaustive and enlarges the schema without handling genuinely novel categories."
      }
     },
     "studyRef": "Task Statement 4.3 (required vs optional fields; enum + other/detail)"
    },
    {
     "n": 53,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Retry with error feedback works for format errors, not for absent info",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Schema validation failures fall into two groups: 70% are format errors (dates like `03/04/25` instead of `YYYY-MM-DD`, amounts as `\"$1,200\"` strings), and 30% are a missing `lot_number` that exists only in an external shipping manifest the model never receives. What should the retry strategy be?",
     "options": [
      {
       "id": "A",
       "text": "Retry format errors with the document, the failed extraction, and the specific validation errors, and do not retry missing `lot_number`; allow null and route it to the manifest source or review."
      },
      {
       "id": "B",
       "text": "Retry all failures up to five times with the same feedback."
      },
      {
       "id": "C",
       "text": "Retry format errors but also tell the model to \"try harder\" to find `lot_number`."
      },
      {
       "id": "D",
       "text": "Drop validation for dates and amounts so those failures disappear."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Retry-with-error-feedback fixes format and structural errors but cannot recover information that is absent from the source.",
      "wrong": {
       "B": "Retrying cannot produce information that is not in the document and wastes calls.",
       "C": "Pressure to find absent data encourages fabrication.",
       "D": "Hides format problems that downstream systems rely on."
      }
     },
     "studyRef": "Task Statement 4.4 (retry limits; absent information)"
    },
    {
     "n": 54,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Semantic validation with calculated vs stated totals",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Extraction uses a strict tool schema, and all outputs pass schema validation. Even so, about 4% of invoices have line items that do not sum to the stated total. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Make the schema stricter so the stated total must equal the sum of the line items for the document to pass schema validation in the pipeline."
      },
      {
       "id": "B",
       "text": "Add \"double check the arithmetic\" to the prompt."
      },
      {
       "id": "C",
       "text": "Extract `calculated_total` alongside `stated_total` and flag discrepancies (for example with a `conflict_detected` boolean) for retry or review."
      },
      {
       "id": "D",
       "text": "Set temperature to 0 so the model stops making arithmetic mistakes."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Strict schemas eliminate syntax errors but not semantic errors. Self-correction flows that compare computed and stated values surface the mismatches.",
      "wrong": {
       "A": "JSON schema validation cannot enforce cross-field arithmetic; this is a semantic error class.",
       "B": "Probabilistic and offers no signal when the check fails.",
       "D": "Does not address source inconsistencies or mis-assigned values, and still produces undetectable mismatches."
      }
     },
     "studyRef": "Task Statement 4.4 (calculated_total vs stated_total; semantic vs syntax errors)"
    },
    {
     "n": 55,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "Each resubmission round adds another batch processing cycle to the SLA; a validation retry is a new request, not mid-request tool calling",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Certificates of origin arrive continuously and are submitted to the Message Batches API every 12 hours, at 06:00 and 18:00. A Pydantic validator then rejects about 5% of extractions (malformed HS codes, totals that don't match the line items). Today each reject gets one synchronous retry that sends the document, the failed extraction, and the validation errors back to Claude; a document that fails again goes to a manual-review queue. To cut cost, the team wants the retries batched too. Results must be delivered within 72 hours of a document's arrival, and validation and resubmission take minutes. Which plan meets the SLA at the lowest cost?",
     "options": [
      {
       "id": "A",
       "text": "Keep the retries synchronous, because a retry that carries the failed output and errors is a multi-turn exchange the batch API cannot run."
      },
      {
       "id": "B",
       "text": "Batch the retries by resubmitting the whole original batch whenever any of its documents fails validation, so all results stay in one set."
      },
      {
       "id": "C",
       "text": "Batch the retries and allow up to two retry rounds per document, each submitted as soon as the previous round's results are validated."
      },
      {
       "id": "D",
       "text": "Batch the retries as one follow-up round, submitted once validation finishes and matched to documents by `custom_id`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Worst case: a document arriving just after a submission waits 12 hours, the first batch takes up to 24 hours, and one retry batch takes up to 24 more: 12 + 24 + 24 = 60 hours, within the 72-hour SLA, at half the synchronous cost. A retry is a new, self-contained request whose messages include the document, the prior output, and the errors, so it can run in a batch; `custom_id` ties each retry result back to its document.",
      "wrong": {
       "A": "The batch API cannot execute tools mid-request, but a retry needs no tool execution: it is a separate request with the earlier output and the errors included, so it can be batched.",
       "B": "Resubmitting the whole batch reprocesses the 95% that already passed, roughly doubling cost, and resends the failed documents without their validation errors. Resubmit only the failures, identified by `custom_id`, with the errors included.",
       "C": "A second batched round adds up to 24 hours: 12 + 24 + 24 + 24 = 84 hours, which breaks the 72-hour SLA."
      }
     },
     "studyRef": "Task Statement 4.5 (SLA = wait for submission + up to 24h processing per round; resubmit failures by custom_id)"
    },
    {
     "n": 56,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "Resubmit only failed documents by custom_id after chunking",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A batch of 100 documents completes, but 4 results (custom_ids `doc-0417`, `doc-0422`, `doc-0451`, `doc-0488`) failed because the documents exceeded the context limit. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Resubmit the entire 100-document batch."
      },
      {
       "id": "B",
       "text": "Chunk only those four documents and resubmit them, identified by `custom_id`."
      },
      {
       "id": "C",
       "text": "Resubmit the four documents unchanged."
      },
      {
       "id": "D",
       "text": "Switch all future processing to the synchronous API so that failures like these can never occur in batches again."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Handle batch failures by resubmitting only the failed items with appropriate modifications such as chunking.",
      "wrong": {
       "A": "Pays again for 96 documents that already succeeded.",
       "C": "They will exceed the context limit again.",
       "D": "Overreaction that forfeits batch savings for a handled edge case."
      }
     },
     "studyRef": "Task Statement 4.5 (batch failure handling by custom_id)"
    },
    {
     "n": 57,
     "scenario": 6,
     "domain": 4,
     "ts": "4.6",
     "tests": "An independent reviewer must not receive the generator's reasoning context",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your contract pipeline makes two Claude calls. The extractor returns about 40 fields, each with a `rationale` such as \"termination notice is 60 days per section 14.2\". To save the verifier work, the verifier call receives the contract, the extracted values, and those rationales, and is asked to flag errors. It agrees with 98% of fields, but a quarterly audit finds errors in 7% of verified records, often where a rationale cites the right section but misreads it. The verifier already runs with extended thinking. What change would most improve error detection?",
     "options": [
      {
       "id": "A",
       "text": "Give the verifier only the contract and the extracted values, and stop sending it the extractor's per-field rationales."
      },
      {
       "id": "B",
       "text": "Raise the verifier's extended-thinking budget so it can examine each rationale more carefully before agreeing with the extractor's reading."
      },
      {
       "id": "C",
       "text": "Run three verifiers on the same inputs, rationales included, and treat a field as wrong only when at least two of them flag it."
      },
      {
       "id": "D",
       "text": "Merge verification into the extractor call by asking it to re-check each field against the section it cited before returning output."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The rationales carry the extractor's reasoning into the verifier, so the verifier follows that reasoning instead of reading the contract fresh; when a rationale cites the right section, a misreading looks plausible. A reviewer without the generator's reasoning context catches subtle errors that a primed reviewer accepts, so withholding the rationales makes the verifier truly independent.",
      "wrong": {
       "B": "The verifier already uses extended thinking and still agrees 98% of the time. More reasoning about the extractor's argument keeps it anchored on that argument; extended thinking does not replace independence.",
       "C": "Three verifiers primed with the same rationales share the same anchoring, and a two-of-three rule suppresses errors that only one of them catches.",
       "D": "That is self-review in the generating session, the weakest option: the model keeps its own reasoning and is the least likely to question its decisions."
      }
     },
     "studyRef": "Task Statement 4.6 (independent review instance without the generator's reasoning context; self-review and extended thinking limits)"
    },
    {
     "n": 58,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Validate accuracy by document type and field before automating",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Overall extraction accuracy on a 5,000-document validation set is 97%. By type: invoices 99%, receipts 98%, handwritten forms 83% (8% of volume). The team plans to auto-approve high-confidence extractions and stop human review. What should you do first?",
     "options": [
      {
       "id": "A",
       "text": "Proceed with automation since 97% exceeds the target."
      },
      {
       "id": "B",
       "text": "Increase the validation set size to confirm the 97% figure."
      },
      {
       "id": "C",
       "text": "Analyze accuracy by document type and by field, and keep human review for segments such as handwritten forms until they perform consistently."
      },
      {
       "id": "D",
       "text": "Automate now and send for human review only the cases that downstream systems later report as errors in production use by the finance team."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Aggregate accuracy can mask poor performance in specific segments. Validate by type and field before reducing human review.",
      "wrong": {
       "A": "The aggregate hides the 83% segment.",
       "B": "A bigger sample of the same aggregate metric still masks segment problems.",
       "D": "Discovers errors after they have caused harm."
      }
     },
     "studyRef": "Task Statement 5.5 (accuracy by document type and field)"
    },
    {
     "n": 59,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Stratified sampling and calibrated field-level confidence",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "You plan to reduce human review by auto-approving extractions the model rates as high confidence. Which TWO practices best control risk? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Continuously take a stratified random sample of auto-approved extractions (by document type and field) to measure error rates and detect new error patterns."
      },
      {
       "id": "B",
       "text": "Trust the model's raw self-reported confidence with a fixed 0.9 cutoff."
      },
      {
       "id": "C",
       "text": "Review a flat 5% random sample of all documents regardless of type."
      },
      {
       "id": "D",
       "text": "Have the model output field-level confidence scores and calibrate the review thresholds against a labeled validation set."
      },
      {
       "id": "E",
       "text": "Judge readiness using only overall accuracy."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "Stratified sampling of high-confidence outputs detects drift and novel errors, and calibrating field-level confidence on labeled data makes routing decisions meaningful.",
      "wrong": {
       "B": "Uncalibrated self-reported confidence is unreliable.",
       "C": "Unstratified sampling can miss rare document types and fields where errors concentrate.",
       "E": "Overall accuracy can hide poor performance in specific segments."
      }
     },
     "studyRef": "Task Statement 5.5 (stratified sampling, calibration)"
    },
    {
     "n": 60,
     "scenario": 6,
     "domain": 5,
     "ts": "5.1",
     "tests": "Position effects: key findings first, section headers",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A reconciliation prompt aggregates 45 per-document extraction summaries (about 70k tokens). Outputs consistently omit details from documents roughly 15 to 30, in the middle of the input. What is the best mitigation?",
     "options": [
      {
       "id": "A",
       "text": "Switch to a model with a larger context window so that all 45 summaries can be attended to equally well in a single pass over the input."
      },
      {
       "id": "B",
       "text": "Add \"Do not skip any documents\" to the prompt."
      },
      {
       "id": "C",
       "text": "Compress each summary to a single sentence so the whole input becomes much shorter and every document fits comfortably."
      },
      {
       "id": "D",
       "text": "Put a key-findings summary at the start of the aggregated input and add explicit section headers."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Models reliably process the beginning and end of long inputs but may omit middle sections. Putting key findings first and using clear headers mitigates position effects.",
      "wrong": {
       "A": "A larger window does not fix uneven attention to middle content.",
       "B": "A general instruction does not change how middle content is processed.",
       "C": "Progressive summarization risks losing numbers, dates, and other details that matter."
      }
     },
     "studyRef": "Task Statement 5.1 (lost in the middle; section headers)"
    }
   ]
  },
  {
   "id": "exam2",
   "title": "Mock Exam 2",
   "scenarioIds": [
    1,
    3,
    4,
    5
   ],
   "questions": [
    {
     "n": 1,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "max_tokens caps the length of one response; it neither limits loop iterations nor signals completion",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Billing disputes take an average of 9 requests through your support agent's loop. Hoping to shorten them, a teammate lowered `max_tokens` from 2048 to 300 on every request. A week later disputes still average 9 requests, but 6% of customers now get replies that stop mid-sentence, and some approved refunds never reach `process_refund`. The loop runs the requested tools when `stop_reason` is `\"tool_use\"` and otherwise sends Claude's latest text to the customer. What is the most accurate diagnosis?",
     "options": [
      {
       "id": "A",
       "text": "The tighter limit made Claude plan more tersely, so it now skips tool calls it judges too costly; a system prompt rule that approved refunds must call `process_refund` will fix it."
      },
      {
       "id": "B",
       "text": "`max_tokens` caps the length of one response, not the number of iterations; responses that hit it end with `stop_reason` `\"max_tokens\"`, which the loop treats as final."
      },
      {
       "id": "C",
       "text": "`max_tokens` is the token budget for the whole conversation, so the growing history of tool results uses up the 300 tokens early; raise it to the full context window size."
      },
      {
       "id": "D",
       "text": "The truncation comes from letting the loop run too long; capping it at 5 requests is the standard way to shorten disputes and keeps each reply complete."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`max_tokens` limits how much Claude can generate in a single response. It has no effect on how many loop iterations a task needs, which is why disputes still take 9 requests. When a response reaches the limit, generation stops mid-text or mid-tool-call and `stop_reason` is `\"max_tokens\"`. This loop treats every stop other than `\"tool_use\"` as final, so it sends the half-finished text to the customer and never runs a half-written `process_refund` call. Restore an adequate `max_tokens` and treat `\"max_tokens\"` as an unfinished response, not as completion.",
      "wrong": {
       "A": "`max_tokens` does not change how Claude plans or which tools it considers worth calling; it simply cuts generation off at the limit. The missing refunds are tool calls truncated while being written, and a prompt rule cannot help a call that never finishes.",
       "C": "`max_tokens` limits the output of a single response; it is not a budget for the conversation history. The fix is only to restore a reasonable per-response limit, not to treat the parameter as a context size.",
       "D": "Truncation happens inside a single response, so an iteration cap cannot prevent it. A fixed cap as the main way to stop the loop is itself an anti-pattern and would cut off disputes that legitimately need more steps."
      }
     },
     "studyRef": "Task Statement 1.1 (stop_reason-driven loop control; max_tokens limits one response, not the number of loop iterations)"
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Multiple customer matches require an additional identifier, not heuristic selection by match score",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "`get_customer` now returns a `match_score` (0 to 1) for each record found by name. To cut clarification turns, a teammate proposes: \"When a name lookup returns several records, auto-select the top one if its score is at least 0.90 and at least 0.10 above the runner-up; otherwise ask for an identifier.\" In an audited case, `get_customer(name=\"Jon Ellis\")` returned 0.97 for Jon Ellis (Leeds) and 0.81 for Jonathan Ellis (Bristol); the customer writing was Jonathan, who signs his messages with his nickname. How should the agent handle a lookup that returns more than one record?",
     "options": [
      {
       "id": "A",
       "text": "Adopt the rule but tighten it to a 0.95 minimum and a 0.15 gap, so that fewer conversations are auto-selected."
      },
      {
       "id": "B",
       "text": "Adopt the rule, and have the agent tell the customer which account it picked so they can object if it is wrong."
      },
      {
       "id": "C",
       "text": "Escalate every multi-match conversation to a human, since the agent cannot verify a customer's identity on its own."
      },
      {
       "id": "D",
       "text": "Ask the customer for an additional identifier, such as email, phone, or an order number, whatever the scores are."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When a lookup returns multiple matches, the agent should ask for additional identifiers instead of selecting by heuristics. A match score measures how closely the typed name resembles each record's name, not which account belongs to the person writing, so no threshold turns it into an identity check.",
      "wrong": {
       "A": "The audited case defeats the tightened rule: 0.97 clears a 0.95 minimum and the 0.16 gap clears 0.15, so the agent would still pick the Leeds account for the Bristol customer.",
       "B": "Naming the selected account discloses another customer's details before identity is established, and it shifts the job of catching the error onto the customer.",
       "C": "The agent can make progress by asking for an identifier, so escalating every multi-match case is premature and lowers first-contact resolution."
      }
     },
     "studyRef": "Task Statement 5.2 (ask for additional identifiers when tool results return multiple matches)"
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Permission errors are non-retryable and need a different response than transient or business errors",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "For orders bought through the MarketHub partner channel, `process_refund` gets HTTP 403 from the payments API: the support agent's service account may not issue partner-channel refunds, and by policy the finance team issues them after a human handoff. These refunds are within policy and are approved when finance handles them. Today the tool returns `{\"isError\": true, \"content\": \"Refund failed\"}`; the agent retries three times, then tells customers to try again tomorrow. How should the tool report this failure?",
     "options": [
      {
       "id": "A",
       "text": "`errorCategory: \"permission\"`, `isRetryable: false`, and a description saying finance must issue partner refunds."
      },
      {
       "id": "B",
       "text": "`errorCategory: \"business\"`, `isRetryable: false`, and a customer-friendly explanation that partner-channel orders are not refundable."
      },
      {
       "id": "C",
       "text": "`errorCategory: \"transient\"`, `isRetryable: true`, and a longer backoff between attempts, since the payments API might accept a later try."
      },
      {
       "id": "D",
       "text": "Keep the generic error and add a system prompt rule: after three failed refunds, call `escalate_to_human`."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The 403 is a permission error: the request is valid and within policy, but this caller lacks the access to perform it, so retrying with the same credentials can never succeed. `errorCategory: \"permission\"`, `isRetryable: false`, and a human-readable description let the agent stop retrying, tell the customer what will happen, and route the case through `escalate_to_human` so finance can complete it.",
      "wrong": {
       "B": "A business error means a policy violation. These refunds are allowed, so telling customers their order is not refundable would be false and would deny refunds they are entitled to.",
       "C": "Permission problems do not clear with time; the account gets the same 403 on every attempt, so marking it retryable guarantees wasted calls.",
       "D": "The generic error still hides the cause, so the agent wastes three retries and cannot explain the situation; a prompt rule after the fact replaces structured metadata with guesswork."
      }
     },
     "studyRef": "Task Statement 2.2 (transient vs validation vs business vs permission errors; errorCategory and isRetryable)"
    },
    {
     "n": 4,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "Pre-execution tool call interception to block policy violations and redirect",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Policy requires that any refund above $500 be handled by a human. The system prompt states this rule, yet an audit found four autonomous refunds of $500+ last month. You will enforce the rule with an Agent SDK hook. Which design guarantees compliance?",
     "options": [
      {
       "id": "A",
       "text": "A `PostToolUse` hook on `process_refund` that checks the amount and calls `escalate_to_human` when it exceeds $500."
      },
      {
       "id": "B",
       "text": "A `PostToolUse` hook that rewrites results for large refunds to say \"pending human review\", so the model tells the customer that a human will follow up on the payment."
      },
      {
       "id": "C",
       "text": "A hook that intercepts `process_refund` before execution and, if `amount > 500`, blocks the call and returns a result directing the agent to the escalation workflow."
      },
      {
       "id": "D",
       "text": "A second validation prompt before every refund asking the model whether the amount is over $500, with the refund allowed to proceed only when the answer is \"no\", and the answer logged."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Tool-call interception hooks (`PreToolUse` in the Agent SDK, returning a deny decision) run before the tool executes, so the refund is never issued and the call can be redirected to human escalation. Hooks give deterministic guarantees where prompt instructions only give probabilistic compliance.",
      "wrong": {
       "A": "`PostToolUse` fires after the tool has already run. The refund would already have been paid, so the hook only escalates after the damage is done.",
       "B": "Rewriting the result after the fact hides that the money has actually been moved; it does not prevent the refund.",
       "D": "A validation prompt is still probabilistic LLM judgment. The original failure was non-compliance with a prompt rule, and this just adds another prompt-based check."
      }
     },
     "studyRef": "Task Statement 1.5 (hooks that intercept outgoing tool calls; PostToolUse vs pre-execution interception)"
    },
    {
     "n": 5,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "System prompt keyword-sensitive wording creating unintended tool associations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After a prompt update added the line `Always call get_customer first whenever a message mentions an account or billing`, tool selection regressed. Messages like \"Where is my order #55102? It was charged to my account\" now trigger `get_customer` and never reach `lookup_order`. The tool descriptions are detailed and were not changed. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Lengthen the `lookup_order` description with more example queries so that it outweighs the system prompt wording."
      },
      {
       "id": "B",
       "text": "Replace the keyword-triggered rule with intent-based guidance and audit the prompt for other keyword-sensitive wording."
      },
      {
       "id": "C",
       "text": "Add a pre-processing layer that detects order numbers in each message and pre-selects `lookup_order` before the model decides."
      },
      {
       "id": "D",
       "text": "Force `lookup_order` through `tool_choice` on every turn, because most customer messages concern order status."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "System prompt wording can override well-written tool descriptions: a keyword-based instruction creates an unintended association between words such as \"account\" or \"billing\" and `get_customer`. The regression coincided with that line, so fixing the instruction is the targeted remedy.",
      "wrong": {
       "A": "The descriptions are already good and unchanged; the regression came from the prompt line. Piling on description text addresses a different problem.",
       "C": "A pre-processing router is over-engineered and bypasses the model's language understanding, when a one-line prompt fix addresses the cause.",
       "D": "Forcing one tool on every turn would break all the other tools and conversation turns (such as final replies)."
      }
     },
     "studyRef": "Task Statement 2.1 (impact of system prompt wording on tool selection)"
    },
    {
     "n": 6,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "Persistent case-facts block outside progressively summarized history",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "In long conversations your agent summarizes older turns after about 20 exchanges. Customers now complain that the agent forgot concrete details: it says \"your recent order\" instead of order #48213, forgets the $89.99 amount, and does not recall that it promised a refund within 5 business days. Which change most directly prevents this?",
     "options": [
      {
       "id": "A",
       "text": "Extract amounts, dates, order IDs, statuses and commitments into a persistent case-facts block sent with every prompt."
      },
      {
       "id": "B",
       "text": "Summarize more frequently, every 5 exchanges instead of every 20, so each summary covers fewer turns, stays short, and keeps the order details accurate."
      },
      {
       "id": "C",
       "text": "Switch to a model with a larger context window so that summarization can be skipped for most conversations and turns stay verbatim."
      },
      {
       "id": "D",
       "text": "Instruct the summarizer to \"be concise but accurate\" and to keep the most important details of each earlier turn in the summary."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Progressive summarization tends to compress exact values, dates, and customer-stated expectations into vague prose. Keeping those transactional facts in a dedicated structured block that is re-sent verbatim each turn protects them from summarization loss.",
      "wrong": {
       "B": "More frequent summarization compounds the loss, since each pass condenses already condensed text.",
       "C": "A bigger window only delays the point at which summarization happens; long cases will still hit it, and details can also be missed in the middle of very long inputs.",
       "D": "A vague instruction relies on the summarizer's judgment and does not guarantee that amounts and commitments survive."
      }
     },
     "studyRef": "Task Statement 5.1 (progressive summarization risks; case-facts block)"
    },
    {
     "n": 7,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Synthesizing one unified resolution after investigating decomposed concerns in parallel",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your support agent splits multi-concern messages into separate items and investigates them in parallel, reusing the verified customer record. Each branch then messages the customer as soon as it finishes. A customer wrote that the blender in order #7319 arrived cracked and asked to cancel the order's other item, a kettle that has not shipped yet. Within a minute they got two replies: one promising a replacement blender \"in the same shipment as your kettle\", the other confirming the kettle was cancelled. In 19% of multi-concern conversations the customer writes back asking which reply to follow. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Investigate the items one after another, so that each branch can read the replies already sent before it writes its own message."
      },
      {
       "id": "B",
       "text": "Add a system-prompt rule telling every branch to keep its reply consistent with the customer's other concerns."
      },
      {
       "id": "C",
       "text": "Route any message that raises two or more concerns about the same order to `escalate_to_human`, so one person resolves them all."
      },
      {
       "id": "D",
       "text": "Have each branch return its findings instead of a reply, and add a final step that merges them into one resolution to send."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Decomposition and parallel investigation are already in place; the missing piece is synthesis. When branches return findings rather than customer-facing replies, one final step can see that the replacement and the cancellation interact (for example, ship the replacement on its own) and send a single unified resolution.",
      "wrong": {
       "A": "Sequential handling gives up the latency benefit of parallel investigation and still sends one message per concern, so the customer still gets fragmented replies, only more slowly.",
       "B": "Parallel branches cannot see each other's results, so an instruction to stay consistent gives them nothing to be consistent with; it is probabilistic guidance with no shared input.",
       "C": "Several concerns are not an escalation trigger; escalating them cuts first-contact resolution on cases the agent can resolve once it combines its findings."
      }
     },
     "studyRef": "Task Statement 1.4 (decompose, investigate in parallel with shared context, then synthesize one unified resolution)"
    },
    {
     "n": 8,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Valid escalation triggers (policy gap, inability to make progress) versus complexity, self-rated confidence, and frustration",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "QA is reviewing five escalations from last week to pick few-shot examples for the agent's system prompt. None of the five customers asked for a human. Which TWO escalations were warranted? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "A customer reported a dented kettle (photo attached), a missing mug, and a double charge across two orders. Policy covers all three, and the agent escalated because the case had many parts."
      },
      {
       "id": "B",
       "text": "A parcel was confirmed delivered to a neighbor who refuses to hand it over. Policy covers parcels lost in transit and damaged items and says nothing about this, and the agent escalated with a summary."
      },
      {
       "id": "C",
       "text": "On a standard in-window return with a verified order, the agent rated its own confidence 4 out of 10 and escalated instead of processing the return."
      },
      {
       "id": "D",
       "text": "`get_customer` returned two accounts. After two requests, the customer had no email, phone, or order number matching either one, and the agent escalated with what it had collected."
      },
      {
       "id": "E",
       "text": "A customer wrote in capitals that a delivery arrived two days late. A standard shipping credit applied, and the agent escalated at once without offering the credit."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "Escalation triggers are an explicit request for a human, a policy exception or gap, and inability to make meaningful progress. B is a gap: policy covers parcels lost in transit and damaged items and is silent on a confirmed delivery to a neighbor. D is inability to progress: after two requests the agent still cannot tell which account belongs to the customer, and it must not pick one by guesswork.",
      "wrong": {
       "A": "Complexity alone is not a trigger: every issue is covered by policy and within the agent's tools, so it should have resolved all three.",
       "C": "Self-reported confidence is a poorly calibrated proxy for case difficulty; a verified in-window return is routine, and escalating it lowers first-contact resolution.",
       "E": "Frustration is not a request for a human. The agent should acknowledge it and offer the standard credit, escalating only if the customer then asks for a person."
      }
     },
     "studyRef": "Task Statement 5.2 (escalation triggers: human request, policy exceptions or gaps, inability to progress)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 4,
     "ts": "4.2",
     "tests": "2-4 targeted few-shot examples of ambiguous cases that show why one action beats plausible alternatives",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Messages such as \"there's a charge on my card I don't recognize\" can mean a duplicate charge on a known order (`lookup_order`, then possibly `process_refund`), a subscription renewal the customer forgot about (`get_customer` to show the plan), or suspected fraud, which policy routes to `escalate_to_human`. The policy text already defines what counts as suspected fraud. Your prompt holds eight few-shot examples, each a clear-cut message followed only by the correct tool call. On these ambiguous messages the agent escalates 44% of conversations, and most of the escalated cases turn out to be renewals. What change would most improve its handling?",
     "options": [
      {
       "id": "A",
       "text": "Add twelve more clear-cut examples, each followed only by the correct tool call, so that the agent sees every request type more often."
      },
      {
       "id": "B",
       "text": "Replace the examples with 20 if-then rules that map charge-related phrases to the tool to call first, covering renewals and duplicates."
      },
      {
       "id": "C",
       "text": "Add three examples of ambiguous charge messages, each with a short explanation of why its first step beats the alternatives."
      },
      {
       "id": "D",
       "text": "Have the agent rate its certainty about the charge type from 1 to 10, and escalate only when that rating falls below 7, to cut escalations."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The existing examples never show an ambiguous case or any reasoning, so the agent has nothing to go on when a message could mean three things. Two to four targeted examples of exactly these messages, each explaining why one first step (for example, `get_customer` to check for a recent renewal) beats the alternatives, teach the judgment, and that judgment carries over to new phrasings.",
      "wrong": {
       "A": "More clear-cut examples repeat what the agent already handles well. They contain no ambiguous case and no reasoning, so behavior on these messages would not change.",
       "B": "A phrase table covers only the wordings someone thought to list. Customers describe charges in endless ways, and rules do not teach the judgment that generalizes.",
       "D": "Self-reported certainty is poorly calibrated, and the agent is already confidently escalating renewals. A threshold does not tell it which first step is right."
      }
     },
     "studyRef": "Task Statement 4.2 (2-4 targeted few-shot examples for ambiguous cases, showing reasoning for the chosen action over alternatives)"
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Structured handoff summaries for human agents who lack the transcript",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "When the agent escalates, the human agent sees only the escalation payload and has no access to the conversation transcript. Currently the payload is the single line `Customer needs help with a refund`, and humans have to re-ask the customer everything. Which TWO elements are the most essential to add to the payload? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "The agent's guess at the customer's emotional state, so that the human can adjust tone."
      },
      {
       "id": "B",
       "text": "The verified customer ID, relevant order ID, and the refund amount at stake, taken from tool results."
      },
      {
       "id": "C",
       "text": "The complete raw log of every tool call and intermediate message, so that no information is lost."
      },
      {
       "id": "D",
       "text": "A short note that the customer needs help, because the human agent will re-collect details directly from the customer."
      },
      {
       "id": "E",
       "text": "The agent's root-cause analysis of the issue and a recommended next action."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "A structured handoff gives the human the identifiers and amounts needed to act immediately (customer ID, order, amount) plus the root cause and a recommended action. This lets them pick up without re-interviewing the customer.",
      "wrong": {
       "A": "A guess about emotion is a weak, unreliable signal and not what the human needs to resolve the case.",
       "C": "An unstructured dump of logs buries the key facts; the handoff should be a compact structured summary.",
       "D": "This is the current failing design. Having the customer repeat everything is exactly the problem to eliminate."
      }
     },
     "studyRef": "Task Statement 1.4 (structured handoff protocols for mid-process escalation)"
    },
    {
     "n": 11,
     "scenario": 1,
     "domain": 2,
     "ts": "2.3",
     "tests": "Too many tools degrade selection reliability; scoped tool access",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After three extra MCP servers were connected (shipping labels, loyalty points, fraud review), the support agent has 16 tools. Tool-selection accuracy in your eval set dropped from 96% to 78%, with errors such as calling `get_loyalty_balance` for a refund question. About 95% of conversations only need `get_customer`, `lookup_order`, `process_refund`, and `escalate_to_human`. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add few-shot examples for each of the 16 tools to the system prompt, showing the correct tool for typical requests."
      },
      {
       "id": "B",
       "text": "Give the main agent just the four core tools, and route the rare shipping, loyalty, and fraud needs to specialized agents or scoped tools."
      },
      {
       "id": "C",
       "text": "Keep all 16 tools and add a keyword router that pre-selects the tool for each incoming message before the model decides."
      },
      {
       "id": "D",
       "text": "Move to a model with a larger context window so that all 16 tool definitions fit comfortably in each request."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Giving an agent many tools (16 instead of 4 to 5) increases decision complexity and degrades selection reliability. Scoping the main agent to the tools its role needs, and handling rare cross-role needs elsewhere, directly addresses this.",
      "wrong": {
       "A": "Sixteen sets of examples add large token overhead and leave the decision complexity of a 16-tool menu in place.",
       "C": "A keyword router is over-engineered and bypasses the model's language understanding, when reducing the tool surface fixes the cause.",
       "D": "The problem is selection complexity, not whether the definitions fit in the window; a larger window does not make choosing among 16 tools easier."
      }
     },
     "studyRef": "Task Statement 2.3 (too many tools degrade selection; scoped tool access)"
    },
    {
     "n": 12,
     "scenario": 1,
     "domain": 5,
     "ts": "5.5",
     "tests": "Aggregate accuracy masking weak segments; stratified sampling by issue type",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A QA dashboard shows that 94% of the agent's autonomous resolutions are judged correct, above the 90% target, and leadership wants to cut human review of resolutions. Before reducing review, what should you do?",
     "options": [
      {
       "id": "A",
       "text": "Break accuracy down by issue type and sample each stratum, including confident resolutions, before reducing review."
      },
      {
       "id": "B",
       "text": "Raise the overall random sample from 500 to 5,000 resolutions to tighten the confidence interval on the 94% figure."
      },
      {
       "id": "C",
       "text": "Have the agent self-report confidence per resolution and drop human review for everything it rates 8 or higher."
      },
      {
       "id": "D",
       "text": "Cut review now, because 94% exceeds the 90% target, and monitor complaints and escalation rates for regressions."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A high aggregate rate can hide poor performance on particular segments (for example, billing disputes). Validating accuracy per issue type and sampling stratified, including high-confidence outputs, reveals weak segments and novel error patterns before review is reduced.",
      "wrong": {
       "B": "A larger sample of the same aggregate still yields one blended number, so it can still hide a poor segment.",
       "C": "Uncalibrated self-reported confidence is unreliable; the agent is often confidently wrong on hard cases. Thresholds must be calibrated against labeled data.",
       "D": "Waiting for complaints to detect errors lets harm occur first, and the aggregate figure says nothing about segment-level performance."
      }
     },
     "studyRef": "Task Statement 5.5 (aggregate metrics masking segment errors; stratified sampling)"
    },
    {
     "n": 13,
     "scenario": 1,
     "domain": 4,
     "ts": "4.3",
     "tests": "Strict schemas eliminate syntax errors, not semantic errors",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "At the end of each case, the agent calls `record_case_summary`, whose strict JSON schema includes `customer_id` (string) and `refund_amount` (number). Output is always valid JSON, but in about 4% of records `refund_amount` holds the order total instead of the amount actually refunded. What is the correct diagnosis and remedy?",
     "options": [
      {
       "id": "A",
       "text": "Switch from tool use to asking for JSON in plain text, because the tool schema appears to confuse the model about which numeric field holds which amount."
      },
      {
       "id": "B",
       "text": "Make `refund_amount` optional so that the model can omit it when unsure, and let downstream systems backfill missing amounts from the order database, reducing validation failures."
      },
      {
       "id": "C",
       "text": "Set `tool_choice` to `\"any\"` so that the model must call the tool on every turn and therefore fills each field correctly with the right amount."
      },
      {
       "id": "D",
       "text": "Schema enforcement removes syntax errors but not semantic ones; validate the value against the `process_refund` result and feed the mismatch back for correction."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Strict tool schemas guarantee well-formed, schema-compliant output but cannot check that a value is correct or in the right field. Semantic validation against source-of-truth data, with specific feedback on retry, addresses the actual problem.",
      "wrong": {
       "A": "Plain-text JSON is less reliable than schema-enforced tool use and would reintroduce syntax errors without fixing the wrong values.",
       "B": "Making the field optional does not make the value correct, and it would let records silently lose the refund amount.",
       "C": "`tool_choice: \"any\"` guarantees that some tool is called, not that its argument values are right."
      }
     },
     "studyRef": "Task Statement 4.3 (strict schemas vs semantic errors); see also 4.4 for validation loops"
    },
    {
     "n": 14,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "PostToolUse hooks to normalize heterogeneous tool output formats",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`get_customer` returns `created_at` as a Unix epoch, `lookup_order` returns ISO 8601 strings, and the billing tool returns status codes `1`, `2`, `3`. The agent sometimes misjudges 30-day return eligibility by comparing mixed formats. These backends belong to other teams and cannot be changed quickly. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Document the conversion rules for epoch timestamps and numeric status codes in the system prompt and trust the agent to apply them on every comparison."
      },
      {
       "id": "B",
       "text": "Add a calculator subagent that the agent must consult each time it compares two dates, so that every date comparison is computed rather than guessed."
      },
      {
       "id": "C",
       "text": "Add a `PostToolUse` hook that converts timestamps to ISO 8601 and maps status codes to readable labels before the results reach the model."
      },
      {
       "id": "D",
       "text": "Ask the three owning teams to standardize their formats and pause the agent rollout until they do."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "A `PostToolUse` hook transforms tool results deterministically before the model sees them, so the model always reasons over one consistent format. It requires no changes to the backends.",
      "wrong": {
       "A": "Date arithmetic and code mapping from prompt rules is probabilistic, and the model must still do the conversions on every turn.",
       "B": "A calculator subagent is over-engineered for a data-format problem and adds latency and failure modes.",
       "D": "Waiting on other teams delays the project when the normalization can be done locally in a hook."
      }
     },
     "studyRef": "Task Statement 1.5 (PostToolUse hooks for data normalization)"
    },
    {
     "n": 15,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Avoiding natural-language and iteration-cap termination anti-patterns",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your support agent's loop is implemented as:\n```python\nfor turn in range(5):\n    resp = client.messages.create(...)\n    if \"anything else I can help\" in resp.content[-1].text:\n        break\n    run_tools_and_append(resp)\n```\nConversation 8841 (return plus billing dispute) ran `get_customer`, `lookup_order`, `process_refund` and `lookup_order` again, and at turn 5 the last response had `stop_reason == \"tool_use\"`. The loop exited and the customer received no answer. What is the correct fix?",
     "options": [
      {
       "id": "A",
       "text": "Increase the iteration cap from 5 to 15 and keep the phrase check as the main stop condition for finished conversations."
      },
      {
       "id": "B",
       "text": "Continue the loop while `stop_reason == \"tool_use\"` and terminate when `stop_reason == \"end_turn\"`."
      },
      {
       "id": "C",
       "text": "Treat any response that contains a text block as complete, since text means the model has finished."
      },
      {
       "id": "D",
       "text": "Ask the model to emit a `[DONE]` token when it considers itself finished, and stop only when that token appears in its output."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The agentic loop should be driven by `stop_reason`: continue on `tool_use`, finish on `end_turn`. Natural-language phrases, arbitrary caps, and text-content checks are unreliable proxies for completion.",
      "wrong": {
       "A": "A larger cap is still an arbitrary primary stop mechanism, and the phrase check can still truncate real work.",
       "C": "The model often emits explanatory text alongside a `tool_use` block, so text presence does not signal completion.",
       "D": "Parsing a special token from model text is still a natural-language completion signal; `stop_reason` is the structured, reliable signal."
      }
     },
     "studyRef": "Task Statement 1.1 (loop termination; avoid parsing natural language or relying on caps)"
    },
    {
     "n": 16,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Partitioning research scope across subagents to minimize duplication",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "For the topic \"renewable energy adoption in emerging markets\", the coordinator launches three web-search subagents, each given the full topic string. Logs show 60% of the URLs retrieved by the three agents overlap, and search cost has tripled without better coverage. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a de-duplication step to the synthesis agent so that repeated sources are merged in the final report."
      },
      {
       "id": "B",
       "text": "Run the three search agents sequentially and pass each agent's results to the next so that it can skip sources already found, keeping the current full-topic prompt for each."
      },
      {
       "id": "C",
       "text": "Assign each subagent a distinct subtopic or source type so searches do not overlap."
      },
      {
       "id": "D",
       "text": "Replace the three agents with one search agent given a higher turn limit and told to be thorough."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The coordinator is responsible for partitioning the research scope. Assigning distinct subtopics or source types removes the duplicated work at its source while keeping parallelism.",
      "wrong": {
       "A": "De-duplicating downstream treats the symptom after the cost of redundant searches is already paid.",
       "B": "Sequencing sacrifices parallelism and still leaves the scopes undefined; partitioning is the direct fix.",
       "D": "A single agent with a higher turn limit gives up parallel coverage and does not define the breadth of the topic."
      }
     },
     "studyRef": "Task Statement 1.2 (coordinator partitions scope; distinct subtopics/source types)"
    },
    {
     "n": 17,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Parallel Task calls cut wall-clock latency to roughly the slowest subagent; validate with parallel vs sequential timing",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Coordinator logs for a typical research query show three independent subagents spawned one per turn: a web-search subagent for 2025-2026 market data (58 s), a document-analysis subagent for the four PDFs the user attached (71 s), and a second web-search subagent for regulatory sources (46 s). Each coordinator turn adds about 4 s. You change the coordinator so it emits all three Task calls in a single response, then benchmark the same 50 queries both ways. Which result would confirm that the change works as intended?",
     "options": [
      {
       "id": "A",
       "text": "The research phase drops from about 187 s to about 75 s, while each subagent's own run time stays the same."
      },
      {
       "id": "B",
       "text": "Total tokens per query fall by roughly two-thirds, because the three subagents now share one coordinator turn and its context."
      },
      {
       "id": "C",
       "text": "Each subagent's own run time falls by about two-thirds, because the three subagents now divide the research work among them."
      },
      {
       "id": "D",
       "text": "The research phase falls to about 58 s, the run time of the first subagent spawned, as the other two finish in its shadow."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Emitting the three Task calls in one response lets the independent subagents run concurrently, so the phase is bounded by the slowest subagent plus one coordinator turn: about 71 + 4 = 75 s, instead of 58 + 71 + 46 + 3 x 4 = 187 s sequentially. Each subagent still does the same work, so its own run time should not change. Comparing the same independent subtasks run in parallel and sequentially is how the latency benefit is validated. Naming note: the Exam Guide calls the spawning tool Task; current Agent SDK versions name it `Agent`. On the exam, use the guide's name.",
      "wrong": {
       "B": "Parallel spawning is a latency optimization. Each subagent still runs in its own context and consumes its own tokens, so token use stays roughly the same.",
       "C": "Concurrency does not split one subagent's task among the others; each still does its full task, so per-subagent time is unchanged. Only the phase's wall-clock time drops.",
       "D": "Concurrent subagents are done when the slowest one finishes. The document-analysis subagent takes 71 s, so the phase cannot end at 58 s."
      }
     },
     "studyRef": "Task Statement 1.3 (parallel subagents via multiple Task calls in one response; measure parallel vs sequential latency)"
    },
    {
     "n": 18,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Emitting multiple Task calls in one response only for independent subtasks; dependent subagents get prior results in their prompt",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A user asks the research system to compare sodium-ion and lithium iron phosphate batteries for a utility's 2030 storage procurement and attaches six vendor RFP responses. The coordinator's plan has four subtasks:\n\n- (1) web search for 2025-2026 cost and deployment data\n- (2) document analysis of the six attached RFP responses\n- (3) synthesis of (1) and (2), with conflicting figures flagged\n- (4) a report built from (3)\n\nToday the coordinator spawns one subagent per turn, and (1) and (2) alone take 110 s and 140 s back to back. What should the coordinator emit in its first response?",
     "options": [
      {
       "id": "A",
       "text": "Four Task calls, one per subtask, so that all four subagents run at once and the run lasts only as long as the slowest."
      },
      {
       "id": "B",
       "text": "One Task call for (1) only, because a coordinator can have just one subagent running at a time and must wait for it."
      },
      {
       "id": "C",
       "text": "Task calls for (1) and (2), plus a third for synthesis told to wait for those two subagents and read their results when they finish."
      },
      {
       "id": "D",
       "text": "Task calls for (1) and (2) together; once both return, a Task call for synthesis with both results in its prompt, then the report."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subtasks (1) and (2) are independent, so the coordinator should emit both Task calls in the same response to run them in parallel (about 140 s instead of 250 s). Synthesis depends on both outputs, and a subagent receives context only through its prompt, so synthesis is spawned after both return, with their complete results passed in; the report follows synthesis. Naming note: the Exam Guide calls the spawning tool Task; current Agent SDK versions name it `Agent`. On the exam, use the guide's name.",
      "wrong": {
       "A": "Synthesis and report generation depend on outputs that do not exist yet. Spawned in the same response, they would start with no findings, because a subagent sees only what is in its own prompt.",
       "B": "A coordinator can run several subagents at once by emitting multiple Task calls in one response. One subagent per turn is the sequential pattern that makes the run slow.",
       "C": "Subagents have isolated contexts and share no memory, so a synthesis subagent cannot watch its siblings or read their results. The coordinator must collect the results and pass them in the synthesis prompt."
      }
     },
     "studyRef": "Task Statement 1.3 (parallel Task calls in one coordinator response; explicit context passing to dependent subagents)"
    },
    {
     "n": 19,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Iterative refinement re-invokes synthesis with prior plus new findings, because subagents keep no context between calls",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your coordinator's refinement loop works like this: after the first synthesis, it lists coverage gaps, sends targeted queries for those gaps to the web-search and document-analysis subagents, and then calls the synthesis subagent with only the new findings and the instruction \"Update the report to cover these gaps.\" On a run about grid-scale storage costs, the first draft covered lithium-ion, pumped hydro, and flow batteries. The gap round added findings on compressed air and thermal storage, two of which revise the first draft's 2023 lithium-ion cost figures. The second draft covers only compressed air and thermal storage, and the lithium-ion figures are never corrected. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Have the report subagent join the first and second drafts into one document, so the content from both synthesis rounds appears together in the report."
      },
      {
       "id": "B",
       "text": "Re-invoke synthesis with the findings from both rounds; it has no memory of its first call and must reconcile the revised cost figures."
      },
      {
       "id": "C",
       "text": "Give the synthesis subagent its own search tools, so it can fetch any earlier content it needs instead of relying on what the coordinator passes it."
      },
      {
       "id": "D",
       "text": "Re-run the entire pipeline on the original query with the gap topics appended, so every subagent rebuilds the full picture."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Each synthesis call starts with fresh, isolated context: it does not remember the first draft or the findings behind it. Given only the gap findings, it wrote about only those topics. In the refinement loop the coordinator should re-invoke synthesis with the earlier findings plus the new targeted ones, so it can integrate everything and reconcile the two findings that revise the lithium-ion figures.",
      "wrong": {
       "A": "Joining the drafts keeps both sets of topics, but it leaves the outdated lithium-ion figures next to the findings that revise them. Reconciling conflicting evidence is synthesis work, and it needs all the findings in one call.",
       "C": "The earlier findings already exist at the coordinator. Giving synthesis search tools over-provisions it, sidesteps the coordinator's routing, and repeats work instead of passing it the findings it needs.",
       "D": "Re-running everything repeats searches and analyses that already succeeded. The refinement loop should re-delegate only targeted gap queries and then re-synthesize with all findings."
      }
     },
     "studyRef": "Task Statement 1.2 (iterative refinement: re-delegate targeted queries, then re-invoke synthesis with the full set of findings; subagents have isolated context)"
    },
    {
     "n": 20,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Routing all subagent communication through the coordinator",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "To cut latency, an engineer lets the web-search subagent write results to a shared directory, and the document-analysis subagent reads them directly, bypassing the coordinator. Two weeks later, a search failure leaves the analysis agent working on stale files, and nobody can tell from the coordinator's logs what happened. What is the best course of action?",
     "options": [
      {
       "id": "A",
       "text": "Add file locking and timestamps to the shared directory so the analysis agent can detect stale files."
      },
      {
       "id": "B",
       "text": "Keep the direct handoff, but add detailed logging inside each subagent."
      },
      {
       "id": "C",
       "text": "Route all inter-subagent communication through the coordinator, which passes the needed findings explicitly in each subagent's prompt."
      },
      {
       "id": "D",
       "text": "Let the document-analysis agent spawn the web-search agent itself via the Task tool whenever it needs fresher data, so that no shared files are needed at all."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Hub-and-spoke routing gives the coordinator observability, consistent error handling, and controlled information flow. It also fits the fact that subagents have isolated context and receive information only through their prompts.",
      "wrong": {
       "A": "Locking and timestamps patch one symptom while leaving the architecture without central error handling or observability.",
       "B": "Per-agent logging improves visibility somewhat, but the coordinator still cannot handle the failure or control what flows between agents.",
       "D": "Letting a subagent spawn another one creates a second, uncontrolled orchestration layer that bypasses the coordinator even further."
      }
     },
     "studyRef": "Task Statement 1.2 (hub-and-spoke; route communication through the coordinator)"
    },
    {
     "n": 21,
     "scenario": 3,
     "domain": 1,
     "ts": "1.6",
     "tests": "Fixed pipeline vs dynamic adaptive decomposition",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The coordinator always runs the same four stages (search, analyze, synthesize, report) for every query. A simple question (\"What year did Acme IPO?\") wastes time on all four stages, while broad questions like \"competitive landscape for grid-scale batteries\" surface unexpected subtopics that the fixed flow never follows up. What design is most appropriate?",
     "options": [
      {
       "id": "A",
       "text": "Have the coordinator assess query complexity, then select which subagents to invoke and generate follow-up subtasks adaptively from intermediate findings."
      },
      {
       "id": "B",
       "text": "Add more fixed stages (a fact-check, a translation pass, a second fact-check) to every query's pipeline to improve quality for the broad, open-ended questions."
      },
      {
       "id": "C",
       "text": "Keep the fixed four stages for every query but run them in parallel to cut the latency of simple and broad questions alike."
      },
      {
       "id": "D",
       "text": "Train a separate classifier to predict which of five predefined fixed pipelines each incoming query needs, and route the query to it automatically without any adaptivity."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Fixed prompt chains suit predictable workflows, while open-ended research needs dynamic decomposition in which the coordinator selects subagents by query complexity and adapts the plan as findings arrive.",
      "wrong": {
       "B": "More fixed stages add cost for simple queries and still cannot follow unexpected leads.",
       "C": "The stages depend on each other (analysis needs search results), so they cannot simply be run in parallel; this also does not make the plan adaptive.",
       "D": "A trained classifier with predefined pipelines is over-engineered and still not adaptive to intermediate findings."
      }
     },
     "studyRef": "Task Statement 1.6 (prompt chaining vs dynamic decomposition)"
    },
    {
     "n": 22,
     "scenario": 3,
     "domain": 2,
     "ts": "2.1",
     "tests": "Renaming and rewriting overlapping tools with distinct purposes and input formats",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The search subagent has two tools: `get_source` (\"Gets a source for a topic\") and `read_source` (\"Reads a source\"). One fetches a live web page by URL; the other loads a PDF from the internal corpus by document ID. The agent picks the wrong one in about 40% of calls. What is the most effective first step?",
     "options": [
      {
       "id": "A",
       "text": "Insert a routing classifier that inspects each request and calls the right tool on the model's behalf."
      },
      {
       "id": "B",
       "text": "Add ten few-shot examples of correct tool selection to the subagent's prompt, and keep the current tool names."
      },
      {
       "id": "C",
       "text": "Merge both into a single `get_source` tool that accepts any URL or ID and decides internally which backend to call, removing the choice from the model entirely."
      },
      {
       "id": "D",
       "text": "Rename them (for example, `fetch_web_page` and `load_corpus_document`) and rewrite descriptions to state input format (URL vs document ID), output, and when to use each."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool names and descriptions are the primary signal for tool selection. Eliminating functional overlap with distinct names and descriptions that specify inputs, outputs, and boundaries addresses the root cause with little effort.",
      "wrong": {
       "A": "A router bypasses the model's own reasoning and is over-engineered when the tool interface itself is ambiguous.",
       "B": "Examples add token overhead without correcting the vague tool names and descriptions.",
       "C": "Merging can work architecturally but is a larger change than a first step; the problem is just inadequate naming and descriptions."
      }
     },
     "studyRef": "Task Statement 2.1 (rename tools and update descriptions to remove overlap)"
    },
    {
     "n": 23,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "tool_choice \"any\" forces a tool call on every request, so the model can never finish with a text reply",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "To stop the coordinator from answering research questions from its own knowledge, an engineer set `tool_choice` to `{\"type\": \"any\"}` on every coordinator request. Delegation now always happens, but no run finishes on its own: every coordinator response has `stop_reason: \"tool_use\"`, and runs end only at the 30-iteration cap. Traces show that after the report subagent returns a finished report, the coordinator calls `Task` again to ask it to \"finalize\" or \"polish\" the same report. What is the most likely cause?",
     "options": [
      {
       "id": "A",
       "text": "The report subagent's output has no completion marker, so the coordinator cannot tell the report is final and keeps asking for more."
      },
      {
       "id": "B",
       "text": "With `\"any\"`, every response must call a tool, so the coordinator can never reply with its final answer and end the turn."
      },
      {
       "id": "C",
       "text": "The 30-iteration cap is too low for a multi-agent run; raising it would give the coordinator time to reach `end_turn` on its own."
      },
      {
       "id": "D",
       "text": "The loop checks `stop_reason`, when it should instead stop as soon as any subagent result contains the finished report text."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`\"any\"` guarantees a tool call on every request, which also means the model can never answer in plain text, so `end_turn` cannot happen and the coordinator invents more tool calls. Use `\"any\"` (or a forced tool) only on steps where a tool call is always the right output, such as the initial delegation, and `\"auto\"` afterwards. Current-docs note: forced `tool_choice` (`\"any\"` and `\"tool\"`) is rejected by Opus 5.5, Sonnet 5.5 and Fable 5.1, which use `\"auto\"` plus explicit instructions; the guide's semantics are used here. Current SDKs also name the subagent tool `Agent`; the guide calls it `Task`.",
      "wrong": {
       "A": "This blames a downstream agent that is working correctly; even with a completion marker, the coordinator would still be forced to call a tool.",
       "C": "No number of iterations helps: while `\"any\"` is set, a response cannot end with `end_turn`, so a higher cap only means more wasted calls.",
       "D": "Stopping on text content is a loop-termination anti-pattern; `stop_reason` is the right signal, and the `tool_choice` setting is what prevents `end_turn`."
      }
     },
     "studyRef": "Task Statement 2.3 (tool_choice \"auto\" vs \"any\" vs forced selection)"
    },
    {
     "n": 24,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "tool_choice \"any\" to guarantee a tool call when the document type is unknown",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent has three extraction tools: `extract_table`, `extract_citations`, and `extract_findings`. The document type is not known in advance. With default settings, some responses are conversational text (\"This looks like a policy report...\") with no tool call, and the pipeline fails to parse them. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Set `tool_choice` to `\"any\"`, so that the model must call one of the extraction tools but can choose which fits the document."
      },
      {
       "id": "B",
       "text": "Force `{\"type\": \"tool\", \"name\": \"extract_findings\"}` on every call."
      },
      {
       "id": "C",
       "text": "Keep `tool_choice` as `\"auto\"` and add a system prompt line saying that the model must always call a tool and never reply in text."
      },
      {
       "id": "D",
       "text": "Add a regex parser that tries to recover structured data from the conversational replies, and fall back to defaults when parsing fails."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`tool_choice: \"any\"` guarantees that the model returns a tool call rather than text while leaving the choice among tools to the model, which suits an unknown document type. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "B": "Forcing one named tool would apply the findings schema to documents that are better served by table or citation extraction.",
       "C": "With `\"auto\"` the model may still reply in text; a prompt rule is only probabilistic.",
       "D": "Regex recovery from free text is brittle and abandons schema-enforced output."
      }
     },
     "studyRef": "Task Statement 2.3 (tool_choice options: auto, any, forced)"
    },
    {
     "n": 25,
     "scenario": 3,
     "domain": 4,
     "ts": "4.3",
     "tests": "Nullable fields and an 'unclear' enum value to prevent fabrication",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "The document-analysis output schema marks `publication_date`, `author`, and `sample_size` as required. For blog posts that state none of these, the model invents plausible values (for example, `\"2023-01-01\"`). Which TWO changes best reduce fabrication? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Make `publication_date`, `author`, and `sample_size` optional/nullable so the model can return null when the source does not state them."
      },
      {
       "id": "B",
       "text": "Lower the sampling temperature to 0 so that the model stops inventing values."
      },
      {
       "id": "C",
       "text": "Add an `\"unclear\"` option to ambiguous enums such as `source_type`, rather than forcing the model to guess a category."
      },
      {
       "id": "D",
       "text": "Add a retry loop that re-runs the extraction until all required fields are non-null."
      },
      {
       "id": "E",
       "text": "Post-process the output with a regex that rejects any date before the year 2000."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "Required fields force the model to produce something even when the source has nothing. Nullable fields and an explicit `\"unclear\"` option give it a truthful way to express absence or ambiguity, which prevents fabricated values.",
      "wrong": {
       "B": "Temperature does not change the fact that the schema demands a value. The model will still fill the field, just consistently.",
       "D": "Retrying cannot create information absent from the source; it only pressures the model into inventing a value.",
       "E": "A date range check does not detect invented values that fall in range, and it does not give the model a way to express absence."
      }
     },
     "studyRef": "Task Statement 4.3 (optional/nullable fields; enum 'unclear' and 'other' + detail)"
    },
    {
     "n": 26,
     "scenario": 3,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples reduce hallucinated precision when sources give informal quantities",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent records each quantitative finding as `{claim, figure, figure_text, approximate, unit, source}`. Its prompt already says \"Report figures exactly as the source states them.\" When sources use informal quantities, it still returns false precision: \"roughly a third of respondents\" comes back as `figure: 33.3, approximate: false`, and \"tens of thousands of installations\" as `figure: 20000`. Clients want approximate figures kept in reports, clearly marked as approximate. Which change best fixes this?",
     "options": [
      {
       "id": "A",
       "text": "Make `figure` nullable and tell the subagent to return null whenever a source gives an approximate quantity, so no invented value reaches synthesis."
      },
      {
       "id": "B",
       "text": "Repeat the existing instruction in capitals at the top and bottom of the prompt and add \"never invent precision\" to it."
      },
      {
       "id": "C",
       "text": "Add few-shot examples of informal quantities such as \"roughly a third\", showing the phrase kept in `figure_text` with `approximate: true`."
      },
      {
       "id": "D",
       "text": "Have the synthesis subagent round every figure to one significant figure, so that no reported number looks more precise than its source."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Few-shot examples are an effective way to reduce hallucination in extraction, including on informal measurements. Showing how a vague phrase should be recorded (wording kept, flagged as approximate, no invented exact value) gives the model a concrete pattern that an instruction it already ignores does not. The schema has the fields; the model needs to see how to use them.",
      "wrong": {
       "A": "Returning null avoids invented values but discards the approximate figures the client wants kept. The information is in the source; it just has to be recorded as approximate.",
       "B": "The instruction is already there and is not working. Repeating or emphasizing it is still instruction-only, while the model needs a demonstration of correct output.",
       "D": "Rounding downstream also blurs figures that sources state precisely, and it still never marks values as approximate. The fix belongs at extraction."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples reduce hallucination in extraction, e.g. informal measurements)"
    },
    {
     "n": 27,
     "scenario": 3,
     "domain": 5,
     "ts": "5.3",
     "tests": "Proceeding with partial results and annotating coverage gaps",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "While researching \"EU battery regulation\", the web-search subagent retried locally and still could not reach the regulatory database (HTTP 503). It returns structured context: failure type `service_unavailable`, the attempted query, three partial results, and two alternative sources. The other five subtopics completed successfully. How should the coordinator proceed?",
     "options": [
      {
       "id": "A",
       "text": "Abort the whole research run and report the failure to the user, because the output would be incomplete."
      },
      {
       "id": "B",
       "text": "Drop the regulatory subtopic silently so the report reads as complete and avoids drawing attention to the missing source."
      },
      {
       "id": "C",
       "text": "Ask the synthesis agent to fill the regulatory section from its general knowledge and present it alongside the sourced content as if it were cited."
      },
      {
       "id": "D",
       "text": "Try alternative sources, then synthesize and flag the regulatory gap in the report."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Structured error context lets the coordinator make an informed recovery choice: try alternatives, proceed with partial results, and annotate which areas are well supported versus gaps due to unavailable sources.",
      "wrong": {
       "A": "Terminating everything on a single failure discards five good subtopics and the partial results.",
       "B": "Silently omitting the section hides the gap from readers and gives a false impression of completeness.",
       "C": "Unsourced content presented as sourced is fabricated attribution and undermines a cited-report system."
      }
     },
     "studyRef": "Task Statement 5.3 (structured error context; coverage annotations)"
    },
    {
     "n": 28,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Temporal data and conflicting statistics: preserve both values with attribution and dates",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Two credible sources report the EV share of new car sales: a government survey collected in 2019 says 4.1%, and an industry report from 2024 says 11.8%. The synthesis agent averaged them to \"about 8%\". The report is meant to show how adoption changed. What is the right design?",
     "options": [
      {
       "id": "A",
       "text": "Report only the 2024 value and drop the 2019 figure, since the newer number supersedes the older one and avoids confusing readers of the executive summary."
      },
      {
       "id": "B",
       "text": "Require subagents to output publication/collection dates with each statistic, and report both values with attribution and dates so the change reads as a trend."
      },
      {
       "id": "C",
       "text": "Have the document-analysis agent decide which source is more credible and discard the other value before synthesis."
      },
      {
       "id": "D",
       "text": "Keep averaging, but add a footnote explaining that the headline figure combines multiple sources that were collected in different years."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Without dates, differences caused by time look like conflicts. Capturing publication or collection dates and preserving both attributed values lets the report interpret them correctly and lets readers see the trend.",
      "wrong": {
       "A": "Dropping the older value removes exactly the information the report needs, and it silently selects one value.",
       "C": "Arbitrating credibility upstream and discarding a value hides a source; conflicts should be annotated and reconciled by the coordinator, not removed.",
       "D": "An average of values from different years has no real meaning, and a footnote does not repair a misleading number."
      }
     },
     "studyRef": "Task Statement 5.6 (temporal data; conflict annotation with attribution)"
    },
    {
     "n": 29,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Preserving claim-source mappings through summarization",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Subagents return findings with source URLs, but after the synthesis step compresses them into flowing prose, about 35% of claims in the final report have no attribution. Which change addresses this?",
     "options": [
      {
       "id": "A",
       "text": "Increase the synthesis agent's output token limit so that it has room to write longer paragraphs and keep each claim near its source."
      },
      {
       "id": "B",
       "text": "Add a final step in which the report agent searches the web to find a citation for each uncited sentence in the finished draft of the report."
      },
      {
       "id": "C",
       "text": "Append \"[citation needed]\" to every sentence that has no citation so that reviewers can find the unsourced claims."
      },
      {
       "id": "D",
       "text": "Require subagents to output claim-source mappings (claim, excerpt, URL, date) that synthesis must preserve and merge."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Attribution is lost when findings are compressed into prose without a structured mapping. Passing claims as structured data with sources, and requiring synthesis to carry them through, preserves provenance.",
      "wrong": {
       "A": "Space is not the issue; the compression step discards the claim-to-source link regardless of length.",
       "B": "Searching after the fact for a plausible source can attach sources that did not support the claim and does not recover the original provenance.",
       "C": "Marking gaps documents the problem without fixing it."
      }
     },
     "studyRef": "Task Statement 5.6 (claim-source mappings preserved through synthesis)"
    },
    {
     "n": 30,
     "scenario": 3,
     "domain": 5,
     "ts": "5.1",
     "tests": "Structured upstream outputs and position-aware aggregation for limited context budgets",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "The synthesis agent receives six subagent outputs, each roughly 9,000 tokens of narrative plus reasoning chains. The aggregated input is at the edge of its budget, and the final report consistently omits findings from the middle subagents. Which TWO changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Switch to a model with a larger context window and keep the verbose outputs as they are."
      },
      {
       "id": "B",
       "text": "Modify the upstream subagents to return structured data (key facts, citations, relevance scores) instead of verbose prose and reasoning chains."
      },
      {
       "id": "C",
       "text": "Add an instruction telling the synthesis agent to pay equal attention to every section."
      },
      {
       "id": "D",
       "text": "Put a key-findings summary at the start of the aggregated input and organize the details under explicit section headers."
      },
      {
       "id": "E",
       "text": "Randomize the order of subagent outputs in each run, so that omissions average out across runs."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "When a downstream agent has a limited context budget, upstream agents should return compact structured data rather than verbose content. Placing a key-findings summary first and using explicit headers mitigates the lost-in-the-middle effect.",
      "wrong": {
       "A": "A larger window does not fix position effects (middle content is still under-attended) and keeps the wasteful verbose outputs.",
       "C": "An instruction to attend equally is probabilistic and does not change the input's size or structure.",
       "E": "Random ordering just moves which findings are lost from run to run, producing inconsistent reports."
      }
     },
     "studyRef": "Task Statement 5.1 (position effects; structured upstream outputs)"
    },
    {
     "n": 31,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Read + Write fallback when Edit cannot find a unique anchor",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The agent needs to change one return statement in `config/routes.py`. The file contains seven identical generated blocks, so the text `return jsonify(result)` appears seven times with identical surrounding lines, and every `Edit` attempt fails with a non-unique match error. Only the third occurrence must change. What should the agent do?",
     "options": [
      {
       "id": "A",
       "text": "Run a global `sed -i` replacement over the file, which changes all seven occurrences and leaves the intended block to be re-checked afterwards."
      },
      {
       "id": "B",
       "text": "Use Grep to find the line number of the third occurrence and pass that line number to Edit as the anchor for the replacement."
      },
      {
       "id": "C",
       "text": "Use Read to load the full file, modify the third occurrence in its content, and Write the whole file back."
      },
      {
       "id": "D",
       "text": "Write the file again from the agent's memory of the original without reading it first."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "When Edit cannot find unique anchor text, the reliable fallback is Read to get the full content, followed by Write with the modified content.",
      "wrong": {
       "A": "A global replacement would modify the six blocks that must not change.",
       "B": "Edit locates text by unique string matching rather than by line numbers, so a Grep line number does not make the match unique.",
       "D": "Rewriting from memory without reading risks dropping or altering content in the file."
      }
     },
     "studyRef": "Task Statement 2.5 (Edit failure on non-unique text; Read + Write fallback)"
    },
    {
     "n": 32,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Tracing function usage across wrapper modules by first finding exported names",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You are asked to find every call site of the legacy `chargeCard` function. A Grep for `chargeCard` returns only two hits, both in `payments/index.ts`, which re-exports it under the wrappers `processPayment` and `legacyCharge`. Other modules import those wrapper names. What is the most reliable approach?",
     "options": [
      {
       "id": "A",
       "text": "List the names `chargeCard` is exported under in the wrapper, then Grep each name across the codebase."
      },
      {
       "id": "B",
       "text": "Read every file under `src/` and look for calls manually, following the imports until all usages have been found."
      },
      {
       "id": "C",
       "text": "Use Glob with `**/*charge*` to find all files that call the function, since file names usually reflect the functions they use, then open them one by one."
      },
      {
       "id": "D",
       "text": "Repeat the Grep for `chargeCard` with 20 lines of context (`-C 20`) so that callers using the wrapper names show up in the output."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Wrappers hide the original name from call sites. Identifying the exported names first (via Read of the wrapper module) and then searching each name with Grep traces every usage without reading the whole codebase.",
      "wrong": {
       "B": "Reading everything is wasteful and floods context; targeted Grep finds the callers directly.",
       "C": "Glob matches file paths, not file contents, so it cannot find call sites.",
       "D": "More context lines only change how much text surrounds the same two hits; they do not find callers using other names."
      }
     },
     "studyRef": "Task Statement 2.5 (tracing usage across wrapper modules)"
    },
    {
     "n": 33,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Shared team MCP servers must be declared in project-scoped .mcp.json; CLAUDE.md text does not configure a server",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your team's internal `perfdb` MCP server returns benchmark history for any commit. The root `CLAUDE.md` has a section: \"For performance questions, use the `perfdb` MCP server (http://perfdb.internal:7400/mcp) and its `compare_runs` tool.\" Engineers who joined this quarter report that when they ask about a regression, the agent replies that it has no `compare_runs` tool and falls back to running Grep over `bench/*.csv` exports. Two senior engineers never see this; both added `perfdb` to their own `~/.claude.json` months ago. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Expand the `CLAUDE.md` section with each `perfdb` tool's name, parameters, and an example call, so the agent knows how to invoke them."
      },
      {
       "id": "B",
       "text": "Rewrite the `compare_runs` description to explain why it beats grepping CSV exports, so the agent stops falling back to Grep."
      },
      {
       "id": "C",
       "text": "Have each new engineer add `perfdb` to their own `~/.claude.json`, the way the two senior engineers did."
      },
      {
       "id": "D",
       "text": "Declare `perfdb` in the repository's committed `.mcp.json`, so every clone connects to it and discovers its tools."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Shared team tooling belongs in the project-scoped `.mcp.json`, which is version-controlled, so everyone who clones the repository gets the server, and its tools are discovered when Claude Code connects. Text in `CLAUDE.md` is only context: it cannot create a connection, which is why only the two engineers with a personal entry have the tool. If `perfdb` needs a token, reference it with environment variable expansion (for example `${PERFDB_TOKEN}`) instead of committing it.",
      "wrong": {
       "A": "Describing tools in `CLAUDE.md` does not make them exist. MCP tools come from configured, connected servers; the new engineers have no `perfdb` connection at all.",
       "B": "A better description helps the agent choose between tools it already has. Here the agent says it has no `compare_runs` tool, so the problem is that the server is not configured, not tool selection.",
       "C": "User scope (`~/.claude.json`) is for personal or experimental servers. Team tooling configured per person is not version-controlled, every future hire must repeat it, and the copies drift."
      }
     },
     "studyRef": "Task Statement 2.4 (project-scoped .mcp.json for shared team servers; tools are discovered from configured servers at connection time)"
    },
    {
     "n": 34,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Rich MCP tool descriptions and MCP resources as content catalogs",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your team added a `schema-explorer` MCP server with tools `query_schema` and `list_tables`. The agent ignores it and greps migration files instead, and when it does use the database it spends 8 to 10 exploratory calls just discovering which tables exist. Which TWO changes best fix this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Rewrite the MCP tool descriptions to explain their capabilities, input formats, and outputs, and when to prefer them over Grep on migration files."
      },
      {
       "id": "B",
       "text": "Move the server to `~/.claude.json`, because user-scoped servers have priority over built-in tools."
      },
      {
       "id": "C",
       "text": "Remove the built-in Grep tool from the agent entirely."
      },
      {
       "id": "D",
       "text": "Restart with one MCP server at a time, since tools from several servers cannot be available at once."
      },
      {
       "id": "E",
       "text": "Expose the table catalog and schema hierarchy as an MCP resource so the agent sees what data exists without exploratory calls."
      }
     ],
     "answer": [
      "A",
      "E"
     ],
     "explanation": {
      "correct": "Detailed descriptions prevent the agent from preferring a familiar built-in tool over a more capable MCP tool, and exposing a catalog as an MCP resource gives visibility into available data, which removes the discovery calls.",
      "wrong": {
       "B": "Configuration scope controls who gets the server, not how the model prioritizes its tools against built-ins.",
       "C": "Removing Grep would cripple unrelated code-search tasks; the problem is tool descriptions, not tool availability.",
       "D": "Tools from all configured MCP servers are discovered and available simultaneously."
      }
     },
     "studyRef": "Task Statement 2.4 (tool descriptions vs built-in tools; MCP resources)"
    },
    {
     "n": 35,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Adopt the community server for the standard integration and add a narrow custom server only for the team-specific workflow",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your developer-productivity agent needs GitHub access: read pull requests, search issues, and post review comments. A maintained community GitHub MCP server covers all of that. Your company also has a release-train workflow: a pull request may join a train only if its `train:` label matches an open train in the internal `trainyard` service, and joining posts a checklist that `trainyard` generates. An engineer proposes writing one custom `github-plus` server that reimplements the GitHub operations and adds the train logic, \"so the agent has one place to go.\" What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Build `github-plus` as proposed, because one server keeps the agent from having to choose between overlapping GitHub tools."
      },
      {
       "id": "B",
       "text": "Adopt the community GitHub server and write a small custom server that covers only the `trainyard` steps."
      },
      {
       "id": "C",
       "text": "Fork the community GitHub server, add the train tools to the fork, and maintain that fork internally from now on."
      },
      {
       "id": "D",
       "text": "Adopt the community GitHub server, describe the train rules in `CLAUDE.md`, and let the agent call the `trainyard` API with curl via Bash."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Use existing community servers for standard integrations such as GitHub and reserve custom servers for team-specific workflows such as the release train. Tools from all configured MCP servers are available to the agent at the same time, so a community server plus a narrow custom `trainyard` server gives the agent everything without a single consolidated server.",
      "wrong": {
       "A": "It reimplements and then maintains a standard integration that already exists. There is no overlap problem to avoid: the custom server would only add train tools.",
       "C": "A fork carries the whole GitHub integration as an internal maintenance burden and drifts from upstream fixes, only to avoid running a second server, which the agent handles fine.",
       "D": "The team-specific workflow is exactly what a custom server is for. Ad hoc curl calls documented in `CLAUDE.md` give no defined tool interface or structured errors and leave the label check to prompt compliance."
      }
     },
     "studyRef": "Task Statement 2.4 (community MCP servers for standard integrations; custom servers reserved for team-specific workflows)"
    },
    {
     "n": 36,
     "scenario": 4,
     "domain": 1,
     "ts": "1.6",
     "tests": "Decomposing open-ended tasks: map structure, prioritize, adapt the plan",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You ask the agent to \"add comprehensive tests to this legacy codebase\" (400 modules, almost no tests). It starts alphabetically, writes tests for trivial utilities, misses the payment paths, and keeps stalling when it discovers hidden dependencies. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Map the structure, identify high-impact modules like payments, write a prioritized plan, and revise it as dependencies surface."
      },
      {
       "id": "B",
       "text": "Prescribe a fixed order: one test file per module, alphabetically, with no deviations, so coverage grows predictably."
      },
      {
       "id": "C",
       "text": "Ask it to generate all 400 test files in one prompt, so conventions stay consistent across every module."
      },
      {
       "id": "D",
       "text": "Set a 100% line-coverage target and let the agent work module by module until the number is reached."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Open-ended tasks benefit from adaptive decomposition: understand the structure, identify the riskiest and most-used areas, make a prioritized plan, and revise it as new dependencies appear.",
      "wrong": {
       "B": "A rigid alphabetical order ignores risk and discovered dependencies, which is what caused the poor results.",
       "C": "One enormous prompt exceeds what the agent can handle with consistent quality and provides no prioritization.",
       "D": "A coverage number rewards easy, low-value tests and does not direct effort to high-impact code."
      }
     },
     "studyRef": "Task Statement 1.6 (adaptive investigation plans for open-ended tasks)"
    },
    {
     "n": 37,
     "scenario": 4,
     "domain": 1,
     "ts": "1.7",
     "tests": "Resuming a named session after file changes and informing it of the changes",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two days ago you ran a named investigation session `billing-audit` that read 40 files. Since then teammates merged changes to 6 of those files. You resume with `--resume billing-audit` and ask it to continue, and the agent cites old function signatures from the changed files. The other 34 files are unchanged and the earlier analysis of them is still valid. What is the best way to proceed?",
     "options": [
      {
       "id": "A",
       "text": "Resume the session and tell the agent which 6 files changed, so that it re-analyzes just those files."
      },
      {
       "id": "B",
       "text": "Resume and continue without comment; the agent will notice on its own that some of the files it read earlier have changed since."
      },
      {
       "id": "C",
       "text": "Discard the session and re-explore all 40 files from scratch, to be certain that nothing stale remains in context."
      },
      {
       "id": "D",
       "text": "Start a new session seeded with a summary of the findings, discarding all earlier tool results from the old session."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Most of the prior context (34 of 40 files) is still valid, so resuming is efficient. Informing the agent of the specific changed files gives it targeted re-analysis rather than full re-exploration.",
      "wrong": {
       "B": "The agent does not detect changes in files it already read unless told or made to re-read them; it relies on stale tool results.",
       "C": "A complete re-exploration throws away mostly valid work.",
       "D": "A fresh session with a summary is best when most prior tool results are stale. Here 34 of 40 files are unchanged and still valid, so discarding them is wasteful."
      }
     },
     "studyRef": "Task Statement 1.7 (resume vs start fresh; informing about file changes)"
    },
    {
     "n": 38,
     "scenario": 4,
     "domain": 1,
     "ts": "1.7",
     "tests": "fork_session for divergent approaches from a shared baseline",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After a long session analyzing the order service, you want to compare two refactoring strategies (event-driven vs layered) starting from the same understanding, without the exploration of one influencing the other. What should you use?",
     "options": [
      {
       "id": "A",
       "text": "Try the first approach in the session, ask Claude to revert it, then try the second approach in the same conversation."
      },
      {
       "id": "B",
       "text": "Start two fresh sessions and repeat the full codebase analysis in each one, then compare the outcomes of the two sessions at the end."
      },
      {
       "id": "C",
       "text": "Ask Claude to implement both in the same files and compare the diffs."
      },
      {
       "id": "D",
       "text": "Create two branches of the session with `fork_session`, one per approach, both starting from the shared analysis."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`fork_session` creates independent branches from a shared baseline, so each approach is explored without contaminating the other and without repeating the analysis.",
      "wrong": {
       "A": "Reverting inside one conversation leaves the first approach's reasoning in context, biasing the second.",
       "B": "Repeating the analysis wastes time and may yield a different baseline in each session.",
       "C": "Both approaches in the same files would conflict and make a clean comparison impossible."
      }
     },
     "studyRef": "Task Statement 1.7 (fork_session for parallel exploration branches)"
    },
    {
     "n": 39,
     "scenario": 4,
     "domain": 3,
     "ts": "3.1",
     "tests": "Directory-level CLAUDE.md files scope instructions to one part of the codebase",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In the `freight-core` monorepo, `legacy/edi-bridge/` holds a 20-year-old EDI translator with rules found nowhere else in the codebase: never reformat the fixed-width segment definitions in `*.seg` files, keep the EBCDIC conversion tables byte-identical, and regenerate `parsers/` with `./gen.sh` instead of editing it. Three engineers maintain it, others occasionally change it, and most never touch it. The root `CLAUDE.md` is already 400 lines. Where should these rules go?",
     "options": [
      {
       "id": "A",
       "text": "Append them to the root `CLAUDE.md` under an \"EDI bridge\" heading, so every session in the repository always has them."
      },
      {
       "id": "B",
       "text": "In `legacy/edi-bridge/CLAUDE.md`, a directory-level file committed alongside the code it describes."
      },
      {
       "id": "C",
       "text": "In the `~/.claude/CLAUDE.md` of each of the three engineers who currently maintain the `edi-bridge` code."
      },
      {
       "id": "D",
       "text": "In `legacy/edi-bridge/README.md`, which Claude Code loads as memory like a CLAUDE.md."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Directory-level CLAUDE.md files scope instructions to one part of the codebase. Committed in `legacy/edi-bridge/`, the rules reach every teammate through version control and are picked up when Claude works in that directory, without adding EDI-only rules to every other session.",
      "wrong": {
       "A": "The root file is loaded in every session, so EDI-only rules would add noise for the majority who never touch `edi-bridge` and grow a file that is already long. Rules for one directory belong in that directory's CLAUDE.md.",
       "C": "User-level files are personal and not shared through version control; anyone else who edits `edi-bridge`, or a future maintainer, would not get the rules.",
       "D": "A README is not a memory file. Claude may read it if it chooses, but it is not loaded as instructions the way CLAUDE.md files are."
      }
     },
     "studyRef": "Task Statement 3.1 (CLAUDE.md hierarchy: user, project, and directory-level files)"
    },
    {
     "n": 40,
     "scenario": 4,
     "domain": 3,
     "ts": "3.1",
     "tests": "Modular CLAUDE.md using @import for package-specific standards",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A monorepo with `web`, `api`, and `mobile` packages has one 900-line root CLAUDE.md. Package maintainers know which shared standards documents (in `docs/standards/`) apply to their package, and want each package to see only the relevant ones. What is the best organization?",
     "options": [
      {
       "id": "A",
       "text": "Split the file into three files in the root directory; all of them will still be loaded for every package."
      },
      {
       "id": "B",
       "text": "Keep the monolith and add headings per package so that the model infers which part applies to the package currently being edited."
      },
      {
       "id": "C",
       "text": "In each package CLAUDE.md, `@import` only its relevant standards; keep root short."
      },
      {
       "id": "D",
       "text": "Move all the standards into `~/.claude/CLAUDE.md` so they are loaded regardless of the package."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`@import` lets each package's CLAUDE.md pull in just the standards files that matter to it, keeping files modular and each context focused.",
      "wrong": {
       "A": "Splitting alone does not scope anything; if all files load for every package, irrelevant standards still consume context.",
       "B": "Relying on inference across a 900-line file is unreliable and wastes context on unrelated sections.",
       "D": "User-level files are personal and not shared with teammates through version control."
      }
     },
     "studyRef": "Task Statement 3.1 (@import, modular organization; /memory to verify what loaded)"
    },
    {
     "n": 41,
     "scenario": 4,
     "domain": 3,
     "ts": "3.2",
     "tests": "context: fork and allowed-tools for skills with verbose output",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your team's `/codebase-audit` skill dumps thousands of lines of dependency listings into the conversation, which crowds out the context needed for follow-up work. The audit only needs to read files. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "In `SKILL.md` frontmatter set `context: fork` so the skill runs in an isolated subagent, and limit `allowed-tools` to read-only tools."
      },
      {
       "id": "B",
       "text": "Move the audit instructions into CLAUDE.md so they load once at the start of every session and are always available to Claude."
      },
      {
       "id": "C",
       "text": "Run `/compact` manually after each audit and hope the key results survive."
      },
      {
       "id": "D",
       "text": "Move the skill to `~/.claude/commands/` so it is only used by the developers who need it."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`context: fork` runs the skill in its own subagent context so verbose intermediate output does not pollute the main conversation, and `allowed-tools` limits what the skill can do while it runs. Current-docs note: in today's Claude Code, `allowed-tools` pre-approves the listed tools (no permission prompt) rather than removing the others, and `disallowed-tools` is the field that removes tools. The Exam Guide describes `allowed-tools` as restricting tool access during skill execution, so answer per the guide.",
      "wrong": {
       "B": "CLAUDE.md is always-loaded context and would add to the clutter; it does not isolate the output of a task.",
       "C": "Compacting after the fact is lossy and manual; isolation prevents the pollution altogether.",
       "D": "Changing where the file lives changes who can use it, not where its output goes."
      }
     },
     "studyRef": "Task Statement 3.2 (skills frontmatter: context: fork, allowed-tools)"
    },
    {
     "n": 42,
     "scenario": 4,
     "domain": 3,
     "ts": "3.3",
     "tests": "Path-scoped rules load only for matching files; extend the paths globs to cover files that carry the convention",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your repository has `.claude/rules/sql-style.md` with frontmatter `paths: [\"**/*.sql\"]`. It requires uppercase keywords, explicit column lists, and no `SELECT *`. Claude follows these conventions in migration and report `.sql` files, but SQL it writes as string constants in DAO classes such as `src/main/java/com/acme/billing/InvoiceDao.java` uses `SELECT *` and lowercase keywords. You confirm the rule never loads while Claude edits `.java` files. The repository has 1,400 Java files, of which 38 are `*Dao.java` classes that embed SQL. Which change applies the SQL conventions to the DAO queries without loading them for unrelated files?",
     "options": [
      {
       "id": "A",
       "text": "Move the SQL conventions into the root `CLAUDE.md`, where they load for every file in the repository."
      },
      {
       "id": "B",
       "text": "Change the rule's glob to `**/*.java` so it loads whenever Claude edits any Java file in the project."
      },
      {
       "id": "C",
       "text": "Turn the conventions into a `/sql-style` skill that engineers invoke before asking for DAO changes."
      },
      {
       "id": "D",
       "text": "Add `**/*Dao.java` to the rule's `paths` list, next to the existing `**/*.sql` pattern."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Rules in `.claude/rules/` with `paths` frontmatter load only when Claude works on files that match one of the globs. The SQL lives in the 38 DAO classes, so adding their pattern to `paths` loads the conventions exactly where they apply and nowhere else.",
      "wrong": {
       "A": "Root `CLAUDE.md` content loads in every session, so the SQL rules would sit in context for all 1,400 Java files and every other file, which is what the question rules out.",
       "B": "`**/*.java` loads the rule for all 1,400 Java files, 1,362 of which contain no SQL, so it fails the 'without loading them for unrelated files' requirement.",
       "C": "A skill depends on someone remembering to invoke it each time; path-scoped rules apply the conventions automatically whenever a matching file is in play."
      }
     },
     "studyRef": "Task Statement 3.3 (path-specific rules: `paths` globs decide when a rule loads)"
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 3,
     "ts": "3.4",
     "tests": "Combining plan mode for investigation with direct execution for implementation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You are replacing the homegrown `flags/` module with the company's `flagkit` SDK: 58 call sites in 31 files, plus a choice between evaluating flags in-process or through a sidecar. In plan mode, Claude explored the code and found three call sites that read flags inside a hot loop and two dead wrapper modules; you chose in-process evaluation and approved a step-by-step plan. The session's context is about 30% full, and the plan's steps refer to those exploration findings. What should you do next?",
     "options": [
      {
       "id": "A",
       "text": "Stay in plan mode and ask Claude to apply the edits from there, so that every change remains a reviewable plan, not a direct edit."
      },
      {
       "id": "B",
       "text": "Leave plan mode in this session and implement the approved plan with direct execution, testing after each group of files."
      },
      {
       "id": "C",
       "text": "Copy the plan into a brand-new session and implement it there with direct execution, so the work starts on a clean context."
      },
      {
       "id": "D",
       "text": "Run plan mode again for each of the 31 files in turn, so that every file gets its own design pass before it is edited."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Plan mode has done its job: the investigation and the design decision are finished and approved. The pattern is to combine plan mode for investigation with direct execution for implementation. Staying in this session keeps the exploration findings the plan depends on, and with context only 30% full there is no reason to start over.",
      "wrong": {
       "A": "Plan mode is for exploring and designing before committing to changes; it does not make edits. Once the plan is approved, implementation is direct execution.",
       "C": "A fresh session with a summary helps when context is stale or exhausted. It is neither here, and a new session would lose the exploration details the plan's steps rely on.",
       "D": "The design decisions are already made for all 31 files, so re-planning each one repeats finished work. The remaining edits follow a known plan and suit direct execution."
      }
     },
     "studyRef": "Task Statement 3.4 (combine plan mode for investigation with direct execution for implementation)"
    },
    {
     "n": 44,
     "scenario": 4,
     "domain": 3,
     "ts": "3.5",
     "tests": "Test cases with example input and expected output to fix edge-case handling",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A data-migration script written by Claude crashes on null values and converts dates in three inconsistent ways. You described the desired behavior in prose twice (\"handle nulls gracefully\", \"normalize dates\") and the results keep varying. Expected behavior is known: null `ship_date` stays null, and `03/04/2024`, `2024-04-03`, and `3 Apr 2024` all become `2024-04-03`. No design questions remain open; the problem is that known requirements are being applied inconsistently. What is the most effective next step?",
     "options": [
      {
       "id": "A",
       "text": "Rephrase the prose instruction more forcefully and emphasize that nulls must never crash."
      },
      {
       "id": "B",
       "text": "Ask the agent to fix the null crash first, and only after that fix is accepted raise the date format problems separately."
      },
      {
       "id": "C",
       "text": "Use the interview pattern: have Claude ask questions about nulls and dates before it changes the script again."
      },
      {
       "id": "D",
       "text": "Provide test cases with example inputs and expected outputs (null and each date format), then iterate by sharing failures."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When prose descriptions are interpreted inconsistently, concrete input/output examples as tests communicate the expected behavior unambiguously, and sharing failures drives progressive improvement.",
      "wrong": {
       "A": "Stronger wording is still prose, which has already been interpreted inconsistently twice.",
       "B": "The two issues both occur in the same conversion logic and may interact; the fixes are best specified together rather than one at a time.",
       "C": "The interview pattern surfaces considerations that the developer has not anticipated; here the expected behavior is already known and just needs to be communicated precisely."
      }
     },
     "studyRef": "Task Statement 3.5 (input/output examples and test-driven iteration)"
    },
    {
     "n": 45,
     "scenario": 4,
     "domain": 5,
     "ts": "5.4",
     "tests": "Scratchpad files and subagent delegation to counter context degradation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After three hours exploring a 1,500-file legacy repository, the agent starts answering with \"typical Spring patterns\" and contradicts earlier statements (it now calls a class `OrderRouter` that it earlier identified as `OrderDispatcher`). What is the best way to continue effectively?",
     "options": [
      {
       "id": "A",
       "text": "Have the agent write key findings (class names, call flows) to a scratchpad file, delegate verbose exploration to subagents, and `/compact`."
      },
      {
       "id": "B",
       "text": "Keep going in the same session, since the full history still contains the correct class names and the model can look them up."
      },
      {
       "id": "C",
       "text": "Clear the context and restart the investigation from scratch without notes, so earlier confusion cannot interfere."
      },
      {
       "id": "D",
       "text": "Add a line to CLAUDE.md telling the agent not to assume typical patterns and to always remember its earlier findings about the code."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Extended sessions degrade as verbose discovery output piles up. Persisting key findings in a scratchpad file, isolating verbose exploration in subagents, and compacting context keep the specifics available and the main context lean.",
      "wrong": {
       "B": "The correct names may be in the history, but the model is already attending to them unreliably; waiting does not fix degradation.",
       "C": "Restarting without notes throws away all the discoveries and forces re-exploration.",
       "D": "A reminder to remember is probabilistic and does not give the agent a durable record of the findings."
      }
     },
     "studyRef": "Task Statement 5.4 (context degradation; scratchpad files; subagent delegation; /compact)"
    },
    {
     "n": 46,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "--output-format json with --json-schema for machine-parseable findings",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your CI step runs `claude -p \"Review this PR\"` and a script uses regular expressions to turn the text into inline PR comments. About 1 run in 10 breaks the parser because the format drifts. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "End the prompt with \"Respond with valid JSON only\" and keep the regex parser as a backup for runs where the format still drifts."
      },
      {
       "id": "B",
       "text": "Run with `--output-format json` and `--json-schema` describing findings (file, line, severity, message), and parse that structured output."
      },
      {
       "id": "C",
       "text": "Wrap the call in a retry loop that runs until the regex parser succeeds."
      },
      {
       "id": "D",
       "text": "Add the `--inline-comments` flag so Claude Code posts the comments to the PR itself."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`--output-format json` combined with `--json-schema` yields schema-conforming, machine-parseable findings that a script can post as inline comments reliably.",
      "wrong": {
       "A": "A prompt request for JSON is probabilistic and offers no schema guarantee.",
       "C": "Repeated retries waste money and still depend on the fragile regex approach.",
       "D": "There is no `--inline-comments` flag; posting comments is the pipeline's job, using the structured output."
      }
     },
     "studyRef": "Task Statement 3.6 (--output-format json, --json-schema)"
    },
    {
     "n": 47,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Re-run reviews need the prior findings in context; a do-not-repeat instruction alone has no data to act on",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your review job runs on every push to a pull request:\n\n```bash\nclaude -p \"Review this PR's diff. Do not repeat comments you made on earlier pushes.\" \\\n  --output-format json --json-schema \"$(cat findings.schema.json)\"\n```\n\nThe job supplies only the current diff (`origin/main...HEAD`). Two weeks after the instruction was added, nothing has changed: about 70% of each re-run's findings repeat comments already posted on the PR. What is the most likely root cause?",
     "options": [
      {
       "id": "A",
       "text": "The instruction is in the prompt, but `-p` runs give CLAUDE.md priority, so it belongs in CLAUDE.md instead."
      },
      {
       "id": "B",
       "text": "Each run reviews the full PR diff instead of only the newest commit, so it sees code it already commented on."
      },
      {
       "id": "C",
       "text": "The `--json-schema` demands a complete findings array, so Claude must list every issue again on each run."
      },
      {
       "id": "D",
       "text": "Each `-p` run starts fresh and never sees the findings from earlier runs."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Each `claude -p` invocation is a new session, so an instruction not to repeat earlier comments has nothing to compare against. The fix is to pass the prior findings into each re-run and instruct Claude to report only new or still-unaddressed issues.",
      "wrong": {
       "A": "CLAUDE.md and the prompt are both context, and neither overrides the other. Moving the instruction would still not give Claude the earlier findings it needs to act on it.",
       "B": "The full PR diff is the right input, because Claude needs it to judge whether earlier issues are still unaddressed. Reviewing only the newest commit would hide those issues, not deduplicate them.",
       "C": "A schema constrains the shape of the output, not which findings it contains; an array holding only new issues, or an empty one, is equally valid."
      }
     },
     "studyRef": "Task Statement 3.6 (include prior review findings on re-runs and report only new or still-unaddressed issues)"
    },
    {
     "n": 48,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Providing existing test files to avoid duplicate test scenarios",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The CI test-generation job proposes tests for `OrderService`, but about half of them duplicate scenarios that already exist in `OrderService.test.ts` (for example, empty cart handling). What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Ask the job to generate only 3 tests per file."
      },
      {
       "id": "B",
       "text": "Run test generation through the Message Batches API for lower cost, accepting that results may take up to a day to arrive."
      },
      {
       "id": "C",
       "text": "Include the existing test files in the context so that generation avoids scenarios that are already covered."
      },
      {
       "id": "D",
       "text": "Generate freely, then compare the names of the generated tests with the existing ones and drop any that match by name."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Claude can only avoid duplicating scenarios it can see. Supplying the existing test files in context lets it propose only tests that add coverage.",
      "wrong": {
       "A": "Fewer tests do not make them non-duplicates; they may still repeat existing cases.",
       "B": "Batch processing changes cost and latency, not what the model knows about existing tests.",
       "D": "Differently named tests can cover the same scenario, so name matching misses duplicates and wastes generation effort."
      }
     },
     "studyRef": "Task Statement 3.6 (existing test files in context)"
    },
    {
     "n": 49,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Documenting testing standards, criteria, and fixtures in CLAUDE.md for CI runs",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The CI-generated tests are low value (trivial getter assertions) and ignore your shared fixtures (`makeUser()`, `makeOrder()`), instead creating ad hoc mocks. What is the best way to improve them?",
     "options": [
      {
       "id": "A",
       "text": "Document testing standards, criteria for valuable tests, and the available fixtures in CLAUDE.md, which CI-invoked Claude Code reads as project context."
      },
      {
       "id": "B",
       "text": "Raise the sampling temperature so the model produces more varied tests."
      },
      {
       "id": "C",
       "text": "Add a post-processing script that deletes generated tests with fewer than three assertions before they are ever committed to the repository."
      },
      {
       "id": "D",
       "text": "Have developers fix the generated tests by hand in interactive sessions after each run."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "CLAUDE.md is the mechanism for giving CI-invoked Claude Code project context such as testing standards, fixture conventions, and review criteria, so the generated tests follow team practice.",
      "wrong": {
       "B": "More randomness does not teach standards or fixtures; it would reduce consistency.",
       "C": "Counting assertions is a crude filter that does not make tests use fixtures or test meaningful behavior, and it discards output after paying for it.",
       "D": "Manual fixing defeats the purpose of automation and leaves the cause in place."
      }
     },
     "studyRef": "Task Statement 3.6 (CLAUDE.md for CI context: standards, criteria, fixtures)"
    },
    {
     "n": 50,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Independent review instance vs same-session self-review",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In your pipeline, one Claude Code session generates a feature and is then asked in the same session to \"review your changes for bugs.\" It rarely finds anything, yet human reviewers keep catching defects later. What change is most effective?",
     "options": [
      {
       "id": "A",
       "text": "Enable extended thinking in the same session before it reviews."
      },
      {
       "id": "B",
       "text": "Run the review in a separate, independent Claude Code invocation that sees the diff but not the generating session's reasoning."
      },
      {
       "id": "C",
       "text": "Add \"be extremely critical and assume there are bugs\" to the review request in the same session, so that the model searches harder for defects in its own work."
      },
      {
       "id": "D",
       "text": "Use `--resume` on the generating session to run the review, so that it has full context of the work it already did."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A session retains the reasoning that produced the code, which makes it less likely to question its own decisions. An independent instance without that context is better at catching subtle issues.",
      "wrong": {
       "A": "Extended thinking inside the same session still builds on the same prior reasoning and has the same bias.",
       "C": "Instructing the same session to be critical does not remove the retained reasoning context.",
       "D": "Resuming the generating session preserves exactly the context that causes the blind spot."
      }
     },
     "studyRef": "Task Statement 3.6 (session context isolation; independent review instance)"
    },
    {
     "n": 51,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Explicit report/skip criteria instead of a vague 'make sure the docs are accurate' instruction",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI job runs `claude -p` on every pull request that touches `docs/` and posts its findings as review comments. The prompt says: \"Make sure the documentation is accurate and up to date.\" Over the last 300 PRs, developers dismissed 57% of the comments, most of which suggested rewording a sentence, adding an example, or mentioning an edge case. Nearly every comment they kept pointed out a CLI flag, default value, or config key that the docs described differently from the code in the same PR. Which change would most improve precision?",
     "options": [
      {
       "id": "A",
       "text": "Append \"Only comment when you are highly confident the documentation is wrong\" to the current instruction and leave the rest of the prompt as it is."
      },
      {
       "id": "B",
       "text": "Have Claude score each comment from 1 to 10 for importance and post only the comments that score 8 or higher on that scale."
      },
      {
       "id": "C",
       "text": "Report only docs that state a flag, default, or config key differently from the code; skip wording, example, and completeness suggestions."
      },
      {
       "id": "D",
       "text": "Move the documentation review into a nightly batch job, so that the dismissed comments no longer interrupt developers in the middle of review."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The kept comments show exactly which category is valuable: documented behavior that contradicts the code. Writing that as an explicit criterion, and naming what to skip (wording, examples, completeness), defines what to report in terms the model can apply consistently. \"Accurate and up to date\" is vague, so the model reports anything it could improve.",
      "wrong": {
       "A": "General instructions such as \"only when highly confident\" do not improve precision. The model can be quite confident that a rewording would help; the problem is what counts as reportable, not confidence.",
       "B": "Self-scored importance is still a confidence-style filter with no definition of what matters. Low-value suggestions can score high, and the category developers actually value is never stated.",
       "D": "Moving the job changes when comments appear, not how many are wrong. Developers would still dismiss most of them, now further from the change."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit criteria, e.g. flag only documented behavior that contradicts the code, instead of vague instructions)"
    },
    {
     "n": 52,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Temporarily disabling a high false-positive category (not deleting it) while its prompt is improved",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI bot posts two kinds of comments on pull requests: code-review findings, which developers accept 88% of the time, and `flaky-test` warnings, which predict which new tests will be flaky and are right only 22% of the time. Developers now add a `skip-claude` label to 35% of PRs, which suppresses both kinds. In the same six weeks, `flaky-test` warnings did catch three timing-dependent tests that would have broken the nightly build. Leadership wants adoption back within two weeks. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Pause `flaky-test` warnings, rework that prompt with explicit criteria, and turn them back on once they meet an agreed precision bar."
      },
      {
       "id": "B",
       "text": "Keep posting both, but prefix each `flaky-test` warning with Claude's confidence so developers can decide which warnings deserve a look."
      },
      {
       "id": "C",
       "text": "Remove the `flaky-test` feature permanently, since a category that is right only 22% of the time costs more trust than its catches are worth."
      },
      {
       "id": "D",
       "text": "Require tech-lead approval for the `skip-claude` label, so that developers keep seeing the accurate review findings along with the warnings."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "One noisy category is driving developers to skip the bot entirely, including its 88%-accepted findings. Temporarily disabling that category restores trust quickly, which fits the two-week goal. Because the warnings have caught real flaky tests, the right move is to improve their prompt with explicit criteria and bring them back once they are precise enough, not to delete them.",
      "wrong": {
       "B": "Self-reported confidence is poorly calibrated, and the noisy warnings keep appearing, so trust in the whole bot keeps eroding.",
       "C": "Deleting the category throws away proven value (three real catches). Low precision in one category is usually a prompt problem that explicit criteria can fix, so a temporary pause is the proportionate step.",
       "D": "This makes the noise harder to escape instead of removing it. Developers would face the same mostly wrong warnings and trust the bot even less."
      }
     },
     "studyRef": "Task Statement 4.1 (temporarily disable high false-positive categories to restore trust while improving their prompts)"
    },
    {
     "n": 53,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Explicit severity criteria with concrete code examples",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The same string-concatenated SQL query was labeled `critical` on one PR and `minor` on another. Your prompt asks for `critical`, `major`, or `minor` ratings without further definition. What most reliably produces consistent severity?",
     "options": [
      {
       "id": "A",
       "text": "Ask the model to rate severity from 1 to 10 instead, which allows finer distinctions between findings of the same kind."
      },
      {
       "id": "B",
       "text": "Run each finding through three rating passes and take the majority severity as the final label across the passes for stability."
      },
      {
       "id": "C",
       "text": "Add a second pass in which the model reviews and re-rates its own severity labels."
      },
      {
       "id": "D",
       "text": "Define explicit criteria for each severity level and include a concrete code example for each level."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Consistent classification requires explicit severity definitions with concrete code examples for each level, so that the model has an anchor for every rating.",
      "wrong": {
       "A": "A finer scale without definitions increases, not reduces, the room for inconsistent judgments.",
       "B": "Voting averages out noise but the model still has no shared definition, so it can consistently misjudge.",
       "C": "Self re-rating uses the same undefined standard and is subject to the same bias as the first rating."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit severity criteria with code examples)"
    },
    {
     "n": 54,
     "scenario": 5,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples distinguishing acceptable patterns from genuine issues",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The reviewer keeps flagging `catch (e) { /* best-effort cache write; failure is fine */ }` as swallowed-error bugs, but it also misses genuinely dangerous empty catch blocks in new code. Detailed instructions exist already. Which change is most effective?",
     "options": [
      {
       "id": "A",
       "text": "Add an exhaustive deny-list of 40 specific code snippets that must never be flagged under any circumstances in any file."
      },
      {
       "id": "B",
       "text": "Add examples contrasting acceptable patterns with genuine issues, each with reasoning, so the model learns the distinction and generalizes."
      },
      {
       "id": "C",
       "text": "Add a post-filter that removes any finding that mentions the word \"catch\"."
      },
      {
       "id": "D",
       "text": "Raise the confidence threshold for reporting any error-handling finding."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Few-shot examples that pair acceptable patterns with real defects and explain the difference enable the model to generalize judgment to novel code instead of matching only pre-specified cases.",
      "wrong": {
       "A": "A deny-list of specific snippets covers only anticipated cases and does not generalize to new patterns.",
       "C": "A keyword filter would also remove the genuine empty-catch bugs.",
       "D": "A threshold cannot teach the difference between acceptable and dangerous patterns."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot to reduce false positives while generalizing)"
    },
    {
     "n": 55,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "detected_pattern field to analyze false-positive patterns from dismissals",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Developers dismiss roughly 30% of the review bot's findings, but nobody can tell which kinds of code constructs trigger the dismissed findings. What should you add to enable systematic analysis?",
     "options": [
      {
       "id": "A",
       "text": "A `detected_pattern` field on each finding, to group dismissals by construct."
      },
      {
       "id": "B",
       "text": "A free-text comment box where developers explain each dismissal, with the explanations reviewed by the team every sprint."
      },
      {
       "id": "C",
       "text": "A monthly review in which a developer manually samples 10% of the findings and records which constructs seem to be causing problems for the team."
      },
      {
       "id": "D",
       "text": "A counter of dismissals per developer, to identify which developers dismiss the most findings."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Recording the construct that triggered each finding in a structured field allows dismissal data to be grouped by pattern, revealing systematic false-positive sources to fix in the prompt.",
      "wrong": {
       "B": "Free-text explanations are unstructured and hard to aggregate, and they rely on developer effort.",
       "C": "Manual sampling is slow and gives only a small, unsystematic picture.",
       "D": "Per-developer counts show who dismisses, not why or which code pattern caused the finding."
      }
     },
     "studyRef": "Task Statement 4.4 (detected_pattern for feedback loops)"
    },
    {
     "n": 56,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Matching batch API to latency-tolerant workloads; custom_id for resubmission",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "A nightly job generates tests for about 3,000 changed files, and results are only needed the next morning. It currently makes synchronous calls and is expensive. Which TWO statements describe a sound redesign? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Also move the blocking pre-merge review to the Message Batches API, to get the same 50% saving."
      },
      {
       "id": "B",
       "text": "Use the Message Batches API for the nightly generation, which is latency-tolerant and gets the 50% cost saving."
      },
      {
       "id": "C",
       "text": "Rely on results arriving in the same order as the requests were submitted."
      },
      {
       "id": "D",
       "text": "Design the batch requests so that Claude can call repository-reading tools mid-request and continue."
      },
      {
       "id": "E",
       "text": "Assign each request a `custom_id` (for example, the file path) so that results can be correlated and only failed ones resubmitted."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "Batch processing fits non-blocking, latency-tolerant work such as nightly generation. `custom_id` correlates requests with results and lets you resubmit only the failed items.",
      "wrong": {
       "A": "Pre-merge review is blocking, and batches have up to a 24-hour window with no latency guarantee.",
       "C": "Batch results are not guaranteed to arrive in submission order; correlate with `custom_id`.",
       "D": "The Batches API does not support multi-turn tool calling within a single request, so tools cannot be executed mid-request."
      }
     },
     "studyRef": "Task Statement 4.5 (batch suitability, custom_id, no multi-turn tool calls)"
    },
    {
     "n": 57,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Batch submission frequency from SLA constraints",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A compliance-check service processes documents with the Message Batches API, whose processing can take up to 24 hours. Documents arrive continuously and the contractual SLA is to return results within 36 hours of arrival. Documents are collected and submitted in scheduled batches. How often must you submit batches to guarantee the SLA?",
     "options": [
      {
       "id": "A",
       "text": "Once every 24 hours, matching the maximum batch processing time."
      },
      {
       "id": "B",
       "text": "Once every 36 hours, matching the SLA."
      },
      {
       "id": "C",
       "text": "At least once every 12 hours."
      },
      {
       "id": "D",
       "text": "Once every 18 hours, which leaves half of the SLA as a buffer."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "A document that arrives just after a submission waits up to one full interval for the next batch, then up to 24 hours to process. So interval + 24 hours must be no more than 36 hours, giving an interval of at most 12 hours (shorter if you want a safety margin).",
      "wrong": {
       "A": "A 24-hour interval gives a worst case of 24 + 24 = 48 hours, which breaks the 36-hour SLA.",
       "B": "36 + 24 = 60 hours in the worst case.",
       "D": "18 + 24 = 42 hours in the worst case; a 'half the SLA' buffer does not follow from the arithmetic."
      }
     },
     "studyRef": "Task Statement 4.5 (calculating submission windows from SLA; worst-case wait + 24h processing)"
    },
    {
     "n": 58,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "conflict_detected flags inconsistent source data instead of silently resolving it",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI job runs `claude -p` with `--json-schema` to generate unit tests for each function a pull request changes. For about 6% of functions, the docstring and the code disagree; for example, the docstring of `parse_amount` says it returns `None` for an empty string, but the code raises `ValueError`. Today the model quietly picks one behavior: some generated tests assert the docstring and fail at once, and others assert the current code, locking in what may be a bug. How should the job handle these cases?",
     "options": [
      {
       "id": "A",
       "text": "Instruct the model to always follow the implementation when the two disagree, since the code is what actually runs."
      },
      {
       "id": "B",
       "text": "Retry generation up to three times, asking the model to resolve the disagreement, and keep the first output naming a single behavior."
      },
      {
       "id": "C",
       "text": "Fail the CI run whenever any docstring and implementation disagree, so that no tests are generated until the two match."
      },
      {
       "id": "D",
       "text": "Add a `conflict_detected` flag with both stated behaviors, skip asserting either one, and surface the flag in the PR comment."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When the source itself is inconsistent, the output should flag the conflict explicitly instead of resolving it silently. A `conflict_detected` field carrying both behaviors lets the job avoid locking in either one and puts the decision in front of the author, who knows which behavior is intended.",
      "wrong": {
       "A": "Always trusting the code silently resolves the conflict and writes the current behavior, possibly a bug, into the test suite.",
       "B": "The disagreement is in the source, not a format error; retries cannot recover the author's intent, and keeping the first single-behavior answer is still a silent guess.",
       "C": "Failing the whole run turns a documentation mismatch into a merge blocker and discards the tests for every other function; the conflict should be surfaced, not treated as fatal."
      }
     },
     "studyRef": "Task Statement 4.4 (self-correction flows with conflict_detected for inconsistent source data)"
    },
    {
     "n": 59,
     "scenario": 5,
     "domain": 1,
     "ts": "1.6",
     "tests": "Prompt chaining for predictable multi-aspect reviews",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Every PR review should cover the same predictable steps: summarize the change, check each file for local defects, check cross-file consistency, and then produce a consolidated report. A single mega-prompt requesting all of this gives shallow, uneven results. Which structure fits best?",
     "options": [
      {
       "id": "A",
       "text": "A prompt chain: fixed sequential steps, each a focused prompt whose output feeds the next step."
      },
      {
       "id": "B",
       "text": "A dynamic planner that invents a new set of subtasks for every PR from scratch."
      },
      {
       "id": "C",
       "text": "The same single prompt, but with a longer system message stressing thoroughness."
      },
      {
       "id": "D",
       "text": "Run the four steps as unrelated parallel calls with no shared data and concatenate their outputs."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "For predictable, multi-aspect reviews a fixed sequential pipeline (prompt chaining) lets each step focus on one task and pass results forward; dynamic decomposition is reserved for open-ended work.",
      "wrong": {
       "B": "Adaptive planning is for open-ended investigation; here the steps are known, so it adds cost and variability.",
       "C": "Stressing thoroughness in a single prompt does not change the attention dilution of one huge task.",
       "D": "The later steps depend on earlier outputs, so running them independently loses the data flow the chain relies on."
      }
     },
     "studyRef": "Task Statement 1.6 (prompt chaining vs dynamic decomposition)"
    },
    {
     "n": 60,
     "scenario": 5,
     "domain": 4,
     "ts": "4.3",
     "tests": "Enum with 'other' plus detail string for extensible categories",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your `--json-schema` for review findings has `category` as an enum of `bug`, `security`, `performance`, and `style`. Accessibility and concurrency issues are being forced into `style`, which pollutes dashboards. What schema change is best?",
     "options": [
      {
       "id": "A",
       "text": "Add an `\"other\"` value to the enum together with a `category_detail` string for a short description when `other` is used."
      },
      {
       "id": "B",
       "text": "Add 30 more specific values to the enum to cover everything that anyone on the team might ever want to report as a finding."
      },
      {
       "id": "C",
       "text": "Change `category` to an unconstrained free-text string."
      },
      {
       "id": "D",
       "text": "Remove the `category` field and let the message text describe the issue, which removes any need to maintain an enum at all."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "An enum with an `\"other\"` value plus a detail field keeps the output machine-parseable and consistent while allowing categories the schema did not anticipate.",
      "wrong": {
       "B": "An ever-growing enum can never be exhaustive, and the unanticipated cases will keep being mislabeled.",
       "C": "Free text loses consistency, so dashboards cannot group by category reliably.",
       "D": "Dropping the field removes the structure downstream systems depend on."
      }
     },
     "studyRef": "Task Statement 4.3 (enum 'other' + detail; extensible categorization)"
    }
   ]
  },
  {
   "id": "exam3",
   "title": "Mock Exam 3",
   "scenarioIds": [
    1,
    2,
    4,
    6
   ],
   "questions": [
    {
     "n": 1,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Model-driven tool selection vs pre-configured decision trees or fixed tool sequences",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your support agent is implemented as a fixed pipeline: every message runs `get_customer`, then `lookup_order`, then `process_refund`, and Claude only writes the reply at the end. About 40% of tickets are not refund requests (address changes, order-status questions, policy questions), and for those the pipeline either issues unwanted refund attempts or fails because no order exists. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Add a branch to the decision tree for each ticket type found in the logs, and keep a fixed tool order inside each branch."
      },
      {
       "id": "B",
       "text": "Run an agentic loop in which Claude picks the next tool from the results so far, and the loop ends when `stop_reason` is `end_turn`."
      },
      {
       "id": "C",
       "text": "Write the three-step sequence into the system prompt as numbered rules and tell Claude to follow it on every ticket."
      },
      {
       "id": "D",
       "text": "Put a keyword classifier in front of the pipeline that skips the refund step whenever the message lacks words like \"refund\"."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "In an agentic loop, Claude decides which tool to call next from the context and tool results accumulated so far, and the loop continues on `tool_use` and ends on `end_turn`. This handles varied requests without enumerating every path in advance.",
      "wrong": {
       "A": "A pre-configured tree still cannot cover requests nobody anticipated, and it needs constant maintenance as new ticket types appear.",
       "C": "Spelling the same fixed sequence out in a prompt keeps the rigid order and adds probabilistic compliance on top of it.",
       "D": "A keyword classifier is a brittle, over-engineered stand-in for the model's own reasoning about which tool the request needs."
      }
     },
     "studyRef": "Task Statement 1.1 (model-driven decision-making vs pre-configured tool sequences; stop_reason loop)."
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Implementing programmatic prerequisites that block downstream tool calls",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your agent verifies the caller with `get_customer`, and a customer ID is then stored in session state. An audit of 3,000 conversations finds that in about 4% of refund cases, `process_refund` was called with an order number the customer typed into chat that `lookup_order` never returned for that verified customer, so refunds were issued against other people's orders. The system prompt already says to confirm order ownership first. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Rewrite the system prompt rule in capital letters, place it at the very top and bottom of the prompt, and repeat it in the `process_refund` tool description, so that every refund conversation begins with the reminder."
      },
      {
       "id": "B",
       "text": "Enforce a gate in the tool layer: reject `process_refund` unless session state holds a `lookup_order` result for that order matching the verified customer's ID."
      },
      {
       "id": "C",
       "text": "Add six few-shot examples showing the agent calling `lookup_order` and checking that the order belongs to the customer before every refund."
      },
      {
       "id": "D",
       "text": "Run a nightly job that scans the day's refunds and reverses any where the order owner does not match the verified customer, and email a summary of the mismatches to the support leads."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When a specific ordering or ownership check is required for critical business logic, programmatic prerequisites provide deterministic guarantees that prompt-based guidance cannot. The gate checks both that the lookup occurred and that the order belongs to the verified customer.",
      "wrong": {
       "A": "Prompt emphasis is still probabilistic compliance; a non-zero failure rate is unacceptable when errors move money.",
       "C": "Few-shot examples improve the likelihood of correct behavior but cannot guarantee it for a financial operation.",
       "D": "This detects violations after the money has moved instead of preventing them; the requirement is a deterministic block before execution."
      }
     },
     "studyRef": "Task Statement 1.4 (programmatic enforcement vs prompt-based guidance)."
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "Tool descriptions should state outputs so the model knows a tool returns the information it needs",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`get_customer` is described as \"Looks up a customer by customer ID (`C-` plus 8 digits) or account email.\" Its response actually includes the profile, loyalty tier, `store_credit_balance`, and any open support cases. For messages like \"How much store credit do I have left?\", logs show the agent calling `lookup_order` on recent orders and trying to add up refunds, or telling the customer it cannot see balances; 70% of these conversations end in `escalate_to_human`. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a dedicated `get_store_credit` tool that returns only the balance, so the agent has an obvious tool for credit questions."
      },
      {
       "id": "B",
       "text": "Add a system prompt line: \"For any question about store credit, call get_customer and read the balance field.\""
      },
      {
       "id": "C",
       "text": "Add store-credit questions to the escalation criteria so they reach a human quickly."
      },
      {
       "id": "D",
       "text": "Extend the `get_customer` description to state what it returns, including store credit and open cases."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool descriptions are how the model decides which tool will give it the information it needs. This one states inputs but not outputs, so the agent cannot know that `get_customer` already returns the balance. Describing the returned fields fixes the root cause, for store credit and for other undocumented fields such as open cases.",
      "wrong": {
       "A": "A second tool for data `get_customer` already returns creates overlap between two tools, a new source of misrouting, and another backend surface to maintain.",
       "B": "A keyword-triggered instruction patches one symptom and can create unintended tool associations; the agent still would not know about other returned fields, such as open cases.",
       "C": "This fixes a different problem. The agent can answer these questions itself; escalating them lowers first-contact resolution instead of making the data discoverable."
      }
     },
     "studyRef": "Task Statement 2.1 (descriptions that state each tool's purpose, inputs, outputs, and boundaries)"
    },
    {
     "n": 4,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "Trimming verbose tool outputs to relevant fields before they accumulate in context",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "`lookup_order` returns about 45 fields (warehouse codes, carrier internals, audit history, and so on), roughly 2,000 tokens per call. In multi-issue conversations the agent often calls it 8-10 times, and by mid-conversation it starts missing earlier details. For return decisions it needs only five fields: status, items, delivery date, total, and return eligibility. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Tell the model in the system prompt to ignore irrelevant order fields, noting that only status, items, delivery date, total, and eligibility matter."
      },
      {
       "id": "B",
       "text": "Summarize the whole conversation with Claude after every tool call, keeping only the latest summary and discarding earlier raw lookup results."
      },
      {
       "id": "C",
       "text": "Move to a model with a larger context window so that all 45 fields from every lookup fit comfortably and nothing needs to be removed."
      },
      {
       "id": "D",
       "text": "Add a post-processing step that trims each `lookup_order` result to the five relevant fields before it enters the history."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool results accumulate in context and consume tokens out of proportion to their relevance. Trimming verbose outputs to the fields the task needs, before they are added to history, is the direct and proportionate remedy.",
      "wrong": {
       "A": "The ignored fields still occupy context and accumulate; instructing the model to disregard them does not reduce token consumption.",
       "B": "Repeated progressive summarization tends to condense numbers and dates into vague statements, and it is a heavier fix than trimming known-irrelevant fields.",
       "C": "A larger window postpones exhaustion but does not address low-relevance content diluting the information that matters."
      }
     },
     "studyRef": "Task Statement 5.1 (trim tool outputs; context accumulation)."
    },
    {
     "n": 5,
     "scenario": 1,
     "domain": 1,
     "ts": "1.3",
     "tests": "Including complete findings from prior agents directly in the subagent's prompt",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A support coordinator has already run `get_customer` (verified ID C-20418) and `lookup_order` for a billing dispute. It then spawns a `billing-investigator` subagent through the Task tool, whose only tool is the read-only `get_billing_history`. The subagent keeps replying that it does not know which customer or order it is working on and asks for them. Which change best fixes this?",
     "options": [
      {
       "id": "A",
       "text": "Enable shared memory between the coordinator and the subagent so that it can read the coordinator's conversation history automatically."
      },
      {
       "id": "B",
       "text": "Pass the verified customer ID, the `lookup_order` results, and the dispute details in the Task prompt for the subagent."
      },
      {
       "id": "C",
       "text": "Add \"use the context from the parent conversation\" to the subagent's AgentDefinition prompt so that it knows what was already found."
      },
      {
       "id": "D",
       "text": "Give the subagent `get_customer` and `lookup_order` as well, so that it can repeat the lookups itself before it investigates."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Subagents run with isolated context and do not inherit the coordinator's history or share memory, so everything they need (customer ID, order data, dispute details) must be included explicitly in the Task prompt. Naming note: the Exam Guide calls this the Task tool. Current Agent SDK versions name it `Agent` in `allowedTools` and in `tool_use` blocks (older versions used `Task`, and it still appears as `Task` in the init tools list). On the exam, use the guide's name.",
      "wrong": {
       "A": "No automatic shared memory exists between invocations; context must be passed explicitly.",
       "C": "The AgentDefinition prompt cannot make the subagent see a parent conversation it never receives.",
       "D": "This widens the subagent's tool scope and repeats lookups the coordinator already completed, instead of passing the existing findings."
      }
     },
     "studyRef": "Task Statement 1.3 (subagents do not inherit context; pass findings explicitly in the Task prompt)."
    },
    {
     "n": 6,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Reserve isError for real failures; a query with no matches is a successful empty result",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "When a shopper gives an email that matches no account, the MCP server behind `get_customer` returns `{\"isError\": true, \"content\": \"Customer lookup failed\"}`. About 11% of conversations come from people without accounts asking pre-purchase questions. For these the agent retries twice, tells the shopper \"our systems are having trouble\", and calls `escalate_to_human`. What should change?",
     "options": [
      {
       "id": "A",
       "text": "Return a successful result for a search with no match, such as an empty `matches` list, and keep `isError` for real failures."
      },
      {
       "id": "B",
       "text": "Keep `isError: true` but add `errorCategory: \"validation\"` and `isRetryable: false`, so the agent stops retrying lookups with no match."
      },
      {
       "id": "C",
       "text": "Add a system prompt rule: \"If get_customer fails, assume the person has no account and keep helping them without any account details.\""
      },
      {
       "id": "D",
       "text": "Raise the agent's retry limit and add exponential backoff, so lookups that fail get more chances to succeed."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A search that runs and finds nothing is a successful query with an empty result, not a failure. Reporting it with `isError` makes the agent treat a valid answer as an outage, so it retries and escalates. Return the empty result normally and keep `isError`, with structured metadata, for real access failures such as timeouts, so the agent can tell the two apart.",
      "wrong": {
       "B": "This stops the retries but still frames a successful query as a failure, and \"validation\" tells the agent the input was invalid, so it may keep asking for a different email instead of helping someone who simply has no account.",
       "C": "This collapses real outages into \"no account\": when the database is down, the agent would treat existing customers as strangers. The tool must distinguish the two cases.",
       "D": "Retrying cannot change the answer: no account uses that email, so every retry returns the same result and the shopper just waits longer."
      }
     },
     "studyRef": "Task Statement 2.2 (isError for failures; access failures vs valid empty results)"
    },
    {
     "n": 7,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Acknowledging frustration while offering resolution; escalating only if the customer reiterates",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"This is the second replacement that arrived cracked. I'm really annoyed.\" The order qualifies for a standard damage replacement with photo evidence. Your prompt currently says \"escalate when the customer expresses strong negative sentiment\", and the agent hands this case to a human, contributing to a 55% first-contact resolution rate. How should you change the agent's behavior?",
     "options": [
      {
       "id": "A",
       "text": "Acknowledge the frustration and resolve the replacement the agent can handle; escalate if the customer asks for a human or repeats that preference, or if no progress is possible."
      },
      {
       "id": "B",
       "text": "Raise the sentiment threshold so that only extremely negative messages trigger escalation, tuning the cutoff on a sample of last month's conversations."
      },
      {
       "id": "C",
       "text": "Ask the agent to self-rate its confidence from 1 to 10 before each response and automatically route conversations rated below 7 to the human queue."
      },
      {
       "id": "D",
       "text": "Offer every customer a human agent in the first message, so nobody feels forced to talk to the bot about a damaged item."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Escalation should depend on explicit triggers: a request for a human, policy gaps, or inability to make progress. Frustration alone on an in-scope issue should be acknowledged and resolved; escalate if the customer repeats their preference for a human.",
      "wrong": {
       "B": "Sentiment remains an unreliable proxy for case complexity; a calm customer may need a policy exception while an annoyed one has a simple case.",
       "C": "Self-reported confidence is poorly calibrated, particularly on hard cases the model is already confidently wrong about.",
       "D": "This sends straightforward cases to humans and works against the resolution target."
      }
     },
     "studyRef": "Task Statement 5.2 (escalation triggers; why sentiment and self-reported confidence are weak proxies)."
    },
    {
     "n": 8,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "Matching each rule to the right hook point: outgoing-call interception to prevent actions, PostToolUse to normalize results",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "You are adding two rules to the support agent, and both must hold in every conversation:\n\n1. `process_refund` must never pay out to a payment method added to the account in the last 24 hours; those refunds go to `escalate_to_human`. `get_customer` returns each method's `added_at`.\n2. `lookup_order` comes from a legacy order system that accepts only an `order_id` and returns `delivered_on` as `\"DD/MM/YYYY\"`, while every other tool uses ISO 8601. The agent has miscounted the 30-day return window on 3% of returns.\n\nWhich TWO implementations are correct? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "For rule 1, a hook that intercepts each outgoing `process_refund` call and, if the target method's `added_at` is under 24 hours old, blocks it and directs the agent to `escalate_to_human`."
      },
      {
       "id": "B",
       "text": "For rule 1, a `PostToolUse` hook on `process_refund` that reads the paid-out method's `added_at` from the result and calls `escalate_to_human` whenever that method is under 24 hours old."
      },
      {
       "id": "C",
       "text": "For rule 2, a `PostToolUse` hook on `lookup_order` that rewrites `delivered_on` into ISO 8601 before the model sees the result, so every date the agent compares uses one format."
      },
      {
       "id": "D",
       "text": "For rule 2, a hook that intercepts each outgoing `lookup_order` call and adds a `date_format: \"iso\"` argument, so the order system returns every date in ISO 8601 instead."
      },
      {
       "id": "E",
       "text": "For both rules, a system-prompt section stating the 24-hour restriction and the order system's date format, with few-shot examples showing each rule applied correctly."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "Each rule needs a hook at the right point. Rule 1 must prevent an action, so it belongs on the outgoing call: block before money moves and redirect to escalation. Rule 2 reshapes data a tool returns, so a `PostToolUse` hook normalizes the date before the model reasons over it.",
      "wrong": {
       "B": "A `PostToolUse` hook runs after `process_refund` has executed, so the payout to the new method has already happened; escalating afterwards does not meet \"must never pay out\".",
       "D": "The legacy system accepts only `order_id`, so an extra argument cannot change its response, and a call-side hook cannot reshape what the tool returns.",
       "E": "Prompt instructions and examples give probabilistic compliance; rules that must hold in every conversation need hooks."
      }
     },
     "studyRef": "Task Statement 1.5 (call interception hooks vs PostToolUse result hooks)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Investigating decomposed concerns in parallel using shared verified-customer context",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your agent verifies the customer at the start of every conversation. For multi-concern messages, which typically raise three concerns, it then handles the concerns one at a time, and each investigation begins by calling `get_customer` again with whichever identifier it finds in the message. Each investigation takes about 30 seconds, about 4 of them in that lookup, and the median time to first reply is 96 seconds against a 45-second target. In 3% of these conversations one investigation matched a different account because the customer mentioned both a current and a former email address. The concerns never depend on one another's results. Which redesign meets both the accuracy and the latency goals?",
     "options": [
      {
       "id": "A",
       "text": "Keep the per-concern lookups, and add a prompt rule telling each investigation to call `get_customer` with the newest email."
      },
      {
       "id": "B",
       "text": "Drop the repeated lookups but keep handling the concerns one at a time, passing the already verified customer ID from each to the next."
      },
      {
       "id": "C",
       "text": "Drop the repeated lookups and investigate the concerns in parallel, giving each one the customer record verified at the start."
      },
      {
       "id": "D",
       "text": "Merge duplicate accounts in the CRM so that `get_customer` returns only one account per person, whichever identifier is used."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The customer is already verified, so the repeated lookups only add latency and a chance of matching the wrong account. Sharing the verified record removes both, and because the concerns are independent they can run in parallel: about 26 seconds each, so roughly 30 seconds to first reply instead of 96. Option B fixes accuracy, but three sequential 26-second investigations still take about 78 seconds.",
      "wrong": {
       "A": "It keeps the redundant lookups and their latency, and relies on each investigation obeying a prompt rule, so mismatched identities can still occur.",
       "B": "Reusing the verified ID removes the wrong-account matches and about 4 seconds per concern, but three sequential investigations of about 26 seconds still take roughly 78 seconds, well over the 45-second target.",
       "D": "CRM cleanup is outside the agent design and does nothing for latency; each investigation would still repeat a lookup the conversation has already done."
      }
     },
     "studyRef": "Task Statement 1.4 (investigate decomposed items in parallel using shared context)"
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Escalate when policy is silent on the specific request instead of applying the nearest rule by analogy",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The billing policy in the agent's system prompt says: \"Monthly plans: customers may cancel at any time; refund the unused days of the current month, prorated daily.\" It says nothing else about cancellations. A customer on an annual plan, who paid $180 upfront under a promotion (list price $240) and has used 5 months, asks to cancel and get the unused 7 months back. `get_customer` and `lookup_order` confirm these facts. What should the agent do?",
     "options": [
      {
       "id": "A",
       "text": "Refund $105 (7/12 of $180), since applying the monthly proration rule to the unused months fits the policy's intent."
      },
      {
       "id": "B",
       "text": "Escalate with the plan, the amount paid, and the months used, noting that the policy covers only monthly plans."
      },
      {
       "id": "C",
       "text": "Decline politely, explaining that the policy offers prorated refunds only for monthly plans, not annual ones."
      },
      {
       "id": "D",
       "text": "Offer $105 in store credit instead of a refund, as a lower-risk compromise that stretches the policy less."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Escalate when policy is ambiguous or silent on the customer's specific request. The policy addresses only monthly plans, and an annual promotional plan raises questions the agent has no rule for (prorate the paid price or the list price, by month or by day, or at all). A human with authority decides, and the summary spares the customer from repeating the facts.",
      "wrong": {
       "A": "Applying the closest rule by analogy invents policy for a case nobody decided, and $105 is only one of several plausible answers (7/12 of the $240 list price would be $140).",
       "C": "Refusing because the policy does not mention the case treats silence as a no. A gap is a reason to escalate, not to deny.",
       "D": "Store credit is also an outcome the policy does not authorize; a compromise still invents policy instead of escalating the gap."
      }
     },
     "studyRef": "Task Statement 5.2 (escalate when policy is ambiguous or silent on the customer's specific request)"
    },
    {
     "n": 11,
     "scenario": 1,
     "domain": 2,
     "ts": "2.4",
     "tests": "Exposing content catalogs as MCP resources to reduce exploratory tool calls",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In most conversations, the agent makes 3-5 exploratory calls to discover which return-reason codes exist, which product categories have special return windows, and what policy documents are available, before it handles the customer's actual issue. This adds latency and cost. Which approach best reduces these calls?",
     "options": [
      {
       "id": "A",
       "text": "Expose reason codes, category rules, and the policy index as MCP resources so the agent sees what exists without exploratory calls."
      },
      {
       "id": "B",
       "text": "Add a `discover_capabilities` tool that the agent must call at the start of every conversation to list reason codes, categories, and policies."
      },
      {
       "id": "C",
       "text": "Paste all 400 policy documents into the system prompt so the model can find whatever it needs without making tool calls, in every conversation."
      },
      {
       "id": "D",
       "text": "Build a custom retrieval layer that uses a classifier on the incoming message to pre-fetch the catalog data it expects the agent to need."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "MCP resources are designed to expose content catalogs (documentation hierarchies, schemas, issue summaries) so agents know what exists without making exploratory calls.",
      "wrong": {
       "B": "This still spends a tool call every conversation; resources provide visibility into content catalogs without exploratory calls.",
       "C": "This bloats every request with content most conversations never need; a catalog gives visibility without loading everything.",
       "D": "This adds an over-engineered pipeline when a simple resource exposure answers the need."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources for content catalogs)."
    },
    {
     "n": 12,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Handoff summaries must be self-contained because human agents lack the transcript",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your `escalate_to_human` tool has four required fields, and this escalation passed schema validation:\n```json\n{\n  \"customer_id\": \"C-40917\",\n  \"root_cause\": \"Same problem the customer described in their second message\",\n  \"refund_amount\": 86.00,\n  \"recommended_action\": \"Do what the agent offered before escalating\"\n}\n```\nThe human console shows only this payload and cannot display chat transcripts. Field values average 60 characters against a 500-character limit, and no escalation last month had an empty field. Median human handle time is still 9 minutes, mostly spent re-running lookups and calling customers back. What change will most reduce handle time?",
     "options": [
      {
       "id": "A",
       "text": "Add a `transcript_ref` field linking to the original chat, so human agents can follow the other fields' references when needed."
      },
      {
       "id": "B",
       "text": "Require every field to state the concrete finding, order, amount, and action itself, with no references back to the chat."
      },
      {
       "id": "C",
       "text": "Add a tool-call interception hook that rejects `escalate_to_human` calls with any missing or empty field until they are filled."
      },
      {
       "id": "D",
       "text": "Raise each field's character limit to 2,000, so the agent has room to restate more of what the customer said in the conversation."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Human agents lack the transcript, so a handoff must be self-contained. Every field here is filled but points back to a conversation the human cannot see, so they have to reconstruct the root cause and the offer themselves. Requiring concrete content (for example, \"duplicate capture of $86.00 on order #5512; refund the second capture\") lets them act at once.",
      "wrong": {
       "A": "The console cannot display transcripts, so a link gives the human nothing to follow; the payload itself has to carry the facts.",
       "C": "No escalation had a missing or empty field, so this hook would never fire; the problem is what filled fields say, not whether they are present.",
       "D": "Fields average 60 of 500 characters, so space is not the constraint, and more room does not stop the agent writing references instead of facts."
      }
     },
     "studyRef": "Task Statement 1.4 (structured, self-contained handoff summaries for humans without the transcript)"
    },
    {
     "n": 13,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "Customer-stated expectations are lost in progressive summaries; persist them with the case facts outside the summary",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your support agent replaces turns older than the latest 15 with a summary and keeps a `case_facts` block (order IDs, amounts, dates, statuses) in every request, outside the summary. The summarizer prompt already says to preserve key customer requests. In a 58-turn chat about a cracked espresso machine (order #77120), the customer said at turn 9: \"I want a replacement, not a refund, and it has to arrive before June 14.\" At turn 55 the agent offered a refund. The summary of turns 1-40 reads: \"Customer reported a damaged machine and wants it resolved.\" What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Add the customer's stated outcome and constraints, such as \"replacement only, by June 14,\" as fields in `case_facts`."
      },
      {
       "id": "B",
       "text": "Strengthen the summarizer prompt so that customer requests must be preserved word for word in every summary."
      },
      {
       "id": "C",
       "text": "Summarize only turns older than the latest 40 instead of the latest 15, so that early requests stay verbatim for longer."
      },
      {
       "id": "D",
       "text": "Have the agent ask the customer again which outcome they want before offering any resolution in chats longer than 30 turns."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Progressive summarization condenses not only numbers but also customer-stated expectations, such as the outcome they asked for and its deadline. The `case_facts` block already protects transactional facts because it sits outside the summary in every request; adding the stated outcome and constraints to it protects them the same way.",
      "wrong": {
       "B": "The summarizer is already told to preserve requests and still condensed this one; a stronger instruction is still a model-written summary that can paraphrase.",
       "C": "It only delays the loss: when the refund was offered at turn 55, turns 1-15 would still have been summarized, and turn 9 is among them.",
       "D": "The customer already stated the outcome; asking again hurts the experience and first-contact resolution and does not fix how the information is lost."
      }
     },
     "studyRef": "Task Statement 5.1 (summaries lose customer-stated expectations; persist key facts outside summarized history)"
    },
    {
     "n": 14,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "Reviewing system prompts for keyword-sensitive instructions that override tool descriptions",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You wrote detailed descriptions for `get_customer` and `lookup_order`. After a recent edit, a system prompt line reads: \"If a customer mentions a refund, first check their account.\" Since then, 30% of messages like \"What's the refund status for order #7731?\" trigger `get_customer` with the order number as the identifier, which fails. The tool descriptions did not change. What is the most likely root cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "The tool descriptions are still too short; add more examples to both of them."
      },
      {
       "id": "B",
       "text": "The model cannot tell the two tools apart; remove `get_customer` from the available tools and verify identity by some other means."
      },
      {
       "id": "C",
       "text": "Add few-shot examples in the system prompt that show order-status questions being routed to `lookup_order` with the order number."
      },
      {
       "id": "D",
       "text": "The keyword-triggered prompt line ties \"refund\" to `get_customer`; reword it around the goal (verify identity when needed) and let tool descriptions drive selection."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "System prompt wording can create keyword-sensitive associations that override otherwise good tool descriptions. When behavior regresses after a prompt edit, review it for such instructions.",
      "wrong": {
       "A": "The descriptions did not change and the regression started with the prompt edit, so the evidence points elsewhere.",
       "B": "`get_customer` is required for identity verification; removing it breaks needed functionality.",
       "C": "This adds tokens to work around the wording problem without fixing the instruction that causes the association."
      }
     },
     "studyRef": "Task Statement 2.1 (system prompt wording and unintended tool associations)."
    },
    {
     "n": 15,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Adding tool results to conversation context between iterations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your agent calls `lookup_order` for the same order 5-6 times in a row and then stops with an iteration-limit error. The loop body is:\n\n```python\nfor block in resp.content:\n    if block.type == \"tool_use\":\n        result = run_tool(block.name, block.input)\n        logger.info(\"tool result: %s\", result)\n# loop continues with `messages` unchanged except for the assistant turn\n```\n\nWhat is the root cause?",
     "options": [
      {
       "id": "A",
       "text": "`max_tokens` is set too low, so Claude's responses are truncated before it can make use of the order data it has retrieved, leaving it unable to finish its reasoning about the order."
      },
      {
       "id": "B",
       "text": "The temperature is too high, so Claude is sampling the same tool call repeatedly instead of settling on a single answer."
      },
      {
       "id": "C",
       "text": "`tool_choice` should be set to `\"any\"` so that Claude is forced to call a tool and then use the data from that first call."
      },
      {
       "id": "D",
       "text": "Tool results are never appended as `tool_result` blocks, so Claude never sees the data and keeps requesting it."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "For the model to reason about the next action, each tool result must be appended to the history (as a `tool_result` content block in a user message, matched by `tool_use_id`) before the next request.",
      "wrong": {
       "A": "A low `max_tokens` would truncate responses with a different stop reason; it does not explain repeated identical tool requests.",
       "B": "Sampling randomness does not explain deterministic repetition; the model simply never receives the result it asked for.",
       "C": "`tool_choice` controls whether a tool must be called, not whether a result is visible; forcing tool calls would worsen the loop."
      }
     },
     "studyRef": "Task Statement 1.1 (how tool results are appended to conversation history)."
    },
    {
     "n": 16,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Using /memory to see which memory files are loaded when one developer's behavior differs",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "For the past week, Claude Code in Lena's sessions has added a license header to every new file and written commit messages as `ACME-123: ...`; nobody else on the team sees this. The repository's CLAUDE.md files contain no such rules, her `~/.claude/CLAUDE.md` holds only an editor preference, and she keeps all client repositories under `~/work/clients/`. What should she do first?",
     "options": [
      {
       "id": "A",
       "text": "Add \"Never add license headers; use Conventional Commits\" to the project CLAUDE.md, so team rules override whatever causes it."
      },
      {
       "id": "B",
       "text": "Delete her local clone and clone the repository again, so her working copy holds exactly the same files as her teammates' copies."
      },
      {
       "id": "C",
       "text": "Run `/compact` at the start of each session, so that stale instructions are cleared from the context before she starts."
      },
      {
       "id": "D",
       "text": "Run `/memory` in one of her sessions to see which memory files are loaded."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`/memory` shows which memory files are loaded, the first step in diagnosing behavior that differs between developers. Here it would reveal a file nobody on the team looks at, for example `~/work/clients/CLAUDE.md` left over from another client, since Claude Code also loads CLAUDE.md files from parent directories of the working directory. Docs note: current Claude Code also has `/context` for inspecting what fills the context window; the guide's command for checking loaded memory files is `/memory`.",
      "wrong": {
       "A": "Memory files are combined, not overridden, so contradictory rules leave Claude with conflicting instructions; it treats the symptom without finding the extra file.",
       "B": "Re-cloning is a guess, not a diagnosis: it discards local state without showing where the instructions come from, and if they come from a file outside the repository, such as one in a parent directory, it changes nothing.",
       "C": "`/compact` summarizes the conversation history; it neither lists nor unloads memory files, which are loaded again at the start of every session."
      }
     },
     "studyRef": "Task Statement 3.1 (use /memory to verify which memory files are loaded)"
    },
    {
     "n": 17,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Configuring allowed-tools in skill frontmatter to restrict tool access",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your team's `/release-notes` skill reads `.release/changes.md` and writes `CHANGELOG.md`. A teammate worries that during execution the skill might run an unintended shell command such as `git reset` or `rm`. You want this controlled in the skill's own configuration rather than by a prompt instruction. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "In the skill's SKILL.md frontmatter, set `allowed-tools` to only the file tools it needs, such as Read and Write."
      },
      {
       "id": "B",
       "text": "Add a line to CLAUDE.md saying that the release-notes skill must never run destructive commands such as `git reset` or `rm`."
      },
      {
       "id": "C",
       "text": "Add `context: fork` to the skill's frontmatter so that it runs in an isolated subagent rather than in the main conversation."
      },
      {
       "id": "D",
       "text": "Move the skill file to `~/.claude/commands/` so that only you can invoke it, instead of every developer on the team."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Skill frontmatter `allowed-tools` is the field the Exam Guide names for restricting tool access during skill execution, so the limit lives in the skill's configuration rather than in a prompt. Current-docs note: in today's Claude Code, `allowed-tools` pre-approves the listed tools (no permission prompt) rather than removing the others, and `disallowed-tools` is the field that removes tools. The Exam Guide describes `allowed-tools` as restricting tool access during skill execution, so answer per the guide.",
      "wrong": {
       "B": "CLAUDE.md is context, not enforcement; the model could still run the command.",
       "C": "Forking isolates the skill's output and context from the main conversation but does not restrict which tools it can use.",
       "D": "Scope controls who can use the command, not what it is allowed to do while running."
      }
     },
     "studyRef": "Task Statement 3.2 (allowed-tools; context: fork is a different feature)."
    },
    {
     "n": 18,
     "scenario": 2,
     "domain": 3,
     "ts": "3.3",
     "tests": "Choosing path-specific rules over subdirectory CLAUDE.md files for conventions spanning many directories",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your monorepo has 14 services, each with SQL migrations in `services/<name>/db/migrations/`. Every migration must be reversible, use the `V<timestamp>__description.sql` naming, and avoid data changes. You want these conventions applied automatically only when Claude is editing migration files, without loading them for unrelated work. Which setup is best?",
     "options": [
      {
       "id": "A",
       "text": "Create `.claude/rules/migrations.md` with frontmatter `paths: [\"**/db/migrations/**/*.sql\"]` holding the conventions."
      },
      {
       "id": "B",
       "text": "Place a CLAUDE.md file in each of the 14 `db/migrations/` directories, each containing a copy of the migration conventions."
      },
      {
       "id": "C",
       "text": "Put the migration conventions under a heading in the root CLAUDE.md and rely on Claude to infer when the section applies."
      },
      {
       "id": "D",
       "text": "Create a `/migration-rules` skill that contains the conventions and ask developers to invoke it before editing a migration."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Path-scoped rules in `.claude/rules/` with glob patterns load only when matching files are in play, and they work across any number of directories without per-directory CLAUDE.md files.",
      "wrong": {
       "B": "This duplicates the conventions across 14 files that will drift, whereas a glob rule expresses them once.",
       "C": "Always-loaded conventions consume context during unrelated work and don't scope the rules to migration files.",
       "D": "This depends on developers remembering to invoke it; the requirement is automatic application based on file paths."
      }
     },
     "studyRef": "Task Statement 3.3 (glob-based rules vs directory CLAUDE.md)."
    },
    {
     "n": 19,
     "scenario": 2,
     "domain": 3,
     "ts": "3.4",
     "tests": "Selecting direct execution for well-understood changes with clear scope",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A production alert includes this stack trace:\n\n```\nTypeError: Cannot read properties of null (reading 'toISOString')\n    at formatInvoiceDate (src/billing/format.ts:42:31)\n    at renderInvoice (src/billing/render.ts:88:12)\n```\n\n`dueDate` can legitimately be null for draft invoices. You want a guard in `formatInvoiceDate` that returns an empty string when it is null. Which approach is most appropriate?",
     "options": [
      {
       "id": "A",
       "text": "Enter plan mode and have Claude design a comprehensive null-handling strategy for the whole billing module before it changes any file."
      },
      {
       "id": "B",
       "text": "Use direct execution: ask Claude to add the null check in `formatInvoiceDate` and run the existing tests."
      },
      {
       "id": "C",
       "text": "Launch an Explore subagent to map every caller of `formatInvoiceDate` across the repository before making the fix."
      },
      {
       "id": "D",
       "text": "Ask Claude to interview you about nullable-date design considerations for draft invoices before it writes any code."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Direct execution is appropriate for simple, well-scoped changes such as a single-file bug fix with a clear stack trace; plan mode is reserved for complex, multi-file, or architectural work.",
      "wrong": {
       "A": "The change is single-file, well-scoped, and the cause is known; plan mode adds overhead without benefit.",
       "C": "Broad discovery is not needed for a guard with a clear stack trace and an unambiguous fix.",
       "D": "The interview pattern fits unfamiliar domains with unclear design choices, not a known one-line guard."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode vs direct execution)."
    },
    {
     "n": 20,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Test-driven iteration when the expected behavior is fully specified and verifiable",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You are porting `calc_late_fee()` from the legacy PHP billing system to the new Python service with Claude Code. Finance has signed off a table of 11 rules with exact amounts, covering grace periods, fee caps, leap-year due dates, and rounding, and the new function must match the legacy output to the cent. Claude can read the PHP source. Last quarter, porting a similar function took nine rounds of feedback such as \"still wrong for some invoices\". Which approach should you take this time?",
     "options": [
      {
       "id": "A",
       "text": "Use the interview pattern: have Claude ask about grace periods, caps, and rounding before it writes code."
      },
      {
       "id": "B",
       "text": "Give Claude two or three input/output examples of late fees, and let it generalize the other rules from them."
      },
      {
       "id": "C",
       "text": "Encode the 11 rules as tests first, then iterate by sharing each failure."
      },
      {
       "id": "D",
       "text": "Paste the rules table into the prompt as prose, ask for the full port, then check it by hand on old invoices."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "When the expected behavior is fully specified and checkable, test-driven iteration fits: write tests for every rule and edge case (grace periods, caps, leap years, rounding) before implementation, then share the specific failing tests each round. The tests define the target exactly and replace vague \"still wrong\" feedback with precise failures.",
      "wrong": {
       "A": "The interview pattern surfaces considerations you have not anticipated in an unfamiliar domain. Finance has already decided every rule, so there is little to discover, and an interview gives no verifiable target.",
       "B": "Two or three examples clarify a transformation when prose is read inconsistently, but they cannot pin down 11 distinct rules and their edge cases; Claude would have to guess the rules the examples do not show.",
       "D": "Prose plus manual checking is the approach that took nine rounds last quarter; it gives Claude no precise, repeatable signal about which rule is failing."
      }
     },
     "studyRef": "Task Statement 3.5 (test-driven iteration: write the test suite first, then iterate by sharing test failures)"
    },
    {
     "n": 21,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Scratchpad files, not shared CLAUDE.md, persist investigation findings across context boundaries",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Over a week, a developer uses Claude Code to reverse-engineer a legacy `ledger/` service before a rewrite, while also maintaining two other repositories. So that findings survive long, compacted sessions, she has Claude append each one (for example, \"posting order is enforced in `JournalSequencer`, not by the database\") to the repository's root `CLAUDE.md`. After three days the file has grown by 400 lines, teammates working on other services in the monorepo see Claude bring up ledger internals in their sessions, and two of the notes were later disproved. Where should these findings be kept?",
     "options": [
      {
       "id": "A",
       "text": "In a scratchpad file for the investigation, such as `notes/ledger.md`, that Claude keeps updated and consults later."
      },
      {
       "id": "B",
       "text": "In her user-level `~/.claude/CLAUDE.md`, so the findings load into every one of her own sessions without reaching teammates."
      },
      {
       "id": "C",
       "text": "Only in the conversation, running `/compact` whenever context fills, because the compaction summary carries findings forward."
      },
      {
       "id": "D",
       "text": "In the commit messages on her branch, because Claude can run `git log` to read any earlier finding when a question needs it."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Investigation findings belong in a scratchpad file that Claude updates and re-reads: it persists across sessions and compactions, can be corrected when a finding is disproved, and is read only when relevant. `CLAUDE.md` is always-loaded project guidance shared with the whole team, the wrong place for a still-changing investigation log.",
      "wrong": {
       "B": "User-level `CLAUDE.md` loads into all of her sessions in every project, so a growing ledger log would consume context in unrelated work; it is for standing personal instructions.",
       "C": "Compaction summaries are lossy and do not carry over to a new session, so specific findings such as class names drift or disappear over a week of work.",
       "D": "Commit messages are hard to search, cannot be corrected when a finding is disproved, and mix investigation notes into version history."
      }
     },
     "studyRef": "Task Statement 5.4 (scratchpad files persisting key findings across context boundaries)"
    },
    {
     "n": 22,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Universal, always-relevant standards belong in CLAUDE.md, not in an on-demand skill",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "To shrink a 700-line `CLAUDE.md`, a developer moved the team's universal coding standards (wrap errors in `AppError`, required structured-logging fields, naming rules; all relevant to nearly every edit) into a project skill, `.claude/skills/standards/SKILL.md`, leaving only the line \"Run /standards for our conventions.\" Since then, code generated in sessions where nobody runs `/standards` ignores those conventions about half the time. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Move the universal standards back into `CLAUDE.md` and keep skills for task-specific workflows."
      },
      {
       "id": "B",
       "text": "Add `context: fork` to the skill's frontmatter so that it is loaded into every new session automatically."
      },
      {
       "id": "C",
       "text": "Rewrite the skill's `description` so that Claude decides to invoke it before every code-generation task."
      },
      {
       "id": "D",
       "text": "Ask developers to run `/standards` at the start of every session and add that step to the onboarding checklist."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`CLAUDE.md` is always loaded, which suits universal standards that apply to nearly every edit. Skills are invoked on demand, which suits task-specific workflows. To shrink `CLAUDE.md`, move occasional procedures into skills (and area-specific conventions into path rules), not the standards every session needs.",
      "wrong": {
       "B": "`context: fork` runs a skill in an isolated sub-agent context; it does not auto-load anything, and isolation would keep the standards out of the main session anyway.",
       "C": "This still depends on Claude choosing to load the skill, which is exactly what fails half the time. Universal standards should not depend on invocation.",
       "D": "The failures happen precisely in sessions where nobody runs the skill. A manual ritual is the least reliable way to apply always-needed rules."
      }
     },
     "studyRef": "Task Statement 3.2 (skills for on-demand task workflows vs CLAUDE.md for always-loaded universal standards)"
    },
    {
     "n": 23,
     "scenario": 2,
     "domain": 1,
     "ts": "1.7",
     "tests": "Choosing between session resumption and starting fresh with injected summaries",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Yesterday you ran a named session `authclient-analysis` that mapped how `AuthClient` is used across 60 files. Overnight, teammates merged a change that renamed methods in exactly 3 of those 60 files; the other 57 are untouched, so the session's earlier findings about them still hold. You want to continue the work today. What is the most effective approach?",
     "options": [
      {
       "id": "A",
       "text": "Resume with `--resume authclient-analysis` and simply continue, since Claude will notice on its own that the 3 files have changed."
      },
      {
       "id": "B",
       "text": "Start a new session with a summary of yesterday's conclusions and re-explore all 60 files to be safe."
      },
      {
       "id": "C",
       "text": "Use `fork_session` from the old session so that the new branch is protected from the stale results in the 3 files."
      },
      {
       "id": "D",
       "text": "Resume with `--resume authclient-analysis` and tell Claude which 3 files changed so it re-analyzes only those."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When prior context is mostly valid, resume the named session and inform it of the specific file changes for targeted re-analysis rather than redoing the full exploration.",
      "wrong": {
       "A": "A resumed session keeps the old file contents as if current; Claude does not automatically detect that files changed, so it must be told.",
       "B": "Starting fresh is the better choice when most tool results are stale; here 57 of 60 files are still valid, so re-exploring everything wastes the existing analysis.",
       "C": "A fork inherits the same history, including the stale results; forking is for exploring divergent approaches, not for fixing staleness."
      }
     },
     "studyRef": "Task Statement 1.7 (resume with targeted change notice vs fresh start; stale-result proportion decides)."
    },
    {
     "n": 24,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Splitting large CLAUDE.md into focused files with @import and .claude/rules",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "The root `CLAUDE.md` has grown to 1,100 lines covering universal standards, API conventions, testing practices, and deployment steps for several packages. It is hard to maintain, and Claude's adherence is inconsistent because irrelevant material is always loaded. Which TWO changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Move the whole file into `~/.claude/CLAUDE.md` so it applies to every project."
      },
      {
       "id": "B",
       "text": "Move topic-specific guidance into `.claude/rules/` files (for example testing and API conventions) that use `paths` frontmatter so they load only for matching files."
      },
      {
       "id": "C",
       "text": "Create `CLAUDE-testing.md` and `CLAUDE-api.md` at the repository root; Claude loads any file with a `CLAUDE-` prefix automatically."
      },
      {
       "id": "D",
       "text": "Keep the universal standards in the root file and have each package's CLAUDE.md use `@import` to include only the standards files relevant to that package."
      },
      {
       "id": "E",
       "text": "Add a `.claude/config.json` with an `includes` array that lists the files to load per directory."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "Modular organization comes from `.claude/rules/` with path scoping for topic-specific rules and `@import` for sharing selected standards files, so only relevant content is loaded.",
      "wrong": {
       "A": "User-level files are personal and are not shared with teammates through version control.",
       "C": "Such prefixed files are not auto-loaded; this invented loading rule would silently drop the content.",
       "E": "No such configuration mechanism exists in Claude Code."
      }
     },
     "studyRef": "Task Statement 3.1 (@import, .claude/rules/, hierarchy)."
    },
    {
     "n": 25,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Addressing interacting issues in one message versus sequential fixes for independent issues",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "After a refactor, three tests fail. (1) `listOrders` paginates with an off-by-one; (2) `calcTotal` rounds tax incorrectly, and `listOrders` uses `calcTotal` for page totals, so fixing either one changes the other's expected output; (3) an unrelated import path in `exportJob.ts` is broken. How should you prompt Claude to fix them?",
     "options": [
      {
       "id": "A",
       "text": "Report all three issues in one large message, because they all come from the same refactor."
      },
      {
       "id": "B",
       "text": "Fix each issue sequentially in three separate messages, in the order in which the tests failed."
      },
      {
       "id": "C",
       "text": "Fix only issue 2 first and wait to see whether the other failures disappear before continuing."
      },
      {
       "id": "D",
       "text": "Describe issues 1 and 2 together in one detailed message; handle issue 3 as a separate step."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Provide all issues in a single message when fixes interact; iterate sequentially when problems are independent.",
      "wrong": {
       "A": "Issue 3 is independent; bundling it adds noise without any benefit, while the genuinely interacting pair should be stated together.",
       "B": "Fixing 1 and 2 separately risks fixes that conflict because they interact.",
       "C": "Issue 3 will not be resolved by a rounding fix, and issue 1's off-by-one is a separate defect."
      }
     },
     "studyRef": "Task Statement 3.5 (interacting vs independent issues)."
    },
    {
     "n": 26,
     "scenario": 2,
     "domain": 3,
     "ts": "3.4",
     "tests": "Using the Explore subagent to isolate verbose discovery output",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You plan to migrate the codebase from `winston` to `pino` logging across 45+ files. A first search shows 600+ matches, and understanding wrapper utilities requires reading many files. You're worried this discovery work will exhaust the main conversation's context before the plan is complete. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Use the Explore subagent for discovery so the verbose output stays in its context and only a summary returns to the main conversation."
      },
      {
       "id": "B",
       "text": "Read all 45 files directly in the main conversation first, so that the full detail is available during planning, then plan from the accumulated details."
      },
      {
       "id": "C",
       "text": "Run `/clear` after the first search and ask Claude to produce the plan from what it remembers of the matches."
      },
      {
       "id": "D",
       "text": "Skip exploration and start editing files one by one, discovering wrapper utilities as each file turns out to need them, then fix whatever breaks."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The Explore subagent isolates verbose discovery output and returns summaries, preserving the main conversation's context during multi-phase tasks.",
      "wrong": {
       "B": "This is exactly what exhausts the context window; a planning phase needs conclusions, not every file's raw content.",
       "C": "Clearing discards the discovery results needed for the plan.",
       "D": "A 45+ file migration with wrapper utilities is an architectural change; editing before understanding risks rework."
      }
     },
     "studyRef": "Task Statement 3.4 (Explore subagent; plan mode for migrations)."
    },
    {
     "n": 27,
     "scenario": 2,
     "domain": 1,
     "ts": "1.6",
     "tests": "Decomposing open-ended tasks by mapping structure, prioritizing, and adapting the plan",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You ask Claude to \"add comprehensive tests to our 80K-line legacy billing codebase\". The team's first attempt used a fixed instruction: \"for each file in alphabetical order, generate unit tests.\" After a day, there are many tests for trivial utility files, but the core `InvoiceEngine` and `ProrationService` modules are untested. What is the better decomposition?",
     "options": [
      {
       "id": "A",
       "text": "Map the structure first, identify high-impact and high-risk areas, build a prioritized plan, and adapt it as dependencies are discovered."
      },
      {
       "id": "B",
       "text": "Keep the alphabetical loop but add a coverage target of 80%, so the loop continues until the target is reached, and report coverage per file."
      },
      {
       "id": "C",
       "text": "Run one independent subagent per file in parallel, each generating tests with no knowledge of the other files, while a coordinator merges the results at the end of the run."
      },
      {
       "id": "D",
       "text": "Use a fixed three-step chain (list functions, write tests, run tests) applied uniformly to every module."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Open-ended tasks suit dynamic decomposition: map the structure, find high-impact areas, then build a prioritized plan that adapts as dependencies appear. Fixed chains suit predictable multi-aspect tasks.",
      "wrong": {
       "B": "A coverage target doesn't change the ordering; trivial files can lift the number while critical modules stay untested.",
       "C": "Parallelism increases output volume but not prioritization, and isolated per-file generation ignores dependencies between modules.",
       "D": "A fixed pipeline suits predictable tasks; an open-ended task needs a plan that adapts to what is discovered."
      }
     },
     "studyRef": "Task Statement 1.6 (adaptive decomposition vs prompt chaining)."
    },
    {
     "n": 28,
     "scenario": 2,
     "domain": 3,
     "ts": "3.6",
     "tests": "-p (--print) is non-interactive print mode, not plan mode",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your team adds a `prepare-commit-msg` git hook that runs:\n\n```bash\nclaude -p \"Write a conventional-commit message for the staged diff\" > \"$1\"\n```\n\nIn code review, a senior developer objects: \"`-p` puts Claude Code in plan mode, so it will describe a plan instead of writing the message. Drop it.\" A teammate drops the flag, and now `git commit` opens a Claude Code session and sits at its input prompt until someone types. What is the correct resolution?",
     "options": [
      {
       "id": "A",
       "text": "Replace `-p` with `--permission-mode plan`, which keeps Claude read-only and also skips the input prompt."
      },
      {
       "id": "B",
       "text": "Restore `-p`: it is print mode, which outputs the result and exits; it is not plan mode."
      },
      {
       "id": "C",
       "text": "Keep the flag removed and pipe `yes` into `claude` in the hook, so any prompt it shows gets answered."
      },
      {
       "id": "D",
       "text": "Replace `-p` with `--output-format text`, which by itself makes Claude Code print the message and exit."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`-p` (`--print`) runs Claude Code non-interactively: it processes the prompt, writes the result to stdout, and exits, which is exactly what a hook that captures the output needs. It has nothing to do with plan mode, so the original hook was correct.",
      "wrong": {
       "A": "Plan mode restricts Claude to read-only exploration and planning; it does not make the session non-interactive, so the commit would still wait for input.",
       "C": "Piping `yes` is a shell workaround that answers prompts blindly. It is not the documented way to run Claude Code unattended, and the hook needs only the final message on stdout.",
       "D": "`--output-format` selects the format of print-mode output; without `-p` the session is still interactive."
      }
     },
     "studyRef": "Task Statement 3.6 (the -p / --print flag for non-interactive runs in scripts and pipelines)"
    },
    {
     "n": 29,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Using /compact to reduce context usage during extended exploration",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You're deep into a debugging session on a flaky payment test. Context usage is at 85%, mostly verbose build logs and file dumps from earlier discovery. You want to keep working on the same bug without losing the conclusions so far. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Run `/clear` and start the debugging over with the same prompt and the same failing test."
      },
      {
       "id": "B",
       "text": "Run `/memory` to remove old messages from the session."
      },
      {
       "id": "C",
       "text": "Run `/compact` to condense the conversation, keeping key findings and dropping verbose discovery output."
      },
      {
       "id": "D",
       "text": "Switch to plan mode so old build output no longer counts toward context."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`/compact` reduces context usage in extended sessions that have filled with verbose output while preserving a summary of the work.",
      "wrong": {
       "A": "`/clear` discards all conclusions reached so far.",
       "B": "`/memory` shows which memory files are loaded; it does not reduce conversation context.",
       "D": "Plan mode changes how Claude works, not how much context is consumed."
      }
     },
     "studyRef": "Task Statement 5.4 (/compact)."
    },
    {
     "n": 30,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Using argument-hint frontmatter to prompt for required parameters",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The `/new-endpoint` skill needs a resource name and an HTTP method. Developers often run it with no arguments, and Claude guesses a resource name. You want developers to be prompted about the required parameters when they invoke it. What should you add?",
     "options": [
      {
       "id": "A",
       "text": "A `context: fork` entry in the SKILL.md frontmatter, which runs the skill in an isolated subagent context."
      },
      {
       "id": "B",
       "text": "A sentence in the root CLAUDE.md saying that developers must always provide a resource and an HTTP method."
      },
      {
       "id": "C",
       "text": "An `arguments` array in `.claude/config.json` that lists the expected arguments for each skill."
      },
      {
       "id": "D",
       "text": "An `argument-hint` entry in the SKILL.md frontmatter, such as `<resource> <GET|POST|PUT|DELETE>`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`argument-hint` in skill frontmatter prompts developers for required parameters when they invoke the skill without arguments.",
      "wrong": {
       "A": "`context: fork` isolates execution and does not prompt for parameters.",
       "B": "CLAUDE.md is always-loaded context and does not prompt at invocation time.",
       "C": "`.claude/config.json` is not a Claude Code mechanism for skills."
      }
     },
     "studyRef": "Task Statement 3.2 (skill frontmatter: argument-hint)."
    },
    {
     "n": 31,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Grep searches the contents of any file type, so references from configuration files are found",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Before deleting `close_period()` from `billing/jobs.py`, an engineer asks the agent to confirm that nothing still invokes it. In this legacy service, the scheduler never imports job functions: `scheduler/runner.py` reads the YAML files under `deploy/schedules/` and loads each handler at run time from a dotted-path string such as `handler: billing.jobs.close_period`. Some Python modules also import and call job functions directly. The repository has about 2,800 files. Which search approach should the agent use?",
     "options": [
      {
       "id": "A",
       "text": "Grep only the `*.py` files for `close_period`, then Read each hit to confirm whether it is a real call."
      },
      {
       "id": "B",
       "text": "Grep all file types for `close_period`, then Read each hit, code or config, to see how it is invoked."
      },
      {
       "id": "C",
       "text": "Glob for `**/*close_period*`, and treat every file whose name matches as a caller to update first."
      },
      {
       "id": "D",
       "text": "Read `scheduler/runner.py` and follow every import it makes, checking whether `close_period` is reachable."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Grep searches the contents of every file, so a search that is not limited to Python finds both the direct calls and the YAML entries that name the function as a string; Reading each hit then shows how it is invoked. A function's callers are wherever its name appears, not only in code.",
      "wrong": {
       "A": "Limiting Grep to `*.py` finds the direct calls but misses the `deploy/schedules/` YAML entries, the very references the scheduler uses at run time, so the agent could wrongly report the function as unused.",
       "C": "Glob matches file names and paths, not contents. Callers do not have `close_period` in their file names, so this finds nothing useful.",
       "D": "The scheduler loads handlers from strings at run time, so following its imports never reaches `close_period`; reading module by module is also far slower than one content search."
      }
     },
     "studyRef": "Task Statement 2.5 (Grep for content search: find every reference to a function, including in non-code files)"
    },
    {
     "n": 32,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Tracing function usage through layered wrapper modules by enumerating each wrapper's exported names",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You ask the agent to list every caller of `fetch_rates()` in a 1,200-file Python repository before its signature changes. The trace so far:\n\n```\nGrep \"fetch_rates\"  -> pricing/core.py (definition), pricing/__init__.py\nRead pricing/__init__.py\n     from .core import fetch_rates as get_rates\nGrep \"get_rates\"    -> 29 files\n```\n\nThe agent reports 29 callers. An engineer points out that `invoicing/fx.py`, which mentions neither name, also calls the function. One of the 29 hits is `pricing/compat.py`, a module that exists to keep old import names working. What should the agent do to complete the trace?",
     "options": [
      {
       "id": "A",
       "text": "Read wrappers among the hits, such as `compat.py`, list the names each exports, and Grep each, repeating as needed."
      },
      {
       "id": "B",
       "text": "Grep the whole repository for the substring `rates`, and treat every hit as a candidate caller to review by hand."
      },
      {
       "id": "C",
       "text": "Repeat the Grep for `fetch_rates` case-insensitively and include the vendored directories, then merge both result sets."
      },
      {
       "id": "D",
       "text": "Read all 1,200 files so that every indirect use of the function is in context before answering the engineer."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Wrapper tracing applies at every layer: identify all the names a wrapper exports, then search for each. `compat.py` imports `get_rates` and re-exports it under the old names that modules such as `invoicing/fx.py` still use, so the agent must Read each wrapper found in the results, collect its exported names, Grep for them, and repeat until no new aliases appear.",
      "wrong": {
       "B": "A substring search floods the results with unrelated names (`tax_rates`, `exchange_rates`) and still misses aliases that do not contain `rates`, which a compatibility module is free to use.",
       "C": "The original name is not the problem: callers reach the function through aliases, so re-running the same search more broadly returns the same two files.",
       "D": "Reading every file upfront exhausts context and is the opposite of incremental exploration; Read on the wrappers plus targeted Grep answers the question at a fraction of the cost."
      }
     },
     "studyRef": "Task Statement 2.5 (trace usage across wrapper modules: identify all exported names, then search for each)"
    },
    {
     "n": 33,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Selecting Glob for file path patterns and Grep for content search",
     "difficulty": "easy",
     "type": "multi",
     "select": 2,
     "stem": "An engineer asks the agent: \"List all React test files in the monorepo, and tell me which of them still use the deprecated `useLegacyAuth` hook.\" Which TWO tool calls are the most appropriate way to answer? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Grep with the pattern `*.test.tsx` to find the test files."
      },
      {
       "id": "B",
       "text": "Glob with the pattern `**/*.test.tsx` to enumerate the React test files."
      },
      {
       "id": "C",
       "text": "Glob with the pattern `**/useLegacyAuth*` to find files that use the hook."
      },
      {
       "id": "D",
       "text": "Read every file in the repository in order to look for the hook."
      },
      {
       "id": "E",
       "text": "Grep for `useLegacyAuth` to find which files reference the hook."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "Glob is for file path patterns; Grep is for content patterns. Combining them answers both parts with minimal reading.",
      "wrong": {
       "A": "Grep searches file contents, so a filename pattern would not find the files by name.",
       "C": "Glob matches only paths; usage of the hook appears inside file contents, not file names.",
       "D": "Reading everything is wasteful when Grep can find the matches directly."
      }
     },
     "studyRef": "Task Statement 2.5 (Grep vs Glob selection)."
    },
    {
     "n": 34,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Enhancing MCP tool descriptions so the agent does not prefer built-in tools",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You connected an MCP server whose `find_references` tool resolves aliased imports and re-exports and returns file, line, and call type. Its description is just \"Finds references.\" The agent keeps using built-in Grep for \"who calls X?\" questions and misses renamed imports. What is the most effective first step?",
     "options": [
      {
       "id": "A",
       "text": "Remove Grep from the agent's tools so only `find_references` can search callers."
      },
      {
       "id": "B",
       "text": "Move the MCP server from project scope to user scope so that the agent notices it more readily."
      },
      {
       "id": "C",
       "text": "Rewrite the description to say what it resolves (aliases, re-exports), what it returns, and when to prefer it over Grep."
      },
      {
       "id": "D",
       "text": "Add a single line to CLAUDE.md saying \"never use Grep\" so that the agent always chooses the MCP tool."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Tool descriptions are the main way a model chooses between tools. Detailing capabilities and outputs prevents the agent from defaulting to built-in tools such as Grep.",
      "wrong": {
       "A": "Grep is still valuable for plain-text search; removing it is heavy-handed and ignores that a poor description is the problem.",
       "B": "Scope controls who has the server, not how the model chooses between available tools.",
       "D": "This is a blunt, probabilistic workaround that doesn't tell the model when the MCP tool is superior."
      }
     },
     "studyRef": "Task Statement 2.4 (enhancing MCP tool descriptions)."
    },
    {
     "n": 35,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Scoping MCP servers: project .mcp.json with env expansion vs user ~/.claude.json",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your team wants (1) a shared Jira MCP server available to every developer, where each developer authenticates with their own token, and (2) Sam to try an experimental log-analysis MCP server without affecting teammates. Which TWO actions are correct? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Define the Jira server in the project `.mcp.json` and reference the token with `${JIRA_TOKEN}` environment variable expansion."
      },
      {
       "id": "B",
       "text": "Define the Jira server in `.mcp.json` with the token written directly in the file so setup is automatic."
      },
      {
       "id": "C",
       "text": "Add Sam's experimental server to the shared `.mcp.json` and ask teammates to ignore its tools."
      },
      {
       "id": "D",
       "text": "Configure Sam's experimental server in his user-scoped `~/.claude.json`."
      },
      {
       "id": "E",
       "text": "Describe the Jira server under an `mcpServers` heading in `~/.claude/CLAUDE.md`."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "Project `.mcp.json` shares team tooling (with `${ENV_VAR}` for credentials), while `~/.claude.json` holds personal or experimental servers.",
      "wrong": {
       "B": "Committing a literal token exposes a secret in version control; environment variable expansion avoids this.",
       "C": "All configured servers' tools are available simultaneously, so teammates' agents would see and potentially use it.",
       "E": "CLAUDE.md supplies instructions and context; it does not register MCP servers."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP scoping; environment variable expansion)."
    },
    {
     "n": 36,
     "scenario": 4,
     "domain": 2,
     "ts": "2.3",
     "tests": "Restricting each agent's tool set to its role",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your documentation-generation subagent has 18 tools: built-ins (Read, Write, Bash, Grep, Glob) plus 13 MCP tools for Jira, Slack, deployments, and database admin. It sometimes triggers a deploy-status tool or posts in Slack during a docs task, and tool selection has become erratic. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Keep all 18 tools and add a prompt paragraph listing tools not to use."
      },
      {
       "id": "B",
       "text": "Add a router agent that picks the tool for each step."
      },
      {
       "id": "C",
       "text": "Restrict the subagent to the handful of tools its role needs, such as Read, Write, Grep, and Glob."
      },
      {
       "id": "D",
       "text": "Rewrite all 13 MCP tool descriptions to be longer and more detailed."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Too many tools degrades selection reliability. Scoped tool access gives each agent only what it needs for its role, preventing cross-specialization misuse.",
      "wrong": {
       "A": "The agent still has to choose among 18 tools; a prompt prohibition is probabilistic and leaves the decision complexity in place.",
       "B": "This adds an extra layer where a simple scoping of tools is enough.",
       "D": "Better descriptions help, but the root problem is that the agent has many irrelevant tools outside its specialization."
      }
     },
     "studyRef": "Task Statement 2.3 (scoped tool access)."
    },
    {
     "n": 37,
     "scenario": 4,
     "domain": 1,
     "ts": "1.3",
     "tests": "Subagents do not inherit the parent's discovered context; pass run-specific facts explicitly in the Task prompt",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your developer-productivity agent, built on the Agent SDK, is used across about 40 internal repositories. Asked to \"add unit tests for the three parsers in `ingest/`\" in the `ledger-sync` repository, the main agent spends 20 turns learning that tests there run only through `make test-docker` (plain `pytest` fails without a database container) and that `ingest/gen/` is generated code that must never be edited. It then spawns three `test-writer` subagents through the Task tool, each prompted only with \"Write unit tests for `ingest/<file>.py`\". Two report \"test environment broken\" after running `pytest`; the third edits `ingest/gen/schema.py`. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add the `make test-docker` command and the `ingest/gen/` rule to the `test-writer` AgentDefinition's system prompt, so every invocation has them."
      },
      {
       "id": "B",
       "text": "Give `test-writer` the same full tool list as the main agent, so each subagent can explore the repository and rediscover the build setup."
      },
      {
       "id": "C",
       "text": "Raise each `test-writer` subagent's turn limit, so it can work out the test command after `pytest` fails."
      },
      {
       "id": "D",
       "text": "Put the discovered facts (the test command, the `ingest/gen/` restriction, the relevant paths) in each Task prompt."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagents start with isolated context: they do not inherit the 20 turns of discovery the main agent did, so anything they need must be passed explicitly in the Task prompt. These facts are specific to `ledger-sync` and to this run, so the per-invocation prompt is the right place for them. Naming note: the Exam Guide calls the spawning tool Task; current Agent SDK versions name it `Agent`. On the exam, use the guide's name.",
      "wrong": {
       "A": "The AgentDefinition prompt is the same for every invocation in all 40 repositories. `ledger-sync`-specific commands and paths there would be wrong instructions in the other 39; role-wide guidance belongs in the definition, repository facts do not.",
       "B": "Each subagent would repeat the 20-turn discovery, three times over, with no guarantee it reaches the same conclusions, such as not editing generated code. Passing what the main agent already learned is cheaper and more reliable.",
       "C": "More turns do not give the subagent the main agent's findings. It may still never find `make test-docker`, and nothing tells it that `ingest/gen/` is off limits."
      }
     },
     "studyRef": "Task Statement 1.3 (subagent context must be explicitly provided in the prompt; no automatic inheritance)"
    },
    {
     "n": 38,
     "scenario": 4,
     "domain": 1,
     "ts": "1.3",
     "tests": "Requiring Task in allowedTools for a coordinator to invoke subagents",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You defined a `code-explorer` subagent using `AgentDefinition` in your Agent SDK setup, but the main agent never delegates to it. It answers everything itself with Read and Grep. The config is:\n\n```python\noptions = ClaudeAgentOptions(\n    allowed_tools=[\"Read\", \"Grep\", \"Glob\"],\n    agents={\"code-explorer\": AgentDefinition(\n        description=\"Explores unfamiliar codebases...\",\n        prompt=\"You explore code and report findings.\",\n        tools=[\"Read\", \"Grep\", \"Glob\"])},\n)\n```\n\nWhat is the most likely root cause?",
     "options": [
      {
       "id": "A",
       "text": "The subagent's `tools` list must also include `\"Task\"`, so that it can be spawned by the main agent."
      },
      {
       "id": "B",
       "text": "`\"Task\"` is missing from the main agent's `allowed_tools`, so it cannot invoke subagents."
      },
      {
       "id": "C",
       "text": "The agent needs `fork_session` enabled before any subagents can run, since forking creates the child session."
      },
      {
       "id": "D",
       "text": "The subagent prompt is too short, so Claude cannot tell that the subagent exists or what it is for."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The Task tool is the mechanism for spawning subagents, and `allowedTools` must include `\"Task\"` for a coordinator to invoke them. Naming note: the Exam Guide calls this the Task tool. Current Agent SDK versions name it `Agent` in `allowedTools` and in `tool_use` blocks (older versions used `Task`, and it still appears as `Task` in the init tools list). On the exam, use the guide's name.",
      "wrong": {
       "A": "`Task` belongs to the invoking agent's allowed tools, not the subagent's tool list.",
       "C": "`fork_session` creates branches from a shared baseline; it isn't what makes subagent delegation available.",
       "D": "Claude decides based on the description, and regardless the Task tool must be available first."
      }
     },
     "studyRef": "Task Statement 1.3 (Task tool, allowedTools, AgentDefinition)."
    },
    {
     "n": 39,
     "scenario": 4,
     "domain": 1,
     "ts": "1.2",
     "tests": "Implementing iterative refinement loops that re-delegate on coverage gaps",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A coordinator produces codebase onboarding reports through a single pass: explore subagents, then a synthesis subagent. Reviewers find that the data layer and the CI/CD sections are consistently thin because the explorers focused on the web layer. You need better coverage without re-running everything. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Always run the full explore-and-synthesize pipeline twice and merge the two reports into one, so that every area gets a second exploration pass whether or not it was thin."
      },
      {
       "id": "B",
       "text": "After synthesis, the coordinator finds gaps, re-delegates targeted exploration, and re-runs synthesis until coverage suffices."
      },
      {
       "id": "C",
       "text": "Give the synthesis subagent Bash and Grep so it can fill gaps itself while writing, without going back through the coordinator or the exploration subagents."
      },
      {
       "id": "D",
       "text": "Add \"be exhaustive\" to every explorer's prompt and list the data layer and CI/CD as areas each report must cover."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "An iterative refinement loop lets the coordinator evaluate synthesis output for gaps, send targeted queries to the right subagents, and synthesize again until coverage is adequate.",
      "wrong": {
       "A": "This duplicates all the work including areas that were already well covered.",
       "C": "This lets the synthesis agent act outside its role, which encourages tool misuse and bypasses the coordinator's control.",
       "D": "A generic instruction does not direct attention to the specific missing areas."
      }
     },
     "studyRef": "Task Statement 1.2 (iterative refinement loops)."
    },
    {
     "n": 40,
     "scenario": 4,
     "domain": 1,
     "ts": "1.6",
     "tests": "Prompt chaining for a predictable generation task: each step's output feeds the next step",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your developer productivity agent scaffolds every new gRPC endpoint as four files: the `.proto` message definitions, a server handler stub, a typed client wrapper, and unit tests. To finish faster, it issues four parallel generation calls, and each call receives only the engineer's one-line request (for example, \"add an endpoint to pause a subscription with a reason code\"). In 14 of the last 30 endpoints the files disagreed with each other: the proto named the field `reason_code`, the handler read `pause_reason`, and the tests built requests with a third name. The four file types and their order never change. How should the generation be decomposed?",
     "options": [
      {
       "id": "A",
       "text": "Chain the steps: generate the proto first, then pass it as input to the handler, client, and test steps."
      },
      {
       "id": "B",
       "text": "Keep the four parallel calls, and add \"use the same field names in every file\" to each of the prompts."
      },
      {
       "id": "C",
       "text": "Keep the four parallel calls, and regenerate the whole set until all four files compile together."
      },
      {
       "id": "D",
       "text": "Hand the work to an adaptive planner that decides at run time which files to generate, and in what order."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The task is predictable (the same four files in the same order every time), and the later files depend on names fixed in the proto. Prompt chaining runs focused steps in sequence and feeds each step's output into the next, so the handler, client, and tests are generated from the actual proto instead of each call inventing names from the one-line request.",
      "wrong": {
       "B": "Each parallel call still sees only the request, not the names the other calls chose, so an instruction to be consistent has nothing to be consistent with. The missing piece is shared input, not a reminder.",
       "C": "Regenerating until the set happens to agree retries the same flawed design: the calls still cannot see each other's output, so cost grows and agreement stays a matter of chance.",
       "D": "Dynamic decomposition suits open-ended work whose subtasks depend on what is discovered. Here the files and their order are fixed, so an adaptive planner adds cost and variability without creating the data flow between steps that is actually missing."
      }
     },
     "studyRef": "Task Statement 1.6 (prompt chaining: sequential focused steps whose outputs feed the next, for predictable workflows)"
    },
    {
     "n": 41,
     "scenario": 4,
     "domain": 1,
     "ts": "1.7",
     "tests": "Using --resume with session names to continue a specific named investigation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "An engineer is running three investigations with Claude Code in one checkout of the legacy `fulfillment` monolith: a memory leak in the label-printing worker, a tax-rounding bug in invoices, and a dead-code map of `ShipCalc`. Each morning she runs `claude --continue`, which reopens whichever conversation she used last, so about half the time she lands in the wrong investigation and spends 15 minutes steering back. None of the code these investigations touch has changed since. What should she do?",
     "options": [
      {
       "id": "A",
       "text": "Merge the three investigations into one long-running session, so that `--continue` always opens a conversation holding all of them."
      },
      {
       "id": "B",
       "text": "Give each investigation its own named session and reopen the one she needs with `--resume <session-name>`."
      },
      {
       "id": "C",
       "text": "Start a fresh session every morning and paste in a short written summary of the investigation she wants to continue."
      },
      {
       "id": "D",
       "text": "Fork the previous day's conversation with `fork_session` each morning, so each day stays separate."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Named session resumption returns her to a specific prior conversation: one named session per investigation, reopened with `--resume <session-name>`. `--continue` just reopens the most recent conversation, which is why she keeps landing in the wrong one. Because the code is unchanged, the prior context is still valid, so resuming beats starting over.",
      "wrong": {
       "A": "Mixing three unrelated investigations in one session fills its context with irrelevant history and lets findings from one bleed into another; it swaps a navigation problem for a context problem.",
       "C": "Starting fresh with a summary is the right move when prior tool results are stale. Nothing has changed here, so she would throw away valid, detailed context for a lossy summary.",
       "D": "fork_session creates divergent branches from a shared baseline. Using it to continue one line of work creates a chain of forks and still does not pick the right investigation."
      }
     },
     "studyRef": "Task Statement 1.7 (named session resumption with --resume <session-name>)"
    },
    {
     "n": 42,
     "scenario": 4,
     "domain": 3,
     "ts": "3.4",
     "tests": "Starting in direct execution and switching later is wrong when complexity is already stated in the requirements",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A ticket for the legacy `claims-processor` service reads: \"Replace the XML-over-FTP export to Northwind Insurance with their new REST API. Note: the export file is also read by two nightly batch jobs and the audit archiver, and Northwind offers two integration options, push webhooks or polled batch uploads, which need different infrastructure.\" A teammate suggests starting in direct execution on `export/ftp_sender.py` and switching to plan mode if complexity shows up. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Follow the suggestion: start with direct execution on `ftp_sender.py`, since plan mode can still be entered later if needed."
      },
      {
       "id": "B",
       "text": "Use direct execution with detailed instructions that commit to push webhooks, as webhooks are the more modern option."
      },
      {
       "id": "C",
       "text": "Start in plan mode to map the export's consumers and compare the two options before editing, as the ticket states the complexity."
      },
      {
       "id": "D",
       "text": "Hand the whole task to the Explore subagent, which can investigate the export's consumers and then make the edits in its own isolated context."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Starting direct and switching only if complexity emerges is the wrong call when the complexity is already stated in the requirements: three downstream consumers and two integration options with different infrastructure. Plan mode lets Claude explore those dependencies and weigh the options before any change, which avoids costly rework.",
      "wrong": {
       "A": "The ticket already names the shared consumers and the open design choice; starting with edits to one file means discovering those dependencies the expensive way, mid-change.",
       "B": "This settles an architectural choice with different infrastructure requirements without exploring the code or its consumers; detailed instructions assume the right design is already known.",
       "D": "The Explore subagent isolates verbose discovery and returns a summary. It is for investigation, not for making edits, and it does not replace planning the design."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode when complexity is stated up front; don't start direct and switch later)"
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 5,
     "ts": "5.4",
     "tests": "Summarizing key findings from one exploration phase before spawning subagents",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Phase 1 of a legacy-system exploration produced a module map, three high-risk areas, and entry points; the transcript is about 90K tokens. In Phase 2 you spawn three subagents, one per risk area, but each begins by rediscovering the module map and spends much of its budget on it. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Pass the full 90K-token Phase 1 transcript to each of the three subagents."
      },
      {
       "id": "B",
       "text": "Rely on the subagents inheriting the coordinator's conversation by default."
      },
      {
       "id": "C",
       "text": "Spawn the Phase 2 subagents before Phase 1 completes."
      },
      {
       "id": "D",
       "text": "Summarize the Phase 1 key findings and inject the summary into each Phase 2 subagent's initial prompt."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagents do not inherit context. Summarizing one phase's key findings and injecting them into the next phase's prompts preserves what matters at low token cost.",
      "wrong": {
       "A": "This burns each subagent's context on raw exploration noise rather than conclusions.",
       "B": "Subagents have isolated context and do not inherit it.",
       "C": "They would still lack the Phase 1 findings and might duplicate work."
      }
     },
     "studyRef": "Task Statement 5.4 (summaries between exploration phases)."
    },
    {
     "n": 44,
     "scenario": 4,
     "domain": 5,
     "ts": "5.3",
     "tests": "Local recovery of transient failures before propagating errors",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A `search-code` subagent calls an MCP `index_query` tool that times out in about 5% of calls. Currently each timeout immediately fails the subagent and the coordinator receives only \"search failed.\" What is the best error handling design?",
     "options": [
      {
       "id": "A",
       "text": "Propagate every timeout to the coordinator immediately with the raw exception text."
      },
      {
       "id": "B",
       "text": "After the retries fail, return an empty result marked successful so the workflow keeps going."
      },
      {
       "id": "C",
       "text": "Have the coordinator discard the subagent's partial output and restart the whole task on any timeout."
      },
      {
       "id": "D",
       "text": "Retry transient timeouts locally; if they persist, return the failure type, attempted query, partial results, and alternatives to the coordinator."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagents should handle transient failures locally and propagate only unresolved errors with structured context (failure type, attempted query, partial results, alternatives).",
      "wrong": {
       "A": "Routine transient failures should be handled locally; propagating all of them adds noise and loses structure.",
       "B": "Suppressing the failure as a success hides the gap and prevents informed coordinator decisions.",
       "C": "This wastes partial results and work already completed."
      }
     },
     "studyRef": "Task Statement 5.3 (local recovery; structured error context)."
    },
    {
     "n": 45,
     "scenario": 4,
     "domain": 5,
     "ts": "5.4",
     "tests": "Designing crash recovery using state exports and a manifest",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A long-running multi-agent analysis with six subagents crashed after three hours, and the restart began from scratch, repeating completed work. You need crash recovery. What design is best?",
     "options": [
      {
       "id": "A",
       "text": "Rely on the coordinator's in-memory state and re-run the same prompt after a crash, expecting the model to pick up from where it left off."
      },
      {
       "id": "B",
       "text": "Each agent exports its state to a known location; on resume the coordinator loads a manifest and injects that state into the agent prompts."
      },
      {
       "id": "C",
       "text": "Re-run every subagent from the start and deduplicate the combined findings afterward."
      },
      {
       "id": "D",
       "text": "Ask the subagents to remember what they finished, since they retain their context between runs, so they can report it to the coordinator on restart."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Crash recovery relies on structured state persistence: agents export state to known locations, and the coordinator loads a manifest on resume and injects state into prompts.",
      "wrong": {
       "A": "In-memory state is lost in a crash.",
       "C": "This repeats all the work, which is what you are trying to avoid.",
       "D": "Subagents do not share memory between invocations."
      }
     },
     "studyRef": "Task Statement 5.4 (structured state persistence and manifests)."
    },
    {
     "n": 46,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Setting tool_choice: any to guarantee structured output when document type is unknown",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline ingests invoices, receipts, and purchase orders and offers three extraction tools: `extract_invoice`, `extract_receipt`, and `extract_po`. The document type is not known in advance. With `tool_choice: {\"type\": \"auto\"}`, about 8% of responses are conversational text instead of a tool call. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Force `extract_invoice` with `{\"type\": \"tool\", \"name\": \"extract_invoice\"}` so that every response is structured output."
      },
      {
       "id": "B",
       "text": "Keep `\"auto\"` and add \"always respond using a tool, never plain text\" to the system prompt as a reminder."
      },
      {
       "id": "C",
       "text": "Set `tool_choice` to `\"any\"` so a tool call is guaranteed while the model picks the schema."
      },
      {
       "id": "D",
       "text": "Keep `\"auto\"` and parse the JSON out of the text replies with a regex fallback when no tool call is returned."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`\"any\"` guarantees that a tool is called while letting the model pick which schema fits, ideal when multiple extraction schemas exist and the document type is unknown. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "Forcing a single tool would apply the invoice schema to receipts and purchase orders.",
       "B": "This is probabilistic; `tool_choice` gives a guarantee.",
       "D": "Parsing free text reintroduces the syntax errors that tool use eliminates."
      }
     },
     "studyRef": "Task Statement 4.3 (tool_choice auto vs any vs forced)."
    },
    {
     "n": 47,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Forcing a specific tool to run first",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your workflow must run `extract_metadata` (document type, language, page count) on every document before any enrichment tool such as `extract_line_items` or `lookup_vendor`. With `tool_choice: \"any\"`, the model sometimes jumps straight to `extract_line_items`, and downstream steps then lack metadata. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Keep `\"any\"` and add a system prompt instruction that `extract_metadata` must always be called first, and fail the request if the first tool call is anything else."
      },
      {
       "id": "B",
       "text": "Merge all of the enrichment tools into `extract_metadata`, so that one call does all the extraction."
      },
      {
       "id": "C",
       "text": "Force `extract_metadata` first with `tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"}`, then run enrichment in follow-up turns."
      },
      {
       "id": "D",
       "text": "Switch to `\"auto\"` so that the model can choose the most sensible first step for each document."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Forced tool selection ensures a specific tool runs first (such as metadata extraction before enrichment), with subsequent steps processed in follow-up turns. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "A prompt instruction is probabilistic; forced tool selection guarantees the order for that first call.",
       "B": "This creates a bloated tool and sacrifices the staged workflow instead of ensuring the order.",
       "D": "`\"auto\"` allows even less control and may produce text instead of a tool call."
      }
     },
     "studyRef": "Task Statement 4.3 (forced tool_choice)."
    },
    {
     "n": 48,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Designing optional/nullable fields to prevent fabrication",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your invoice schema marks `po_number` as a required string. For invoices that don't contain a PO number, the model returns values such as \"N/A\" or a made-up \"PO-0000\", which then pollute the downstream matching system. What is the best schema change?",
     "options": [
      {
       "id": "A",
       "text": "Keep the field required and tell the model to use \"UNKNOWN\" when absent."
      },
      {
       "id": "B",
       "text": "Add a regex check rejecting \"N/A\" and \"PO-0000\", then retry up to three times."
      },
      {
       "id": "C",
       "text": "Remove `po_number` from the schema and have a clerk fill it in manually."
      },
      {
       "id": "D",
       "text": "Make `po_number` optional and nullable, and tell the model to return null when the document has none."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When source documents may lack information, fields should be optional or nullable so the model can return null instead of fabricating values to satisfy a required field.",
      "wrong": {
       "A": "A sentinel string still forces a value and downstream systems must treat it specially.",
       "B": "If the document has no PO number, retries cannot produce the missing information and will likely produce another fabrication.",
       "C": "This gives up automation for a field that the model handles well when it is present."
      }
     },
     "studyRef": "Task Statement 4.3 (nullable fields prevent fabrication)."
    },
    {
     "n": 49,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Adding enum values like \"unclear\" and \"other\" + detail for extensible categorization",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The `document_category` enum has four values: `invoice`, `receipt`, `purchase_order`, `credit_note`. New document types such as customs declarations and account statements are being forced into the nearest value, and some scanned pages are genuinely ambiguous. What is the best schema evolution?",
     "options": [
      {
       "id": "A",
       "text": "Add `\"other\"` with a companion `category_detail` string and an `\"unclear\"` value for ambiguous documents."
      },
      {
       "id": "B",
       "text": "Change `document_category` to a free-form string and let the model write whatever label fits each document it sees."
      },
      {
       "id": "C",
       "text": "Keep the enum and add a new value each month as new document types show up in production, shipping a schema update each time."
      },
      {
       "id": "D",
       "text": "Drop the field and infer the category from the file name instead."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Enums with `\"other\"` plus a detail field handle extensible categories, and `\"unclear\"` captures ambiguous cases without forcing a wrong label.",
      "wrong": {
       "B": "Free-form values lose normalization and break downstream consumers that rely on a fixed set.",
       "C": "The enum would still force misclassification until a release, and ambiguous documents would remain unaddressed.",
       "D": "File names are unreliable and discard the model's reading of the actual content."
      }
     },
     "studyRef": "Task Statement 4.3 (enum with other + detail; unclear)."
    },
    {
     "n": 50,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Identifying when retries will be ineffective versus effective",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "About 6% of extractions fail validation. Two representative failures: (a) `due_date` was returned as \"03/04/2025\" but the schema requires ISO 8601; (b) `vendor_tax_id` is missing, and the single-page invoice says only \"tax ID on file with accounts payable.\" What is the best handling strategy?",
     "options": [
      {
       "id": "A",
       "text": "Retry both failures up to three times with the same instructions until validation passes, on the grounds that the second attempt will find the missing tax ID."
      },
      {
       "id": "B",
       "text": "Retry (b) at a higher temperature to encourage the model to find the tax ID."
      },
      {
       "id": "C",
       "text": "Retry (a) with the document, failed extraction, and format error; for (b), leave the field null and route it for follow-up."
      },
      {
       "id": "D",
       "text": "Skip retries entirely and send both failures to human reviewers for manual correction, because neither failure can be corrected automatically."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Retry with error feedback works for format and structural errors but is ineffective when the required information is absent from the source.",
      "wrong": {
       "A": "Retrying (b) cannot succeed because the information is not in the document.",
       "B": "The data is absent; variation just risks a fabricated value.",
       "D": "Format mismatches like (a) are cheaply fixable via retry with error feedback, so human time is wasted."
      }
     },
     "studyRef": "Task Statement 4.4 (limits of retry)."
    },
    {
     "n": 51,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Designing self-correction validation: calculated_total vs stated_total and conflict_detected",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Extractions pass JSON schema validation, but in about 3% of invoices the sum of `line_items[].amount` does not equal `total`. In some cases the model mis-read a line; in others, the source document itself contains an arithmetic error. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Turn on strict schema mode so that the totals must be consistent for the output to be accepted, and rely on it to reject records whose line items do not sum to the total."
      },
      {
       "id": "B",
       "text": "Tell the model \"make sure the totals match\" and drop the validation step."
      },
      {
       "id": "C",
       "text": "Extract `stated_total` and `calculated_total` plus a `conflict_detected` boolean, and route mismatches for retry or review."
      },
      {
       "id": "D",
       "text": "Remove `line_items` from the schema and extract only `total`, which avoids any mismatch."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Semantic errors (values not summing) are not caught by schema validity. Extracting calculated and stated values and flagging conflicts exposes discrepancies for appropriate handling.",
      "wrong": {
       "A": "Strict schemas eliminate syntax errors but cannot enforce semantic relationships such as sums.",
       "B": "The model may alter numbers to force a match, hiding source errors and misreads.",
       "D": "This discards the data needed downstream and does not resolve the discrepancy."
      }
     },
     "studyRef": "Task Statement 4.4 (semantic validation; calculated_total/conflict_detected)."
    },
    {
     "n": 52,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Designing retry-with-error-feedback loops",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "You are designing the validation-retry loop for your extraction service. Which TWO design choices are correct? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Re-send the original prompt unchanged at a higher temperature until validation passes."
      },
      {
       "id": "B",
       "text": "Send only the validation error message, without the document or the failed output."
      },
      {
       "id": "C",
       "text": "Send a follow-up request containing the original document, the failed extraction, and the specific validation errors."
      },
      {
       "id": "D",
       "text": "Retry every failure up to ten times and accept the last attempt."
      },
      {
       "id": "E",
       "text": "Retry only errors the source document could plausibly resolve (format or structure), and route missing-information cases to null handling or human review."
      }
     ],
     "answer": [
      "C",
      "E"
     ],
     "explanation": {
      "correct": "Retry works best when the model sees the source, its failed attempt, and the exact error; it is ineffective for absent information.",
      "wrong": {
       "A": "Without error feedback the model has no guidance, and repeated sampling is wasteful.",
       "B": "The model cannot correct the extraction without the source and its previous attempt.",
       "D": "Many failures are not recoverable by retry, and accepting the last attempt could pass bad data."
      }
     },
     "studyRef": "Task Statement 4.4 (retry-with-error-feedback)."
    },
    {
     "n": 53,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples should cover each document structure the extractor meets",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You extract `lot_number`, `assay_percent`, and `test_results` from suppliers' certificates of analysis. The prompt has three few-shot examples, all single-lot certificates with a results table, and accuracy on that layout is 97%. On certificates that report results in sentences (\"Assay by HPLC: 99.2%, meets specification\"), `test_results` comes back empty 38% of the time, and on multi-lot certificates, values from one lot are attached to another. Which revision to the examples is most effective?",
     "options": [
      {
       "id": "A",
       "text": "Add six more single-lot tabular examples with harder values, so that the model gets more extraction practice before it reads each document."
      },
      {
       "id": "B",
       "text": "Remove the examples and describe every certificate layout in detail in the instructions, since examples bias the model toward tables."
      },
      {
       "id": "C",
       "text": "Convert every certificate into one standard table with a parser per supplier before extraction, so the existing examples match every input."
      },
      {
       "id": "D",
       "text": "Swap two of the tabular examples for a narrative certificate and a multi-lot certificate, each shown with its correct output."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The failures line up with the layouts the examples never show. Few-shot examples should demonstrate the varied document structures the system meets, so replacing redundant table examples with a narrative certificate and a multi-lot certificate shows how to extract from each, without growing the prompt.",
      "wrong": {
       "A": "More examples of the layout that already works at 97% add nothing for narrative or multi-lot certificates, which is where the errors are.",
       "B": "Instructions alone are what tend to give inconsistent results; examples are the stronger tool. The bias comes from showing only one layout, not from using examples.",
       "C": "A parser per supplier is heavy engineering for a problem the right examples address, and it would break on every new supplier format."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples demonstrating varied document structures)"
    },
    {
     "n": 54,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples to address empty/null extraction of required information",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "For research papers, the `sample_size` field comes back null for about 20% of documents, yet manual review shows the number is stated in narrative text (\"we recruited 214 participants across three sites\") rather than in a table. The prompt says to look for the sample size. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Make `sample_size` a required field, so that the model is forced to find a value in every paper."
      },
      {
       "id": "B",
       "text": "Add a regex pass for numbers followed by \"participants\" after the extraction has finished."
      },
      {
       "id": "C",
       "text": "Add few-shot examples that show extracting `sample_size` from narrative text, tables, and footnotes."
      },
      {
       "id": "D",
       "text": "Tell the model to think harder and search the entire paper before answering."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Few-shot examples showing extraction from documents with varied formats address empty or null extraction when the information is present in other forms.",
      "wrong": {
       "A": "Required fields encourage fabrication when a value is truly absent and don't teach the model where to find it.",
       "B": "A regex covers only pre-specified phrasing and misses variants like \"N = 214\" or \"two hundred fourteen\".",
       "D": "This is a vague instruction; examples demonstrate where and how to extract it."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot to reduce null extraction)."
    },
    {
     "n": 55,
     "scenario": 6,
     "domain": 4,
     "ts": "4.1",
     "tests": "Writing specific categorical criteria instead of confidence-based filtering",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your extraction prompt tells the model: \"Set `needs_review` to true when you are not highly confident.\" The flag is true on 38% of documents, and reviewers report that most are fine, so they've started ignoring it. What is the best improvement?",
     "options": [
      {
       "id": "A",
       "text": "Change the prompt to \"only flag when you are very highly confident that there is a problem\", so the model reports only the most obvious problems to reviewers."
      },
      {
       "id": "B",
       "text": "Use explicit categorical criteria: flag only for unreconciled totals, a missing or illegible identifier, or conflicting values for a field."
      },
      {
       "id": "C",
       "text": "Have the model output a 0-100 confidence number and flag anything below 70."
      },
      {
       "id": "D",
       "text": "Add a second Claude call that re-judges every flag raised by the first call before it is shown to reviewers, with the second call also deciding what reviewers see."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Explicit criteria defining exactly what to report improve precision; general instructions to be conservative or confident do not, and false positives erode trust.",
      "wrong": {
       "A": "General confidence wording does not improve precision; the model has no concrete boundary to apply.",
       "C": "Self-reported confidence is poorly calibrated, and the threshold is arbitrary.",
       "D": "Adding another model layer is over-engineered before the criteria themselves are made explicit."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit criteria vs vague confidence filtering)."
    },
    {
     "n": 56,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "Handling batch failures by custom_id with appropriate modifications",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You submitted a Message Batches job of 10,000 documents. Results: 9,640 succeeded; 360 failed. Of the failures, 340 exceeded the context limit (very long contracts) and 20 were transient server errors. What is the best next step?",
     "options": [
      {
       "id": "A",
       "text": "Resubmit the entire batch of 10,000 documents to be safe and keep results consistent, so that all documents come from one consistent run."
      },
      {
       "id": "B",
       "text": "Use `custom_id` to find failures, chunk the 340 oversized documents, and resubmit only those plus the 20 transient failures."
      },
      {
       "id": "C",
       "text": "Resubmit the 360 failed requests unchanged in a new batch."
      },
      {
       "id": "D",
       "text": "Move all 10,000 documents to the synchronous API so that no failures can occur."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Batch failures are identified by `custom_id`; resubmit only failed items, with modifications (such as chunking) where the cause requires it.",
      "wrong": {
       "A": "This pays again for the 9,640 successes.",
       "C": "The oversized documents will fail again without chunking.",
       "D": "This loses the batch discount for the majority that succeeded, and it still wouldn't fix over-limit documents."
      }
     },
     "studyRef": "Task Statement 4.5 (custom_id, failure handling)."
    },
    {
     "n": 57,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "Deriving the guaranteed end-to-end latency from a fixed batch submission schedule plus pre- and post-processing",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Scanned bills of lading go through OCR, which takes up to 3 hours, before they are eligible for extraction. Eligible documents are submitted to the Message Batches API at 00:00, 08:00, and 16:00 each day. After a batch ends, a loader writes its results to the customs system within 1 hour. Sales wants to promise customers a delivery time measured from the moment a document is uploaded. Ignoring failed requests, what is the shortest delivery time you can guarantee with this schedule?",
     "options": [
      {
       "id": "A",
       "text": "25 hours: up to 24 hours of batch processing plus up to 1 hour for the loader to write the results."
      },
      {
       "id": "B",
       "text": "33 hours: up to 8 hours waiting for the next submission, 24 hours of processing, and the 1-hour load."
      },
      {
       "id": "C",
       "text": "36 hours: up to 3 hours of OCR, up to 8 hours waiting for a submission, 24 of processing, and 1 to load."
      },
      {
       "id": "D",
       "text": "28 hours: 3 hours of OCR, 24 of processing, and 1 to load, because submissions run several times every day."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Worst case: OCR takes the full 3 hours and the document becomes eligible just after a submission, so it waits 8 hours for the next one; the batch can take up to 24 hours (there is no shorter guarantee); then the load takes up to 1 hour. 3 + 8 + 24 + 1 = 36 hours is the shortest time you can promise.",
      "wrong": {
       "A": "It ignores both the OCR step and the wait for the next submission window, which a document arriving at the wrong moment will hit.",
       "B": "It counts the submission wait but forgets that OCR must finish before a document can join a batch.",
       "D": "Frequent submissions shorten the wait but do not remove it: a document that becomes eligible just after 08:00 waits until 16:00."
      }
     },
     "studyRef": "Task Statement 4.5 (calculating guaranteed latency from submission frequency and the 24-hour processing window)"
    },
    {
     "n": 58,
     "scenario": 6,
     "domain": 4,
     "ts": "4.6",
     "tests": "Using an independent review instance with per-finding confidence for review routing",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After extracting fields from a contract, the same session is asked to \"double-check your extraction,\" and it confirms nearly everything; a later audit shows 9% of extractions still contained errors. You want a more effective verification step that also lets you prioritize limited reviewer time. What should you build?",
     "options": [
      {
       "id": "A",
       "text": "A second, independent Claude instance without the generator's reasoning context that checks the extraction against the source and outputs per-finding confidence."
      },
      {
       "id": "B",
       "text": "Ask the same session to re-verify its extraction with extended thinking enabled, before accepting the first version it produced."
      },
      {
       "id": "C",
       "text": "Run the original extraction three times and accept values that agree in at least two runs, and use the most frequent value for each field."
      },
      {
       "id": "D",
       "text": "Give the extraction session a larger context window so that it can re-read the whole contract, as a way of improving how it reviews its own output."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Independent review instances are more effective than same-session self-review; per-finding confidence output enables routing review attention.",
      "wrong": {
       "B": "The session retains its generation reasoning and is less likely to question its own decisions.",
       "C": "Consensus voting can suppress real findings that only some runs catch.",
       "D": "A larger window does not address the bias of reviewing its own output."
      }
     },
     "studyRef": "Task Statement 4.6 (independent instances; confidence-based routing)."
    },
    {
     "n": 59,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Validating accuracy by document type and field; stratified sampling of high-confidence extractions",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your audit of 2,000 documents shows 97% overall field-level accuracy. A proposal would auto-approve extractions the model rates high-confidence and eliminate human review for them. Which TWO actions should you take before adopting this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Break accuracy down by document type and by field to confirm performance is consistent across segments."
      },
      {
       "id": "B",
       "text": "Approve the proposal because 97% is above the team's 95% target."
      },
      {
       "id": "C",
       "text": "Raise the confidence threshold until the aggregate accuracy reaches 99%."
      },
      {
       "id": "D",
       "text": "Ask the model to rate its overall confidence once per batch and approve batches that score highly."
      },
      {
       "id": "E",
       "text": "Continuously sample high-confidence extractions with stratified random sampling to measure error rates and catch new error patterns."
      }
     ],
     "answer": [
      "A",
      "E"
     ],
     "explanation": {
      "correct": "Aggregate accuracy can mask weak segments; segment analysis plus stratified sampling validates automation and surfaces novel errors.",
      "wrong": {
       "B": "A single aggregate can hide poor performance on specific document types or fields.",
       "C": "This tunes to an aggregate and still doesn't show segment-level failures.",
       "D": "Batch-level self-rating is too coarse and poorly calibrated to detect field-level errors."
      }
     },
     "studyRef": "Task Statement 5.5 (aggregate masking; stratified sampling)."
    },
    {
     "n": 60,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Calibrating field-level confidence thresholds with labeled validation sets",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The model outputs a confidence score per field. Reviewers can inspect about 10% of fields. On a labeled validation set, fields scored >= 0.90 are 99% accurate for `total_amount` but only 71% accurate for `handwritten_notes`. The team uses a single global threshold of 0.90. What is the best improvement?",
     "options": [
      {
       "id": "A",
       "text": "Keep the global 0.90 threshold, since the model reports that value as its confidence."
      },
      {
       "id": "B",
       "text": "Randomly select 10% of all fields for review regardless of their confidence scores."
      },
      {
       "id": "C",
       "text": "Calibrate a review threshold per field on the labeled validation set, and route fields below their calibrated threshold to reviewers."
      },
      {
       "id": "D",
       "text": "Ask the model to explain its confidence in a sentence for each field, and trust the explanations."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Field-level confidence is only useful once calibrated on labeled data; thresholds differ per field, and reviewer capacity should go where calibrated confidence is low.",
      "wrong": {
       "A": "The validation data shows the same score means different accuracy per field; raw scores are not calibrated.",
       "B": "Random selection ignores the information in the confidence scores, spending reviewers on fields that are already reliable.",
       "D": "Explanations are not calibration; they don't tell you the empirical accuracy at a given score."
      }
     },
     "studyRef": "Task Statement 5.5 (field-level confidence calibration)."
    }
   ]
  },
  {
   "id": "exam4",
   "title": "Mock Exam 4",
   "scenarioIds": [
    1,
    3,
    5,
    6
   ],
   "questions": [
    {
     "n": 1,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "A prerequisite gate must open on a returned verified customer ID, not on the verification call having been made",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your prerequisite check lets `process_refund` run if the session's tool-call log contains a `get_customer` call. An audit finds 37 refunds issued on accounts that never passed verification. In every case the model emitted `get_customer` and `process_refund` as two `tool_use` blocks in the same response, your executor ran both, and `get_customer` returned:\n```json\n{\"verified\": false, \"reason\": \"postcode_mismatch\"}\n```\nWhat is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Allow `process_refund` only after an earlier `get_customer` result has actually returned a verified customer ID."
      },
      {
       "id": "B",
       "text": "Run each response's `tool_use` blocks strictly in the order listed, so `get_customer` finishes before `process_refund` starts."
      },
      {
       "id": "C",
       "text": "Add a system-prompt rule forbidding `get_customer` and `process_refund` in one response, with an example of waiting."
      },
      {
       "id": "D",
       "text": "Force `get_customer` with `tool_choice` on the first request of each conversation, so verification runs before any refund."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The gate checks the wrong condition: that verification was attempted, not that it succeeded. A prerequisite should block `process_refund` until `get_customer` has actually returned a verified customer ID, which also blocks a refund requested in the same response as the lookup, because no verified result exists yet. Current-docs note: forced `tool_choice` (`\"any\"` and `\"tool\"`) is rejected by Opus 5.5, Sonnet 5.5 and Fable 5.1, which use `\"auto\"` plus explicit instructions; the guide's semantics are used here.",
      "wrong": {
       "B": "Sequential execution fixes ordering, but in these cases verification ran and failed; the refund still executes right after the failed check because nothing inspects the result.",
       "C": "A prompt rule is probabilistic, and even when followed it does not stop a refund after a failed verification; the gate condition is what is wrong.",
       "D": "Forced `tool_choice` applies only to the request it is set on and says nothing about whether verification succeeded; here `get_customer` did run and returned `verified: false`."
      }
     },
     "studyRef": "Task Statement 1.4 (programmatic prerequisites that block downstream tools until a verified customer ID is returned)"
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "PostToolUse hooks translate each tool's numeric status codes into consistent named values",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your system prompt contains a decode table for the `status` codes `lookup_order` returns (`1` placed, `2` packed, `3` shipped, `4` delivered). Last month you connected `get_payment_events`, owned by the payments team, which returns `state` codes on its own scale (`1` authorized, `2` captured, `3` refunded, `4` charged back). Since then the agent has told several customers whose payment `state` was `3` that their refund \"has shipped\", and told a customer with a chargeback that the order \"was delivered\". Neither team can change its tool's output this quarter. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a second decode table for payment codes to the system prompt, under its own heading, directly below the order-status table."
      },
      {
       "id": "B",
       "text": "Have the model first state which tool each code came from before interpreting it, as a short reasoning step written at the start of each turn."
      },
      {
       "id": "C",
       "text": "Add `PostToolUse` hooks that replace each tool's codes with named values, such as `payment_state: \"refunded\"`, before the model sees them."
      },
      {
       "id": "D",
       "text": "Expose a `decode_status` tool the agent can call with a code and a tool name whenever it is unsure what a returned code means."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Two tools reuse the same numbers with different meanings, and the model is decoding them from a prompt table. A `PostToolUse` hook per tool translates the codes into explicit named values before the model processes the result, so nothing is left to misread, and neither tool's owner has to change anything.",
      "wrong": {
       "A": "A second table of the same numbers raises the chance of applying the wrong one; decoding still depends on the model choosing correctly every time.",
       "B": "This is still probabilistic interpretation of ambiguous numbers; it adds tokens to every turn without guaranteeing the right table is applied.",
       "D": "The agent is confidently wrong rather than unsure, so it would rarely call the tool; deterministic translation should not depend on the model deciding to ask."
      }
     },
     "studyRef": "Task Statement 1.5 (PostToolUse hooks normalizing heterogeneous formats, including numeric status codes)"
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Structured handoffs keep root cause and recommended action so humans can act immediately",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Escalated billing disputes reach human agents through `escalate_to_human` with `customer_id`, `order_id`, `disputed_amount`, `root_cause`, and `recommended_action`. Humans cannot see the chat transcript, and a human always approves the final outcome. A compliance reviewer proposes removing the agent's analysis fields so humans form an independent judgment. Last month humans accepted the recommended action unchanged in 88% of 2,400 escalations, at a median of 3.5 minutes. In a one-week pilot without `recommended_action` (root cause kept), the median rose to 10 minutes, nearly all of it spent choosing between refund, partial credit, and replacement. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Remove both fields as proposed, because the human makes the final decision and the identifiers are enough to look up everything else."
      },
      {
       "id": "B",
       "text": "Keep both fields: the human still approves every outcome, and the analysis lets them act without redoing work they cannot see."
      },
      {
       "id": "C",
       "text": "Keep `root_cause` but remove `recommended_action`, so humans get the diagnosis without being anchored on one outcome."
      },
      {
       "id": "D",
       "text": "Keep both fields but hide them until the human has entered a decision, then show them so the two can be compared."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A structured handoff carries the root cause and a recommended action so the human, who lacks the transcript, can act immediately. Human approval of every outcome already preserves human judgment, and the pilot shows that removing the recommendation alone nearly tripled handle time, all of it spent on the decision the recommendation supports.",
      "wrong": {
       "A": "Identifiers let a human re-run lookups but not recover the agent's diagnosis or options, which live in a transcript they cannot see; this recreates the re-investigation a handoff exists to avoid.",
       "C": "The pilot already tested this configuration: with root cause kept and the recommendation removed, the median rose from 3.5 to 10 minutes.",
       "D": "Hiding the recommendation until the human decides recreates the pilot condition for the decision step, so it brings the time cost back; approval already guards against blind acceptance."
      }
     },
     "studyRef": "Task Statement 1.4 (handoff protocols with customer details, root cause analysis, and recommended actions)"
    },
    {
     "n": 4,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "Tool descriptions should cover edge cases and boundaries, not only the typical request",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Tool selection is 97% correct overall with these descriptions:\n\n- `get_customer`: \"Returns the profile for a customer ID (`C-` plus 8 digits) or account email.\"\n- `lookup_order`: \"Returns items, payment, and shipping status for an order number (`ORD-` plus 8 digits).\"\n\nGuest-checkout orders (18% of orders) have no customer account, but `lookup_order` can retrieve them from the order number plus the checkout email. In guest conversations the agent calls `get_customer` with the email, gets \"no customer found\", and escalates 64% of them without ever calling `lookup_order`. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Add six few-shot examples of guest-checkout conversations to the system prompt that show the agent going straight to `lookup_order`."
      },
      {
       "id": "B",
       "text": "Change `get_customer` to fall back to the order database when no account exists and return the guest's orders in its response."
      },
      {
       "id": "C",
       "text": "Add a programmatic prerequisite that blocks `escalate_to_human` until `lookup_order` has been called in the conversation."
      },
      {
       "id": "D",
       "text": "Document the guest case in both descriptions: no account exists, so use `lookup_order` with order number and email."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Selection already works for typical requests; it fails on an edge case neither description mentions. Tool descriptions should cover edge cases and boundaries: `lookup_order` accepts the order number plus checkout email for guest orders, and `get_customer` has no record of guests. That is a small, direct fix at the mechanism the model uses to choose tools.",
      "wrong": {
       "A": "Few-shot examples add tokens to every conversation while the descriptions stay silent on the case, so the model still has no description-level reason to pick `lookup_order` for guests. Fix the descriptions first.",
       "B": "This blurs the boundary between the tools, giving `get_customer` an order-lookup role that overlaps `lookup_order`, and costs backend work when a description change closes the actual gap.",
       "C": "This enforces an ordering, not understanding: it blocks legitimate escalations that involve no order, and the agent still does not know that guest orders are found by order number plus email."
      }
     },
     "studyRef": "Task Statement 2.1 (include input formats, example queries, edge cases, and boundaries in tool descriptions)"
    },
    {
     "n": 5,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Distinguishing access failures from valid empty results",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`lookup_order` catches all backend exceptions and returns `{\"orders\": []}`. Customers whose orders exist are being told \"you have no orders on file\" whenever the order database times out. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Keep returning an empty list but instruct the agent in the system prompt to double-check any \"no orders\" answer by asking the customer to confirm."
      },
      {
       "id": "B",
       "text": "Return a generic `Operation failed` error for both timeouts and genuinely empty results."
      },
      {
       "id": "C",
       "text": "Have the agent call `lookup_order` three times whenever it receives an empty list."
      },
      {
       "id": "D",
       "text": "Return an empty success only for a true no-match; for timeouts return `isError: true`, `errorCategory: \"transient\"`, `isRetryable: true`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Valid empty results (successful query, no matches) must be distinguishable from access failures. Structured error metadata lets the agent retry transient failures instead of reporting a false \"no orders\".",
      "wrong": {
       "A": "This treats the symptom, relies on prompt compliance, and still gives the agent a result that conceals a failed query.",
       "B": "Uniform generic errors prevent recovery decisions: the agent cannot tell whether to retry, ask for another identifier, or report no orders.",
       "C": "Blind retries waste calls for the many true-empty cases and still cannot tell a timeout from an empty result."
      }
     },
     "studyRef": "Task Statement 2.2 (+ access failures versus valid empty results)"
    },
    {
     "n": 6,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Structured business-error responses with non-retryable flags and customer-friendly explanations",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "`process_refund` rejects refunds for orders older than 60 days. It currently returns `isError: true` with the text \"Refund failed\". In logs, the agent retries the call three times and then gives customers a vague apology. Which TWO changes best fix this behavior? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Return structured error metadata for policy rejections, such as `errorCategory: \"business\"` and `isRetryable: false`."
      },
      {
       "id": "B",
       "text": "Wrap every tool call in the agent loop with exponential backoff retries for any error."
      },
      {
       "id": "C",
       "text": "Include a customer-friendly explanation in the error (for example, that the 60-day window ended on a specific date) so the agent can communicate it and offer alternatives or escalation."
      },
      {
       "id": "D",
       "text": "Add a system prompt rule: never retry `process_refund` under any circumstances."
      },
      {
       "id": "E",
       "text": "Change the response to a generic `Operation failed - please contact support` so internal policy details are never exposed to the agent."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "Marking the failure as a non-retryable business-rule violation stops the wasted retries and tells the agent this is a policy decision, not a transient fault. A human-readable, policy-specific explanation lets the agent respond accurately instead of apologizing vaguely.",
      "wrong": {
       "B": "Retrying a deterministic policy rejection can never succeed. Blanket retries are only appropriate for transient errors.",
       "D": "A blanket no-retry rule would also stop retries of genuine transient failures, and it still leaves the agent without an explanation to give the customer.",
       "E": "A more generic message removes exactly the information the agent needs to choose a recovery path and talk to the customer."
      }
     },
     "studyRef": "Task Statement 2.2 (+ transient vs validation vs business vs permission errors; retryable flag)"
    },
    {
     "n": 7,
     "scenario": 1,
     "domain": 2,
     "ts": "2.3",
     "tests": "Using forced tool_choice so a specific tool is called first, then processing later steps in follow-up turns",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Every conversation must begin with a structured triage call to `classify_request` (issue type, urgency, any IDs mentioned) before any backend lookup. With `tool_choice: \"auto\"`, 7% of conversations skip it: the agent jumps straight to `get_customer` or replies with plain text. Which configuration fixes this without breaking the rest of the workflow?",
     "options": [
      {
       "id": "A",
       "text": "Set `tool_choice: \"any\"` on the first request."
      },
      {
       "id": "B",
       "text": "Force `tool_choice: {\"type\": \"tool\", \"name\": \"classify_request\"}` on the first request only, then use `\"auto\"` for the following turns in the loop."
      },
      {
       "id": "C",
       "text": "Add a bold instruction to the system prompt: \"Your first action must always be `classify_request`.\""
      },
      {
       "id": "D",
       "text": "Force `classify_request` on every request in the loop so it can never be skipped."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Forced tool selection guarantees `classify_request` runs first. Switching back to `auto` afterward lets the agent call the backend tools and eventually end its turn. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "`any` guarantees some tool call but not which one, so the agent could still call `get_customer` first.",
       "C": "This is prompt-based and probabilistic, which is the mechanism already failing 7% of the time.",
       "D": "Forcing the same tool on every turn would prevent the agent from calling other tools or ever finishing with a final answer."
      }
     },
     "studyRef": "Task Statement 2.3 (+ tool_choice auto vs any vs forced)"
    },
    {
     "n": 8,
     "scenario": 1,
     "domain": 2,
     "ts": "2.4",
     "tests": "Enhancing an MCP tool's description so the agent stops preferring built-in Grep over a more capable MCP tool",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Besides its four MCP tools, your support agent has the built-in Read and Grep tools over `kb/`, a folder of help-center articles it uses for how-to questions. The policy team added an MCP tool, `get_return_policy`, that takes an order ID and returns the return rules for that order's purchase date, region, and membership tier, including exception clauses. Its description is \"Returns policy text.\" The system prompt already says to prefer policy tools for policy questions. On return-eligibility questions the agent still greps `kb/` for \"return window\" in 64% of cases, finds the generic 30-day article, and denies returns that the 60-day Plus-member rule allows. What is the most effective first step?",
     "options": [
      {
       "id": "A",
       "text": "Remove Read and Grep from the agent, so that every policy question has to go through `get_return_policy`."
      },
      {
       "id": "B",
       "text": "Repeat the instruction to prefer policy tools in capital letters at the end of the system prompt, where it is most salient."
      },
      {
       "id": "C",
       "text": "Rewrite the `get_return_policy` description: its order ID input, the date, region, and tier rules it resolves, and that `kb/` is generic."
      },
      {
       "id": "D",
       "text": "Add a routing classifier in front of the agent that detects return-eligibility questions and calls `get_return_policy` before the agent runs."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Tool descriptions are the main signal the model uses to choose a tool. \"Returns policy text\" gives no reason to prefer the MCP tool over the familiar Grep, so the agent searches the generic articles. Describing the tool's input, what it resolves, what it returns, and when to use it instead of `kb/` is the low-effort, high-leverage first step.",
      "wrong": {
       "A": "The agent needs `kb/` for how-to questions. Removing built-in tools sacrifices a legitimate capability instead of fixing the uninformative description.",
       "B": "The preference is already in the system prompt and is not followed. Louder wording is still probabilistic and leaves the root cause, a three-word description, in place.",
       "D": "A classifier is an over-engineered first step. It adds infrastructure and bypasses the model's tool selection when a better description has not been tried."
      }
     },
     "studyRef": "Task Statement 2.4 (detailed MCP tool descriptions keep the agent from preferring built-in tools such as Grep)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "The case-facts block must be included in every request, outside summarized history, not sent once",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "For billing disputes, an engineer builds a `dispute_facts` block (invoice numbers, disputed amounts, charge dates, refund status) and inserts it into the first user message of each conversation. Once a chat passes 20 turns, older turns are replaced by a model-written summary. QA finds that after about turn 25 the agent starts quoting rounded amounts (\"around $300\" for $312.86) and mixes up invoice INV-5531 with INV-5513. Before turn 20 the figures are always exact. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Re-send `dispute_facts` with every request as its own block, outside the summarized history."
      },
      {
       "id": "B",
       "text": "Instruct the summarizer to copy the `dispute_facts` block verbatim into every summary that it writes."
      },
      {
       "id": "C",
       "text": "Store the facts in a database and give the agent a `get_dispute_facts` tool to call whenever it needs a figure."
      },
      {
       "id": "D",
       "text": "Raise the summarization threshold from 20 to 35 turns, so that the first user message stays verbatim for longer."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Transactional facts belong in a persistent block included in each prompt, outside the summarized history. Placed only in the first user message, the block became part of the history and was condensed with it at turn 20, which is exactly when the figures went vague. Re-sending it with every request keeps the exact values in front of the model for the whole conversation.",
      "wrong": {
       "B": "This relies on a model-written summary reproducing exact figures, which is the failure being observed; the facts should not pass through summarization at all.",
       "C": "The agent quotes rounded figures confidently from the summary, so it does not know it needs a lookup; making the facts optional to fetch does not keep them in context.",
       "D": "It only postpones the problem: any chat longer than 35 turns loses the block the same way."
      }
     },
     "studyRef": "Task Statement 5.1 (persistent case-facts block included in each prompt, outside summarized history)"
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Self-reported confidence is an unreliable escalation proxy, and threshold tuning cannot fix it",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your agent rates its confidence from 1 to 10 on every turn, and conversations rated below 6 go to `escalate_to_human`. Last month, 410 of 2,300 conversations were routed this way, and QA found that 260 of those 410 were standard in-policy cases such as in-window returns. Separately, the agent itself issued 37 refunds that needed policy exceptions it had no authority to grant: 4 of them were rated 6-7, 9 were rated 8, and 24 were rated 9 or 10. A teammate proposes raising the threshold to \"below 9\"; a replay shows that this would route 1,450 conversations. What is the best response?",
     "options": [
      {
       "id": "A",
       "text": "Reject it; route on explicit criteria with few-shot examples (policy gap or exception, human request, no progress)."
      },
      {
       "id": "B",
       "text": "Accept it: the higher threshold sends the risky exception refunds to humans, and staff can clear the simple cases fast."
      },
      {
       "id": "C",
       "text": "Keep the current threshold, but have the agent justify each rating so that QA can recalibrate the scale every month."
      },
      {
       "id": "D",
       "text": "Replace self-rated confidence with a sentiment score from a separate model, removing self-reporting bias."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Self-reported confidence is a poorly calibrated proxy: the agent was most confident (9 or 10) on 24 of the 37 cases it should have escalated. Explicit escalation criteria with few-shot examples name the real triggers (a policy exception or gap, an explicit request for a human, inability to progress), so exception refunds escalate whatever confidence the agent reports.",
      "wrong": {
       "B": "\"Below 9\" catches only 13 of the 37 exception refunds (the 4 rated 6-7 and the 9 rated 8) while routing 1,450 of 2,300 conversations, about 63%, which caps first-contact resolution near 37% against an 80% target.",
       "C": "Explaining a miscalibrated score does not calibrate it; routing would still depend on a number that is highest on the hardest cases.",
       "D": "Sentiment measures how the customer feels, not whether the case needs a policy exception, so it is also a poor proxy for case complexity."
      }
     },
     "studyRef": "Task Statement 5.2 (why self-reported confidence and sentiment are unreliable escalation proxies; explicit criteria)"
    },
    {
     "n": 11,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Appropriate escalation triggers: explicit human request and policy gaps versus resolvable cases",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "You are writing explicit escalation criteria for the system prompt. Which TWO of the following situations should the criteria tell the agent to escalate rather than resolve itself? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "A customer is visibly annoyed about a delayed delivery, but the order qualifies for a standard replacement under policy."
      },
      {
       "id": "B",
       "text": "A customer reports a damaged item and provides photo evidence; the damage-replacement policy clearly applies."
      },
      {
       "id": "C",
       "text": "A customer asks you to match a competitor's lower price on a purchase, and the policy only covers price adjustments against the company's own site."
      },
      {
       "id": "D",
       "text": "A customer writes: \"I don't want to talk to a bot, get me a human agent.\""
      },
      {
       "id": "E",
       "text": "A customer asks where order #4471 is, and `lookup_order` shows it shipped yesterday."
      }
     ],
     "answer": [
      "C",
      "D"
     ],
     "explanation": {
      "correct": "Policy that is silent or ambiguous on the specific request is a gap; the agent should escalate instead of improvising a policy. An explicit request for a human should be honored immediately, without first attempting to investigate or resolve.",
      "wrong": {
       "A": "Frustration alone is not a complexity signal. The agent should acknowledge it and resolve the in-policy replacement, escalating only if the customer then asks for a human.",
       "B": "This is a standard, in-policy case and exactly the kind of request the agent should resolve to reach the first-contact resolution target.",
       "E": "This is a simple status question that the agent can answer directly with its tools."
      }
     },
     "studyRef": "Task Statement 5.2 (+ escalation triggers: customer request, policy gap, no progress)"
    },
    {
     "n": 12,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Loop control based on stop_reason rather than assistant text content",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Customers sometimes receive replies like \"Let me look that up for you.\" and nothing else, though the order lookup was never completed. The loop is:\n\n```python\nwhile True:\n    resp = client.messages.create(model=M, tools=TOOLS, messages=msgs)\n    if resp.content[0].type == \"text\":\n        return resp.content[0].text\n    run_tools(resp, msgs)\n```\n\nWhat is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a counter that stops the loop after 10 iterations and returns the last text block."
      },
      {
       "id": "B",
       "text": "Instruct the model to finish every final answer with the phrase `FINAL ANSWER:` and loop until that phrase appears."
      },
      {
       "id": "C",
       "text": "Branch on `resp.stop_reason`: keep looping and append tool results while it is `\"tool_use\"`, and return only when it is `\"end_turn\"`."
      },
      {
       "id": "D",
       "text": "Instruct the model never to write text before calling a tool."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Claude can emit a text preamble in the same response as a `tool_use` block. Termination must depend on `stop_reason`, not on whether text content appears.",
      "wrong": {
       "A": "An iteration cap is a safety net, not the primary stopping condition, and it would still return the preamble in this scenario.",
       "B": "This parses natural language to detect completion, an anti-pattern that is brittle and depends on prompt compliance.",
       "D": "This is probabilistic, and it leaves the loop condition wrong for any response that happens to contain text."
      }
     },
     "studyRef": "Task Statement 1.1 (+ stop_reason-driven agentic loop and anti-patterns)"
    },
    {
     "n": 13,
     "scenario": 1,
     "domain": 1,
     "ts": "1.7",
     "tests": "Starting fresh with an injected summary when prior tool results are stale",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A customer returns to a support conversation 3 days later. The saved session contains `lookup_order` output showing order #5120 as \"shipped\" and a pending refund decision. Meanwhile the order was delivered and a replacement was issued by another team. What is the most reliable way to continue?",
     "options": [
      {
       "id": "A",
       "text": "Resume the named session as is, since the full history gives the agent the best context."
      },
      {
       "id": "B",
       "text": "Start a new session with a structured summary and re-run `lookup_order`."
      },
      {
       "id": "C",
       "text": "Resume the session and add a message telling the agent that some details \"may have changed\", without specifying which."
      },
      {
       "id": "D",
       "text": "Create a fork of the saved session with `fork_session` and continue in the fork."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Resuming with stale tool results risks the agent reasoning from out-of-date data. A fresh session with a summary plus re-fetched state is more reliable.",
      "wrong": {
       "A": "The history contains tool results that are now wrong, and the agent may trust them over fresh information.",
       "C": "A vague warning leaves the agent unsure what to re-verify. Without a specific change list it would likely still rely on the stale results.",
       "D": "A fork starts from the same stale history. It is for exploring divergent approaches, not for refreshing outdated tool output."
      }
     },
     "studyRef": "Task Statement 1.7 (+ resume versus fresh start with summary)"
    },
    {
     "n": 14,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Decomposing multi-concern requests into distinct items so every concern is handled",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "On a 600-message evaluation set of multi-concern support requests, your agent fully resolves the first concern mentioned 96% of the time but addresses the second and third concerns only 44% of the time. Its replies read as complete and never mention the skipped items. Every response ends with `stop_reason: \"end_turn\"`, and replies average 140 words against a `max_tokens` of 1,024. Two weeks ago you added \"Address every concern the customer raises\" to the system prompt, which moved the 44% figure up from 41%. What change is most likely to close the gap?",
     "options": [
      {
       "id": "A",
       "text": "Raise `max_tokens` to 4,096, so replies have room to cover the second and third concerns after the first is resolved."
      },
      {
       "id": "B",
       "text": "Add an explicit step that lists each distinct concern as its own item, investigates each, and checks all are resolved before replying."
      },
      {
       "id": "C",
       "text": "Repeat the existing instruction at the end of the system prompt in capital letters, so the model weighs it more heavily on each turn."
      },
      {
       "id": "D",
       "text": "Ask customers to choose one concern to handle first whenever a message raises several, and open a new conversation for each of the rest."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The agent is not decomposing the request: it latches onto the most salient concern and treats the reply as done. An explicit decomposition step turns the message into distinct tracked items (investigated with the shared customer context and synthesized into one reply), so coverage becomes a structural property instead of something the model has to remember.",
      "wrong": {
       "A": "Truncation is ruled out: every response ends with `end_turn`, and 140-word replies are far below a 1,024-token limit.",
       "C": "The data already shows that instruction-only fixes barely move coverage (41% to 44%); restating the same instruction louder is the same approach.",
       "D": "This pushes decomposition onto the customer and splits one contact into several, which lowers first-contact resolution."
      }
     },
     "studyRef": "Task Statement 1.4 (decomposing multi-concern requests into distinct items)"
    },
    {
     "n": 15,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Iteration cap only as a high safety backstop; normal loop termination follows stop_reason",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your support agent's loop ends when `stop_reason` is `\"end_turn\"`, but it is written as `while turns < 8:`, and when the counter runs out it sends Claude's latest text to the customer. Across 20,000 conversations, 91% reach `\"end_turn\"` within 8 requests. Most of the rest are multi-order billing disputes that need 10 to 14 requests; they get cut off with replies such as \"Let me check your second order.\" Last quarter, before the counter was added, one conversation looped 260 times because `lookup_order` kept returning a retryable error. Which loop design should you adopt?",
     "options": [
      {
       "id": "A",
       "text": "Raise the limit to 15 requests so that all of the multi-order disputes fit, keeping the counter as the loop's exit condition and sending the latest text when it runs out."
      },
      {
       "id": "B",
       "text": "Remove the counter and loop only while `stop_reason` is `\"tool_use\"`, because any iteration limit in an agentic loop is an anti-pattern that cuts off work."
      },
      {
       "id": "C",
       "text": "Keep the limit at 8 and add a system prompt instruction telling Claude to finish every case within eight requests and to summarize anything left open."
      },
      {
       "id": "D",
       "text": "Continue on `\"tool_use\"` and stop on `\"end_turn\"`; keep a cap far above normal use, such as 40 requests, only as a backstop that hands off via `escalate_to_human`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Normal termination should come from `stop_reason`: continue while Claude requests tools and stop on `\"end_turn\"`. Today the counter is what ends every long dispute, so it acts as a primary stopping mechanism and cuts off cases that need 10 to 14 requests. An iteration limit still has a role, but only as a safety backstop against runaway loops like the 260-iteration incident: set it well above normal usage, and when it fires, hand the case to a human instead of sending a half-finished reply.",
      "wrong": {
       "A": "A bigger counter is still sized to the workload, so it remains what ends long cases: any dispute that needs more than 15 requests is cut off the same way, and the customer still gets a half-finished reply instead of a handoff.",
       "B": "Driving the loop by `stop_reason` is right, but dropping every limit ignores the stated runaway incident. Iteration caps are an anti-pattern as the primary stop; as a high backstop they guard against a tool that keeps failing.",
       "C": "Asking Claude to fit every case into eight requests is probabilistic and works against first-contact resolution: the multi-order disputes really need more steps, so they would end unresolved instead of being cut off."
      }
     },
     "studyRef": "Task Statement 1.1 (avoid arbitrary iteration caps as the primary stopping mechanism; terminate on stop_reason)"
    },
    {
     "n": 16,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Routing through the coordinator gives one record of what each subagent was asked and returned (observability)",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A delivered report cites a 2019 emissions inventory as current, and the client points out that a 2023 revision of the same inventory was publicly available. Your system routes every delegation and every subagent result through the coordinator, which logs them per run. You need to find out whether the 2023 revision was never found by web search, was filtered out by document analysis, or was dropped during synthesis. What should you examine first?",
     "options": [
      {
       "id": "A",
       "text": "Re-run the same research request with verbose logging enabled inside each subagent, then compare the new outputs with the delivered report."
      },
      {
       "id": "B",
       "text": "Open a new session with the synthesis subagent and ask it to explain why it preferred the 2019 inventory over the 2023 revision."
      },
      {
       "id": "C",
       "text": "The coordinator's log for that run, which records what each subagent was asked to do and exactly what it returned."
      },
      {
       "id": "D",
       "text": "The report subagent's citation template, since the outdated citation appears in the final document and the template controls how sources are shown."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Because every handoff goes through the coordinator, its log is the one place that shows what each subagent was given and what it returned in that run. It shows at which step the 2023 revision disappeared: absent from the search results, present in search but missing from the analysis output, or analyzed but left out of the synthesis. This observability is a main reason to route all subagent communication through the coordinator.",
      "wrong": {
       "A": "A new run may not reproduce the original results, because search results and model outputs vary. It also costs a full run, while the record of the original run already exists in the coordinator's log.",
       "B": "A new session has none of the original run's context, since subagents keep no memory between invocations; its answer would be an after-the-fact guess, not evidence of what happened.",
       "D": "The report subagent only renders what it receives. Starting there blames the last component before checking which upstream step lost the 2023 source."
      }
     },
     "studyRef": "Task Statement 1.2 (routing all subagent communication through the coordinator for observability)"
    },
    {
     "n": 17,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Coordinator dynamically selecting subagents by query complexity instead of always running the full pipeline",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Users report that simple questions such as \"In what year was the Hubble Space Telescope launched?\" take about 4 minutes because the coordinator always runs web search, document analysis, synthesis, and report generation. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Set shorter timeouts on all four subagents."
      },
      {
       "id": "B",
       "text": "Train a separate classifier on past queries to label each as simple or complex before the coordinator runs."
      },
      {
       "id": "C",
       "text": "Let the coordinator assess each query and invoke only the subagents it needs."
      },
      {
       "id": "D",
       "text": "Switch all subagents to a smaller model."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The coordinator should decide dynamically which subagents to invoke based on query complexity rather than always routing through the whole pipeline.",
      "wrong": {
       "A": "Timeouts cut work off without removing unnecessary stages and may truncate results on legitimate complex queries.",
       "B": "This is an over-engineered extra component when the coordinator model can already assess complexity with a prompt change.",
       "D": "This lowers quality across all queries and still executes stages that simple questions do not need."
      }
     },
     "studyRef": "Task Statement 1.2 (+ dynamic subagent selection)"
    },
    {
     "n": 18,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Coordinator prompts should state goals and quality criteria, not step-by-step procedures, so subagents can adapt",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The coordinator sends each of 30 corporate sustainability reports to the document-analysis subagent with this prompt: \"Read the executive summary and pages 40-55. Extract the Scope 1 and Scope 2 totals from the table on page 47 and return them.\" For 11 of the 30 reports, the subagent returns nothing or the wrong figures. Those companies print their emissions tables in an appendix near the end of the same PDF, and the subagent's trace shows it read exactly the pages it was told to read. What is the most likely root cause?",
     "options": [
      {
       "id": "A",
       "text": "The document-analysis subagent's model is not capable enough for long PDFs and should be swapped for a larger model."
      },
      {
       "id": "B",
       "text": "The synthesis subagent discards the figures for these 11 companies because their tables use a different layout and units."
      },
      {
       "id": "C",
       "text": "The subagent's context window is too small for a whole report, so everything after page 55 is cut off before it can be read at all."
      },
      {
       "id": "D",
       "text": "The coordinator prescribes pages and a table position instead of the goal and quality criteria, so the subagent cannot adapt."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The trace shows the subagent did exactly what it was told; the problem is what it was told. A fixed procedure (these pages, this table) fits only some layouts. The coordinator should state the goal and quality criteria instead, for example: the FY2025 Scope 1 and Scope 2 totals wherever they appear, with value, unit, year, and page, flagging restated figures and answering \"not reported\" if absent, so the subagent can adapt to each report.",
      "wrong": {
       "A": "The subagent read the pages it was sent to and found nothing because the data is elsewhere. A larger model following the same page-restricted procedure would miss the same figures.",
       "B": "The failure happens before synthesis: the document-analysis output for these reports is already empty or wrong. Blaming a downstream agent ignores the evidence in the trace.",
       "C": "The trace shows the subagent read pages 40-55 as instructed and never attempted the appendix. The limit came from the prompt, not from context size."
      }
     },
     "studyRef": "Task Statement 1.3 (coordinator prompts specify research goals and quality criteria, not procedures)"
    },
    {
     "n": 19,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "AgentDefinition tool restrictions limit what a subagent type can use; omitted tools means inherited tools",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Reviewers find that 7% of reports cite sources the web-search subagent never collected; traces show the synthesis subagent running its own web searches mid-draft. The coordinator already passes complete findings in every synthesis prompt. The synthesis definition is:\n\n```python\n\"synthesis\": AgentDefinition(\n    description=\"Combines search and analysis findings into a cited draft\",\n    prompt=\"...Use ONLY the findings in this prompt. Never search the web...\",\n)\n```\n\nWhat change most reliably stops synthesis from searching?",
     "options": [
      {
       "id": "A",
       "text": "Set `tools` on the synthesis definition to only the tools it needs, leaving web search out."
      },
      {
       "id": "B",
       "text": "Rewrite the prompt so the search ban appears in capitals at the top and bottom, plus two examples of drafting from supplied findings."
      },
      {
       "id": "C",
       "text": "After each draft, compare its cited URLs with the collected sources and re-run synthesis when it cites one the search agent never found."
      },
      {
       "id": "D",
       "text": "Fold synthesis into the coordinator, so that the coordinator writes each draft itself directly from the findings it has gathered."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Each AgentDefinition can restrict which tools that subagent type may use. This definition sets no `tools` field, so the subagent inherits the full tool set, web search included, and the prompt's ban is only probabilistic. Listing just the tools synthesis needs takes web search out of its reach, which is a deterministic guarantee.",
      "wrong": {
       "B": "The prompt already forbids searching and the subagent still searched in 7% of reports. More emphasis and examples may lower the rate but remain probabilistic compliance.",
       "C": "This detects the problem after the fact and pays for extra synthesis runs; the unwanted searches still happen. Restricting the tool prevents them.",
       "D": "The coordinator has web access too, so this does not remove the capability, and it gives up the specialized synthesis role and its focused context instead of fixing the configuration."
      }
     },
     "studyRef": "Task Statement 1.3 (AgentDefinition descriptions, prompts, and tool restrictions per subagent type)"
    },
    {
     "n": 20,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Passing complete findings in structured form that separates content from metadata",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Final reports lose citations. The coordinator currently tells the synthesis subagent: \"Write a report on the findings above.\" Synthesis then cites sources vaguely or not at all. Which TWO changes to how the coordinator invokes synthesis best fix this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Rely on the synthesis subagent inheriting the coordinator's conversation so that it can find the sources itself."
      },
      {
       "id": "B",
       "text": "Pass each finding as structured data that separates the claim and evidence from metadata such as source URL, document name, and page number."
      },
      {
       "id": "C",
       "text": "Pass a short paraphrased summary of the findings to save tokens and ask the synthesis agent to add citations afterwards."
      },
      {
       "id": "D",
       "text": "Let the synthesis subagent re-run its own web searches to rediscover the source URLs."
      },
      {
       "id": "E",
       "text": "Include the complete findings from the search and analysis subagents directly in the synthesis subagent's prompt."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "Structured claim-plus-metadata records preserve attribution through the handoff and give the synthesis agent something it can cite exactly. Subagents have isolated context and do not inherit the coordinator's history. Anything the synthesis agent needs must be supplied explicitly in its prompt.",
      "wrong": {
       "A": "Subagents do not inherit parent conversation history automatically, so there is nothing to find.",
       "C": "Paraphrasing is exactly where claim-source links are lost, and citations cannot be reconstructed afterwards.",
       "D": "Re-searching is wasteful, may surface different sources, and breaks the claim-to-source mapping gathered earlier."
      }
     },
     "studyRef": "Task Statement 1.3 (+ explicit context passing and structured attribution)"
    },
    {
     "n": 21,
     "scenario": 3,
     "domain": 1,
     "ts": "1.6",
     "tests": "Adaptive decomposition for open-ended research combined with a fixed chain for predictable report production",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your research system takes open-ended questions such as \"What is slowing grid-scale battery deployment in Southeast Asia?\", where the countries, regulations, and supply issues that matter only become clear from the first round of searches. Once findings are in, every report goes through the same three steps: draft the sections, check each claim against its cited source, then format to the house template. Last month the team made the whole workflow dynamic, letting the coordinator plan every step, report production included. Research depth improved, but 9 of 40 reports skipped the citation check, and section order now varies from report to report. How should the workflow be decomposed?",
     "options": [
      {
       "id": "A",
       "text": "Return to a fixed pipeline end to end, with a preset list of research subtasks for each type of question."
      },
      {
       "id": "B",
       "text": "Adaptive decomposition for the research, then a fixed chain: draft, verify citations, format."
      },
      {
       "id": "C",
       "text": "Keep dynamic planning throughout, and add to the coordinator's prompt that the citation check is mandatory."
      },
      {
       "id": "D",
       "text": "Keep dynamic planning throughout, and have the coordinator produce each report three times, keeping the best."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The two phases differ in kind. Research is open-ended: its subtasks should be generated from what each round of searching finds, which is why dynamic planning improved depth. Report production is predictable: the same steps in the same order every time, so a fixed prompt chain guarantees that the citation check runs and keeps section order consistent.",
      "wrong": {
       "A": "A preset research list cannot anticipate which countries, regulations, or supply issues the first searches will surface, so it would give back the depth that adaptive decomposition delivered.",
       "C": "A prompt instruction is probabilistic; 9 skipped checks in 40 reports show the planner already treats the step as optional. A fixed chain makes the check a step that always runs, and also fixes the varying section order.",
       "D": "Tripling report production is costly and still leaves the step order to the planner; picking the best of three does not guarantee that any version ran the citation check."
      }
     },
     "studyRef": "Task Statement 1.6 (fixed prompt chains for predictable steps, dynamic decomposition for open-ended investigation)"
    },
    {
     "n": 22,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Iterative refinement loop: evaluate synthesis for gaps, re-delegate targeted queries, re-invoke synthesis",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "For the topic \"renewable energy adoption in Southeast Asia\" the coordinator's decomposition correctly lists all eight countries. Each subagent finishes without errors, but the report is thin on Vietnam and Indonesia because the first searches returned few usable sources. What is the most effective design change?",
     "options": [
      {
       "id": "A",
       "text": "Tell the synthesis subagent to fill in the missing countries from its general knowledge of the region's energy sector."
      },
      {
       "id": "B",
       "text": "Rewrite the coordinator's decomposition prompt to use more, narrower subtopics for every country in the list."
      },
      {
       "id": "C",
       "text": "Rerun the entire pipeline from scratch with the same queries, then merge the two resulting reports by hand."
      },
      {
       "id": "D",
       "text": "Have the coordinator find coverage gaps, re-delegate targeted queries, and re-run synthesis."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "An iterative refinement loop lets the coordinator find gaps in the output and fill them with targeted re-delegation. Here decomposition was fine; the first retrieval was thin.",
      "wrong": {
       "A": "This produces uncited content that bypasses the research pipeline and undermines the cited-report goal.",
       "B": "The decomposition already covered all eight countries; the stem shows the gap is in retrieved material, not in the assignment.",
       "C": "Identical queries are likely to return the same thin sources, and merging full reports doubles cost without targeting the gap."
      }
     },
     "studyRef": "Task Statement 1.2 (+ iterative refinement loop)"
    },
    {
     "n": 23,
     "scenario": 3,
     "domain": 1,
     "ts": "1.7",
     "tests": "Resume continues one line of work; fork_session branches a divergent exploration from the same baseline",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Yesterday an analyst ran a session named `grid-storage-baseline` in which the research system reviewed 36 sources on grid-scale storage and began drafting the report's cost section. The sources and findings are still current. Today she needs to (1) finish the cost section where she left off and (2) test whether treating pumped hydro, rather than lithium-ion, as the reference technology changes the conclusions, without affecting the main draft if she discards the idea. Which approach fits?",
     "options": [
      {
       "id": "A",
       "text": "Fork the baseline with `fork_session` to finish the cost section, and resume `grid-storage-baseline` to try the pumped-hydro framing."
      },
      {
       "id": "B",
       "text": "Resume `grid-storage-baseline` to finish the cost section, and branch it with `fork_session` for the pumped-hydro test."
      },
      {
       "id": "C",
       "text": "Resume `grid-storage-baseline` for both tasks, trying the pumped-hydro framing in the same session once the cost section is done."
      },
      {
       "id": "D",
       "text": "Start two fresh sessions, one per task, each seeded with a structured summary of the sources and the draft."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Resumption continues a single line of work, and the baseline is still valid, so finishing the cost section belongs in the resumed session. fork_session creates an independent branch from the same baseline, so the pumped-hydro experiment starts with all 36 sources of analysis, cannot touch the main draft, and can simply be discarded.",
      "wrong": {
       "A": "This swaps the tools: the main draft would continue in a branch, away from the named session, while the experiment would run in the very session it was supposed to leave untouched.",
       "C": "Exploring the alternative framing inside the main session mixes it into the draft's context; even if she discards the idea, its reasoning keeps shaping later work. A fork keeps it independent.",
       "D": "Fresh sessions seeded with summaries are for when prior tool results are stale. These findings are current, so she would replace detailed, valid context with a lossy summary."
      }
     },
     "studyRef": "Task Statement 1.7 (choose resume vs fork_session; resume when prior context is valid)"
    },
    {
     "n": 24,
     "scenario": 3,
     "domain": 2,
     "ts": "2.2",
     "tests": "Local error recovery in subagents for transient failures; propagating only unresolvable errors with context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "One of the web-search subagent's twelve queries gets an HTTP 503 from a news API. Today the subagent immediately fails and returns an error to the coordinator, which re-plans the whole task. Most 503s clear within seconds. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Always propagate every error to the coordinator immediately so it has full control."
      },
      {
       "id": "B",
       "text": "Catch the error in the subagent and return an empty result set for that query, marking the call as a normal success."
      },
      {
       "id": "C",
       "text": "Abort the entire research run on the first API error and tell the user to resubmit the whole request later."
      },
      {
       "id": "D",
       "text": "Retry transient failures locally with backoff; propagate only unresolved errors plus partial results."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Local recovery handles transient faults close to where they occur; the coordinator only needs errors the subagent cannot resolve, with the context to decide next steps.",
      "wrong": {
       "A": "This floods the coordinator with errors the subagent could have resolved and triggers needless re-planning.",
       "B": "Returning failure as an empty success hides the gap so the coordinator cannot recover or annotate coverage.",
       "C": "Terminating everything because of one failed query among twelve discards good partial work."
      }
     },
     "studyRef": "Task Statement 2.2 (+ local recovery within subagents)"
    },
    {
     "n": 25,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "Replacing generic tools with constrained alternatives that validate inputs",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent has a generic `fetch_url` tool. In testing, it sometimes fetches arbitrary web pages and internal admin URLs instead of the research documents it was meant to analyze. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Replace `fetch_url` with `load_document`, which validates the URL before fetching."
      },
      {
       "id": "B",
       "text": "Keep `fetch_url` and add a system prompt instruction telling it to fetch only research documents."
      },
      {
       "id": "C",
       "text": "Give the subagent a second generic tool, `fetch_page`, so it can choose whichever one fits the page."
      },
      {
       "id": "D",
       "text": "Move all fetching to the synthesis subagent so the document-analysis subagent never calls external URLs."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A constrained, purpose-specific tool enforces what the agent may load, which is more reliable than asking a generic tool to behave.",
      "wrong": {
       "B": "The restriction is left to prompt compliance, and the unrestricted tool remains available.",
       "C": "A near-duplicate tool adds overlap and ambiguity without adding any constraint.",
       "D": "This moves the risk to another agent that is outside the fetching specialization, and the unsafe tool still exists."
      }
     },
     "studyRef": "Task Statement 2.3 (+ constrained tools replacing generic ones)"
    },
    {
     "n": 26,
     "scenario": 3,
     "domain": 2,
     "ts": "2.1",
     "tests": "Validate tool selection with ambiguous requests between similar tools, not only clear-cut ones",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent has two tools, `extract_data_points` and `verify_claim_against_source`. You wrote two candidate description sets and tested each on the same 400 production requests, each labeled with the correct tool. Ambiguous requests are ones like \"What does the IEA report say about the 2030 storage figure in the draft?\", which could plausibly go to either tool.\n\n```\n             clear-cut (260)   ambiguous (140)\nVersion 1    99% correct       61% correct\nVersion 2    96% correct       90% correct\n```\n\nProduction traffic has the same mix. Which decision does this evidence best support?",
     "options": [
      {
       "id": "A",
       "text": "Ship Version 1, since clear-cut requests are about two-thirds of traffic and Version 1 is more accurate on them."
      },
      {
       "id": "B",
       "text": "Ship Version 1 and add a keyword-based router that sends each ambiguous request to one of the two tools before the subagent reasons."
      },
      {
       "id": "C",
       "text": "Ship Version 2: it is about 94% correct overall against about 86% for Version 1, and it holds up on the ambiguous cases."
      },
      {
       "id": "D",
       "text": "Re-test both versions on a fresh set of clear-cut requests, since ambiguous labels are subjective and skew the result."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Overall accuracy is (0.96 x 260 + 0.90 x 140) / 400 = 375.6 / 400, about 94%, for Version 2, versus (0.99 x 260 + 0.61 x 140) / 400 = 342.8 / 400, about 86%, for Version 1. Just as important, tool selection is validated on ambiguous requests between similar tools, which is where descriptions either draw the boundary or fail, and Version 2 does that far better at a small cost on clear-cut requests.",
      "wrong": {
       "A": "Clear-cut requests are easy for any reasonable description. Version 1 gains about 8 clear-cut requests but loses about 41 ambiguous ones, so it is worse overall and fails where similar tools get confused.",
       "B": "A keyword router is over-engineered and bypasses the model's understanding of the request; better descriptions (Version 2) already resolve most ambiguous cases.",
       "D": "Clear-cut requests cannot validate selection between similar tools; the ambiguous requests are the point of the test, and the labeled set already gives a clear answer."
      }
     },
     "studyRef": "Task Statement 2.1 (descriptions that differentiate similar tools; test with ambiguous requests)"
    },
    {
     "n": 27,
     "scenario": 3,
     "domain": 2,
     "ts": "2.4",
     "tests": "MCP design: resources expose content catalogs for reading, tools perform actions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You are adding an MCP server for your company's research archive to the multi-agent research system. It must give the document-analysis subagent three things: (1) the archive's collection hierarchy with document counts and date ranges, (2) the house citation format for each collection, and (3) a way to request a restricted document, which files a licensing request, writes an audit entry, and notifies the archive owner. How should the server expose these?",
     "options": [
      {
       "id": "A",
       "text": "Expose all three as tools (`list_collections`, `get_citation_format`, `request_document`), because subagents act only by calling tools."
      },
      {
       "id": "B",
       "text": "Expose (1) and (2) as resources the subagent can read, and expose (3) as a tool it calls."
      },
      {
       "id": "C",
       "text": "Expose all three as resources, with (3) as a `request://` resource whose read files the licensing request."
      },
      {
       "id": "D",
       "text": "Expose (1) as a resource and (2) and (3) as tools, because the citation format differs from one collection to the next."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Resources expose content the agent reads, such as catalogs, hierarchies, and reference formats, so the subagent can see what exists without exploratory calls. Tools are for actions with effects. The restricted-document request files a request, writes an audit entry, and notifies someone, so it is a tool; the hierarchy and the citation formats are read-only content, so they are resources.",
      "wrong": {
       "A": "Modeling read-only catalogs as tools forces exploratory calls just to learn what exists, which is the overhead resources are meant to remove.",
       "C": "An action with side effects should not hide behind a read. Reading a resource is expected to be safe, so ordinary context gathering could file licensing requests.",
       "D": "Per-collection content is still read-only reference content; resources can be addressed per collection. Varying by collection does not turn a format into an action."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources for content catalogs, tools for actions)"
    },
    {
     "n": 28,
     "scenario": 3,
     "domain": 5,
     "ts": "5.3",
     "tests": "Structuring synthesis output with coverage annotations when sources were unavailable",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two of six planned source categories (a paywalled industry database and a timed-out patent API) could not be reached. The synthesis subagent nonetheless produced a polished report that reads as if the research were complete. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Require coverage annotations: which findings are well supported and which areas have gaps from unavailable sources."
      },
      {
       "id": "B",
       "text": "Cancel report generation whenever any source category is unavailable."
      },
      {
       "id": "C",
       "text": "Silently drop the two unavailable categories from the report outline so the final report looks internally consistent and complete."
      },
      {
       "id": "D",
       "text": "Mark the two failed queries as empty successes so the pipeline proceeds without special handling."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Coverage annotations make gaps explicit so readers do not mistake missing evidence for absence of evidence.",
      "wrong": {
       "B": "Terminating on a single partial failure discards a mostly complete result when the gaps could simply be disclosed.",
       "C": "Hiding the gap suppresses information readers need to calibrate trust in the conclusions.",
       "D": "Converting failures to empty successes is an anti-pattern: it erases the failure information."
      }
     },
     "studyRef": "Task Statement 5.3 (+ coverage annotations and gap reporting)"
    },
    {
     "n": 29,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Temporal data and conflict annotation instead of arbitrarily choosing a value",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Two credible reports give different electric-vehicle market shares for Country X: 14% and 18%. The synthesis agent calls them contradictory and reports only the higher number. Reading the sources, the 14% figure was collected in 2022 and the 18% figure in 2023. Which TWO changes best fix this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Instruct synthesis to always keep the figure from the larger or more prominent publisher."
      },
      {
       "id": "B",
       "text": "Average conflicting numbers and report the mean without attribution."
      },
      {
       "id": "C",
       "text": "Require subagents to include publication or data-collection dates in their structured claim-source outputs."
      },
      {
       "id": "D",
       "text": "Remove any statistic on which sources disagree from the report."
      },
      {
       "id": "E",
       "text": "Have synthesis preserve both values with source attribution and context, and separate well-established from contested findings in the report."
      }
     ],
     "answer": [
      "C",
      "E"
     ],
     "explanation": {
      "correct": "Dates let synthesis recognize that a difference may be temporal rather than a true contradiction. Conflicts should be annotated, not silently resolved, so readers can see both figures, their sources, and the methodological or temporal context.",
      "wrong": {
       "A": "Picking one value by publisher rank is an arbitrary resolution that discards credible information.",
       "B": "Averaging figures from different years or methods produces a number no source reported and loses provenance.",
       "D": "Dropping conflicting data hides real information instead of annotating the conflict."
      }
     },
     "studyRef": "Task Statement 5.6 (+ publication dates and conflict annotation)"
    },
    {
     "n": 30,
     "scenario": 3,
     "domain": 5,
     "ts": "5.4",
     "tests": "Structured state persistence for crash recovery using manifests",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A multi-hour research run crashes at minute 70, and on restart the coordinator starts from scratch, losing about an hour of subagent work. What is the best way to make recovery reliable?",
     "options": [
      {
       "id": "A",
       "text": "Increase the coordinator's context window so more of the run stays in memory."
      },
      {
       "id": "B",
       "text": "Have each agent export its state to a known location and have the coordinator write a manifest; on restart, load the manifest and inject the saved state into the agents' prompts."
      },
      {
       "id": "C",
       "text": "Wrap the whole run in automatic retry so a crash simply triggers a full re-run."
      },
      {
       "id": "D",
       "text": "Save only the final report to disk when the run completes."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Structured state exports plus a coordinator-loaded manifest let the system resume where it stopped.",
      "wrong": {
       "A": "Context lives in the crashed process, so a larger window protects nothing.",
       "C": "A full re-run repeats an hour of work and may produce different results.",
       "D": "A final-only save does not exist at crash time, so no intermediate progress is recoverable."
      }
     },
     "studyRef": "Task Statement 5.4 (+ manifests and agent state export)"
    },
    {
     "n": 31,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Existing test files given to test generation must reflect the PR branch so generated tests avoid duplicates",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI test-generation step runs `claude -p` on each pull request. A setup script builds its context from the PR's changed source files plus the existing test files for those modules, which it copies from a cached clone of `main` (refreshed nightly) to save clone time. An audit of 140 proposed tests found 51 that duplicate scenarios already covered, and 44 of those 51 repeat tests that the PR's author added in the same pull request. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Take the existing test files from the PR's head commit instead of from the cached `main` clone."
      },
      {
       "id": "B",
       "text": "Add \"do not propose tests that the author already added in this pull request\" to the prompt."
      },
      {
       "id": "C",
       "text": "Refresh the cached `main` clone every hour instead of nightly, so the test files it supplies stay current."
      },
      {
       "id": "D",
       "text": "Drop the test files from context, and remove duplicates afterwards by comparing generated test names."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Test generation avoids duplicate scenarios only when the tests that already cover the code are in context. The author's new tests exist only on the PR branch, so the context must come from the PR's head commit; that removes the cause of 44 of the 51 duplicates.",
      "wrong": {
       "B": "An instruction cannot help when Claude never sees those tests; the run has no way to tell which scenarios the author added.",
       "C": "`main` does not contain the PR's tests until it merges, however often the clone is refreshed, so this changes nothing for the 44 duplicates.",
       "D": "Removing existing tests from context removes the mechanism that prevents duplicates, and name matching misses duplicate scenarios whose tests are named differently."
      }
     },
     "studyRef": "Task Statement 3.6 (provide existing test files in context so test generation avoids covered scenarios)"
    },
    {
     "n": 32,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "CLAUDE.md testing standards, valuable-test criteria, and fixtures improve CI test generation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Last month reviewers rejected 300 of the 520 tests proposed by your CI test-generation job, which runs `claude -p` from the repository checkout with only the changed source files in its prompt. Each rejected test was tagged with one reason:\n\n- duplicates a scenario in the module's existing test file: 102\n- asserts on trivial getters or framework behavior: 66\n- hand-rolls mocks instead of using the `tests/factories/` builders: 57\n- snapshot test, which the team bans: 39\n- other: 36\n\nYou can ship one change this sprint. Which change addresses the most rejections?",
     "options": [
      {
       "id": "A",
       "text": "Document the testing standards, valuable-test criteria, and `tests/factories/` builders in the project CLAUDE.md."
      },
      {
       "id": "B",
       "text": "Include each changed module's existing test file in the run's context, so that already covered scenarios are visible."
      },
      {
       "id": "C",
       "text": "Add a post-generation filter that drops any test shorter than five lines before reviewers see the output."
      },
      {
       "id": "D",
       "text": "Generate three candidate sets per pull request, and keep only the tests that appear in at least two of those three sets."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Three of the reasons (trivial assertions 66, hand-rolled mocks 57, banned snapshots 39) come from the job not knowing the team's testing standards, what counts as a valuable test, and the available fixtures. CLAUDE.md is how CI-invoked Claude Code receives that project context, so documenting them there targets 162 rejections, more than the 102 duplicates.",
      "wrong": {
       "B": "Providing existing test files is the right fix for duplicates and worth doing next, but it targets 102 rejections against 162 for the CLAUDE.md change.",
       "C": "Length is a poor proxy for value: the filter might catch some getter tests but not hand-rolled mocks or snapshot tests, and it can drop short tests that are valuable.",
       "D": "Agreement across runs filters random variation, not systematic gaps; tests that ignore the standards or repeat existing scenarios appear consistently and would survive."
      }
     },
     "studyRef": "Task Statement 3.6 (document testing standards, valuable-test criteria, and fixtures in CLAUDE.md for CI test generation)"
    },
    {
     "n": 33,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "--output-format json makes Claude Code CI output machine-parseable without a separate API integration",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI step runs `claude -p \"Summarize the riskiest changes in this PR for the release manager\"` from the repository checkout, so Claude Code can read the code and follows the project CLAUDE.md. A new dashboard script must load the step's output with `json.loads` and record whether the run ended in an error. A teammate proposes rewriting the step as a Python script that calls the Messages API directly, \"because Claude Code only prints plain text.\" What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Accept the rewrite, since only a direct Messages API call returns a response the script can load as JSON."
      },
      {
       "id": "B",
       "text": "Keep the text output and pipe it through `jq -R -s` to wrap the summary in a JSON string for the script."
      },
      {
       "id": "C",
       "text": "Keep `claude -p` and add `--output-format json`, then read the result and the run's error status from it."
      },
      {
       "id": "D",
       "text": "Add \"reply only with a JSON object\" to the prompt, and load the step's stdout directly with `json.loads`."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`--output-format json` makes a `claude -p` run emit machine-parseable JSON that carries the result and run metadata, including whether the run ended in an error. The step keeps everything Claude Code provides in CI, including file access and the CLAUDE.md project context.",
      "wrong": {
       "A": "The premise is false: Claude Code emits JSON with `--output-format json`. A direct API call would also lose Claude Code's file tools and the CLAUDE.md context the summary relies on, unless the team rebuilt them.",
       "B": "Wrapping text in a JSON string makes it loadable but adds no structure and no error status; a failed run's partial output would be wrapped just the same.",
       "D": "A prompt instruction is probabilistic: a preamble sentence or a Markdown fence breaks `json.loads`, and it still gives no reliable run status."
      }
     },
     "studyRef": "Task Statement 3.6 (--output-format json for machine-parseable output from CI runs)"
    },
    {
     "n": 34,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Prior findings in context plus a --json-schema status field so re-review comments land in existing threads",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your PR review job runs on every push and posts findings as inline comments, using `claude -p` with `--output-format json` and a `--json-schema` for the findings. Each run currently sees only the PR diff. A new requirement: when an earlier finding is still unaddressed, the bot must reply in that finding's existing comment thread; it opens a new thread only for a new issue and posts nothing for issues that were fixed. Which TWO changes together meet the requirement? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Pass the previous run's findings, each with its ID, into the re-run, and ask for only new or still-unaddressed issues."
      },
      {
       "id": "B",
       "text": "Have the posting script match each new finding to an existing thread by file path and line number, and reply on a match."
      },
      {
       "id": "C",
       "text": "Tell Claude to word each finding exactly as on earlier runs, so the posting script can match threads by comment text."
      },
      {
       "id": "D",
       "text": "Add a `status` enum (`new`, `still_unaddressed`) and a nullable `prior_id` to the findings schema passed to `--json-schema`."
      },
      {
       "id": "E",
       "text": "Add the `--thread-replies` flag so that Claude Code posts its replies into the existing comment threads by itself."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "The re-run must see the prior findings to tell new issues from still-unaddressed ones, and its output must say which is which in machine-readable form. Prior findings with IDs in context, plus schema fields for `status` and `prior_id`, let the poster reply in the right thread, open threads only for new issues, and skip the fixed ones.",
      "wrong": {
       "B": "Line numbers shift when later commits add or remove lines, so file-and-line matching misroutes replies; and without prior findings in context the run still re-reports old issues as if they were new.",
       "C": "Claude cannot reproduce wording from runs it has never seen, and exact text matching is brittle even when it can; the status belongs in a structured field, not in phrasing.",
       "E": "Claude Code has no `--thread-replies` flag. Posting is your script's job, and the script needs the structured status to do it."
      }
     },
     "studyRef": "Task Statement 3.6 (prior findings on re-runs; --json-schema for machine-parseable findings posted as inline PR comments)"
    },
    {
     "n": 35,
     "scenario": 5,
     "domain": 3,
     "ts": "3.1",
     "tests": "@import keeps CLAUDE.md modular only when imported standards live in the repository",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI review job runs `claude -p` on every pull request. The project's root `CLAUDE.md` contains:\n\n```\n## Review standards\n@docs/architecture.md\n@~/standards/review-checklist.md\n```\n\nThe checklist exists only in the tech lead's home directory. CI reviews follow the architecture notes but ignore the checklist. The tech lead's local sessions follow it, but at least two other developers report that their local reviews ignore it too. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a CI setup step that copies the checklist into `~/standards/` on the runner before `claude -p` starts, so the import resolves."
      },
      {
       "id": "B",
       "text": "Commit the checklist to the repository and import it by a repository path, such as `@docs/review-checklist.md`."
      },
      {
       "id": "C",
       "text": "Paste the checklist's full text into the `claude -p` prompt in the CI job, so every automated review receives it directly."
      },
      {
       "id": "D",
       "text": "Move the import line into `~/.claude/CLAUDE.md` on every developer machine and on the CI runner image, so all of them load it."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`@~/...` imports a file from the importing user's home directory, so this checklist is effectively user-level: it reaches only machines that happen to have that file. Committing the checklist and importing it by a repository-relative path makes it part of the project-level configuration, shared through version control with every developer and with the CI runner's checkout.",
      "wrong": {
       "A": "This fixes CI only: developers without the file still miss it, and the checklist stays unversioned in one person's home directory, so the CI and local copies can drift.",
       "C": "This also fixes CI only and duplicates the standards outside the project's CLAUDE.md; developers' local sessions still lack the checklist.",
       "D": "User-level files are not shared through version control; this needs manual setup on every machine and image, and the checklist itself stays unversioned."
      }
     },
     "studyRef": "Task Statement 3.1 (@import for modular CLAUDE.md; user-level vs project-level sharing)"
    },
    {
     "n": 36,
     "scenario": 5,
     "domain": 3,
     "ts": "3.3",
     "tests": "Path-specific rules need a valid paths frontmatter to load conditionally",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The team created `.claude/rules/terraform.md` so Terraform conventions load only when infrastructure files are in play. Yet CI logs for a PR that touches only Python files still show those conventions in the review context. The file begins:\n\n```\n---\napplies_to: \"terraform/**/*\"\n---\nUse remote state ...\n```\n\nWhat is the most likely root cause?",
     "options": [
      {
       "id": "A",
       "text": "`claude -p` runs ignore path scoping, so every rule always loads in CI."
      },
      {
       "id": "B",
       "text": "Rules in `.claude/rules/` must be imported with `@` from the root CLAUDE.md before path scoping works."
      },
      {
       "id": "C",
       "text": "Globs such as `terraform/**/*` are not supported; the rule must be placed in a `terraform/CLAUDE.md` file instead of `.claude/rules/`."
      },
      {
       "id": "D",
       "text": "The frontmatter key is unrecognized: scoping needs a `paths` field of globs, so this rule has no path scope and always loads."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Conditional activation requires YAML frontmatter with `paths:` globs. A rule file without that field is treated as always applicable.",
      "wrong": {
       "A": "Path-scoped rules are part of project configuration and are not disabled by non-interactive mode.",
       "B": "Rule files are discovered automatically and do not need an import.",
       "C": "Glob patterns are the supported mechanism for path scoping. Moving the file does not explain why this one loads."
      }
     },
     "studyRef": "Task Statement 3.3 (+ .claude/rules paths frontmatter)"
    },
    {
     "n": 37,
     "scenario": 5,
     "domain": 3,
     "ts": "3.2",
     "tests": "argument-hint frontmatter prompts developers for a required skill parameter",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Developers use a project skill, `/explain-ci-failure`, to diagnose failed pipeline jobs locally before pushing a fix. It needs a CI job URL. Its `SKILL.md` frontmatter contains only `description: Explains why a CI job failed. Requires the job URL.` Developers often type `/explain-ci-failure` with nothing after it, and Claude then explains the most recent local test run instead, usually a different failure. You want developers prompted for the job URL when they invoke the skill without arguments. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Add a line to `CLAUDE.md` saying that `/explain-ci-failure` must always be run with a CI job URL attached."
      },
      {
       "id": "B",
       "text": "Add `context: fork`, so that the skill runs in a sub-agent that asks for the job URL before it starts."
      },
      {
       "id": "C",
       "text": "Add `argument-hint: \"<ci-job-url>\"` to the skill's frontmatter, so a bare invocation asks for it."
      },
      {
       "id": "D",
       "text": "Add `required-args: [job-url]` to the frontmatter so the skill won't start without one."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`argument-hint` is the frontmatter option for prompting developers for required parameters when they invoke a skill without arguments. The `description` explains what the skill does and when to use it; writing \"Requires the job URL\" there does not prompt anyone. Note: current Claude Code docs describe `argument-hint` as the hint shown during autocomplete for expected arguments; the Exam Guide frames it as prompting for required parameters.",
      "wrong": {
       "A": "`CLAUDE.md` is always-loaded context, not skill configuration. It does not prompt the developer and adds a skill-specific note to every session.",
       "B": "`context: fork` isolates the skill's execution from the main conversation; it has nothing to do with collecting parameters.",
       "D": "There is no `required-args` frontmatter key for skills; it is not a Claude Code mechanism."
      }
     },
     "studyRef": "Task Statement 3.2 (argument-hint frontmatter to prompt for required skill parameters)"
    },
    {
     "n": 38,
     "scenario": 5,
     "domain": 3,
     "ts": "3.4",
     "tests": "Plan mode for large multi-file migrations, especially when the files are not uniform",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your org is retiring the homegrown `ci-cache.sh` script in favor of a shared caching action. Fifty-one workflow files call the script. Nine of them run matrix builds whose cache keys include the matrix values, and four share a cache between jobs through a fixed key. A teammate proposes direct execution: \"Tell Claude Code to replace every `ci-cache.sh` call with the action. It's mechanical.\" Which approach should you take?",
     "options": [
      {
       "id": "A",
       "text": "Direct execution with one instruction to replace every call, since all 51 files invoke the same script and planning would add nothing."
      },
      {
       "id": "B",
       "text": "Plan mode first: explore how the 51 files use the script, including the matrix and shared-key cases, and design the key mapping."
      },
      {
       "id": "C",
       "text": "Direct execution in batches of ten files, reviewing each batch's diff before moving on, so that mistakes stay small."
      },
      {
       "id": "D",
       "text": "A `sed` replacement across all 51 files, then direct execution to fix whichever workflows fail on their next CI run."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A migration touching 51 files that includes non-uniform cases (matrix-dependent keys, shared keys) is the kind of multi-file change plan mode is for: explore first, design the key mapping, then implement the approved plan. Treating it as mechanical risks rework once the special cases surface.",
      "wrong": {
       "A": "The stem already shows the files are not uniform: matrix-based and shared keys need a design decision that a blanket replacement ignores.",
       "C": "Batching limits the damage per step but still discovers the matrix and shared-key problems during implementation, after files have changed; it never designs the mapping first.",
       "D": "This uses CI failures as the discovery tool, and broken cache keys often do not fail a build; they silently cause cache misses or collisions between jobs."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode for library or tooling migrations across many files)"
    },
    {
     "n": 39,
     "scenario": 5,
     "domain": 3,
     "ts": "3.5",
     "tests": "Interview pattern when the intended behavior is still undecided in an unfamiliar domain",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You are using Claude Code to build a CI bot that detects flaky tests, quarantines them, and files tickets. You have never designed flaky-test handling, and the team has not settled basic questions: whether a test that fails once in 200 runs counts as flaky, whether tests guarding auth or payments may ever be quarantined, and what should happen when a quarantined test starts failing every time. A teammate suggests writing the bot's test suite first and iterating on the failures. What should you do first?",
     "options": [
      {
       "id": "A",
       "text": "Write the bot's test suite first, as suggested, and iterate by sharing each failure until the suite passes."
      },
      {
       "id": "B",
       "text": "Have Claude interview you about thresholds, protected tests, and failure modes before it writes any code."
      },
      {
       "id": "C",
       "text": "Give Claude three sample CI run histories, each paired with the quarantine decision you expect for it."
      },
      {
       "id": "D",
       "text": "Ask for an implementation that follows industry best practices, then tune it after a week of real CI runs."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The interview pattern has Claude ask questions before implementing, surfacing considerations you have not anticipated in an unfamiliar domain: thresholds, tests that must never be quarantined, and failure modes. Once those decisions are made, they can be encoded as tests.",
      "wrong": {
       "A": "Test-first iteration needs a known target. With the quarantine policy undecided, the tests would encode guesses, and iterating until they pass would lock those guesses in.",
       "C": "Input/output examples clarify a transformation you already understand; you cannot state the expected decision for each history until the policy questions are answered.",
       "D": "Implementing first and tuning in production means the undecided cases, such as quarantining an auth test, are discovered as incidents instead of as design questions."
      }
     },
     "studyRef": "Task Statement 3.5 (interview pattern to surface design considerations before implementing in unfamiliar domains)"
    },
    {
     "n": 40,
     "scenario": 5,
     "domain": 3,
     "ts": "3.5",
     "tests": "Providing all issues in a single message when fixes interact versus sequential iteration",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A generated PR-summary template has three problems: it is too long, it drops the required severity field, and the dedupe rule hides low-severity notes. Shortening the template tends to remove the severity field, and the dedupe rule depends on that field. How should you request the fixes?",
     "options": [
      {
       "id": "A",
       "text": "Describe all three problems together in one message, noting how they interact."
      },
      {
       "id": "B",
       "text": "Fix them one per message in separate turns, starting with the length problem, then severity, then dedupe."
      },
      {
       "id": "C",
       "text": "Fix only the length problem now and assume the other two problems will disappear on their own."
      },
      {
       "id": "D",
       "text": "Start three separate sessions, one per problem, then merge the three templates by hand."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "When fixes interact, they should be given in a single message. Changing one in isolation would break another.",
      "wrong": {
       "B": "Sequential fixes make sense for independent problems. Here shortening can remove the severity field again.",
       "C": "The other two problems have their own causes and will not resolve themselves.",
       "D": "Merging three separately edited templates recreates the interactions you needed to handle together."
      }
     },
     "studyRef": "Task Statement 3.5 (+ interacting versus independent issues)"
    },
    {
     "n": 41,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Categorical report/skip criteria instead of a self-rated confidence threshold",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI reviewer posts about 30 findings per pull request, and developers dismiss 46% of them. A sample of dismissals shows style nits, renaming suggestions, and flags on `legacy/` helpers that follow a documented local convention. A teammate ran an A/B test on 400 PRs: telling Claude to report only findings it rates at 0.8 confidence or higher cut dismissals to 31%, but it also dropped 38% of the confirmed security and logic bugs, which Claude had rated between 0.6 and 0.75. Which change should you make?",
     "options": [
      {
       "id": "A",
       "text": "Adopt the 0.8 confidence threshold, since it cuts dismissals by a third, and rely on human reviewers to catch the bugs it drops."
      },
      {
       "id": "B",
       "text": "Lower the threshold to 0.6 so the security and logic bugs pass the filter, accepting that dismissals will go back to roughly their current level."
      },
      {
       "id": "C",
       "text": "Add \"be conservative and avoid nitpicking\" to the review prompt, which reduces style noise without depending on confidence scores."
      },
      {
       "id": "D",
       "text": "State what to report (logic bugs, security, data loss) and what to skip (style, naming, documented conventions such as the `legacy/` helpers)."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The dismissed findings fall into identifiable categories, and the A/B test shows that self-rated confidence does not track value: real bugs scored lower than the noise did. Explicit categorical criteria for what to report and what to skip remove the style and local-convention noise directly, without filtering out the bug findings.",
      "wrong": {
       "A": "The test shows the threshold drops 38% of the confirmed security and logic bugs. Trading real bugs for fewer dismissals is the wrong tradeoff; those findings are why the reviewer exists.",
       "B": "This keeps the bugs but brings the noise back, because the noise is not low-confidence. A confidence threshold cannot separate the two categories.",
       "C": "General instructions such as \"be conservative\" do not improve precision: they do not say which findings matter, so the model's choices barely change."
      }
     },
     "studyRef": "Task Statement 4.1 (specific report/skip criteria instead of confidence-based filtering)"
    },
    {
     "n": 42,
     "scenario": 5,
     "domain": 4,
     "ts": "4.6",
     "tests": "Independent review instance versus self-review in the generating session",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "In the CI pipeline Claude generates a patch and, in the same session, is asked to \"review your changes critically\". It rarely finds problems, while human reviewers regularly do. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Review the patch with a second, independent Claude instance that does not have the generator's reasoning context."
      },
      {
       "id": "B",
       "text": "Enable extended thinking for the self-review step."
      },
      {
       "id": "C",
       "text": "Add \"be extremely harsh\" to the self-review instruction."
      },
      {
       "id": "D",
       "text": "Run the same self-review prompt twice and merge the findings."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A model retains its reasoning from generation and is less likely to question its own decisions. A fresh instance reviews without that bias.",
      "wrong": {
       "B": "More reasoning in the same session still starts from the generator's context and assumptions.",
       "C": "A harsher tone does not remove the retained context, and the forced bug count invites invented issues.",
       "D": "Both passes share the same bias because they are in the same session context."
      }
     },
     "studyRef": "Task Statement 4.6 (+ independent review instances)"
    },
    {
     "n": 43,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Refining the prompt on a sample set before processing a large batch",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A nightly job will use the Message Batches API to generate tests for 12,000 files. A trial of 200 files showed 31% of outputs failing the output schema or the team's quality bar, and resubmitting failures is expensive. What is the best way to proceed?",
     "options": [
      {
       "id": "A",
       "text": "Refine the prompt on a small representative sample, then submit the full batch."
      },
      {
       "id": "B",
       "text": "Submit all 12,000 files now and fix whichever fail afterwards, since batch pricing is 50% cheaper."
      },
      {
       "id": "C",
       "text": "Switch the whole job to synchronous API calls to avoid failures."
      },
      {
       "id": "D",
       "text": "Split the 12,000 files into many tiny batches of 10 each so failures are easier to find and retry."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Prompt refinement on a sample maximizes first-pass success and reduces costly resubmission of large volumes.",
      "wrong": {
       "B": "Paying for 12,000 requests with a 31% failure rate wastes the savings and multiplies resubmissions.",
       "C": "Synchronous calls do not fix the prompt problem and would give up the discount for a latency-tolerant job.",
       "D": "Smaller batches do not improve the success rate and add overhead; the failures come from the prompt."
      }
     },
     "studyRef": "Task Statement 4.5 (+ prompt refinement before batch submission)"
    },
    {
     "n": 44,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "Recording detected_pattern at generation time enables dismissal analysis; post-hoc classification is not a substitute",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Developers mark 34% of your CI review bot's PR comments as \"not useful\". Each item in the bot's JSON output has `file`, `line`, `severity`, and `message`, and the message wording varies from run to run, often without naming the code involved. A teammate proposes a monthly job that sends the text of every dismissed comment to a separate Claude call, which guesses what kind of code triggered it, then tallies the guesses so the team can tune the review prompt. What is the better way to make these dismissals analyzable?",
     "options": [
      {
       "id": "A",
       "text": "Adopt the monthly job as proposed, since a separate model can infer the triggering code from the comment text with no output change."
      },
      {
       "id": "B",
       "text": "Group the dismissals by `severity` each month, since dismissed high-severity comments are the false positives that cost the most time."
      },
      {
       "id": "C",
       "text": "Add a `detected_pattern` field naming the triggering construct on each finding, and log every dismissal against its finding."
      },
      {
       "id": "D",
       "text": "Raise the minimum `severity` the bot posts from low to medium, so fewer comments reach developers and dismissals fall."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Recording `detected_pattern` when a finding is generated captures the construct the reviewer actually reacted to, in a consistent field, so dismissals can be grouped and per-pattern dismissal rates computed. Guessing the construct later from reworded comment text adds a second model and produces inconsistent labels.",
      "wrong": {
       "A": "The comments often do not name the code and their wording varies, so the classifier guesses from incomplete text; it adds infrastructure and still yields labels not tied to what triggered the finding.",
       "B": "Severity is the bot's claimed importance, not the construct that triggered the finding, so it cannot show which patterns produce false positives.",
       "D": "Suppressing low-severity comments hides the symptom without identifying which constructs cause false positives, and may drop useful findings too."
      }
     },
     "studyRef": "Task Statement 4.4 (detected_pattern fields for analyzing false-positive dismissal patterns)"
    },
    {
     "n": 45,
     "scenario": 5,
     "domain": 2,
     "ts": "2.4",
     "tests": "Tools from all configured MCP servers are available simultaneously in one run",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI review runs `claude -p` with the committed `.mcp.json`, which defines `github` and `sonarqube`. The team now wants each review to flag changed functions that have open production errors, citing the Sentry issue ID. An engineer's pull request adds a `sentry` server to `.mcp.json` (token via `${SENTRY_TOKEN}`) and also splits the job in two: a first `claude -p` run with a Sentry-only config writes all open Sentry issues (about 4,000) to `sentry.md`, and the review run reads that file, \"because a run can only use one MCP server's tools at a time.\" What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Keep the `sentry` entry but drop the split: one run gets the tools of every configured server and can query Sentry for just the changed functions."
      },
      {
       "id": "B",
       "text": "Keep the split, but have the first run write only the 50 most recent Sentry issues, so `sentry.md` fits the review run's context."
      },
      {
       "id": "C",
       "text": "Merge `github`, `sonarqube`, and Sentry into one custom proxy MCP server, so that a single run can reach all three systems."
      },
      {
       "id": "D",
       "text": "Keep the split, but hand the first run's output to the review run with `--resume`, so the Sentry data arrives as session history and not as a file."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Tools from all configured MCP servers are discovered at connection time and are available to the agent simultaneously, so the premise of the split is false. With `github`, `sonarqube`, and `sentry` all in `.mcp.json`, one review run can look up Sentry issues for exactly the functions the diff changes instead of loading 4,000 issues it mostly does not need.",
      "wrong": {
       "B": "It keeps a design built on a false premise and drops issues arbitrarily: a changed function's errors may be older than the 50 most recent.",
       "C": "A custom proxy adds a server to build and maintain only to work around a limitation that does not exist.",
       "D": "Still built on the false premise, and resuming the first session pulls the entire 4,000-issue dump into the review's context."
      }
     },
     "studyRef": "Task Statement 2.4 (tools from all configured MCP servers are discovered at connection time and available simultaneously)"
    },
    {
     "n": 46,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "tool_choice any when the document type is unknown; forced tool when it is already known",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Documents reach your extraction service through two intake paths. The AP mailbox receives only supplier invoices, and the mail gateway tags each one `source=ap_mailbox`. The scan station receives an unlabeled mix of invoices, receipts, and delivery notes. Both paths send the same request with three tools (`extract_invoice`, `extract_receipt`, `extract_delivery_note`) and `tool_choice: {\"type\": \"any\"}`. Every response is a tool call, but 3% of AP-mailbox invoices that resemble till receipts are extracted with `extract_receipt`, losing `po_number` and `payment_terms`. Scan-station accuracy is acceptable. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Switch both paths to `\"auto\"`, so the model can answer in text when a document does not clearly fit a tool, and send those replies to manual review."
      },
      {
       "id": "B",
       "text": "Keep `\"any\"` on both paths, and add the `source=ap_mailbox` tag to the user message so the model can infer it is an invoice."
      },
      {
       "id": "C",
       "text": "Force `extract_invoice` for AP-mailbox documents with `{\"type\": \"tool\", \"name\": \"extract_invoice\"}`; keep `\"any\"` for the scan station."
      },
      {
       "id": "D",
       "text": "Force `extract_invoice` on both paths, because forcing a single named tool is the most reliable way to get structured output from every document."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`\"any\"` is the right setting when several extraction schemas exist and the type is unknown, as at the scan station. For the AP mailbox the type is already known, so there is no reason to let the model choose; forcing `extract_invoice` guarantees the invoice schema runs on every invoice. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; the Exam Guide still tests auto / any / forced selection, so answer per the guide.",
      "wrong": {
       "A": "`\"auto\"` lets the model reply in text instead of calling a tool, which removes the structured-output guarantee, and it does nothing to stop invoices going to `extract_receipt`.",
       "B": "This leaves a known fact to the model's inference. It may help, but it is still probabilistic when the type can simply be fixed for that path.",
       "D": "Scan-station documents are a mix of types, so forcing the invoice schema there would extract receipts and delivery notes as invoices. Forcing fits only the path where the type is known."
      }
     },
     "studyRef": "Task Statement 4.3 (tool_choice: \"any\" when the document type is unknown vs forcing a specific named tool)"
    },
    {
     "n": 47,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "tool_choice any when multiple extraction schemas exist and the document type is unknown",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Documents arrive without type labels. You define three extraction tools (`extract_invoice`, `extract_contract`, `extract_receipt`). With `tool_choice: \"auto\"`, about 5% of requests come back as conversational text asking what kind of document it is. Your latency budget allows only one model call per document. Which setting is best?",
     "options": [
      {
       "id": "A",
       "text": "Set `tool_choice` to `\"any\"` so the model must call one of the extraction tools."
      },
      {
       "id": "B",
       "text": "Force `extract_invoice` with `tool_choice: {\"type\": \"tool\", \"name\": \"extract_invoice\"}`."
      },
      {
       "id": "C",
       "text": "Keep `\"auto\"` and add a prompt line: \"Never ask the user questions.\""
      },
      {
       "id": "D",
       "text": "Add a separate classification model call to label the document type first, then force the matching tool."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`any` guarantees a tool call while letting the model choose the right schema for an unknown document type. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "B": "Forcing one tool would make contracts and receipts be extracted with the invoice schema.",
       "C": "The structured output is still not guaranteed because the model may return text; this is prompt-level compliance.",
       "D": "A pre-classifier is more machinery than needed when `\"any\"` already makes the model select among the tools."
      }
     },
     "studyRef": "Task Statement 4.3 (+ tool_choice any vs forced)"
    },
    {
     "n": 48,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Format normalization rules in the prompt, alongside a strict schema, to resolve ambiguous source formats",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your extractor returns `invoice_date` as an ISO 8601 string through a strict tool schema. US suppliers write dates as MM/DD/YYYY, while German and UK suppliers write DD/MM/YYYY, and nothing in a date like \"04/03/2025\" shows which. Every output is schema-valid, yet 7% of dates whose day is 12 or lower come back wrong; \"04/03/2025\" from a Munich supplier was returned as `2025-04-03`. Every invoice shows the supplier's address, and many contain other dates such as \"Lieferdatum: 25/02/2025\". How should you fix this?",
     "options": [
      {
       "id": "A",
       "text": "Add `\"format\": \"date\"` to `invoice_date` in the schema, so that the strict schema rejects any value that is not a real calendar date."
      },
      {
       "id": "B",
       "text": "Extract `invoice_date` as the raw string and convert it downstream with a date library that detects each date's format automatically."
      },
      {
       "id": "C",
       "text": "Have the model report its confidence in each date and send any date with a confidence below 0.8 to manual review before posting."
      },
      {
       "id": "D",
       "text": "Add prompt rules to infer the day/month order from the supplier's country and from unambiguous dates, then output ISO 8601."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The schema guarantees a well-formed ISO string, not the right day and month. Normalization rules in the prompt, alongside the strict schema, tell the model how to resolve the ambiguity from evidence in the document: the supplier's country and any unambiguous dates such as 25/02/2025. Only the extraction step sees that evidence.",
      "wrong": {
       "A": "Both readings of \"04/03/2025\" are real calendar dates, so a format constraint accepts the wrong one. Schema constraints check form, not meaning.",
       "B": "A library looking only at \"04/03/2025\" cannot know the order and falls back to a default, usually month-first, which is wrong for German and UK suppliers. The needed context is in the document, not the string.",
       "C": "Self-reported confidence is poorly calibrated, and the model is confidently wrong here. Routing dates to review treats the symptom instead of giving the model the rule."
      }
     },
     "studyRef": "Task Statement 4.3 (format normalization rules in prompts alongside strict output schemas)"
    },
    {
     "n": 49,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples generalize to documents that match no example; add targeted examples for specific confusions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your freight-invoice extractor classifies each accessorial charge (fuel surcharge, liftgate, detention, and so on). The prompt has three few-shot examples from three carriers, each with a line explaining the classification. On a test set from 50 carriers that appear in no example, accuracy is 94%, against 96% for the three example carriers; most errors are `detention` charges labeled `storage`. A teammate proposes writing one example for each of your 310 carriers, because \"few-shot examples only work on documents that match an example.\" How should you respond?",
     "options": [
      {
       "id": "A",
       "text": "Agree: few-shot examples only teach the layouts they show, and the two-point gap proves unseen carriers are handled poorly."
      },
      {
       "id": "B",
       "text": "Agree in principle, but fine-tune a model on the 310 carrier examples instead, because that many examples will not fit in one prompt."
      },
      {
       "id": "C",
       "text": "Disagree: 94% on unseen carriers shows the examples generalize; add one example contrasting `detention` with `storage` instead."
      },
      {
       "id": "D",
       "text": "Disagree, and remove the examples entirely, because examples from just three carriers bias the model toward copying their layouts."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Examples with reasoning let the model generalize its judgment to documents that match no example, and 94% accuracy on 50 unseen carriers shows that happening. The remaining errors are one specific confusion, so a single targeted example that contrasts `detention` with `storage` and explains the difference addresses them without a 310-example prompt.",
      "wrong": {
       "A": "The premise is false: the model already reaches 94% on carriers it has never seen. The errors are concentrated in one pair of charge types, not spread across unseen layouts.",
       "B": "Generalization does not require fine-tuning; a few targeted examples already generalize, as the unseen-carrier results show, and the gap is one specific confusion.",
       "D": "Removing the examples would lose the guidance that produces 94% on unseen carriers. Examples with reasoning teach judgment, not copying."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples let the model generalize judgment to novel patterns)"
    },
    {
     "n": 50,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Handling stated_total vs calculated_total mismatches: one targeted retry for misreads, conflict_detected for source errors",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your invoice extraction returns `stated_total` (as printed), `calculated_total` (the sum of the extracted line items), and `conflict_detected`. Of 4,000 invoices a day, about 200 come back with the two totals different. All 200 go to reviewers, who can clear 60 a day, so the backlog grows by about 140 a day. A labeled audit of 300 past mismatches found that 76% were model misreads of one line item (for example `1,800` read as `1.800`) that a re-extraction fixed, and 24% were arithmetic errors printed in the source document. Which handling policy best fits these numbers?",
     "options": [
      {
       "id": "A",
       "text": "On a mismatch, retry once with the document, failed extraction, and discrepancy; if it persists, set `conflict_detected` and review."
      },
      {
       "id": "B",
       "text": "Keep sending every mismatch to reviewers, but have them work the queue by invoice amount, largest first, so the riskiest are cleared."
      },
      {
       "id": "C",
       "text": "On a mismatch, re-prompt with \"the totals must match\" up to five times, and route to review only invoices that never agree."
      },
      {
       "id": "D",
       "text": "On a mismatch, overwrite `stated_total` with `calculated_total`, so every record that reaches the ERP is always internally consistent."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Misreads are correctable extraction errors, so one retry that includes the document, the failed output, and the specific discrepancy should fix most of them (about 152 of 200). The remaining true source errors (about 48) keep `conflict_detected` set and go to review, which fits the 60-a-day capacity.",
      "wrong": {
       "B": "Reordering does not change throughput: 200 arrive, 60 are cleared, and the backlog still grows by about 140 a day, mostly with misreads a retry would fix.",
       "C": "For the 24% whose printed totals are genuinely wrong, the only way to make the totals agree is to change correctly read values, so repeated \"must match\" pressure invites fabricated corrections instead of surfacing the conflict.",
       "D": "This silently resolves every conflict in favor of the extracted line items, so misread lines reach the ERP as wrong totals and true source errors are hidden."
      }
     },
     "studyRef": "Task Statement 4.4 (calculated_total vs stated_total, conflict_detected, retry with specific feedback)"
    },
    {
     "n": 51,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Retry limits: effective for format errors, ineffective when information is absent from the source",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two validation failures appear in the retry queue. Failure 1: `invoice_date` was extracted as \"March 3rd\" and fails the ISO 8601 pattern. Failure 2: `vendor_tax_id` is empty, and the document states \"Tax ID: see attached W-9\", which was not provided. How should the pipeline handle them?",
     "options": [
      {
       "id": "A",
       "text": "Retry both with the same error-feedback prompt, up to three times each, before giving up and routing to review."
      },
      {
       "id": "B",
       "text": "Retry failure 1 with the specific error; accept null for failure 2 and route it to review."
      },
      {
       "id": "C",
       "text": "Retry neither; reject both documents for manual data entry."
      },
      {
       "id": "D",
       "text": "Retry failure 2 with a bigger model, since a stronger model is more likely to find the tax ID in the document."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Retry with error feedback fixes format and structural errors. It cannot recover data that is not in the document.",
      "wrong": {
       "A": "Retrying failure 2 cannot succeed and may encourage a fabricated tax ID.",
       "C": "Failure 1 is a simple format mismatch that a retry with the specific error can correct automatically.",
       "D": "No model can extract information the document does not contain."
      }
     },
     "studyRef": "Task Statement 4.4 (+ when retry helps)"
    },
    {
     "n": 52,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "A multi-day backfill is latency-tolerant even though the batch API has no latency SLA; correlate results by custom_id",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You added `incoterm` and `payment_terms` to your invoice extraction schema and must re-extract 64,000 archived invoices before month-end close, 9 days away. The updated prompt and schema have already passed testing on a 500-invoice sample. The current plan reuses the synchronous pipeline. A colleague objects to the Message Batches API: \"It has no latency guarantee, so we can't plan around it.\" What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Keep the synchronous pipeline, since a job with a fixed deadline shouldn't depend on an API that has no latency guarantee."
      },
      {
       "id": "B",
       "text": "Use the batch API, poll every minute, and fall back to synchronous calls for any request not finished within an hour."
      },
      {
       "id": "C",
       "text": "Use the batch API, and match each result to its invoice by its position in the results file."
      },
      {
       "id": "D",
       "text": "Use the batch API with each invoice ID as its `custom_id`, then resubmit only the failures by that ID."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Batch processing can take up to 24 hours with no finer guarantee, which matters only when the deadline is shorter than that window plus any resubmission. A 9-day backfill is latency-tolerant, so it gets the 50% saving safely. Setting `custom_id` to the invoice ID correlates each result with its invoice and lets you resubmit only the failed ones.",
      "wrong": {
       "A": "The lack of a latency SLA rules out blocking or short-deadline work, not a job with 9 days of slack; this gives up the 50% saving for nothing.",
       "B": "A one-hour fallback adds complexity to protect a deadline that is days away and would push much of the work back to full-price synchronous calls.",
       "C": "Batch results are not guaranteed to come back in submission order; correlate them by `custom_id`, not by position."
      }
     },
     "studyRef": "Task Statement 4.5 (batch for latency-tolerant workloads; up to 24h, no SLA; custom_id correlation)"
    },
    {
     "n": 53,
     "scenario": 6,
     "domain": 4,
     "ts": "4.5",
     "tests": "Handling batch failures by resubmitting only failed items identified by custom_id",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A batch of 5,000 documents completes: 4,870 succeeded and 130 failed with context-length errors. What is the best handling?",
     "options": [
      {
       "id": "A",
       "text": "Resubmit the full batch of 5,000 with the same settings."
      },
      {
       "id": "B",
       "text": "Use each result's `custom_id` to identify the 130 failures, chunk those oversized documents, and resubmit only them."
      },
      {
       "id": "C",
       "text": "Match results to documents by their position in the results file."
      },
      {
       "id": "D",
       "text": "Resubmit only the 130 failures unchanged, since the errors were probably transient."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`custom_id` correlates results with requests, so you can resubmit just the failed items with an appropriate modification.",
      "wrong": {
       "A": "This pays again for the 4,870 successes, and the oversized documents would fail again.",
       "C": "Batch results are not guaranteed to be returned in request order; position-based matching can misattribute results.",
       "D": "Context-length errors are deterministic for a given input, so unchanged resubmission fails again."
      }
     },
     "studyRef": "Task Statement 4.5 (+ custom_id and failure handling)"
    },
    {
     "n": 54,
     "scenario": 6,
     "domain": 4,
     "ts": "4.6",
     "tests": "Per-document local passes plus a cross-document integration pass, and independent review without generator context",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Claim packets contain 12 to 15 documents. A single-pass extraction over the whole packet gives uneven depth: some documents are extracted carefully, others superficially, and cross-document fields (claimant name, loss date) sometimes disagree between documents. Asking the same session to double-check its own output rarely changes anything. Which TWO changes are best? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Ask the same session to re-read its extraction and confirm it is correct before returning."
      },
      {
       "id": "B",
       "text": "Extract each document in its own focused pass, then run a separate integration pass that checks cross-document fields for consistency."
      },
      {
       "id": "C",
       "text": "Run the single pass three times and keep only the fields that match in at least two runs."
      },
      {
       "id": "D",
       "text": "Have an independent Claude instance, without the extraction reasoning context, verify the flagged fields against the source documents."
      },
      {
       "id": "E",
       "text": "Move to a model with a larger context window so all 15 documents get equal attention in one pass."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "Per-document local passes avoid attention dilution, and a dedicated integration pass catches cross-document inconsistencies. This is the multi-pass review pattern. A fresh instance is not anchored on the extractor's earlier decisions, so it is better at catching subtle errors than self-review.",
      "wrong": {
       "A": "Same-session self-review retains the generator's reasoning and is the approach already shown to rarely change anything.",
       "C": "Consensus voting can suppress real findings that surface only intermittently and does not address uneven attention or cross-document checks.",
       "E": "A larger window does not fix attention dilution across many documents."
      }
     },
     "studyRef": "Task Statement 4.6 (+ per-document passes, integration pass, independent instance)"
    },
    {
     "n": 55,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Strict schemas eliminate syntax errors but not semantic errors such as values in the wrong field",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Three weeks after you moved your freight-invoice extractor from prompt-requested JSON to a strict `extract_freight_invoice` tool, the dashboard shows 0 schema-validation failures across 41,000 invoices, down from 2.7%. The project lead proposes removing the downstream reconciliation step, which recomputes tax from the rate and subtotal and compares line-item sums with `total_due`, because \"the schema now guarantees correct output.\" A spot audit of 500 invoices finds 9 where the fuel surcharge was placed in `tax_amount`. How should you respond?",
     "options": [
      {
       "id": "A",
       "text": "Agree, and treat the 9 audit findings as noise, because strict tool use guarantees every value satisfies the schema's types and required fields."
      },
      {
       "id": "B",
       "text": "Agree to remove the step, but add a `pattern` constraint to `tax_amount` in the schema so that surcharge values fail validation."
      },
      {
       "id": "C",
       "text": "Disagree, and go back to prompt-requested JSON, because strict mode hides the extraction errors that parse failures used to expose."
      },
      {
       "id": "D",
       "text": "Keep the reconciliation step: a strict schema eliminates syntax errors, not semantic ones such as values in the wrong field."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool use with a strict schema eliminates malformed JSON, which is why validation failures fell to zero. It cannot tell whether a correctly typed number belongs in `tax_amount` or somewhere else. The surcharge-in-tax cases from the audit are exactly the semantic errors the reconciliation step exists to catch, so it has to stay.",
      "wrong": {
       "A": "Schema-valid is not the same as correct. The 9 findings are real semantic errors: the right type in the wrong field.",
       "B": "A surcharge and a tax amount are both numbers, so no schema pattern can tell which one a value is. Field placement has to be checked semantically.",
       "C": "Parse failures never exposed misplaced values; they were syntax errors. Going back would bring the 2.7% failures back and still miss the semantic errors."
      }
     },
     "studyRef": "Task Statement 4.3 (strict JSON schemas eliminate syntax errors but not semantic errors)"
    },
    {
     "n": 56,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Routing low-confidence or contradictory extractions to human review given limited capacity",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Two reviewers can check about 300 documents a day, but 2,000 documents arrive daily. How should you decide which extractions get human review?",
     "options": [
      {
       "id": "A",
       "text": "Review the first 300 documents that arrive each day, in the order they were received, until capacity is spent."
      },
      {
       "id": "B",
       "text": "Route low-confidence and contradictory extractions to reviewers using field-level confidence."
      },
      {
       "id": "C",
       "text": "Review every document of the newest document type and none of the others, regardless of how confident the model was."
      },
      {
       "id": "D",
       "text": "Review documents in the order the model finished processing them, starting with the longest documents."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Confidence-based routing prioritizes limited reviewer capacity where errors are most likely, and a labeled set calibrates thresholds.",
      "wrong": {
       "A": "Arrival order has nothing to do with risk, so review attention is spent on random documents.",
       "C": "Document type is only one factor; confidence and contradictions within other types are ignored.",
       "D": "Length and finish order are not risk signals."
      }
     },
     "studyRef": "Task Statement 5.5 (+ routing by field-level confidence)"
    },
    {
     "n": 57,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Route extractions from contradictory source documents to human review regardless of confidence",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline extracts fields from franchise agreement packets. A packet is auto-accepted when every field's confidence clears a threshold calibrated on a labeled set; the rest go to reviewers, who can handle 250 packets a day and now receive about 190 of the 3,000 that arrive. A stratified audit of auto-accepted packets found `royalty_rate` wrong in 1.4% of them. Nearly all of those contain a base agreement and an addendum that state different rates, and which one governs depends on clauses that vary by packet. In them the model picked one rate with 0.96 to 0.99 confidence, the same range as its correct extractions; about 70% of all `royalty_rate` values score below 0.995. Such packets are about 1.5% of volume. What change best addresses this?",
     "options": [
      {
       "id": "A",
       "text": "Raise the `royalty_rate` threshold to 0.995, so these incorrect extractions fall below it and are routed to reviewers."
      },
      {
       "id": "B",
       "text": "Instruct the model to always take the rate from the most recent addendum, since later documents normally supersede earlier ones."
      },
      {
       "id": "C",
       "text": "Flag packets whose documents state conflicting values, and route every flagged packet to review regardless of confidence."
      },
      {
       "id": "D",
       "text": "Raise the stratified audit sample of auto-accepted packets from 2% to 10% of volume, so that more of these errors get caught."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Confidence reflects how sure the model is about what it read, not whether the sources agree, and here the wrong rates score like correct ones. Contradictory source documents are their own review trigger: flag them and send them to humans regardless of confidence. At about 45 packets a day, this fits within the roughly 60 packets of spare review capacity.",
      "wrong": {
       "A": "The wrong extractions score in the same range as correct ones, so no threshold separates them; at 0.995 about 70% of packets (some 2,100 a day) would go to review, far beyond 250.",
       "B": "Which document governs varies by packet, so a fixed precedence rule silently resolves the conflict and is wrong whenever the base agreement controls.",
       "D": "Sampling measures error rates; it does not route these packets. Even a 10% sample lets about nine in ten of them through unreviewed, so the wrong rates still reach downstream systems."
      }
     },
     "studyRef": "Task Statement 5.5 (routing low-confidence or contradictory-source extractions to human review)"
    },
    {
     "n": 58,
     "scenario": 6,
     "domain": 5,
     "ts": "5.1",
     "tests": "Upstream extractors must include metadata (dates, source locations) in structured outputs for accurate downstream reconciliation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline extracts each document of a supplier contract package separately (master agreement, amendments, rate schedules); then a reconciliation call merges the per-document JSON records into one contract profile. Its context budget fits the records but not the source documents. Each record holds only field values, such as `payment_terms: \"Net 45\"`, and packages are uploaded in no particular order. When an amendment changes payment terms from Net 45 to Net 30, the profile still shows Net 45 in 38% of affected packages, and auditors cannot tell which document a value came from. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Also give the reconciliation call the full text of every source document, so that it can check which value is current."
      },
      {
       "id": "B",
       "text": "Add a `confidence` score to each extracted field, and have reconciliation keep whichever value has the higher score."
      },
      {
       "id": "C",
       "text": "Tell reconciliation to prefer values from records that appear later in its input, ordering the records by upload time."
      },
      {
       "id": "D",
       "text": "Have each extractor return, for every field, the source document's effective date and the section it came from."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The downstream step can only reconcile what its input tells it. Requiring each upstream extraction to carry metadata, the source document's effective date and the section or page of each value, lets reconciliation pick the value in force and lets auditors trace it, while staying within the reconciliation call's limited context budget.",
      "wrong": {
       "A": "The stem states that the budget does not fit the source documents; the fix has to make the records self-describing instead.",
       "B": "Both values were extracted correctly from their own documents, so confidence cannot say which one is current; recency needs dates, not certainty.",
       "C": "Packages arrive in no particular order, so upload position says nothing about which document is in force; it also leans on position in a long input."
      }
     },
     "studyRef": "Task Statement 5.1 (require metadata such as dates and source locations in upstream structured outputs)"
    },
    {
     "n": 59,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Stratified random sampling of high-confidence extractions to measure error rates and detect novel patterns",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After launch, high-confidence extractions skip human review. How should you keep measuring their error rate and detect new error patterns?",
     "options": [
      {
       "id": "A",
       "text": "Review only the low-confidence extractions, since those are the risky ones."
      },
      {
       "id": "B",
       "text": "Stop reviewing once the first month shows no problems."
      },
      {
       "id": "C",
       "text": "Regularly review a stratified random sample of high-confidence extractions, by document type and field."
      },
      {
       "id": "D",
       "text": "Ask the model to self-report, after each extraction, whether any of its high-confidence answers might be wrong or incomplete."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Stratified random sampling provides an unbiased error-rate estimate per segment and can reveal novel patterns hidden in the auto-approved set.",
      "wrong": {
       "A": "This never examines the auto-approved set, so errors in high-confidence outputs go undetected.",
       "B": "Without ongoing sampling, drift and new document formats will go unnoticed.",
       "D": "Self-reported confidence is poorly calibrated and cannot replace measured error rates."
      }
     },
     "studyRef": "Task Statement 5.5 (+ stratified sampling)"
    },
    {
     "n": 60,
     "scenario": 6,
     "domain": 5,
     "ts": "5.6",
     "tests": "Including conflicting values with annotations rather than arbitrarily selecting one",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A purchase order lists a total of $1,200, while the matching invoice for the same order lists $1,250. The pipeline currently keeps whichever document is newer and discards the other. What is a better design?",
     "options": [
      {
       "id": "A",
       "text": "Average the two amounts and store the mean as the order total without any flag or note."
      },
      {
       "id": "B",
       "text": "Keep the larger amount to be safe, and discard the smaller one without any comment."
      },
      {
       "id": "C",
       "text": "Retry the extraction repeatedly until both documents happen to give the same total amount."
      },
      {
       "id": "D",
       "text": "Keep both values, flag `conflict_detected`, and route for reconciliation."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Conflicting values should be preserved and annotated with attribution so the next stage can reconcile them instead of silently picking one.",
      "wrong": {
       "A": "An average matches neither source and corrupts financial records.",
       "B": "An arbitrary pick discards one source and may overcharge or understate.",
       "C": "The discrepancy is in the sources; retrying cannot make them agree."
      }
     },
     "studyRef": "Task Statement 5.6 (+ conflict annotation)"
    }
   ]
  },
  {
   "id": "exam5",
   "title": "Mock Exam 5",
   "scenarioIds": [
    2,
    3,
    4,
    5
   ],
   "questions": [
    {
     "n": 1,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Using @import to selectively include relevant standards files per package",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your monorepo has `packages/billing`, `packages/web`, and `packages/infra`, plus a shared `docs/standards/` folder containing `payments-rules.md`, `react-style.md`, `terraform-style.md`, and `security-baseline.md`. The root `CLAUDE.md` is currently 1,400 lines and contains all of this material, so Claude loads every standard in every session regardless of which package you are working in. Maintainers want each package to receive only the standards that apply to it, while keeping a single source of truth for each standard. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Keep all 1,400 lines in the root file but add section headings, and tell Claude at the top to read only the section matching the current package."
      },
      {
       "id": "B",
       "text": "Copy the content of each standards file into the CLAUDE.md of every package that needs it so each package file is self-contained."
      },
      {
       "id": "C",
       "text": "Use `@` imports in each package's `CLAUDE.md` for only its relevant `docs/standards/` files."
      },
      {
       "id": "D",
       "text": "Have each maintainer place the relevant standards in their own `~/.claude/CLAUDE.md` and import them from there."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`@import` lets a project or directory-level CLAUDE.md reference specific external files, keeping CLAUDE.md modular. Each package's file imports only the standards its maintainers know are relevant, and the standards remain single-sourced in `docs/standards/`.",
      "wrong": {
       "A": "Headings do not prevent loading: every line still consumes context in every session, and relying on Claude to ignore irrelevant sections is inference, not scoping.",
       "B": "Duplicating content creates multiple copies that drift apart; it gives up the single source of truth the maintainers asked for.",
       "D": "User-level files apply only to that user and are not shared via version control, so teammates would not receive the standards at all."
      }
     },
     "studyRef": "Task Statement 3.1 (study CLAUDE.md hierarchy, @import syntax, and .claude/rules/ as the modular alternatives)"
    },
    {
     "n": 2,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Choosing between skills (on-demand workflows) and CLAUDE.md (always-loaded standards)",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team has two kinds of guidance for Claude Code: (1) a rule that all TypeScript must use strict null checks and named exports, which is relevant to almost every task; and (2) a 25-step procedure for cutting a release (bump versions, regenerate the changelog, tag, draft release notes) that is needed only a few times per month. How should you organize these?",
     "options": [
      {
       "id": "A",
       "text": "Put both in the project `CLAUDE.md` so that Claude always has everything it might need."
      },
      {
       "id": "B",
       "text": "Put the TypeScript rule in a skill and the release procedure in the project `CLAUDE.md`."
      },
      {
       "id": "C",
       "text": "Put the TypeScript rule in the project `CLAUDE.md` and the release procedure in a project skill under `.claude/skills/` that developers invoke when releasing."
      },
      {
       "id": "D",
       "text": "Put the TypeScript rule in `~/.claude/CLAUDE.md` and the release procedure in `~/.claude/skills/`."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "CLAUDE.md is for always-loaded, universal standards; skills are for on-demand, task-specific workflows. Project-level locations are shared via version control.",
      "wrong": {
       "A": "The 25-step release procedure would be loaded into context in every session even though it is rarely relevant, wasting context.",
       "B": "This reverses the allocation: universal standards belong in always-loaded CLAUDE.md, and task-specific workflows belong in on-demand skills.",
       "D": "Both locations are personal and not shared through version control, so teammates would not get either piece of guidance."
      }
     },
     "studyRef": "Task Statement 3.2 (skills vs CLAUDE.md; project vs personal scope)"
    },
    {
     "n": 3,
     "scenario": 2,
     "domain": 3,
     "ts": "3.3",
     "tests": "Choosing one glob-scoped rule over per-directory CLAUDE.md files (even with @imports) for a file type spread across the codebase",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your monorepo has 60 packages, and a scaffolder adds two or three new ones each month. Every package keeps API contract files named `*.contract.ts` next to its other source, and all of them must follow the same 40 lines of contract conventions. A teammate's pull request adds a `CLAUDE.md` to each package containing a single line, `@../../docs/contract-conventions.md`, arguing that the import keeps one source of truth. What is the best response?",
     "options": [
      {
       "id": "A",
       "text": "Approve it: the import gives one source of truth, and subdirectory `CLAUDE.md` files load when Claude works in that package."
      },
      {
       "id": "B",
       "text": "Paste the 40 lines into the root `CLAUDE.md` instead, so that they apply in every package without needing any per-package files."
      },
      {
       "id": "C",
       "text": "Replace them with one `.claude/rules/contracts.md` whose `paths` is `[\"**/*.contract.ts\"]`, covering future packages."
      },
      {
       "id": "D",
       "text": "Approve it, and also change the scaffolder so that it writes the import line into every new package's `CLAUDE.md`."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The conventions apply to a file type spread across the codebase, which is what glob-scoped rules are for: one rule with `paths: [\"**/*.contract.ts\"]` matches contract files in every existing and future package and loads only when such a file is being edited. Directory-bound `CLAUDE.md` files cannot target a file type, even when they share content through an import.",
      "wrong": {
       "A": "The import avoids duplicated text, but the files are still directory-bound: new packages get nothing, and the conventions load for every file in a package, not just contracts.",
       "B": "The root `CLAUDE.md` is always loaded, so the contract conventions would consume context in every session, including ones that never touch a contract file.",
       "D": "It patches new packages but keeps 60+ files to maintain, depends on the scaffolder, and still loads the conventions for any file in a package instead of only `*.contract.ts`."
      }
     },
     "studyRef": "Task Statement 3.3 (glob-pattern rules over subdirectory CLAUDE.md files for conventions spanning many directories)"
    },
    {
     "n": 4,
     "scenario": 2,
     "domain": 3,
     "ts": "3.4",
     "tests": "Selecting plan mode for choosing between integration approaches with different infrastructure requirements",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You must add real-time order status notifications to a service. Three viable designs exist: (a) a polling endpoint with ETags that needs no new infrastructure; (b) a message-queue push that needs a new topic and a consumer service; and (c) partner webhooks that need a public endpoint and signature verification. The change would touch roughly 20 files across three services, and the right choice depends on what the current services already support. What is the best way to proceed?",
     "options": [
      {
       "id": "A",
       "text": "Use plan mode to explore the existing services, compare the three designs against current infrastructure, and agree on an approach before any files are edited."
      },
      {
       "id": "B",
       "text": "Use direct execution and start with the polling endpoint because it is the cheapest, switching designs later if it proves inadequate."
      },
      {
       "id": "C",
       "text": "Use direct execution with a very detailed prompt describing how you believe the queue-based design should be built."
      },
      {
       "id": "D",
       "text": "Use direct execution to build prototypes of all three designs on separate branches, then compare them."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Plan mode is intended for tasks with multiple valid approaches, architectural decisions, and multi-file changes, because it allows safe exploration and design before committing to edits.",
      "wrong": {
       "B": "Committing to a design before exploring risks costly rework across ~20 files if the choice turns out to be wrong.",
       "C": "This assumes the design decision is already made without exploring what the codebase supports.",
       "D": "Implementing three designs across dozens of files is far more expensive than exploring and planning once; plan mode exists to avoid exactly this rework."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode vs direct execution decision criteria)"
    },
    {
     "n": 5,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Addressing multiple interacting issues in one detailed message rather than sequentially",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Claude generated a date-range reporting module. Three tests now fail: (1) the range end boundary is excluded, (2) conversion for a UTC+13 timezone is off by one day, and (3) cached results from one timezone are returned for another. All three trace back to how `normalizeRange()` handles timezones and how the cache key is built. You have been fixing one failure per message, and each fix has caused one of the others to regress. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Keep fixing sequentially, ordering the fixes from easiest to hardest and re-running the full suite after each one to confirm nothing else regressed."
      },
      {
       "id": "B",
       "text": "Send all three failing tests in one message, explaining that they share `normalizeRange()` and the cache key."
      },
      {
       "id": "C",
       "text": "Open three parallel sessions, each fixing one failure on its own branch, then merge the branches and resolve any conflicts by hand."
      },
      {
       "id": "D",
       "text": "Revert to the original code and re-prompt with a longer prose description of the timezone behavior."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When problems interact, give all of them in one message so the fix can address them jointly; reserve sequential iteration for independent problems.",
      "wrong": {
       "A": "Sequential iteration suits independent problems; here the fixes interact, so one-at-a-time changes keep undoing each other.",
       "C": "Parallel isolated fixes to interacting code will conflict and cannot account for each other's changes.",
       "D": "This discards working progress and substitutes more prose for concrete failing cases, without addressing that the issues interact."
      }
     },
     "studyRef": "Task Statement 3.5 (interacting vs independent issues; test-driven iteration)"
    },
    {
     "n": 6,
     "scenario": 2,
     "domain": 1,
     "ts": "1.7",
     "tests": "Using --resume with session names to continue named investigation sessions",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You are investigating a flaky payment-reconciliation job over several days. Each morning you start a new Claude Code session and spend about 20 minutes re-explaining what was discovered the day before (services traced, hypotheses ruled out). The repository has not changed since. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Name the session and resume it daily with `claude --resume <session-name>`."
      },
      {
       "id": "B",
       "text": "Paste the previous day's terminal scrollback into each new session as the first message."
      },
      {
       "id": "C",
       "text": "Record each day's findings in the root `CLAUDE.md` so every new session loads them."
      },
      {
       "id": "D",
       "text": "Run `/compact` at the end of each day and rely on the next new session to remember the summary."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Named sessions can be continued across work sessions with `--resume <session-name>`, which is appropriate when prior context is still valid, as it is here.",
      "wrong": {
       "B": "This is manual, bulky, and noisy; resuming the named session restores the conversation directly.",
       "C": "Transient investigation notes would pollute shared project configuration and be loaded by every teammate in every session.",
       "D": "`/compact` condenses the current conversation only; a brand-new session does not carry that history forward."
      }
     },
     "studyRef": "Task Statement 1.7 (--resume, fork_session, resume vs fresh start)"
    },
    {
     "n": 7,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Using context: fork for output isolation and allowed-tools to pre-approve tools in skill frontmatter",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your team wants a shared `/dep-audit` skill stored in the repository at `.claude/skills/dep-audit/SKILL.md`. It walks the whole lockfile and prints a very long analysis. Two requirements: the verbose output must not pollute the developer's main conversation, and the skill's read-only lookups (Read, Grep, Glob) must run without a permission prompt each time. Which TWO choices satisfy these requirements? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Add `argument-hint: [package-name]` to the frontmatter."
      },
      {
       "id": "B",
       "text": "Set `context: fork` in the skill's frontmatter so it runs in an isolated subagent context."
      },
      {
       "id": "C",
       "text": "Set `disable-model-invocation: true` in the frontmatter."
      },
      {
       "id": "D",
       "text": "Set `allowed-tools: Read, Grep, Glob` in the skill's frontmatter so those tools are pre-approved while the skill runs."
      },
      {
       "id": "E",
       "text": "Move the skill to `~/.claude/skills/dep-audit/`."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "`context: fork` runs the skill in an isolated subagent so verbose output does not pollute the main conversation, and `allowed-tools` in the skill frontmatter pre-approves the listed tools (here the read-only Read, Grep, Glob) so they run without prompting.",
      "wrong": {
       "A": "`argument-hint` only prompts for parameters when the skill is invoked without arguments; it neither isolates output nor pre-approves tools.",
       "C": "This only prevents Claude from invoking the skill on its own; it does not isolate output or pre-approve tools.",
       "E": "Personal skills are not shared with teammates through version control, and location does not control output isolation or tool approvals."
      }
     },
     "studyRef": "Task Statement 3.2 (SKILL.md frontmatter: context, allowed-tools, argument-hint)"
    },
    {
     "n": 8,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "/compact for discovery output already in context; subagent delegation for verbose discovery not yet run",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "An hour into a Claude Code refactoring session, context is at 84%, mostly verbose test-runner logs and file dumps from a debugging detour that is now finished; its conclusions are already saved in `notes/refactor.md`. Next you need every use of the deprecated `LegacyMoney` type across about 300 files, and a similar sweep of this repository last month produced tens of thousands of lines of Grep and Read output. You want to keep working in this session on the design that follows. Which plan fits best?",
     "options": [
      {
       "id": "A",
       "text": "Run `/compact` now, then run the 300-file sweep in the main session, and run `/compact` again as soon as the sweep finishes."
      },
      {
       "id": "B",
       "text": "Run `/memory` to unload the finished debugging logs from context, then run the sweep in the main session using the space that frees."
      },
      {
       "id": "C",
       "text": "Run the sweep in the main session with each Grep piped through `head -50`, so no single search adds more than 50 lines."
      },
      {
       "id": "D",
       "text": "Run `/compact` now to condense the finished debugging output, then delegate the sweep to a subagent that returns only call sites."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Two problems need two tools. Output already in context is reduced with `/compact`, which is safe here because the conclusions are saved in the notes file. Output not yet generated is best kept out of the main context by delegating the sweep to a subagent that returns only the call sites. Current-docs note: `/memory` opens memory files and `/context` shows context usage; neither frees context.",
      "wrong": {
       "A": "Compacting first helps, but tens of thousands of lines of sweep output would refill the main context, possibly before the sweep ends, and a second compaction would summarize away the call-site list the design needs.",
       "B": "`/memory` is for viewing and editing memory files such as CLAUDE.md; it does not remove conversation content or reduce context usage.",
       "C": "Truncating each search hides matches, so the sweep would miss uses of `LegacyMoney`; the goal is every use, not fewer lines."
      }
     },
     "studyRef": "Task Statement 5.4 (/compact during extended exploration; subagents to isolate verbose discovery)"
    },
    {
     "n": 9,
     "scenario": 2,
     "domain": 1,
     "ts": "1.6",
     "tests": "After mapping structure, prioritize high-impact areas and adapt the plan as dependencies surface",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You ask Claude Code to \"add type hints and get `mypy --strict` passing\" across a 600-module Python monolith. Claude first mapped the import graph, then proposed annotating modules from largest to smallest by line count. The map shows that `core/money.py` and `core/ids.py` are imported by 410 modules, and the incident log ties 40% of last year's production bugs to `billing/`. Two days in, the largest modules (report generators that nothing else imports) are annotated, yet strict-mode errors elsewhere have barely dropped, because untyped values from the core helpers flow into almost every caller. How should the plan change?",
     "options": [
      {
       "id": "A",
       "text": "Keep largest-first, but run `mypy --follow-imports=skip` so core-helper errors stop counting per module."
      },
      {
       "id": "B",
       "text": "Start with the widely imported core helpers and incident-heavy `billing/` paths, reordering as dependencies surface."
      },
      {
       "id": "C",
       "text": "Freeze the approved order so that progress stays measurable, and log newly found dependencies for a follow-up project."
      },
      {
       "id": "D",
       "text": "Annotate `billing/` first because it caused 40% of bugs, then resume the largest-first order elsewhere."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "For an open-ended task, mapping the structure is only the first step: the plan must then prioritize high-impact areas and adapt as dependencies are discovered. Impact here is fan-in (types from `core/` propagate into 410 modules) and risk (`billing/` caused 40% of incidents), not file size, and the order should keep changing as the work uncovers further dependencies.",
      "wrong": {
       "A": "Skipping followed imports hides the errors instead of fixing them; the untyped core helpers would still flow into every caller once strict checking runs normally.",
       "C": "A plan that cannot adapt to discovered dependencies keeps doing low-value work; deferring dependencies to a later project is the rigid-plan misconception.",
       "D": "It acts on the incident data but ignores what the dependency map revealed: the core helpers imported by 410 modules are what keep strict-mode errors high everywhere."
      }
     },
     "studyRef": "Task Statement 1.6 (open-ended tasks: map structure, identify high-impact areas, build a prioritized plan that adapts)"
    },
    {
     "n": 10,
     "scenario": 2,
     "domain": 3,
     "ts": "3.1",
     "tests": "Using the /memory command to verify which memory files are loaded and diagnose inconsistent behavior",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two developers on the same repository, at the same commit, report that Claude Code follows the team's testing conventions on one laptop but ignores them on the other. What is the best way to diagnose the difference?",
     "options": [
      {
       "id": "A",
       "text": "Ask Claude in each session to recite the instructions it remembers and compare the answers, then treat any mismatch as the cause."
      },
      {
       "id": "B",
       "text": "Run `/memory` in each session to see which memory files are loaded and compare them."
      },
      {
       "id": "C",
       "text": "Delete and re-clone the repository on the laptop where conventions are ignored, since stale cached state is the likely cause."
      },
      {
       "id": "D",
       "text": "Check `.claude/config.json` for a conventions array."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`/memory` shows which memory files (user, project, directory-level) are actually loaded in a session, so you can see, for example, that conventions live in one developer's `~/.claude/CLAUDE.md` or that a file is missing. Current-docs note: `/memory` lists and opens the memory files for the user and project scopes, and `/context` shows which CLAUDE.md and rules files loaded at launch. The Exam Guide attributes the diagnosis to `/memory`.",
      "wrong": {
       "A": "Claude's recitation is not a reliable record of what was loaded and does not reveal which file each instruction came from.",
       "C": "Re-cloning the repository does not touch user-level memory files and would not explain the difference if the project files are identical.",
       "D": "No `.claude/config.json` conventions mechanism exists; instructions come from CLAUDE.md files and rules."
      }
     },
     "studyRef": "Task Statement 3.1 (/memory to verify loaded memory files; CLAUDE.md hierarchy)"
    },
    {
     "n": 11,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "A scratchpad only counteracts context degradation if it is kept current when findings change",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "During a long Claude Code session on intermittent checkout failures, Claude keeps `notes/checkout-flake.md` and has been told to consult it before answering. In hour one it recorded: \"Root cause: `CartLockManager` releases the lock before the write commits.\" In hour two, logs disproved that, and the failures were traced to a stale read in `InventoryCache.refresh()`; this was discussed in the conversation, but the notes file was never edited. At 92% context the developer ran `/compact`, and Claude's next proposal is a patch to `CartLockManager` that cites the notes. What should change?",
     "options": [
      {
       "id": "A",
       "text": "Update the notes whenever a finding changes, recording the new cause and marking the disproved one as disproved."
      },
      {
       "id": "B",
       "text": "Stop running `/compact` during debugging sessions, so later conclusions stay in the conversation where Claude can see them."
      },
      {
       "id": "C",
       "text": "After each compaction, stop consulting the notes and rely on the compaction summary, which reflects the latest discussion."
      },
      {
       "id": "D",
       "text": "Add a `CLAUDE.md` line saying conclusions reached in the conversation always override anything written in the notes."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A scratchpad counteracts degradation only if it holds the current findings. Here the file still asserted a disproved cause, so after compaction it outweighed the lost detail of the hour-two discussion. Recording revisions, and marking disproved hypotheses, keeps the file trustworthy across compactions and later sessions.",
      "wrong": {
       "B": "At 92% context the session has to free space; avoiding `/compact` only postpones the loss, and the notes would still be wrong for any later session.",
       "C": "Compaction summaries are lossy and do not persist to new sessions; the scratchpad is the durable record, so the fix is to keep it accurate, not abandon it.",
       "D": "After compaction the conversation's conclusion may survive only as a vague summary or not at all, so this rule still leaves the stale note as the most specific source Claude has."
      }
     },
     "studyRef": "Task Statement 5.4 (maintaining scratchpad files of key findings to counteract context degradation)"
    },
    {
     "n": 12,
     "scenario": 2,
     "domain": 1,
     "ts": "1.7",
     "tests": "Using fork_session to create parallel exploration branches from a shared baseline",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You have spent an hour in a Claude Code session analyzing a payments module (call graph, database access patterns). You now want to compare two refactoring strategies, extracting a repository layer versus introducing an event-sourced ledger, and you want each exploration to stay independent so one does not bias the other, without redoing the analysis. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Explore both strategies one after the other in the same conversation, asking Claude to forget the first before starting the second."
      },
      {
       "id": "B",
       "text": "Start two fresh sessions and re-run the module analysis in each."
      },
      {
       "id": "C",
       "text": "Ask Claude to describe both strategies in a single response and pick the better one to implement."
      },
      {
       "id": "D",
       "text": "Use `fork_session` to branch the analyzed session and explore one strategy per branch."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`fork_session` creates independent branches from a shared analysis baseline, enabling divergent approaches to be explored without contaminating each other or repeating the shared analysis.",
      "wrong": {
       "A": "The first exploration stays in context and will influence the second; instructions to forget are unreliable.",
       "B": "This repeats an hour of analysis that a fork would share as a common baseline.",
       "C": "A single comparison gives shallow treatment and does not produce two independent, explored approaches."
      }
     },
     "studyRef": "Task Statement 1.7 (fork_session vs resume vs fresh start)"
    },
    {
     "n": 13,
     "scenario": 2,
     "domain": 3,
     "ts": "3.5",
     "tests": "Providing concrete input/output examples when prose descriptions are interpreted inconsistently",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You ask Claude to \"convert legacy log lines into structured JSON.\" Results vary between runs: `ts` is sometimes a string and sometimes epoch milliseconds, and severity is dropped when the source log uses lowercase (`error`). Three rewordings of your written instructions have not fixed the inconsistency. What is the best next step?",
     "options": [
      {
       "id": "A",
       "text": "Write a longer prose specification that enumerates every field rule in more detail."
      },
      {
       "id": "B",
       "text": "Run the conversion several times and keep whichever output format appears most often."
      },
      {
       "id": "C",
       "text": "Switch to plan mode so Claude can reason about the format before converting."
      },
      {
       "id": "D",
       "text": "Add 2-3 input/output examples, including a lowercase-severity case."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When natural-language descriptions yield inconsistent results, 2-3 concrete input/output examples (including edge cases) are the most effective way to communicate the expected transformation.",
      "wrong": {
       "A": "Prose has already been interpreted inconsistently three times; concrete examples communicate the transformation more reliably.",
       "B": "Majority selection masks the inconsistency rather than specifying the intended output, and costs multiple runs.",
       "C": "Plan mode helps with exploration and design for complex tasks; it does not clarify an ambiguous output specification."
      }
     },
     "studyRef": "Task Statement 3.5 (input/output examples, test-driven iteration, interview pattern)"
    },
    {
     "n": 14,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Spawning subagents for specific questions while the main agent coordinates",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your main session is at roughly 70% of its context after tracing the refund flow through six services. You now also need to find every test file that touches refunds and trace the dependencies of `RefundPolicy`, and you want the main conversation to stay focused on the high-level picture. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Perform both investigations in the main session and run `/compact` once at the end."
      },
      {
       "id": "B",
       "text": "Delegate each question to a subagent that returns only a concise summary."
      },
      {
       "id": "C",
       "text": "Switch to a model with a larger context window so everything fits in the current session."
      },
      {
       "id": "D",
       "text": "Ask Claude to avoid reading files and rely only on Grep match lines for the rest of the session."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Delegating specific investigative questions to subagents isolates verbose exploration output; the main agent keeps only the summaries and preserves context for high-level coordination.",
      "wrong": {
       "A": "The verbose output would already have crowded the context before compaction, and the summary would be lossy.",
       "C": "A larger window does not prevent the main session from being diluted by verbose exploration output.",
       "D": "Restricting how evidence is gathered reduces accuracy and does not isolate the discovery output."
      }
     },
     "studyRef": "Task Statement 5.4 (subagent delegation for exploration)"
    },
    {
     "n": 15,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Delegating specific investigative questions to subagents while the main session coordinates",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Before changing proration logic in an unfamiliar monorepo, a developer needs three facts: which services call `applyProration()`, which test files cover it, and which config flags change its behavior. From her main Claude Code session she delegates one subagent the task \"Explore the billing area and report back everything relevant.\" It runs for 25 minutes, returns a 6,000-word tour of invoicing, dunning, and tax, and names only three of the five callers. What should she change?",
     "options": [
      {
       "id": "A",
       "text": "Run the exploration in the main session instead, so that no detail is lost in a subagent's summary of what it found."
      },
      {
       "id": "B",
       "text": "Give the subagent the full main-session transcript first, so that it understands why proration matters to the change."
      },
      {
       "id": "C",
       "text": "Ask the subagent to return its raw Grep and Read output instead of a summary, so she can judge relevance herself."
      },
      {
       "id": "D",
       "text": "Give each of the three questions to its own subagent, each asked to return a concise answer to its question."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Delegation works best with specific investigative questions (\"find every caller of `applyProration()`\"): each subagent has a clear finish line, its verbose search output stays in its own context, and the main session gets short, targeted answers. A vague \"explore everything\" brief produces a broad tour that still misses the facts needed.",
      "wrong": {
       "A": "Exploring in the main session floods its context with search output, which is exactly what delegation is meant to prevent.",
       "B": "The problem is the vague question, not missing background; pasting the transcript bloats the subagent's context without telling it what to find.",
       "C": "Raw output would flood the main session and defeat the isolation that delegation provides."
      }
     },
     "studyRef": "Task Statement 5.4 (spawning subagents for specific questions while the main agent coordinates)"
    },
    {
     "n": 16,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Coordinator selects subagents from what each query requires, not from surface features such as length",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "To speed up simple lookups, you added a routing rule to the coordinator's prompt: \"If the query is under 15 words, call only the web-search and report subagents.\" Median latency fell from 210 to 40 seconds. Now 9% of answers are wrong. For example, \"Summarize the dosing tables in the two attached FDA labels\" (10 words) was answered from web snippets instead of the attached PDFs. Lookups make up 65% of traffic and must finish in under 60 seconds. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Return to running all four subagents for every query, since a research product must put correctness ahead of latency, even for lookups."
      },
      {
       "id": "B",
       "text": "Raise the threshold to 25 words, so that more queries take the full pipeline while the shortest lookups keep their fast path."
      },
      {
       "id": "C",
       "text": "Train a separate classifier on 5,000 labeled queries to choose the route before the coordinator runs, and have the coordinator follow it."
      },
      {
       "id": "D",
       "text": "Have the coordinator pick subagents from what each query needs, e.g., attached documents need document analysis, whatever the length."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The coordinator should analyze what each query requires and invoke only the subagents those requirements call for. A query about attached PDFs needs document analysis however short it is, while a real lookup can skip it. Word count is a surface feature that says little about what a query needs. Selecting by requirements keeps the fast path for lookups and the full pipeline for work that needs it.",
      "wrong": {
       "A": "Always running the full pipeline fixes the misroutes but breaks the stated requirement that lookups, 65% of traffic, finish in under 60 seconds. It abandons dynamic selection instead of fixing how selection is made.",
       "B": "A higher threshold is still a length heuristic: short queries that need document analysis are still misrouted, and long simple lookups now pay for the full pipeline.",
       "C": "A trained classifier adds labeled data and new infrastructure when the coordinator can already reason about what a query requires. It is over-engineered for this fix."
      }
     },
     "studyRef": "Task Statement 1.2 (coordinator analyzes query requirements and dynamically selects which subagents to invoke)"
    },
    {
     "n": 17,
     "scenario": 3,
     "domain": 2,
     "ts": "2.1",
     "tests": "Renaming tools and rewriting descriptions to eliminate functional overlap",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your search subagent has two tools: `analyze_content` (\"Analyzes content\") and `analyze_document` (\"Analyzes a document\"). Logs show about 35% of the time raw web page text is sent to `analyze_document` and uploaded PDFs are sent to `analyze_content`, producing poor results. What is the most effective first step?",
     "options": [
      {
       "id": "A",
       "text": "Add five to eight few-shot examples to the system prompt showing the correct tool for each input type."
      },
      {
       "id": "B",
       "text": "Rename `analyze_content` to `extract_web_results` with a web-specific description, and rewrite `analyze_document` to state the inputs it accepts and when to use it."
      },
      {
       "id": "C",
       "text": "Merge both tools into one `analyze` tool with a `source_type` parameter that the model must set."
      },
      {
       "id": "D",
       "text": "Build a pre-routing layer that inspects each input for a URL or file extension and selects the tool before the model runs."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Tool descriptions are the primary mechanism for tool selection. Overlapping, minimal descriptions cause misrouting; renaming and rewriting them to eliminate functional overlap fixes the cause directly.",
      "wrong": {
       "A": "Examples add token overhead without fixing the near-identical tool descriptions, which are the root cause.",
       "C": "Consolidation is a larger redesign than a first step requires, and it moves the ambiguity into a parameter.",
       "D": "A routing layer is over-engineered and bypasses the model's ability to choose tools when descriptions are clear."
      }
     },
     "studyRef": "Task Statement 2.1 (tool descriptions, boundaries, renaming overlapping tools)"
    },
    {
     "n": 18,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Passing complete findings in subagent prompts using structured formats that separate content from metadata",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Final reports contain claims with no sources, and some merged figures cannot be traced to any document. Currently the coordinator gives the synthesis subagent a short prose recap such as \"Web search found that renewable energy grew; the documents say costs fell.\" Which TWO changes best restore attribution? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Have the web search and document analysis subagents return structured findings that separate each claim from metadata such as source URL or document name, page, and date."
      },
      {
       "id": "B",
       "text": "Include those complete structured findings directly in the synthesis subagent's prompt."
      },
      {
       "id": "C",
       "text": "Run the synthesis subagent in the coordinator's session so it inherits the conversation history automatically."
      },
      {
       "id": "D",
       "text": "Add a line to the synthesis subagent's system prompt telling it to cite sources for every claim."
      },
      {
       "id": "E",
       "text": "Give the synthesis subagent web search tools so it can look up sources for each claim itself."
      }
     ],
     "answer": [
      "A",
      "B"
     ],
     "explanation": {
      "correct": "Subagents do not inherit context, so complete findings must be placed in the prompt. Using structured formats that separate content from metadata preserves attribution through the handoff.",
      "wrong": {
       "C": "Subagents have isolated context and do not inherit the coordinator's history; findings must be passed explicitly.",
       "D": "An instruction to cite cannot create source information that was never passed to it.",
       "E": "This duplicates search work and gives the synthesis role tools outside its specialization, rather than preserving the existing attribution."
      }
     },
     "studyRef": "Task Statement 1.3 (explicit context passing; structured content/metadata handoffs)"
    },
    {
     "n": 19,
     "scenario": 3,
     "domain": 5,
     "ts": "5.3",
     "tests": "Distinguishing access failures from valid empty results so downstream agents do not treat 'could not check' as 'none exist'",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A delivered report stated, \"No clinical trials have been registered for compound RX-7.\" The client later found two registered trials. The run trace shows that the web-search subagent's call to the trial-registry tool timed out after 30 seconds on the first attempt and on both retries, and that the subagent then returned `{\"status\": \"ok\", \"trials\": []}` to the coordinator. The coordinator marked the topic as covered, and synthesis wrote the absence claim from that result. Which design flaw let the false claim into the report?",
     "options": [
      {
       "id": "A",
       "text": "The synthesis subagent's prompt allows absence claims; it should be told never to state that something does not exist, whatever the search results show."
      },
      {
       "id": "B",
       "text": "The coordinator should have re-delegated the search, because a result with zero matches usually means the search failed and needs another attempt."
      },
      {
       "id": "C",
       "text": "The subagent reported an access failure as a valid empty result, so downstream agents took \"could not check\" for \"checked, found none.\""
      },
      {
       "id": "D",
       "text": "The registry tool's 30-second timeout is too short for complex queries; raising it to 120 seconds would have let the search finish."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "An access failure (the registry never answered) and a valid empty result (the query ran and matched nothing) need different handling. Returning the timeout as `status: ok` with an empty list made them identical, so the coordinator had no reason to retry or try another source, and synthesis had no reason to flag a gap. The subagent should return a structured error with the failure type, the attempted query, and any partial results.",
      "wrong": {
       "A": "Synthesis behaved correctly on what it was told: a successful search with no matches supports an absence claim. Banning absence claims would also block true ones; the flaw is upstream.",
       "B": "The coordinator received a success status, so it had no signal to act on. Treating every empty result as a failure is also wrong: many searches legitimately find nothing, and retrying them wastes effort.",
       "D": "A longer timeout might make this rarer, but timeouts will still happen, and each one would still be reported as \"no trials exist.\" The reporting design is the flaw."
      }
     },
     "studyRef": "Task Statement 5.3 (distinguish access failures from valid empty results; structured error context)"
    },
    {
     "n": 20,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Subagents share no memory between invocations; a re-invocation must restate what the earlier run already did",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "After synthesis, the coordinator finds two coverage gaps in a report on desalination costs: no Middle East data after 2023 and nothing on brine-disposal costs. It re-invokes the web-search subagent with: \"Fill the gaps you missed earlier: Middle East after 2023, and brine disposal.\" The first run used 14 queries and returned 22 sources. The second run repeats 5 of those queries, and 6 of its 9 sources duplicate first-run sources. What should the coordinator's re-invocation prompt contain?",
     "options": [
      {
       "id": "A",
       "text": "Only the two gap topics, written as new standalone research goals, so the second run is not biased by the first."
      },
      {
       "id": "B",
       "text": "The ID of the first run, so that the subagent can reload its earlier queries and sources before it searches again."
      },
      {
       "id": "C",
       "text": "The coordinator's whole conversation so far, including every draft and the full text of all 22 sources, so nothing is left out."
      },
      {
       "id": "D",
       "text": "The two gaps as goals, plus the 14 queries already run and the 22 source URLs already collected, asking for new sources only."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Subagents keep no memory between invocations: the second run starts from nothing, so \"the gaps you missed earlier\" means nothing to it. To avoid repeating work, the coordinator must restate what is already known: the gap goals, the queries already tried, and the sources already collected, with an instruction to return only new sources.",
      "wrong": {
       "A": "Without the list of earlier queries and sources, the subagent cannot avoid them; that is exactly what produced the repeated queries and duplicate sources.",
       "B": "No memory persists between subagent invocations, and the subagent has no way to reload a previous run by ID. Whatever it needs must be in its prompt.",
       "C": "The needed lists would be in there, but buried in drafts and full source text the search task does not need, wasting tokens and diluting attention. Pass the specific facts the task requires."
      }
     },
     "studyRef": "Task Statement 1.3 (subagents do not share memory between invocations; provide context explicitly)"
    },
    {
     "n": 21,
     "scenario": 3,
     "domain": 2,
     "ts": "2.2",
     "tests": "Returning structured error metadata (errorCategory, isRetryable, description)",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your `fetch_report` MCP tool returns `isError: true` with the text \"Operation failed\" for every failure. Logs show the agent retrying a 403 permission denial three times, retrying a malformed report ID with the same input, and giving up immediately on 503 service-unavailable responses. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a system prompt rule telling the agent to retry up to three times on any tool failure."
      },
      {
       "id": "B",
       "text": "Return a successful empty result whenever the report cannot be fetched."
      },
      {
       "id": "C",
       "text": "Return structured error metadata including an `errorCategory` (transient, validation, permission), an `isRetryable` flag, and a human-readable description."
      },
      {
       "id": "D",
       "text": "Add exponential backoff in the agent loop for all errors regardless of type."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Uniform errors prevent appropriate recovery. Structured metadata (category, retryability, description) lets the agent retry transient failures, fix validation issues, and stop on permission errors.",
      "wrong": {
       "A": "Blanket retries would waste attempts on non-retryable permission and validation errors and still not distinguish the 503 case.",
       "B": "This hides failures as success, preventing any recovery.",
       "D": "Backoff helps transient errors only; permission and validation errors would still be retried pointlessly."
      }
     },
     "studyRef": "Task Statement 2.2 (isError, error categories, retryable vs non-retryable)"
    },
    {
     "n": 22,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Iterative refinement loop: coordinator evaluates synthesis for gaps and re-delegates",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A report on \"renewable energy policy in Southeast Asia\" covers Indonesia and Vietnam well but has no content on the Philippines or Thailand. The search, analysis, and synthesis subagents each performed correctly on what they were given, and the pipeline runs once, in a fixed order. What design change best improves coverage?",
     "options": [
      {
       "id": "A",
       "text": "Have the coordinator find coverage gaps, re-delegate targeted queries, and re-run synthesis until coverage suffices."
      },
      {
       "id": "B",
       "text": "Give the synthesis subagent web search tools so it can fill in missing countries itself during synthesis, without returning to the coordinator."
      },
      {
       "id": "C",
       "text": "Add to the report subagent's prompt an instruction to ensure comprehensive coverage of all countries, including any not mentioned in its inputs."
      },
      {
       "id": "D",
       "text": "Run the same fixed pipeline three times and merge the three reports."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "An iterative refinement loop in the coordinator evaluates synthesis output for gaps, sends targeted follow-up work to search and analysis subagents, and repeats synthesis until coverage is adequate.",
      "wrong": {
       "B": "This gives the synthesis role tools outside its specialization and bypasses coordinator control.",
       "C": "The report agent can only present what it receives; instructing it cannot create missing findings.",
       "D": "Repeating the same decomposition tends to reproduce the same gaps and adds duplication instead of targeted follow-up."
      }
     },
     "studyRef": "Task Statement 1.2 (iterative refinement loops, coverage)"
    },
    {
     "n": 23,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Handling conflicting statistics with source attribution and publication dates",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Two credible sources report EV market share for the same country: 18% (an industry association report dated December 2023) and 23% (a government agency report dated June 2024). The synthesis agent silently used 23%, and an auditor later flagged the report. Which TWO changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Require subagents to include publication or data collection dates (and methodological context) in their structured outputs so temporal differences are not misread as contradictions."
      },
      {
       "id": "B",
       "text": "Instruct the synthesis agent to always use the figure from the source it judges more authoritative."
      },
      {
       "id": "C",
       "text": "Present both values in the report with their source attribution, in a section for contested findings, instead of selecting one."
      },
      {
       "id": "D",
       "text": "Average the two values and report a single blended figure."
      },
      {
       "id": "E",
       "text": "Omit the statistic from the report and note that data is unavailable."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "Conflicting values should be annotated with source attribution rather than arbitrarily resolved, and dates should be captured so that temporal differences are interpreted correctly.",
      "wrong": {
       "B": "Arbitrarily selecting one value hides a real conflict and discards information the reader may need.",
       "D": "Averaging values from different dates and methods creates a number no source reported.",
       "E": "Both sources are credible; removing the data discards useful evidence rather than annotating the conflict."
      }
     },
     "studyRef": "Task Statement 5.6 (conflict annotation, temporal data, provenance)"
    },
    {
     "n": 24,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "Setting tool_choice 'any' to guarantee the model calls a tool",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The coordinator's planning step offers three tools: `plan_quick_lookup`, `plan_standard_research`, and `plan_deep_dive`, each returning a structured plan. With `tool_choice` set to `{\"type\": \"auto\"}`, about 8% of requests get conversational text (\"Sure, here's how I'd approach this...\") instead of a tool call, and the plan parser fails. The model must still choose which plan tool fits the request. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Set `tool_choice` to force `{\"type\": \"tool\", \"name\": \"plan_standard_research\"}`."
      },
      {
       "id": "B",
       "text": "Add a system prompt sentence: \"Always respond by calling a planning tool.\""
      },
      {
       "id": "C",
       "text": "Set `tool_choice` to `\"any\"` so the model must call one of the tools but can still choose which."
      },
      {
       "id": "D",
       "text": "Keep `\"auto\"` and retry the request whenever the parser fails."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`\"auto\"` allows text responses, `\"any\"` guarantees a tool call while letting the model choose which, and forced selection names one tool. 'any' fits when multiple tools are valid. Current-API note: Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject `tool_choice` `\"any\"` and forced `{\"type\": \"tool\"}` with a 400 error; on those models you steer with `\"auto\"` plus an explicit instruction, `strict: true` on the tool, or structured outputs. The Exam Guide still lists `auto` / `any` / forced selection as tested knowledge, so answer per the guide.",
      "wrong": {
       "A": "Forcing one tool guarantees a call but removes the model's ability to choose among the three plans.",
       "B": "This relies on probabilistic compliance when the requirement can be enforced through `tool_choice`.",
       "D": "Retries add latency and cost and still allow failure; `tool_choice` can guarantee a tool call."
      }
     },
     "studyRef": "Task Statement 2.3 (tool_choice options)"
    },
    {
     "n": 25,
     "scenario": 3,
     "domain": 5,
     "ts": "5.1",
     "tests": "Modifying upstream agents to return structured data instead of verbose content when downstream context is limited",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Each web search subagent response is about 6,000 tokens, including its reasoning chain and full page text. With 12 queries per request, the synthesis subagent runs out of context and later findings are dropped. Which change best addresses the problem with the least loss of important information?",
     "options": [
      {
       "id": "A",
       "text": "Truncate every search response to its first 500 tokens before it is passed on to the synthesis subagent."
      },
      {
       "id": "B",
       "text": "Have the web search subagent return structured key facts, citations, and relevance scores."
      },
      {
       "id": "C",
       "text": "Switch the synthesis subagent to a model with a larger context window."
      },
      {
       "id": "D",
       "text": "Have the synthesis subagent summarize each response progressively as it reads them, rather than all at once at the end."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When downstream agents have limited context budgets, upstream agents should return compact structured data (key facts, citations, relevance scores) rather than verbose content and reasoning.",
      "wrong": {
       "A": "Truncation indiscriminately drops later content, which may hold the key facts and citations.",
       "C": "A larger window does not address verbose, low-value content, and attention quality still suffers.",
       "D": "Progressive summarization risks losing numbers and source attribution, and it still receives all the verbose input first."
      }
     },
     "studyRef": "Task Statement 5.1 (context budgets, structured upstream outputs)"
    },
    {
     "n": 26,
     "scenario": 3,
     "domain": 1,
     "ts": "1.1",
     "tests": "Model-driven tool selection in an agentic loop vs a pre-configured tool sequence",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your web-search subagent is a script, not a loop. For every assignment it calls `search(query)`, fetches the top 5 URLs with `fetch_page`, runs `extract_quotes` on each page, and returns. Over two months the team has added 14 `if` branches: retry with synonyms when there are fewer than 3 hits, skip PDFs over 50 pages, prefer `.gov` domains for policy topics, and others. Reviewers still find new cases every week where the right next step depended on what a page revealed, such as a page that cites the primary dataset, which the script never follows. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Keep adding a branch for each case the reviewers report, because a deterministic sequence of tool calls is more predictable than letting the model choose."
      },
      {
       "id": "B",
       "text": "Keep the script, but have Claude rank the top 5 URLs before they are fetched, so that better pages enter the fixed fetch-and-extract sequence."
      },
      {
       "id": "C",
       "text": "Raise the fetch count from 5 to 15 URLs per query, so that pages citing primary datasets are more likely to be included in the first pass."
      },
      {
       "id": "D",
       "text": "Expose the three tools in a `stop_reason`-driven loop and let Claude choose each next call based on what earlier results showed."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "In an agentic loop Claude decides which tool to call next based on what earlier results revealed. That is exactly what these cases need: following a page's citation to the primary dataset is a step only the page's content can suggest. A pre-configured sequence cannot adapt to results, so every new case means another hand-written branch. Tool restrictions and the prompt can still set boundaries around the loop.",
      "wrong": {
       "A": "Fourteen branches and new misses every week show that a fixed decision tree cannot anticipate what results will reveal. More branches add maintenance without making the subagent adaptive.",
       "B": "Ranking changes which pages enter the pipeline, but the sequence stays fixed: it still cannot follow a link from a page to the dataset it cites, which is the stated failure.",
       "C": "Fetching more pages costs more and still never follows a link that a page reveals; the script still cannot take a step it was not written to take."
      }
     },
     "studyRef": "Task Statement 1.1 (model-driven decision-making vs pre-configured decision trees or tool sequences)"
    },
    {
     "n": 27,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Coordinator controls what each subagent receives instead of a shared workspace all subagents read",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A client uploads an internal strategy memo that names an unannounced product, codename `Halcyon`, so the system can compare the plan against public market research. In your current design, every artifact (uploaded files, search results, analyses) is written to a shared workspace that all four subagents read when they start. The security team finds `Halcyon` in 37 queries that the web-search subagent sent to a public search API. What change best prevents this class of problem?",
     "options": [
      {
       "id": "A",
       "text": "Drop the shared workspace: the coordinator gives the memo only to document analysis and sends web search only the public subtopics it needs."
      },
      {
       "id": "B",
       "text": "Add an instruction to the web-search subagent's prompt that it must never include confidential terms, client names, or product codenames in its queries."
      },
      {
       "id": "C",
       "text": "Keep the workspace, but have the web-search subagent send each query to the document-analysis subagent for approval first."
      },
      {
       "id": "D",
       "text": "Delete the memo from the shared workspace after each run finishes, so that later runs cannot read it or pass it on."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "In a coordinator-subagent design the coordinator controls information flow: it decides what each subagent receives instead of letting all context reach every agent. Web search needs public subtopics, not the client's memo, so if it never sees the codename it cannot leak it. Document analysis gets the memo because comparing it with the research is its job.",
      "wrong": {
       "B": "A prompt rule is probabilistic, the subagent still holds the whole memo, and it cannot know every sensitive term in it. The exposure itself has to be removed.",
       "C": "This adds a direct subagent-to-subagent channel that bypasses the coordinator, and the search subagent still reads the memo. Policing queries is not the analysis subagent's job.",
       "D": "The leak happened during the run that used the memo; deleting it afterwards changes nothing for that run, and every new upload would leak the same way."
      }
     },
     "studyRef": "Task Statement 1.2 (coordinator controls information flow: each subagent receives only what its task needs)"
    },
    {
     "n": 28,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Each AgentDefinition carries its own system prompt for role-specific instructions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The report-generation subagent must follow the firm's house style: a fixed section order, Chicago author-date citations, and a closing \"Limitations\" section. The coordinator currently pastes these 35 lines of rules into every Task prompt it sends to the report subagent. On long runs the coordinator sometimes paraphrases or drops them, and 12% of reports lack the Limitations section. The rules are identical for every report. Where should they live?",
     "options": [
      {
       "id": "A",
       "text": "In the coordinator's system prompt, with an instruction to copy them word for word into every Task call to the report subagent."
      },
      {
       "id": "B",
       "text": "In the `prompt` of the report subagent's AgentDefinition, so every invocation of that subagent type starts with them."
      },
      {
       "id": "C",
       "text": "In the synthesis subagent's prompt, so that the drafts it hands on are already in house style before reporting."
      },
      {
       "id": "D",
       "text": "In a style-guide file that the report subagent is told it may open whenever it is unsure about formatting."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Each AgentDefinition carries its own system prompt for role-specific instructions. Rules that are the same for every invocation of a subagent type belong there, so they no longer depend on the coordinator reproducing them; the Task prompt then carries only what changes per run, such as the synthesized findings. Naming note: the Exam Guide calls the spawning tool Task; current Agent SDK versions name it `Agent`. On the exam, use the guide's name.",
      "wrong": {
       "A": "This keeps the dependency that is failing: the coordinator must still reproduce 35 lines exactly in every call, and on long runs it already paraphrases or drops them.",
       "C": "Citation format and section order are the report subagent's job. Moving them to synthesis puts them on the wrong role, and the report subagent can still restructure the draft without them.",
       "D": "Opening the file is left to the subagent's judgment, so rules it does not think to check, such as the Limitations section, can still be missed. Constant rules belong in its definition."
      }
     },
     "studyRef": "Task Statement 1.3 (AgentDefinition: description, system prompt, and tool restrictions per subagent type)"
    },
    {
     "n": 29,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Rendering different content types appropriately in synthesis output",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The synthesis output is currently converted to uniform bulleted lists. Quarterly revenue comparisons across eight companies are hard to scan, and a news timeline loses its chronological narrative. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Have the synthesis step render each content type appropriately: tables for financial data, prose for news, structured lists for technical findings."
      },
      {
       "id": "B",
       "text": "Convert all content to tables so everything is consistently structured."
      },
      {
       "id": "C",
       "text": "Ask the report agent to make the report longer so details are easier to follow."
      },
      {
       "id": "D",
       "text": "Have the web search subagent reformat each source's content before returning it."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Different content types are best presented in different forms: financial data as tables, news as prose, technical findings as structured lists, rather than a single uniform format.",
      "wrong": {
       "B": "Another uniform format would make narrative news content awkward just as lists do for financial data.",
       "C": "Length does not address the mismatch between content type and format.",
       "D": "Formatting for presentation is a synthesis/reporting concern, not a search concern, and would not retain content-appropriate structure."
      }
     },
     "studyRef": "Task Statement 5.6 (rendering content types in synthesis)"
    },
    {
     "n": 30,
     "scenario": 3,
     "domain": 2,
     "ts": "2.3",
     "tests": "A scoped cross-role tool must itself be narrow; an over-broad verify_fact recreates cross-specialization misuse",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After an earlier latency fix, the synthesis subagent received a `verify_fact` tool so it could check simple claims without a round trip through the coordinator. `verify_fact` was built as a thin wrapper over the web-search subagent's search function: it accepts any query string and returns the top 10 results with full page text. Synthesis runs now take 2.3x longer, and traces show 15 to 30 open-ended queries per report (\"recent developments in solid-state batteries\"), with newly found, uncited sources appearing in drafts. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Remove `verify_fact` and send every verification back through the coordinator to the web-search subagent, as the system did before the fix."
      },
      {
       "id": "B",
       "text": "Add a system-prompt rule limiting synthesis to five `verify_fact` calls per report and telling it not to add new sources."
      },
      {
       "id": "C",
       "text": "Narrow `verify_fact` to one claim plus its cited source, returning a verdict with evidence; broader checks go via the coordinator."
      },
      {
       "id": "D",
       "text": "Give synthesis the web-search subagent's full toolset, so its searches are at least as thorough and consistent as the search agent's."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "A cross-role tool for a high-frequency need has to be scoped itself. As built, `verify_fact` is general web search, so synthesis has drifted into doing the search agent's job. Constraining its input and output to single-claim verification keeps the fast path for simple checks while complex investigation still goes through the coordinator.",
      "wrong": {
       "A": "This brings back the round-trip latency the tool was added to remove; the problem is the tool's breadth, not its existence.",
       "B": "A call cap and a prompt rule do not change what the tool can do; five open-ended searches still let synthesis do research and add uncited sources.",
       "D": "Over-provisioning synthesis with search tools deepens the cross-specialization misuse instead of removing it."
      }
     },
     "studyRef": "Task Statement 2.3 (scoped cross-role tools for high-frequency needs; constrained alternatives to generic tools)"
    },
    {
     "n": 31,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Matching built-in tools to purpose: Glob for name patterns, Read for full contents, Bash for running commands",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your security team now lets the developer productivity agent use Bash only for build and test commands; everything else must go through the dedicated built-in tools. Last week's trace for a field-rename ticket used Bash for every step:\n\n```\n1  find . -name \"*.graphql\"\n2  grep -rn \"orderTotal\" src/\n3  cat src/resolvers/order.ts\n4  sed -i 's/orderTotal/totalAmount/' src/resolvers/order.ts\n5  npm test -- resolvers\n```\n\nWhich TWO replacements comply with the new rule and use the right tool for the step? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Step 1 becomes Glob with the pattern `**/*.graphql`."
      },
      {
       "id": "B",
       "text": "Step 5 becomes Grep over the test files for `PASS`, to confirm the resolver tests succeed."
      },
      {
       "id": "C",
       "text": "Step 2 becomes Glob with the pattern `**/*orderTotal*`."
      },
      {
       "id": "D",
       "text": "Step 3 becomes Read on `src/resolvers/order.ts`."
      },
      {
       "id": "E",
       "text": "Step 4 becomes Write with only the lines that contain the renamed field."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "`find -name` locates files by a name pattern, which is Glob's job, and `cat` loads a file's full contents, which is Read's job. Step 5 runs the test suite, a command execution, so it stays in Bash, which the new rule still allows.",
      "wrong": {
       "B": "Grep only searches file contents; it cannot run tests. Running the suite is a command execution, exactly what Bash remains allowed to do.",
       "C": "Step 2 searches file contents for an identifier, which is Grep's job. Glob matches file names, and no file is named after `orderTotal`.",
       "E": "Write replaces the entire file with the content it is given, so writing only the changed lines would truncate `order.ts`. A targeted change belongs in Edit with a unique anchor."
      }
     },
     "studyRef": "Task Statement 2.5 (Glob for name patterns, Grep for content, Read for full files, Edit for targeted changes, Bash for commands)"
    },
    {
     "n": 32,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Exposing a documentation hierarchy as an MCP resource so the agent can see what exists without exploratory search calls",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Engineers use your agent to understand `ledger-core`, a 20-year-old settlement system. Its 640 design notes and runbooks sit behind an internal MCP server with two tools, `search_docs(query)` and `get_doc(path)`. The documents use the original module names (`SETL-B`, `RCN2`), while engineers and the agent use today's names (`batch-settlement`, `reconciliation`). Logs show 6 to 11 `search_docs` calls per question, most returning zero hits, and answers that miss runbooks the team knows exist. The `search_docs` description already explains its query syntax and filters. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Raise the `search_docs` result limit from 10 to 100, so each query returns more candidate documents."
      },
      {
       "id": "B",
       "text": "Expose the documentation hierarchy as an MCP resource listing each note's path, title, and module aliases."
      },
      {
       "id": "C",
       "text": "Add a few-shot example to the system prompt that shows a good search sequence for one module, so the agent searches more broadly."
      },
      {
       "id": "D",
       "text": "Rewrite the `search_docs` description again with more example queries, so the agent chooses better keywords on its first attempt."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The agent cannot search well for documents it does not know exist under names it does not know. An MCP resource that exposes the documentation hierarchy, with titles and old and new module names, gives the agent visibility into the available content up front, so it can open the right runbooks with `get_doc` instead of guessing keywords.",
      "wrong": {
       "A": "Most queries return zero hits, and a higher limit does not change that; for the queries that do hit, it only adds more irrelevant results to context.",
       "C": "One worked example cannot teach the mapping for every legacy module, and the agent still has no view of which documents exist.",
       "D": "The description already explains the tool well. Better phrasing does not tell the agent the legacy vocabulary or the inventory of documents; visibility is the gap."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources expose content catalogs such as documentation hierarchies to reduce exploratory tool calls)"
    },
    {
     "n": 33,
     "scenario": 4,
     "domain": 1,
     "ts": "1.1",
     "tests": "Avoiding natural-language signals for loop termination",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your agent loop stops when the assistant's text contains the phrase \"Task complete\". In production, runs sometimes end early after the model writes, \"I'll now run the tests. Task complete once they pass,\" and other runs never emit the phrase and loop indefinitely. What is the correct fix?",
     "options": [
      {
       "id": "A",
       "text": "Cap the loop at 15 iterations and treat the cap as the normal stopping condition."
      },
      {
       "id": "B",
       "text": "Treat any response that has no text content as a signal to continue and any response with text as complete."
      },
      {
       "id": "C",
       "text": "Ask the model to end with a JSON object `{\"done\": true}` and parse the final message for it."
      },
      {
       "id": "D",
       "text": "Control the loop with `stop_reason`: continue while it is `\"tool_use\"` and finish when it is `\"end_turn\"`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The agentic loop continues while `stop_reason` is `tool_use` and terminates on `end_turn`; parsing language or relying on caps are anti-patterns.",
      "wrong": {
       "A": "An iteration cap as the primary stop is an anti-pattern; it truncates legitimate long tasks and does not detect completion.",
       "B": "Checking for assistant text as a completion indicator is unreliable; text can appear alongside tool calls.",
       "C": "This is still parsing model output to detect completion, when the API already reports it through `stop_reason`."
      }
     },
     "studyRef": "Task Statement 1.1 (agentic loop control flow)"
    },
    {
     "n": 34,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "The Read + Write fallback needs a full Read: Write replaces the whole file, and Grep output is not the file",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The agent's system prompt says: \"If Edit reports a non-unique match, fall back to rewriting the file.\" Here is the trace from a flag-default change in `src/flags/defaults.ts`, a 1,140-line file:\n\n```\n1 Edit   old_string=\"enabled: false,\"   -> error: matches 4 locations\n2 Grep   \"enabled: false\" -C 3          -> 4 matches, 28 lines of output\n3 Write  src/flags/defaults.ts          (those 28 lines, one value changed)\n```\n\nAfter step 3 the file is 28 lines long, and CI fails on dozens of missing exports. What is the root cause?",
     "options": [
      {
       "id": "A",
       "text": "Edit's failed call left the file partly modified, and the Write in step 3 then saved that damaged state."
      },
      {
       "id": "B",
       "text": "The Write content came from Grep's matched lines, not a full Read, and Write replaces the file with what it gets."
      },
      {
       "id": "C",
       "text": "Grep's `-C 3` context was too narrow; with enough context lines, writing back Grep output would have been safe."
      },
      {
       "id": "D",
       "text": "Rewriting is inherently unsafe: after a non-unique Edit error the agent should stop and ask an engineer to do it instead."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The fallback for a non-unique Edit is Read then Write: Read loads the full file, the agent changes the target in that content, and Write puts the whole file back. Grep returns only matching lines plus context, not the file, and Write replaces the file's entire contents, so writing the Grep output cut 1,140 lines to 28. The prompt should name the fallback explicitly as Read + Write.",
      "wrong": {
       "A": "A failed Edit does not modify the file; the error means nothing was changed, so there was no partial state to save.",
       "C": "Grep output is always a set of excerpts. More context lines only shrink the damage unless they happen to cover every line, which is just a fragile way of doing a Read.",
       "D": "Read + Write is the reliable fallback when Edit cannot find unique anchor text; refusing to use it gives up on a change the agent can make safely."
      }
     },
     "studyRef": "Task Statement 2.5 (Read + Write fallback when Edit fails on non-unique text; Write replaces the whole file)"
    },
    {
     "n": 35,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Actions belong in MCP tools, not resources; resources are read-only content catalogs",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "The platform team's `buildinfra` MCP server exposes the catalog of 140 CI pipelines as the resource `pipelines://catalog`, each pipeline's latest logs as `pipelines://{id}/logs`, and reruns as `pipelines://{id}/rerun`, a resource whose read starts a new run. While exploring why a legacy service's builds are slow, the agent read the rerun resources of nine pipelines as part of gathering context, starting nine expensive builds that nobody requested. What should the platform team change?",
     "options": [
      {
       "id": "A",
       "text": "Add a `CLAUDE.md` rule telling the agent never to read a `rerun` resource unless an engineer explicitly asks for a new build."
      },
      {
       "id": "B",
       "text": "Convert the catalog and the logs into tools as well, so that every interaction with `buildinfra` is an explicit tool call."
      },
      {
       "id": "C",
       "text": "Replace the rerun resource with a `rerun_pipeline` tool, and keep the catalog and the logs as resources."
      },
      {
       "id": "D",
       "text": "Add a PostToolUse hook that logs every rerun resource read, so the platform team can cancel unintended builds quickly."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Resources expose content for the agent to read; tools perform actions. Because a rerun was modeled as a read, ordinary context gathering triggered builds. Making it a `rerun_pipeline` tool turns it into an explicit action that can be permission-gated, while the catalog and logs stay resources that the agent can browse safely.",
      "wrong": {
       "A": "A prompt rule is probabilistic and leaves the flawed design in place: any client or agent that reads the resource still starts a build.",
       "B": "The catalog and logs are exactly what resources are for. Converting them removes the agent's cheap view of what exists and leaves the real problem framed the wrong way.",
       "D": "PostToolUse runs after the action, so the builds have already started. Logging helps clean up but does not prevent the side effect."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources for content catalogs, tools for actions)"
    },
    {
     "n": 36,
     "scenario": 4,
     "domain": 1,
     "ts": "1.5",
     "tests": "Tool call interception hooks that block policy-violating actions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The system prompt tells your developer-productivity agent to never force-push and never run commands against the production database host. In about 3% of runs, the agent still issues `git push --force` or a `psql` command against `prod-db.internal` via the Bash tool. What change provides a guarantee?",
     "options": [
      {
       "id": "A",
       "text": "Add a hook that intercepts outgoing Bash tool calls, blocks commands matching those patterns, and returns a message redirecting the agent."
      },
      {
       "id": "B",
       "text": "Rewrite the system prompt with stronger wording and bold capitalization for these two rules so that they stand out from the other instructions."
      },
      {
       "id": "C",
       "text": "Have the agent ask for confirmation in its text before running any Bash command."
      },
      {
       "id": "D",
       "text": "Remove the Bash tool entirely from the agent's tool list."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "When business or safety rules require guaranteed compliance, tool call interception hooks enforce them deterministically, unlike prompt instructions.",
      "wrong": {
       "B": "Prompt instructions are probabilistic and carry a non-zero failure rate; this needs deterministic enforcement.",
       "C": "A text confirmation is still model-dependent and can be skipped; it is not an enforced control.",
       "D": "This blocks the dangerous commands but also removes all legitimate shell use the agent needs."
      }
     },
     "studyRef": "Task Statement 1.5 (hooks vs prompts for compliance)"
    },
    {
     "n": 37,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Environment variable expansion in .mcp.json for shared credentials; personal experimental servers in ~/.claude.json",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Sam's pull request changes the repository's committed `.mcp.json` to:\n\n```json\n{\n  \"mcpServers\": {\n    \"jira\":   { \"command\": \"jira-mcp\", \"env\": { \"JIRA_TOKEN\": \"${JIRA_TOKEN}\" } },\n    \"pgread\": { \"command\": \"pg-mcp\", \"args\": [\"--dsn\", \"postgres://ro:Xk82v@db.internal/app\"] },\n    \"notes\":  { \"command\": \"/Users/sam/bin/notes-mcp\" }\n  }\n}\n```\n\n`jira` and `pgread` are meant for the whole team (each engineer uses their own Jira token; everyone shares the read-only database account). `notes` is Sam's personal note-taking server, which he is still experimenting with. What should the review require?",
     "options": [
      {
       "id": "A",
       "text": "Approve it as is, since the repository is private and the read-only password is visible only to employees who already have access."
      },
      {
       "id": "B",
       "text": "Move all three servers into each engineer's `~/.claude.json`, so that no credentials or machine paths are kept in the repository."
      },
      {
       "id": "C",
       "text": "Replace the DSN with `${PG_RO_DSN}`, move `notes` to Sam's `~/.claude.json`, and keep the `jira` entry as it is."
      },
      {
       "id": "D",
       "text": "Replace the DSN with `${PG_RO_DSN}` and keep `notes`, since engineers without the binary just won't see its tools."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Shared servers stay in the project `.mcp.json`, and credentials are supplied through environment variable expansion so no secret is committed: `jira` already does this correctly, and `pgread` must replace its literal password with a variable such as `${PG_RO_DSN}`. A personal, experimental server with a path on one laptop belongs in that user's `~/.claude.json`, where it does not affect teammates.",
      "wrong": {
       "A": "A private repository is still the wrong place for secrets: every clone, fork, and backup carries the password. Expansion keeps the shared definition without the secret.",
       "B": "This removes the shared, version-controlled definition of team servers. Keeping secrets out of the repository does not require user scope; `${VAR}` expansion does that.",
       "D": "Fixes the secret but leaves a personal experiment in shared configuration: every teammate's session tries to start a server that exists only on Sam's machine."
      }
     },
     "studyRef": "Task Statement 2.4 (.mcp.json with ${VAR} expansion for credentials; personal/experimental servers in ~/.claude.json)"
    },
    {
     "n": 38,
     "scenario": 4,
     "domain": 3,
     "ts": "3.1",
     "tests": "Project-level CLAUDE.md is shared via version control and scoped to its repository; user-level applies everywhere for that user",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your platform team supports `ledger-api` and 11 other repositories, each with its own conventions. To give every engineer the `ledger-api` rules (money as integer cents, schema changes only through `ledgerctl migrate`, no ORM in `core/`), the onboarding script appends them to each engineer's `~/.claude/CLAUDE.md`. Two problems followed: sessions in the other 11 repositories now apply the ledger rules, and engineers onboarded before last month's rule change still have the old version. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Commit the rules to `ledger-api` as its project-level `CLAUDE.md`, and stop writing them to engineers' home directories."
      },
      {
       "id": "B",
       "text": "Run the onboarding script every night, so that it rewrites the ledger section of every engineer's `~/.claude/CLAUDE.md` file."
      },
      {
       "id": "C",
       "text": "Put the rules under a heading \"Apply only in ledger-api\" in each `~/.claude/CLAUDE.md`, so sessions in other repositories skip them."
      },
      {
       "id": "D",
       "text": "Ask engineers to run `/memory` when they start ledger work, to confirm the ledger rules are loaded."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A project-level CLAUDE.md in the repository is shared through version control, so every engineer working in `ledger-api` gets the current rules at the commit they have checked out, and sessions in other repositories never see them. User-level `~/.claude/CLAUDE.md` applies to that user in every project and is not versioned with the code, which caused both problems. (Current docs also offer `/context` for inspecting what is loaded; the exam uses `/memory`.)",
      "wrong": {
       "B": "This addresses staleness only: user-level rules still load in every repository, so the leak into the other 11 remains.",
       "C": "This relies on Claude inferring when a heading applies, and the rules still load in every repository; the copies in home directories still go stale too.",
       "D": "`/memory` can confirm what is loaded, but it fixes neither problem: the rules would still load everywhere and could still be outdated."
      }
     },
     "studyRef": "Task Statement 3.1 (project-level vs user-level CLAUDE.md; sharing through version control)"
    },
    {
     "n": 39,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Building codebase understanding incrementally with Grep then Read",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A new engineer asks the agent to explain how payment retries work in an unfamiliar 3,000-file service. The agent's first move is to Read every file in `src/` so it can \"load the whole codebase.\" After about 40 reads, the context is nearly full and it has not answered. What is the better approach?",
     "options": [
      {
       "id": "A",
       "text": "Start with Grep for entry points such as retry-related function names, then Read specific files and follow imports to trace the flow."
      },
      {
       "id": "B",
       "text": "Use Glob with `**/*.ts` and read each result in alphabetical order."
      },
      {
       "id": "C",
       "text": "Read only the README and answer from that, since it summarizes the service."
      },
      {
       "id": "D",
       "text": "Split the codebase alphabetically across several sessions and combine the notes, which gives each pass a bounded amount of material to read in its own context."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Build understanding incrementally: Grep to find entry points, then Read to follow imports and trace flows, instead of reading all files upfront.",
      "wrong": {
       "B": "Glob only lists paths; reading every match is the same exhaustive approach that exhausts context.",
       "C": "A README may be missing or outdated and cannot substitute for tracing the actual code.",
       "D": "This is an unprincipled split that does not follow the code's actual call flow."
      }
     },
     "studyRef": "Task Statement 2.5 (incremental codebase understanding)"
    },
    {
     "n": 40,
     "scenario": 4,
     "domain": 5,
     "ts": "5.4",
     "tests": "Crash recovery needs structured state exported to a known location at a granularity that survives a mid-run crash",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your migration tool runs a coordinator and four subagents with the Agent SDK. Each subagent converts 25 legacy modules, about 6 minutes per module, and makes mapping decisions (which legacy API maps to which replacement) that its later modules reuse. Only when its whole assignment is done does a subagent write `.migrate-state/<agent>.json` and return a summary to the coordinator. On resume, the coordinator loads `.migrate-state/manifest.json` and injects the listed state into re-spawned subagents. The host crashed two hours into a run; the manifest listed no state files, and about 80 converted modules were redone. What change would have preserved that work?",
     "options": [
      {
       "id": "A",
       "text": "Resume the coordinator's own session after the crash, since its conversation history records each subagent's progress up to the crash."
      },
      {
       "id": "B",
       "text": "Run the four subagents one after another instead of in parallel, so that a crash can only cost the assignment in progress."
      },
      {
       "id": "C",
       "text": "Have each re-spawned subagent scan the repository's converted files and work out which of its modules were already done."
      },
      {
       "id": "D",
       "text": "Have each subagent rewrite its state file after every module, listing modules completed, the one in progress, and its decisions."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The state export exists but at the wrong granularity: written only at the end of a 2.5-hour assignment, it captured nothing from a crash at hour two. Exporting structured state to the known location after every module lets the manifest restore completed work and the mapping decisions later modules depend on.",
      "wrong": {
       "A": "Subagents report to the coordinator only when an assignment completes, so the coordinator's history holds none of their in-progress work; resuming it restores nothing about the 80 modules.",
       "B": "Sequential runs still lose all in-flight work of the running assignment and roughly quadruple total run time.",
       "C": "Converted files do not record the mapping decisions later modules must reuse, and a half-converted module can look finished; inferring progress is unreliable compared with an explicit export."
      }
     },
     "studyRef": "Task Statement 5.4 (structured state exports and manifests for crash recovery)"
    },
    {
     "n": 41,
     "scenario": 4,
     "domain": 1,
     "ts": "1.5",
     "tests": "An interception hook that blocks a policy violation should redirect to the approved alternative workflow",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your developer-productivity agent has a hook that intercepts `Bash` calls and blocks any command that targets `prod-db.internal`, returning only the message `denied`. No production queries have run since rollout, but in 18% of blocked sessions the agent re-issues the same command several times, then tells the engineer it \"lacks permission\" and stops. Read-only data questions are supposed to go to the `run_readonly_query` tool on the `analytics-replica` MCP server, which is already connected. What change is best?",
     "options": [
      {
       "id": "A",
       "text": "Add a system-prompt section explaining that production commands are blocked and the agent should use the replica, keeping the denial."
      },
      {
       "id": "B",
       "text": "Make the hook's block message name the policy and redirect the agent to `run_readonly_query` on `analytics-replica`."
      },
      {
       "id": "C",
       "text": "Have the hook silently rewrite the host to the replica and run the command, returning the output as if it came from production."
      },
      {
       "id": "D",
       "text": "Remove `Bash` from the agent's tool set entirely, so that no command against the production database can ever be issued."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A hook that blocks a policy-violating action should redirect to the approved alternative, not just fail. Putting the redirect in the block result delivers it deterministically at the moment the agent is blocked, so it switches to the replica tool instead of retrying or giving up.",
      "wrong": {
       "A": "Prompt guidance is probabilistic and is read long before the block happens; the bare `denied` result still gives the agent no path forward at that moment.",
       "C": "Silently substituting another system misleads the agent and the engineer about where the data came from, and replica data can lag production.",
       "D": "Bash is needed for builds, tests, and Git; removing it breaks the agent's core work to solve a problem the existing block already prevents."
      }
     },
     "studyRef": "Task Statement 1.5 (interception hooks that block and redirect to alternative workflows)"
    },
    {
     "n": 42,
     "scenario": 4,
     "domain": 3,
     "ts": "3.2",
     "tests": "Applying context: fork selectively: isolates verbose output but a forked skill does not see the conversation",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your team has two project skills for a legacy monolith. `/survey-module` reads every file in a module (often 200+) and prints about 20,000 tokens of notes; engineers only need its one-page summary at the end. `/pair-refactor` continues the refactoring plan the engineer has been discussing with Claude in the current session and then edits files step by step. A teammate proposes adding `context: fork` to both skills' frontmatter \"to keep sessions clean.\" What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Add `context: fork` to `/survey-module` only; a forked skill can't see the session's discussion."
      },
      {
       "id": "B",
       "text": "Add `context: fork` to both, so that neither skill's intermediate output ends up in the main conversation."
      },
      {
       "id": "C",
       "text": "Add it to neither, and have engineers run `/compact` right after each `/survey-module` run finishes."
      },
      {
       "id": "D",
       "text": "Add `context: fork` to `/pair-refactor` only, because its step-by-step edits create the most back-and-forth."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`context: fork` runs a skill in an isolated sub-agent context, so `/survey-module`'s 20,000 tokens of notes stay out of the main session and only the summary comes back. The same isolation means a forked skill does not see the conversation history, and `/pair-refactor` depends on the plan discussed in that conversation, so it must run in the main context.",
      "wrong": {
       "B": "Forking `/pair-refactor` would cut it off from the plan the engineer discussed, which is the input it needs.",
       "C": "`/compact` is a lossy cleanup after the verbose output has already filled the context; `context: fork` prevents the pollution in the first place.",
       "D": "This is backwards: it isolates the skill that needs the conversation and leaves the verbose survey polluting the main session."
      }
     },
     "studyRef": "Task Statement 3.2 (context: fork isolates verbose or exploratory skills; a forked skill does not see conversation history)"
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "MCP tools are discovered from the server at connection time rather than hard-coded in the agent",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your Agent SDK productivity agent connects to the team's `codesearch` MCP server. Its system prompt contains a hand-maintained, 120-line section that lists every `codesearch` tool with its parameters. Last week the server team renamed `find_symbol` to `lookup_symbol` and added `list_dependents`. Since then, transcripts show the agent repeatedly attempting the removed `find_symbol`, which fails, and never using `list_dependents`. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a CI check that fails whenever the system prompt's tool list differs from the tools the server reports, so the list is always kept current."
      },
      {
       "id": "B",
       "text": "Pin `codesearch` to last month's release until someone can rewrite the system prompt section for the renamed and new tools."
      },
      {
       "id": "C",
       "text": "Delete the hand-written list: the agent gets each tool's definition from the server at connection, so keep guidance in tool descriptions."
      },
      {
       "id": "D",
       "text": "Add a hook that intercepts calls to `find_symbol` and redirects them to `lookup_symbol` with the same arguments."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "MCP tools are discovered when the agent connects to the server: their names, descriptions, and input schemas come from the server itself. A hand-maintained copy in the prompt is a second, stale source of truth that overrides what the agent actually has. Removing it, and keeping usage guidance in the server's tool descriptions, means renames and new tools reach the agent automatically.",
      "wrong": {
       "A": "It detects drift but keeps the duplicated catalog that causes it, so every server change still needs a manual prompt edit.",
       "B": "Pinning hides the symptom and blocks the team from new tools such as `list_dependents`, while the duplicated list remains.",
       "D": "It patches one rename. The next change breaks again, and nothing helps the agent discover `list_dependents`."
      }
     },
     "studyRef": "Task Statement 2.4 (tools from configured MCP servers are discovered at connection time)"
    },
    {
     "n": 44,
     "scenario": 4,
     "domain": 1,
     "ts": "1.4",
     "tests": "Prompt guidance is appropriate for low-stakes workflow preferences; programmatic gates are for required compliance",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your scaffolding agent's system prompt tells it to `Grep` for an existing helper before writing a new utility function. Reviews show it skips the search in about 7% of sessions; the result is an occasional duplicate helper that code review catches and that takes a few minutes to consolidate. A teammate proposes a hook that rejects every `Write` call unless `Grep` has run earlier in the session. About a fifth of sessions only create brand-new files, such as generated migrations or new packages, where no prior search applies. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Ship the hook as proposed, since a deterministic gate is always preferable to prompt guidance for any rule the team writes down."
      },
      {
       "id": "B",
       "text": "Keep it as prompt guidance, perhaps with a clearer example: a miss is cheap and caught in review, while a gate would block valid writes."
      },
      {
       "id": "C",
       "text": "Ship the hook, but exempt any `Write` call the agent labels as a new module, so the model decides when the requirement applies."
      },
      {
       "id": "D",
       "text": "Replace `Write` with an MCP tool that searches the repository itself and refuses to create any function whose name resembles an existing one."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Programmatic gates are for rules that need deterministic compliance, such as financial or safety controls. A duplicate-helper preference with a cheap, reviewable failure mode is a good fit for prompt guidance, while a blanket gate would block the fifth of sessions that legitimately create new files.",
      "wrong": {
       "A": "Not every workflow preference warrants a hook; gating this one adds friction and blocks legitimate new-file sessions to prevent a low-cost miss.",
       "C": "The exemption depends on how the model labels its own call, so the gate is only as reliable as prompt compliance while adding complexity.",
       "D": "This over-engineers a low-stakes preference, and name-similarity refusals would block legitimate new functions."
      }
     },
     "studyRef": "Task Statement 1.4 (programmatic enforcement vs prompt-based guidance for workflow ordering)"
    },
    {
     "n": 45,
     "scenario": 4,
     "domain": 5,
     "ts": "5.1",
     "tests": "Trimming verbose tool outputs to the relevant fields before they accumulate in context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Engineers use your agent to trace failures in legacy nightly batch jobs, and sessions often hit the context limit after about 25 tool calls. Telemetry from those sessions shows where the tokens went: system prompt and `CLAUDE.md` 6%, conversation text 8%, `Read` results 18%, and results from the `jobs` MCP server's `get_job_run` tool 68%. Each `get_job_run` result is about 3,500 tokens (full log tail, 140 environment variables, per-step timings), but the agent only ever uses the run ID, status, return code, failing step, and start time. What is the most effective change?",
     "options": [
      {
       "id": "A",
       "text": "Run `/compact` automatically every 10 tool calls, so that the older tool results are condensed into a short running summary."
      },
      {
       "id": "B",
       "text": "Shorten the system prompt and the project `CLAUDE.md`, because they are loaded into every request."
      },
      {
       "id": "C",
       "text": "Increase `max_tokens` on each request, so that the agent has more room before reaching the context limit."
      },
      {
       "id": "D",
       "text": "Trim each `get_job_run` result to the run ID, status, return code, failing step, and start time before it enters context."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool results accumulate in context and consume tokens far out of proportion to their relevance: here one tool is 68% of the tokens while only five fields matter. Trimming each `get_job_run` result to those fields before it is added to the context (for example in a wrapper or a PostToolUse hook) removes most of the growth at its source.",
      "wrong": {
       "A": "Compaction is a lossy cleanup after the fact, and every new 3,500-token result recreates the problem.",
       "B": "The prompt and `CLAUDE.md` are only 6% of the tokens; shortening them targets the wrong source.",
       "C": "`max_tokens` limits the length of the model's output; it does not enlarge the context window or reduce what tool results consume."
      }
     },
     "studyRef": "Task Statement 5.1 (trim verbose tool outputs to relevant fields before they accumulate in context)"
    },
    {
     "n": 46,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "CLAUDE.md supplies the team's review criteria, including what not to flag, to CI-invoked Claude Code",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your CI review job runs `claude -p \"Review this PR for bugs and security issues\"` from the repository checkout. Developers dismiss 58% of its comments, and most dismissed ones target patterns the team accepts on purpose: raw SQL in `migrations/`, generated code under `src/gen/`, and `eval` in the sandboxed plugin loader, which already passed a security review. The review still finds real defects. The project CLAUDE.md currently holds only build commands. What is the best way to cut the false positives?",
     "options": [
      {
       "id": "A",
       "text": "Change the prompt to \"report only high-severity issues\", so comments on accepted patterns fall below the bar."
      },
      {
       "id": "B",
       "text": "Have Claude infer on each run which patterns the team accepts, by measuring how often each pattern appears."
      },
      {
       "id": "C",
       "text": "Tell developers to mark false positives \"won't fix\", so the review learns over time which comments it should stop posting."
      },
      {
       "id": "D",
       "text": "Add review criteria to the project CLAUDE.md: what to report, what to skip (with these paths), and severity rules."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "CLAUDE.md is the mechanism for giving CI-invoked Claude Code the team's review criteria. Writing down what to report, which intentional patterns and paths to skip, and how to assign severity gives every run the explicit project standards it lacks, removing the accepted-pattern comments while keeping real findings.",
      "wrong": {
       "A": "A severity cut also drops real medium-severity defects, and an accepted `eval` may still be rated high; it hides comments instead of giving the review the team's criteria.",
       "B": "Frequency does not show intent: a common pattern can still be wrong, and a rare one can be accepted. Inferring criteria on every run is also costly and inconsistent compared with stating them once.",
       "C": "Each `claude -p` run is a fresh session; dismissals on the PR do not reach later runs unless you put them in context, so nothing is learned."
      }
     },
     "studyRef": "Task Statement 3.6 (CLAUDE.md provides review criteria and project standards to CI-invoked Claude Code)"
    },
    {
     "n": 47,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "A high false-positive category erodes trust in an accurate one: disable it temporarily and rewrite its criteria",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Your CI reviewer's `hardcoded-string` category, meant to catch user-facing text that skipped translation, has 74% of its findings dismissed. Most of them land on log messages, test fixtures, and internal error codes. Developers have started bulk-dismissing every comment from the bot: dismissals of `sql-injection` findings, which audits show are 93% correct, rose from 5% to 41% this quarter. Which TWO actions should you take first? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Add \"report only the hard-coded strings you are highly confident are user-facing\" to the `hardcoded-string` instructions."
      },
      {
       "id": "B",
       "text": "Stop posting `hardcoded-string` findings for now, so that the remaining categories can rebuild developers' trust."
      },
      {
       "id": "C",
       "text": "Run every review three times and post only findings that appear in at least two runs, to filter noise in all categories."
      },
      {
       "id": "D",
       "text": "Add a severity label to every comment so developers can sort out and dismiss `hardcoded-string` findings without reading them."
      },
      {
       "id": "E",
       "text": "Rewrite the `hardcoded-string` criteria to cover only strings rendered in UI components, and to skip logs, tests, and error codes."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "The noisy category is dragging down trust in an accurate one: developers now dismiss correct `sql-injection` findings too. Temporarily disabling `hardcoded-string` (B) stops the damage. Rewriting its criteria to state exactly what to report and what to skip (E) fixes the cause, so the category can come back once its precision is acceptable.",
      "wrong": {
       "A": "The near miss: it targets the right category, but \"highly confident\" is a vague confidence instruction that never defines user-facing text, so it will not improve precision.",
       "C": "These false positives are systematic, so they would appear in most runs and pass the vote. Consensus voting mainly suppresses real issues that are detected only intermittently.",
       "D": "Labels make the noise easier to skim past but leave it in place. Trust keeps eroding because developers still see a flood of wrong findings."
      }
     },
     "studyRef": "Task Statement 4.1 (high false-positive categories undermine trust in accurate ones; temporarily disable them while improving their criteria)"
    },
    {
     "n": 48,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Matching the API to latency requirements when the same job is blocking only on some runs",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your nightly CI job generates regression tests for the day's merged changes: about 1,500 requests, sent at 23:00 after the last merge. On most nights the tests are reviewed whenever developers get to them the next day. On the four release nights each month, however, the generated tests must pass before the 07:00 release build can start. The job uses the synchronous API today, and finance wants the Message Batches API for its 50% savings. Which design gives the lowest cost without ever putting the 07:00 build at risk?",
     "options": [
      {
       "id": "A",
       "text": "Use batch every night; in the last six weeks every batch finished in under an hour, which leaves a wide margin before 07:00."
      },
      {
       "id": "B",
       "text": "Use batch on ordinary nights and the synchronous API on release nights, when the job blocks the build."
      },
      {
       "id": "C",
       "text": "Keep the synchronous API every night, since a job that blocks a build on some nights has to be treated as blocking on all nights."
      },
      {
       "id": "D",
       "text": "Use batch every night, marking release-night requests `priority: \"high\"` so they finish by 07:00."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Batch processing can take up to 24 hours with no latency SLA, so it cannot back a step that must finish within the 8 hours before a 07:00 build. On ordinary nights nothing waits on the job, so batch is the right, cheaper fit. Choosing the API per run by its latency requirement captures the saving on most nights without risking release builds.",
      "wrong": {
       "A": "Past completion times are not a guarantee. With up to 24 hours of processing and no SLA, a slow batch on a release night would delay the build.",
       "C": "It is safe but not lowest cost: the job is latency-tolerant on most nights, and those nights can use batch for the 50% saving.",
       "D": "The Message Batches API has no priority flag that guarantees completion time; this feature does not exist."
      }
     },
     "studyRef": "Task Statement 4.5 (synchronous API for blocking work, batch for latency-tolerant work; no batch latency SLA)"
    },
    {
     "n": 49,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Re-run review inputs: the full current PR diff plus the prior findings with a report-only-new-or-unaddressed instruction",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your PR review job reruns `claude -p` after every push, and PRs average five pushes before merge. Each re-run receives the full PR diff and nothing else, and developers complain that every push brings back comments the bot already posted; they still want reminders about earlier findings that remain unfixed. A teammate proposes sending only the newest commit's diff. Last month, though, a push that changed `parseAmount()` to return cents broke a caller added two commits earlier in the same PR, and the full-diff review caught it. Which TWO should each re-run receive? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Only the newest commit's diff, since the earlier commits were already reviewed on previous runs."
      },
      {
       "id": "B",
       "text": "No prior context, plus a post-step that deletes any new comment whose file and line match an older one."
      },
      {
       "id": "C",
       "text": "The full PR diff against the base branch at the new head commit."
      },
      {
       "id": "D",
       "text": "Every comment the bot has ever posted in the repository, so it can avoid repeating any of them."
      },
      {
       "id": "E",
       "text": "The previous run's findings, with an instruction to report only new or still-unaddressed issues."
      }
     ],
     "answer": [
      "C",
      "E"
     ],
     "explanation": {
      "correct": "A re-run needs the whole change at the new head, both to find issues that span commits (the `parseAmount()` caller) and to check whether earlier findings are still present, plus the prior findings with an instruction to report only new or still-unaddressed issues. Together they remove duplicate comments while keeping reminders for unfixed findings.",
      "wrong": {
       "A": "The newest commit alone hides the earlier caller that its change broke, the exact defect the full-diff review caught, and it cannot show whether findings in untouched code are still unfixed.",
       "B": "A file-and-line match breaks when later commits shift lines, and deleting matches also deletes the reminders developers want; deduplication belongs in the run's context.",
       "D": "Comments from other pull requests are irrelevant to this change and bloat the context; the run needs this PR's prior findings, not the repository's comment history."
      }
     },
     "studyRef": "Task Statement 3.6 (re-run reviews with prior findings in context; report only new or still-unaddressed issues)"
    },
    {
     "n": 50,
     "scenario": 5,
     "domain": 4,
     "ts": "4.2",
     "tests": "Contrastive few-shot examples (acceptable pattern vs genuine issue) cut false positives and generalize",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your CI reviewer flags every `time.sleep()` call as a performance bug. Developers dismiss 85% of these flags, which land on retry helpers and one-off CLI scripts where a blocking pause is intended. The prompt already says \"Ignore `time.sleep` in scripts and retry helpers.\" Last week the reviewer also missed a blocking `requests.get()` call inside an `async def` request handler, which stalled the event loop in production; that is the underlying problem the `time.sleep` check was meant to catch. Which change best reduces the false positives while also catching cases like the one it missed?",
     "options": [
      {
       "id": "A",
       "text": "List the directories where `time.sleep` is allowed, such as `scripts/` and `retry.py`, and keep flagging the call everywhere else."
      },
      {
       "id": "B",
       "text": "Add six examples of `time.sleep` findings that reviewers confirmed as real bugs, so the model learns what a genuine performance issue looks like."
      },
      {
       "id": "C",
       "text": "Change the instruction to \"Only flag `time.sleep` when you are confident it causes a real problem,\" and drop the list of exceptions."
      },
      {
       "id": "D",
       "text": "Add examples contrasting `time.sleep` in a sync retry helper (fine, and why) with a blocking call in an `async def` handler (a bug, and why)."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Contrastive examples show the model the principle behind the check, blocking calls inside async code, instead of a keyword. The acceptable example cuts the false positives on intended pauses, and the genuine example teaches a judgment that carries over to patterns no rule names, such as `requests.get()` in a handler.",
      "wrong": {
       "A": "A path allowlist is still keyword matching: it would not catch `requests.get()` in a handler, and it keeps flagging intended pauses in sync code outside those paths.",
       "B": "Showing only genuine issues does not teach what is acceptable, so the false positives on intended pauses remain, and the examples still center on one keyword.",
       "C": "Confidence wording does not define what makes a call a problem, so precision barely improves, and nothing points the model at the missed `requests.get()` case."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples distinguishing acceptable code patterns from genuine issues)"
    },
    {
     "n": 51,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "A self-correction request must include the original input, the failed output, and the specific validation errors",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline has two CI jobs. Job 1 runs `claude -p` with `--output-format json` and `--json-schema` on the pull request diff and uploads `findings.json`. Job 2 runs later on a fresh runner that has none of Job 1's local state, and checks semantics: each finding's `file` must appear in the diff and its `line` must fall inside a changed hunk. On failure, Job 2 currently runs:\n```bash\nclaude -p \"Your review had these errors: $ERRORS. Fix them.\" \\\n  --output-format json --json-schema review.schema.json\n```\nRetried outputs always pass validation, but they average 2 findings against 9 in the originals, and real issues from the first review disappear. What should Job 2 send on retry?",
     "options": [
      {
       "id": "A",
       "text": "The pull request diff, the failed `findings.json`, and the specific validation errors, asking for corrections to the listed findings."
      },
      {
       "id": "B",
       "text": "The same error message with `--resume` and Job 1's session ID, so the retry continues the review conversation with the diff in context."
      },
      {
       "id": "C",
       "text": "A fresh request to review the diff again from scratch, without the error list, so the second review is independent of the first."
      },
      {
       "id": "D",
       "text": "Nothing: drop every finding that fails validation and post only the ones that passed, so no retry is needed and the job ends sooner."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A self-correction request needs the original input, the failed output, and the specific errors. With only the error list, the model has neither the diff nor its own findings, so it produces a thin new answer that happens to validate. Sending all three lets it fix the listed locations while keeping the valid findings.",
      "wrong": {
       "B": "Job 2 runs on a fresh runner without Job 1's local state, so that session is not there to resume; the retry has to carry the diff and the failed output itself.",
       "C": "A blind re-review ignores what the validator found, can repeat the same location errors, and discards the first review's valid findings.",
       "D": "A wrong file or line is a correctable output error that a retry with specific feedback usually fixes; dropping those findings throws away real issues."
      }
     },
     "studyRef": "Task Statement 4.4 (follow-up requests with original document, failed extraction, and specific validation errors)"
    },
    {
     "n": 52,
     "scenario": 5,
     "domain": 4,
     "ts": "4.6",
     "tests": "Using a second independent Claude instance to review generated code",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In your pipeline, one Claude Code session writes a change and then, in the same session, is told to \"review your changes carefully\" with extended thinking enabled. A race condition slips through and is found later by a human. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Run the review in a separate, independent Claude instance that does not have the generator's reasoning context."
      },
      {
       "id": "B",
       "text": "Add \"be extremely critical of your own work\" to the prompt in the same session."
      },
      {
       "id": "C",
       "text": "Increase the extended-thinking budget for the self-review step."
      },
      {
       "id": "D",
       "text": "Repeat the same-session self-review three times and take the union of the findings, so that issues missed on one pass have several further chances to be noticed."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A model retains its reasoning context from generation, making self-review less likely to challenge its own choices; an independent instance without that context is more effective.",
      "wrong": {
       "B": "The same session retains the reasoning that produced the code, so it remains reluctant to question its own decisions.",
       "C": "More thinking in the same session does not remove the retained generation context that causes the blind spot.",
       "D": "Repeating the same biased reviewer multiplies cost without providing an independent perspective."
      }
     },
     "studyRef": "Task Statement 4.6 (independent review instances)"
    },
    {
     "n": 53,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "--json-schema constrains field values (an enum), not only the shape, for reliable automated posting",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your review job runs `claude -p` with `--output-format json` and a `--json-schema` for the findings, and every run parses. The posting script maps each finding's `severity` to a check-run annotation level: `high` to failure, `medium` to warning, `low` to notice, and anything else to notice. The schema declares `severity` as `{\"type\": \"string\"}`. Last week findings arrived labeled `High`, `critical`, `P1`, `blocker`, and `minor`, and two real security bugs were posted as notices. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "List the three allowed values in the prompt, and instruct Claude to use only those values for every finding."
      },
      {
       "id": "B",
       "text": "Declare `severity` in the schema as an enum of `high`, `medium`, and `low`."
      },
      {
       "id": "C",
       "text": "Extend the script's mapping with every label seen so far, and map any unknown label to warning, not notice."
      },
      {
       "id": "D",
       "text": "Run the review twice per push, and keep the higher of the two severities for each finding both runs report."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`--json-schema` enforces the structure of the output, and an enum is part of that structure: it restricts `severity` to the three values the script understands. A plain string type lets any label through, which is what sent the `critical` and `P1` findings to the notice fallback.",
      "wrong": {
       "A": "A prompt instruction is probabilistic; with a free-string schema nothing stops a run from writing `critical` again. Declaring the enum in the schema makes the constraint enforced instead of requested.",
       "C": "Chasing labels in the script never ends, because new variants keep appearing, and guessing a level for unknown labels can still under-rate real security bugs.",
       "D": "Two runs double the cost and still return free-form labels, and there is no reliable way to rank `blocker` against `P1`."
      }
     },
     "studyRef": "Task Statement 3.6 (--output-format json with --json-schema for machine-parseable findings)"
    },
    {
     "n": 54,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Explicit severity criteria with a concrete code example for each level",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your review prompt defines severity as `high`: significant impact; `medium`: moderate impact; `low`: minor impact. Temperature is already 0. Across 25 pull requests, the same defect, a database write in a request handler whose promise is never awaited, was rated `high` 13 times and `medium` 12 times, depending on the surrounding code. A teammate proposes adding a second Claude instance that re-rates each finding's severity with the same three definitions and keeps the higher rating. Which change most directly makes severity labels consistent?",
     "options": [
      {
       "id": "A",
       "text": "Also set the second instance's temperature to 0 and keep the current definitions, because sampling randomness is what makes the labels vary."
      },
      {
       "id": "B",
       "text": "Give each severity level explicit criteria and a concrete code example, such as an unawaited write in a request handler for `high`."
      },
      {
       "id": "C",
       "text": "Adopt the second-instance re-rating, since an independent reviewer without the first instance's reasoning context classifies more consistently."
      },
      {
       "id": "D",
       "text": "Have Claude output a confidence score with each finding and map scores above 0.9 to `high`, 0.6 to 0.9 to `medium`, and the rest to `low`."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The definitions are the problem: \"significant\" versus \"moderate\" impact leaves each call to whatever the surrounding code suggests. Explicit criteria for each level, each illustrated with a concrete code example, give the model a fixed reference to classify against, so the same pattern gets the same label.",
      "wrong": {
       "A": "Temperature is already 0 and the labels still vary with the surrounding code. The inconsistency comes from vague definitions, not from sampling.",
       "C": "Independent review helps catch issues a generator missed, but a second rater using the same vague definitions is just as inconsistent, and keeping the higher rating only biases labels upward.",
       "D": "Confidence measures how sure the model is that a finding is real, not how severe it is; a certain style nit would be labeled `high`."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit severity criteria with concrete code examples for each level)"
    },
    {
     "n": 55,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Batch API does not support multi-turn tool calling within a single request",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Your nightly job asks Claude to generate tests and uses tools mid-conversation to run them and fix failures. To cut costs, the team wants to move it to the Message Batches API and proposes keeping the same tool-based generate-run-fix conversation inside each batch request. What is the best way to evaluate this?",
     "options": [
      {
       "id": "A",
       "text": "Batch requests cannot run tools mid-request, so batch only the single-turn generation and run and repair in a separate follow-up step."
      },
      {
       "id": "B",
       "text": "Proceed as proposed, since batch requests can run tools and receive results within the same request."
      },
      {
       "id": "C",
       "text": "Move the entire job to batch and have the model simulate test results instead of running them."
      },
      {
       "id": "D",
       "text": "Reject batch processing entirely because the nightly job is latency-sensitive."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The Batches API suits latency-tolerant work at 50% lower cost but cannot run a multi-turn tool loop within one request, so only the single-turn parts can be batched.",
      "wrong": {
       "B": "The batch API does not support multi-turn tool calling within a single request.",
       "C": "Simulated results are not real test outcomes and would produce unreliable tests.",
       "D": "A nightly job is latency-tolerant, which is exactly what batch fits; the issue is the tool loop, not latency."
      }
     },
     "studyRef": "Task Statement 4.5 (batch limits and appropriate use)"
    },
    {
     "n": 56,
     "scenario": 5,
     "domain": 4,
     "ts": "4.6",
     "tests": "Self-reported confidence with each finding to enable calibrated review routing",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Human reviewers can examine about 20 flagged PRs per day, while the bot produces far more findings. You have 2,000 historical findings labeled correct or incorrect by senior engineers. Which design best uses reviewer capacity?",
     "options": [
      {
       "id": "A",
       "text": "Have a verification pass output confidence per finding, calibrate thresholds against the labeled findings, and route low-confidence ones to humans."
      },
      {
       "id": "B",
       "text": "Route a finding to humans whenever the model reports confidence below 8 out of 10, without checking against labels, since a high score suggests the model has already checked the result."
      },
      {
       "id": "C",
       "text": "Send every finding to humans in chronological order until capacity is exhausted."
      },
      {
       "id": "D",
       "text": "Randomly sample 20 PRs per day for human review."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Model self-reported confidence can route review attention effectively once thresholds are calibrated against labeled validation data.",
      "wrong": {
       "B": "Uncalibrated self-reported confidence may not match actual accuracy; the labeled set is needed to set thresholds.",
       "C": "This ignores which findings need attention and leaves reviewer time unprioritized.",
       "D": "Random sampling does not prioritize uncertain findings, so reviewers spend time on many that are fine."
      }
     },
     "studyRef": "Task Statement 4.6 (verification passes, calibrated routing; see also 5.5)"
    },
    {
     "n": 57,
     "scenario": 5,
     "domain": 4,
     "ts": "4.3",
     "tests": "Adding 'unclear' and 'other'+detail enum values for ambiguous cases",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A test-failure triage tool uses a JSON schema with `\"root_cause\": {\"enum\": [\"null_deref\", \"race_condition\", \"bad_config\"]}`. For failures that fit none of these or are ambiguous, the model must still pick one and often mislabels, which skews your reports. What is the best schema change?",
     "options": [
      {
       "id": "A",
       "text": "Change `root_cause` to a free-form string so the model can write whatever it finds."
      },
      {
       "id": "B",
       "text": "Keep the enum and add a prompt line telling the model to always pick the closest value."
      },
      {
       "id": "C",
       "text": "Add `\"unclear\"`, `\"other\"`, and a `root_cause_detail` string."
      },
      {
       "id": "D",
       "text": "Remove the `root_cause` field entirely and group failures by test name instead."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Schemas should let ambiguous and novel cases be expressed: 'unclear' for ambiguity and 'other' plus a detail field for extensible categories, instead of forcing a wrong value.",
      "wrong": {
       "A": "Free-form text loses the aggregation benefits of an enum.",
       "B": "This pushes the model to keep forcing ambiguous cases into wrong categories.",
       "D": "This discards useful classification instead of letting the schema represent uncertainty."
      }
     },
     "studyRef": "Task Statement 4.3 (schema design, enums with other/unclear)"
    },
    {
     "n": 58,
     "scenario": 5,
     "domain": 1,
     "ts": "1.6",
     "tests": "Splitting reviews into per-file local passes plus a separate cross-file integration pass",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A 12-file PR changes a response contract in `billing/schema.ts` and updates three consumers, but one consumer still reads an old field name. Your single-pass review of all 12 files missed the mismatch, while giving uneven attention to individual files. Which redesign is most likely to fix both problems?",
     "options": [
      {
       "id": "A",
       "text": "Keep one pass but add \"give every file equal depth and check cross-file consistency\" to the prompt."
      },
      {
       "id": "B",
       "text": "Per-file passes, then an integration pass over findings and changed contracts."
      },
      {
       "id": "C",
       "text": "Run only per-file passes, since each file can see its own imports and the types it uses."
      },
      {
       "id": "D",
       "text": "Run three full-PR passes and flag only issues found in at least two of the three runs."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Splitting into per-file local passes and a separate cross-file integration pass avoids attention dilution and still catches cross-file data flow issues.",
      "wrong": {
       "A": "The attention dilution is structural; an instruction does not change how a single pass distributes attention.",
       "C": "Per-file passes in isolation cannot reliably catch a contract mismatch that spans files.",
       "D": "Requiring consensus can suppress real bugs that are only caught intermittently."
      }
     },
     "studyRef": "Task Statement 1.6 (also 4.6: multi-pass review)"
    },
    {
     "n": 59,
     "scenario": 5,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples demonstrating the desired output format",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your review prompt already lists the required fields for each comment. Even so, some comments omit the file location, some omit severity, and the suggested fixes vary from one-word hints to full rewrites. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Rephrase the instruction with emphasis such as \"you MUST include ALL fields\", repeated in the system prompt and again at the end."
      },
      {
       "id": "B",
       "text": "Post-process the output with regular expressions that guess missing fields from the comment's surrounding text."
      },
      {
       "id": "C",
       "text": "Add two to four few-shot examples of full comments showing location, issue, severity, and fix."
      },
      {
       "id": "D",
       "text": "Run each review twice and keep the more complete response."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "When detailed instructions alone produce inconsistent formatting, few-shot examples demonstrating the desired output format are the most effective fix.",
      "wrong": {
       "A": "Stronger wording is still prose that has already produced inconsistent output.",
       "B": "Guessing missing fields fabricates information instead of fixing the output.",
       "D": "This doubles cost without addressing the cause of the inconsistency."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot for format consistency)"
    },
    {
     "n": 60,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "Identifying when retries with error feedback will and will not be effective",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline extracts review findings into JSON validated with Pydantic. Two failures occur. Failure A: `line` is returned as the string `\"42-45\"` instead of an integer. Failure B: a finding refers to ownership described in `docs/OWNERS.md`, which is not part of the PR, so the required `owner_team` field cannot be filled and comes back as a plausible guess. How should you handle these?",
     "options": [
      {
       "id": "A",
       "text": "Retry A with the original input, the failed output, and the specific validation error; B is absent from the source, so retrying will not help: make `owner_team` nullable."
      },
      {
       "id": "B",
       "text": "Retry both failures with the validation error appended, since feedback fixes any validation error."
      },
      {
       "id": "C",
       "text": "Skip retrying A and drop the finding, and fix B by retrying with a stronger instruction to find the owner."
      },
      {
       "id": "D",
       "text": "Retry both up to five times with increasing temperature to diversify the output."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Retry with error feedback works for format and structural mismatches but is ineffective when required information is absent from the provided source; schemas should allow null rather than force fabrication.",
      "wrong": {
       "B": "Retries fix format or structure errors but cannot produce information absent from the source.",
       "C": "A is a classic format error that retry feedback can fix, and B's missing information cannot be conjured by instruction.",
       "D": "More attempts at higher temperature do not supply missing data and can increase fabrication."
      }
     },
     "studyRef": "Task Statement 4.4 (retry-with-feedback limits; see also 4.3 nullable fields)"
    }
   ]
  }
 ],
 "sample": {
  "id": "sample",
  "title": "Official Sample Questions",
  "subtitle": "The 12 sample questions published in the Exam Guide (Section 9)",
  "scenarioIds": [
   1,
   2,
   3,
   5
  ],
  "official": true,
  "questions": [
   {
    "n": 1,
    "scenario": 1,
    "domain": 1,
    "ts": "1.4",
    "tests": "Programmatic prerequisites vs prompt guidance",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "Production data shows that in 12% of cases, your agent skips `get_customer` entirely and calls `lookup_order` using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
    "options": [
     {
      "id": "A",
      "text": "Add a programmatic prerequisite that blocks `lookup_order` and `process_refund` calls until `get_customer` has returned a verified customer ID."
     },
     {
      "id": "B",
      "text": "Enhance the system prompt to state that customer verification via `get_customer` is mandatory before any order operations."
     },
     {
      "id": "C",
      "text": "Add few-shot examples showing the agent always calling `get_customer` first, even when customers volunteer order details."
     },
     {
      "id": "D",
      "text": "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot.",
     "wrong": {
      "B": "Relies on probabilistic LLM compliance, which is insufficient when errors have financial consequences.",
      "C": "Relies on probabilistic LLM compliance, which is insufficient when errors have financial consequences.",
      "D": "Addresses tool availability rather than tool ordering, which is not the actual problem."
     }
    },
    "studyRef": "Task Statement 1.4 / 1.5 (Official Exam Guide, Sample Question 1)"
   },
   {
    "n": 2,
    "scenario": 1,
    "domain": 2,
    "ts": "2.1",
    "tests": "Tool descriptions drive tool selection",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "Production logs show the agent frequently calls `get_customer` when users ask about orders (e.g., \"check my order #12345\"), instead of calling `lookup_order`. Both tools have minimal descriptions (\"Retrieves customer information\" / \"Retrieves order details\") and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?",
    "options": [
     {
      "id": "A",
      "text": "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples showing order-related queries routing to `lookup_order`."
     },
     {
      "id": "B",
      "text": "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools."
     },
     {
      "id": "C",
      "text": "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns."
     },
     {
      "id": "D",
      "text": "Consolidate both tools into a single `lookup_entity` tool that accepts any identifier and internally determines which backend to query."
     }
    ],
    "answer": [
     "B"
    ],
    "explanation": {
     "correct": "Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions are minimal, models lack the context to differentiate between similar tools. Option B directly addresses this root cause with a low-effort, high-leverage fix.",
     "wrong": {
      "A": "Few-shot examples add token overhead without fixing the underlying issue.",
      "C": "A routing layer is over-engineered and bypasses the LLM's natural language understanding.",
      "D": "Consolidating tools is a valid architectural choice but requires more effort than a \"first step\" warrants when the immediate problem is inadequate descriptions."
     }
    },
    "studyRef": "Task Statement 2.1 (Official Exam Guide, Sample Question 2)"
   },
   {
    "n": 3,
    "scenario": 1,
    "domain": 5,
    "ts": "5.2",
    "tests": "Escalation calibration with explicit criteria",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?",
    "options": [
     {
      "id": "A",
      "text": "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously."
     },
     {
      "id": "B",
      "text": "Have the agent self-report a confidence score (1-10) before each response and automatically route requests to humans when confidence falls below a threshold."
     },
     {
      "id": "C",
      "text": "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing."
     },
     {
      "id": "D",
      "text": "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Adding explicit escalation criteria with few-shot examples directly addresses the root cause: unclear decision boundaries. This is the proportionate first response before adding infrastructure.",
     "wrong": {
      "B": "LLM self-reported confidence is poorly calibrated; the agent is already incorrectly confident on hard cases.",
      "C": "Over-engineered, requiring labeled data and ML infrastructure when prompt optimization hasn't been tried.",
      "D": "Solves a different problem entirely; sentiment doesn't correlate with case complexity, which is the actual issue."
     }
    },
    "studyRef": "Task Statement 5.2 (Official Exam Guide, Sample Question 3)"
   },
   {
    "n": 4,
    "scenario": 2,
    "domain": 3,
    "ts": "3.2",
    "tests": "Project-scoped slash commands location",
    "difficulty": "easy",
    "type": "single",
    "select": 1,
    "stem": "You want to create a custom `/review` slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?",
    "options": [
     {
      "id": "A",
      "text": "In the `.claude/commands/` directory in the project repository"
     },
     {
      "id": "B",
      "text": "In `~/.claude/commands/` in each developer's home directory"
     },
     {
      "id": "C",
      "text": "In the `CLAUDE.md` file at the project root"
     },
     {
      "id": "D",
      "text": "In a `.claude/config.json` file with a `commands` array"
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Project-scoped custom slash commands live in `.claude/commands/` within the repository. They are version-controlled and automatically available to all developers when they clone or pull the repo.",
     "wrong": {
      "B": "`~/.claude/commands/` is for personal commands that aren't shared via version control.",
      "C": "CLAUDE.md is for project instructions and context, not command definitions.",
      "D": "Describes a configuration mechanism that doesn't exist in Claude Code."
     }
    },
    "studyRef": "Task Statement 3.2 (Official Exam Guide, Sample Question 4)"
   },
   {
    "n": 5,
    "scenario": 2,
    "domain": 3,
    "ts": "3.4",
    "tests": "Plan mode vs direct execution",
    "difficulty": "easy",
    "type": "single",
    "select": 1,
    "stem": "You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?",
    "options": [
     {
      "id": "A",
      "text": "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes."
     },
     {
      "id": "B",
      "text": "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries."
     },
     {
      "id": "C",
      "text": "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured."
     },
     {
      "id": "D",
      "text": "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions - exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes.",
     "wrong": {
      "B": "Risks costly rework when dependencies are discovered late.",
      "C": "Assumes you already know the right structure without exploring the code.",
      "D": "Ignores that the complexity is already stated in the requirements, not something that might emerge later."
     }
    },
    "studyRef": "Task Statement 3.4 (Official Exam Guide, Sample Question 5)"
   },
   {
    "n": 6,
    "scenario": 2,
    "domain": 3,
    "ts": "3.3",
    "tests": "Path-specific rules with glob patterns",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "Your codebase has distinct areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow a repository pattern. Test files are spread throughout the codebase alongside the code they test (e.g., `Button.test.tsx` next to `Button.tsx`), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
    "options": [
     {
      "id": "A",
      "text": "Create rule files in `.claude/rules/` with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths."
     },
     {
      "id": "B",
      "text": "Consolidate all conventions in the root `CLAUDE.md` file under headers for each area, relying on Claude to infer which section applies."
     },
     {
      "id": "C",
      "text": "Create skills in `.claude/skills/` for each code type that include the relevant conventions in their `SKILL.md` files."
     },
     {
      "id": "D",
      "text": "Place a separate `CLAUDE.md` file in each subdirectory containing that area's specific conventions."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "`.claude/rules/` with glob patterns (e.g., `**/*.test.tsx`) allows conventions to be automatically applied based on file paths regardless of directory location - essential for test files spread throughout the codebase.",
     "wrong": {
      "B": "Relies on inference rather than explicit matching, making it unreliable.",
      "C": "Requires manual skill invocation or relies on Claude choosing to load them, contradicting the need for deterministic \"automatic\" application based on file paths.",
      "D": "Can't easily handle files spread across many directories since CLAUDE.md files are directory-bound."
     }
    },
    "studyRef": "Task Statement 3.3 (Official Exam Guide, Sample Question 6)"
   },
   {
    "n": 7,
    "scenario": 3,
    "domain": 1,
    "ts": "1.2",
    "tests": "Coordinator task decomposition root cause",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "After running the system on the topic \"impact of AI on creative industries,\" you observe that each subagent completes successfully: the web search agent finds relevant articles, the document analysis agent summarizes papers correctly, and the synthesis agent produces coherent output. However, the final reports cover only visual arts, completely missing music, writing, and film production. When you examine the coordinator's logs, you see it decomposed the topic into three subtasks: \"AI in digital art creation,\" \"AI in graphic design,\" and \"AI in photography.\" What is the most likely root cause?",
    "options": [
     {
      "id": "A",
      "text": "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents."
     },
     {
      "id": "B",
      "text": "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic."
     },
     {
      "id": "C",
      "text": "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors."
     },
     {
      "id": "D",
      "text": "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria."
     }
    ],
    "answer": [
     "B"
    ],
    "explanation": {
     "correct": "The coordinator's logs reveal the root cause directly: it decomposed \"creative industries\" into only visual arts subtasks, omitting music, writing, and film. The subagents executed their assigned tasks correctly - the problem is what they were assigned.",
     "wrong": {
      "A": "Incorrectly blames a downstream agent that is working correctly within its assigned scope.",
      "C": "Incorrectly blames a downstream agent that is working correctly within its assigned scope.",
      "D": "Incorrectly blames a downstream agent that is working correctly within its assigned scope."
     }
    },
    "studyRef": "Task Statement 1.2 (Official Exam Guide, Sample Question 7)"
   },
   {
    "n": 8,
    "scenario": 3,
    "domain": 5,
    "ts": "5.3",
    "tests": "Structured error propagation",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?",
    "options": [
     {
      "id": "A",
      "text": "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches."
     },
     {
      "id": "B",
      "text": "Implement automatic retry logic with exponential backoff within the subagent, returning a generic \"search unavailable\" status only after all retries are exhausted."
     },
     {
      "id": "C",
      "text": "Catch the timeout within the subagent and return an empty result set marked as successful."
     },
     {
      "id": "D",
      "text": "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Structured error context gives the coordinator the information it needs to make intelligent recovery decisions - whether to retry with a modified query, try an alternative approach, or proceed with partial results.",
     "wrong": {
      "B": "A generic status hides valuable context from the coordinator, preventing informed decisions.",
      "C": "Suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs.",
      "D": "Terminates the entire workflow unnecessarily when recovery strategies could succeed."
     }
    },
    "studyRef": "Task Statement 5.3 / 2.2 (Official Exam Guide, Sample Question 8)"
   },
   {
    "n": 9,
    "scenario": 3,
    "domain": 2,
    "ts": "2.3",
    "tests": "Scoped cross-role tool for high-frequency need",
    "difficulty": "hard",
    "type": "single",
    "select": 1,
    "stem": "During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?",
    "options": [
     {
      "id": "A",
      "text": "Give the synthesis agent a scoped `verify_fact` tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator."
     },
     {
      "id": "B",
      "text": "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once."
     },
     {
      "id": "C",
      "text": "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator."
     },
     {
      "id": "D",
      "text": "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Applies the principle of least privilege by giving the synthesis agent only what it needs for the 85% common case (simple fact verification) while preserving the existing coordination pattern for complex cases.",
     "wrong": {
      "B": "Batching creates blocking dependencies since synthesis steps may depend on earlier verified facts.",
      "C": "Over-provisions the synthesis agent, violating separation of concerns.",
      "D": "Relies on speculative caching that cannot reliably predict what the synthesis agent will need to verify."
     }
    },
    "studyRef": "Task Statement 2.3 (Official Exam Guide, Sample Question 9)"
   },
   {
    "n": 10,
    "scenario": 5,
    "domain": 3,
    "ts": "3.6",
    "tests": "Non-interactive Claude Code in CI (-p flag)",
    "difficulty": "easy",
    "type": "single",
    "select": 1,
    "stem": "Your pipeline script runs `claude \"Analyze this pull request for security issues\"` but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?",
    "options": [
     {
      "id": "A",
      "text": "Add the `-p` flag: `claude -p \"Analyze this pull request for security issues\"`"
     },
     {
      "id": "B",
      "text": "Set the environment variable `CLAUDE_HEADLESS=true` before running the command"
     },
     {
      "id": "C",
      "text": "Redirect stdin from /dev/null: `claude \"Analyze this pull request for security issues\" < /dev/null`"
     },
     {
      "id": "D",
      "text": "Add the `--batch` flag: `claude --batch \"Analyze this pull request for security issues\"`"
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "The `-p` (or `--print`) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input - exactly what CI/CD pipelines require.",
     "wrong": {
      "B": "References a non-existent feature (the CLAUDE_HEADLESS environment variable).",
      "C": "A Unix workaround that doesn't properly address Claude Code's command syntax.",
      "D": "References a non-existent feature (the --batch flag)."
     }
    },
    "studyRef": "Task Statement 3.6 (Official Exam Guide, Sample Question 10)"
   },
   {
    "n": 11,
    "scenario": 5,
    "domain": 4,
    "ts": "4.5",
    "tests": "Batch API vs real-time by latency requirement",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?",
    "options": [
     {
      "id": "A",
      "text": "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks."
     },
     {
      "id": "B",
      "text": "Switch both workflows to batch processing with status polling to check for completion."
     },
     {
      "id": "C",
      "text": "Keep real-time calls for both workflows to avoid batch result ordering issues."
     },
     {
      "id": "D",
      "text": "Switch both to batch processing with a timeout fallback to real-time if batches take too long."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. That makes it unsuitable for blocking pre-merge checks where developers wait for results, but ideal for overnight jobs like technical debt reports.",
     "wrong": {
      "B": "Relying on \"often faster\" completion isn't acceptable for blocking workflows.",
      "C": "Reflects a misconception - batch results can be correlated using `custom_id` fields.",
      "D": "Adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case."
     }
    },
    "studyRef": "Task Statement 4.5 (Official Exam Guide, Sample Question 11)"
   },
   {
    "n": 12,
    "scenario": 5,
    "domain": 4,
    "ts": "4.6",
    "tests": "Multi-pass review: per-file plus integration",
    "difficulty": "medium",
    "type": "single",
    "select": 1,
    "stem": "A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback - flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?",
    "options": [
     {
      "id": "A",
      "text": "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow."
     },
     {
      "id": "B",
      "text": "Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs."
     },
     {
      "id": "C",
      "text": "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass."
     },
     {
      "id": "D",
      "text": "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs."
     }
    ],
    "answer": [
     "A"
    ],
    "explanation": {
     "correct": "Splitting reviews into focused passes directly addresses the root cause: attention dilution when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues.",
     "wrong": {
      "B": "Shifts burden to developers without improving the system.",
      "C": "Misunderstands that larger context windows don't solve attention quality issues.",
      "D": "Would suppress detection of real bugs by requiring consensus on issues that may only be caught intermittently."
     }
    },
    "studyRef": "Task Statement 4.6 / 1.6 (Official Exam Guide, Sample Question 12)"
   }
  ]
 }
};
