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
     "difficulty": "medium",
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
      "correct": "A pre-execution interception hook gives deterministic compliance and can redirect to an alternative workflow, which a prompt rule cannot guarantee.",
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
      "correct": "Forced tool selection guarantees a specific tool runs first. Subsequent turns return to `\"auto\"` so the loop can call other tools and finish with text.",
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
     "difficulty": "medium",
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
     "difficulty": "medium",
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
      "correct": "`/memory` reveals which memory files are actually loaded in a session. Hierarchy placement explains inconsistency: user-level files are personal, and directory-level files load when Claude works in that directory.",
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
       "B": "Restricts which tools the skill may use but does not isolate its output from the main conversation.",
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
     "tests": "Plan-mode investigation then direct execution",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You must migrate from `moment` to `date-fns` across 52 files. Two approaches are viable: a one-shot codemod, or an adapter module with an incremental rollout. They have different CI and risk implications, and usage patterns in the code are unknown. What is the best workflow?",
     "options": [
      {
       "id": "A",
       "text": "Start direct execution on the first ten files and extrapolate the approach to the rest."
      },
      {
       "id": "B",
       "text": "Explore and decide in plan mode, then implement in direct execution."
      },
      {
       "id": "C",
       "text": "Use direct execution with a very detailed prompt describing the adapter design you have assumed."
      },
      {
       "id": "D",
       "text": "Use direct execution on the first ten files and extrapolate the same approach to the remaining forty-two files once it appears to work."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Plan mode is built for multi-file changes with multiple valid approaches. Combining plan-mode investigation with direct execution for implementation avoids rework and still moves fast.",
      "wrong": {
       "A": "Commits to an approach before the usage patterns and tradeoffs are known, risking costly rework.",
       "C": "Assumes the right design without exploring the code, which is the failure mode plan mode prevents.",
       "D": "A partial plan is exposed to dependencies that surface later in the remaining 42 files."
      }
     },
     "studyRef": "Task Statement 3.4 (library migrations; combining plan mode with direct execution)"
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
     "difficulty": "hard",
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
      "correct": "Subagents are spawned through the Task tool, so the coordinator must be allowed to use it.",
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
      "correct": "Parallel subagents are created by emitting multiple Task calls in one coordinator response, not across separate turns.",
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
     "difficulty": "hard",
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
     "difficulty": "hard",
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
     "difficulty": "hard",
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
      "correct": "Tool use with a JSON schema is the most reliable way to get schema-compliant structured output and removes JSON syntax and formatting problems.",
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
     "tests": "Batch API does not support multi-turn tool calling",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A nightly job processes 30,000 documents. Extraction currently has the model call a `lookup_vendor_id` tool mid-request and continue with the result. Finance wants the Message Batches API for the 50% cost savings and nothing is needed before morning. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Submit the batch as is; the batch will run the `lookup_vendor_id` tool loop for each request and return the final results."
      },
      {
       "id": "B",
       "text": "Include the entire vendor database in every request so that no tool call is needed, at the cost of many extra tokens per document processed."
      },
      {
       "id": "C",
       "text": "Move everything back to synchronous calls so the tool loop runs normally, accepting the higher per-document cost."
      },
      {
       "id": "D",
       "text": "Batch single-turn extraction requests, then do the vendor lookup in your code, matched by `custom_id`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The Batches API is a good fit for latency-tolerant jobs but cannot execute tools mid-request and return results. Restructure so the model call is single-turn and enrichment happens afterward.",
      "wrong": {
       "A": "Batch requests do not support multi-turn tool calling within a request.",
       "B": "Enormous token overhead per request that wipes out the savings.",
       "C": "Valid but forfeits the savings for a job that tolerates latency."
      }
     },
     "studyRef": "Task Statement 4.5 (Batches API limits; custom_id)"
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
     "tests": "Independent review instance beats same-session self-review",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "After extracting data from a contract, the same Claude session is asked \"review your extraction for errors.\" It catches only about 10% of known errors. What is the most effective alternative?",
     "options": [
      {
       "id": "A",
       "text": "Use a second, independent Claude instance, without the generator's reasoning context, to review the extraction."
      },
      {
       "id": "B",
       "text": "Enable extended thinking in the same session and ask it to repeat the review of the extraction against the source document, using more reasoning."
      },
      {
       "id": "C",
       "text": "Add \"be extremely critical of your own work\" to the review prompt so the model scrutinizes its own output harder before finalizing it."
      },
      {
       "id": "D",
       "text": "Ask the same session to review three times and merge findings."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A model that generated an output retains its reasoning context and is less likely to question its own decisions. An independent instance is more effective.",
      "wrong": {
       "B": "Extended thinking in the same context still carries the original reasoning and is less effective than an independent instance.",
       "C": "Instructions to self-critique do not remove the retained reasoning bias.",
       "D": "Repeated self-review shares the same blind spots."
      }
     },
     "studyRef": "Task Statement 4.6 (independent review instances)"
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
     "tests": "Adding tool results (with the assistant turn) to conversation history between loop iterations",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your support agent loop calls the Messages API. When `stop_reason == \"tool_use\"`, the code runs the requested tool and then sends a brand-new request containing only the original user message plus the tool output pasted in as plain text; the previous assistant turn is not included. In testing, the agent calls `get_customer` for the same customer ID three or four times in a row before answering. What is the root cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "Increase `max_tokens` substantially so the model has enough output room to reason about each tool result and settle on its next action in one pass."
      },
      {
       "id": "B",
       "text": "Append the assistant turn (with its `tool_use` block) and a user message holding the matching `tool_result` to history before each new request."
      },
      {
       "id": "C",
       "text": "Add a system prompt rule telling the agent never to call the same tool twice with the same arguments in one conversation."
      },
      {
       "id": "D",
       "text": "Set `tool_choice` to `\"any\"` so that the model is forced to call a tool on each iteration and stays on track."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The model can only reason about new information if the conversation history contains its own `tool_use` request and the paired `tool_result`. Without them, each iteration starts from scratch, so the model re-requests the same data. Appending both to history is the core of the agentic loop.",
      "wrong": {
       "A": "The model is not running out of output room; it simply never sees the result of the previous call. More tokens do not change that.",
       "C": "A prompt rule is probabilistic and treats the symptom. The real defect is that tool results never reach the model's context.",
       "D": "`tool_choice: \"any\"` forces a tool call every turn, which would make the loop worse (it could never end with a text answer) and does not supply the missing history."
      }
     },
     "studyRef": "Task Statement 1.1 (agentic loop lifecycle; study how assistant turns and tool_result blocks are appended to history)"
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Multiple customer matches require clarification, not heuristic selection",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"Hi, I'm Maria Lopez and I need a refund for my last order.\" `get_customer` with the name `Maria Lopez` returns three distinct records. The agent currently picks the record with the most recent order activity and continues to `process_refund`. QA found that about 1 in 20 of these refunds went to the wrong account. Escalations are reserved for cases where the agent cannot make progress, and the agent can ask follow-up questions in chat. What change best fixes this?",
     "options": [
      {
       "id": "A",
       "text": "Select the record whose shipping address was most recently used, since it is the most likely to be the active account."
      },
      {
       "id": "B",
       "text": "Escalate every conversation where `get_customer` returns more than one match, so that a human agent with full account access can choose the correct record before any refund discussion."
      },
      {
       "id": "C",
       "text": "Pick the record with the highest lifetime order value, since high-value customers contact support most often."
      },
      {
       "id": "D",
       "text": "Instruct the agent to ask the customer for an additional identifier (email, phone, or order number) and only proceed once exactly one record matches."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "When a tool returns multiple matches, the agent should request additional identifiers instead of guessing. Heuristic selection is what causes the wrong-account refunds, and a quick clarifying question resolves the ambiguity within the agent's own capability.",
      "wrong": {
       "A": "This is still a heuristic. A recently used shipping address does not prove identity, and wrong guesses lead to financial errors.",
       "B": "Escalations are reserved for cases the agent cannot progress on, and here a single clarifying question resolves the ambiguity; blanket escalation wastes human capacity and hurts the 80% first-contact-resolution target.",
       "C": "Lifetime order value says nothing about which person is actually contacting support; it is another arbitrary heuristic."
      }
     },
     "studyRef": "Task Statement 5.2 (ambiguity resolution; ask for additional identifiers rather than selecting heuristically)"
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 2,
     "ts": "2.2",
     "tests": "Returning business-rule errors as non-retryable, with customer-friendly explanations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`process_refund` rejects a request for an order placed 45 days ago because the refund window is 30 days. The MCP tool currently returns:\n```json\n{\"isError\": true, \"content\": \"Error: request failed\"}\n```\nThe agent retries three times, then tells the customer \"we hit a technical problem, please try again later.\" What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Return a structured business error (`isRetryable: false`) with a customer-friendly 30-day-window explanation the agent can relay."
      },
      {
       "id": "B",
       "text": "Increase the retry limit and add exponential backoff with jitter so that transient failures from the refund service stop reaching customers."
      },
      {
       "id": "C",
       "text": "Return an empty result marked as success when a policy rule blocks the refund, so the agent does not loop on the call and the customer never sees an error."
      },
      {
       "id": "D",
       "text": "Add a system prompt table that maps each error string that `process_refund` might return to the correct customer-facing message and next step, and have the agent follow it."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Structured error metadata (category, retryability, human-readable explanation) lets the agent distinguish a business-rule violation from a transient fault. It stops pointless retries and lets the agent communicate the policy accurately and pick a suitable next step.",
      "wrong": {
       "B": "The failure is a deterministic policy violation, not a transient fault. Retrying can never succeed and only delays the answer.",
       "C": "Reporting a failure as success hides it from the agent, which may then tell the customer the refund went through.",
       "D": "Every failure currently returns the same generic string, so a mapping table has nothing to key on. The tool itself must return distinguishable errors."
      }
     },
     "studyRef": "Task Statement 2.2 (structured error responses: errorCategory, isRetryable, business-rule errors)"
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
      "correct": "Tool-call interception hooks run before the tool executes, so the refund is never issued and the call can be redirected to human escalation. Hooks give deterministic guarantees where prompt instructions only give probabilistic compliance.",
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
     "tests": "Decomposing multi-concern requests and investigating in parallel with shared context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"I was charged twice for order #A-100, I need to change the shipping address on order #B-205, and I can't log in.\" The agent handles these one after another, often forgets the third issue, and takes about 3x longer than single-issue conversations. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Ask the customer to open separate tickets for each issue so that every conversation stays single-purpose."
      },
      {
       "id": "B",
       "text": "Build a fixed three-agent pipeline (billing, shipping, login) that always runs in that order for every conversation, whatever the customer actually asked about."
      },
      {
       "id": "C",
       "text": "Escalate every message that contains more than one issue to a human agent, since the agent cannot be trusted to track several separate problems in one conversation."
      },
      {
       "id": "D",
       "text": "Decompose the message into distinct items, investigate each in parallel using the shared verified customer context, then synthesize one unified resolution."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "For multi-concern requests the agent should split the message into discrete issues, investigate them concurrently with shared context (such as the verified customer ID), and then combine the outcomes into a single coherent reply. This improves both completeness and latency.",
      "wrong": {
       "A": "Pushing work onto the customer hurts the experience and the first-contact-resolution target, and fixes nothing in the agent.",
       "B": "A fixed pipeline runs irrelevant stages for most conversations, is sequential, and over-engineers a problem solved by decomposition within one agent.",
       "C": "Multi-issue messages are within the agent's capability; blanket escalation sacrifices resolution rate."
      }
     },
     "studyRef": "Task Statement 1.4 (decompose multi-concern requests, investigate in parallel, synthesize)"
    },
    {
     "n": 8,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Escalation triggers: explicit human request and policy gaps, not sentiment or confidence",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "You are writing escalation criteria for the support agent's system prompt. Which TWO of the following situations should cause the agent to call `escalate_to_human`? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "A customer is annoyed that a package arrived two days late and asks for the standard replacement for an item that arrived damaged, with photos attached."
      },
      {
       "id": "B",
       "text": "A customer asks for a refund on an item bought through a third-party marketplace, while the written policy covers only direct purchases and says nothing about resellers."
      },
      {
       "id": "C",
       "text": "The agent rates its own confidence at 6/10 on a routine in-window return whose order data it has already verified."
      },
      {
       "id": "D",
       "text": "A customer says, \"I don't want to talk to a bot, get me a human agent right now.\""
      },
      {
       "id": "E",
       "text": "A customer writes in all capitals about a duplicate charge that `lookup_order` confirms, and the refund is within the agent's authority."
      }
     ],
     "answer": [
      "B",
      "D"
     ],
     "explanation": {
      "correct": "Valid triggers are an explicit request for a human (honored immediately, without first investigating) and a policy gap where the written policy is silent on the customer's situation. The agent should not improvise policy it does not have.",
      "wrong": {
       "A": "A standard damage replacement with evidence is a straightforward case the agent can resolve; mild annoyance is not a complexity signal.",
       "C": "Self-reported confidence is a poor proxy for real case complexity, and this case is routine and verified.",
       "E": "The agent should acknowledge the frustration and resolve the issue because it is within its capability; sentiment alone is not a trigger."
      }
     },
     "studyRef": "Task Statement 5.2 (escalation triggers; unreliable sentiment/confidence proxies)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples showing reasoning for ambiguous-case handling",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Requests such as \"I want to cancel\" are ambiguous: the customer may mean an unshipped order or an active subscription. Your tool descriptions are already detailed, yet the agent picks the order tools about 30% of the time when the customer meant the subscription, and vice versa. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Add 20 or more examples of clear, unambiguous requests to the system prompt so the agent sees many routing patterns and learns what each tool is normally used for in practice."
      },
      {
       "id": "B",
       "text": "Set the temperature to 0 so that the agent makes the same choice on the same input."
      },
      {
       "id": "C",
       "text": "Add 2 to 4 few-shot examples of ambiguous requests that show the reasoning behind the chosen action (for example, asking which is meant when an open order and a subscription both exist)."
      },
      {
       "id": "D",
       "text": "Build a classifier that labels each message as order cancellation or subscription cancellation before the agent runs."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Few-shot examples of genuinely ambiguous cases, including the reasoning for choosing one action over plausible alternatives, teach the model the decision boundary and let it generalize to similar cases.",
      "wrong": {
       "A": "Clear examples do not teach how to handle ambiguity, and they add tokens without touching the failing cases.",
       "B": "Temperature 0 makes the choice repeatable but not correct; the model would consistently pick the wrong interpretation for the same input.",
       "D": "A separate classifier is over-engineered when prompt-level examples have not been tried, and it would face the same ambiguity."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot examples for ambiguous cases)"
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
     "tests": "allowedTools must include \"Task\" for a coordinator to spawn subagents",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You defined `AgentDefinition` entries for `web-search`, `doc-analysis`, `synthesis`, and `report`, each with a clear description and prompt. When you run the coordinator, it performs all the research itself using its own tools and never delegates. What is the most likely cause?",
     "options": [
      {
       "id": "A",
       "text": "The coordinator's `allowedTools` does not include `\"Task\"`, the tool used to spawn subagents."
      },
      {
       "id": "B",
       "text": "The subagent descriptions are too detailed, which causes the coordinator to prefer doing the work directly."
      },
      {
       "id": "C",
       "text": "Each subagent's own `allowedTools` must include `\"Task\"` before the coordinator can call it."
      },
      {
       "id": "D",
       "text": "Delegation is disabled until `fork_session` is enabled on the coordinator."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Subagents are invoked through the Task tool, and the coordinator can only call it if `\"Task\"` is in its `allowedTools`. Without it, the coordinator has no mechanism to delegate.",
      "wrong": {
       "B": "Clear descriptions are what help the coordinator choose a subagent; they do not suppress delegation.",
       "C": "The permission to spawn belongs to the coordinator. Giving subagents `Task` would let them spawn others, not enable the coordinator to call them.",
       "D": "`fork_session` is about branching a session from a shared baseline and has nothing to do with enabling delegation."
      }
     },
     "studyRef": "Task Statement 1.3 (Task tool and allowedTools)"
    },
    {
     "n": 18,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Spawning parallel subagents with multiple Task calls in one response",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The coordinator researches four independent subtopics. Tracing shows it calls the Task tool for one subtopic, waits for the result, then does the next, so total latency is roughly four times that of a single subagent. What change gives parallel execution?",
     "options": [
      {
       "id": "A",
       "text": "Raise `max_tokens` on the coordinator so that it can plan all four subtopics in a single pass before delegating."
      },
      {
       "id": "B",
       "text": "Give the four subagents a shared scratch memory so that they can coordinate their work and skip duplicate effort between them."
      },
      {
       "id": "C",
       "text": "Launch four separate coordinator instances, each handling one subtopic, and merge their outputs into a single report by hand afterwards."
      },
      {
       "id": "D",
       "text": "Have the coordinator emit all four Task tool calls in a single response, so that the subagents run concurrently."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Parallel subagents are created by emitting multiple Task tool calls in a single coordinator response rather than across separate turns. The independent subtopics then execute concurrently.",
      "wrong": {
       "A": "Planning room is not the bottleneck; the delegation pattern across turns is.",
       "B": "Subagents do not share memory, and extra coordination would not change the turn-by-turn delegation that serializes the work.",
       "C": "Separate coordinators lose the central aggregation and gap-checking that the coordinator provides."
      }
     },
     "studyRef": "Task Statement 1.3 (spawning parallel subagents)"
    },
    {
     "n": 19,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Iterative refinement loop: evaluate gaps, re-delegate targeted queries, re-synthesize",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A report on \"AI in healthcare\" omits regulatory aspects even though relevant sources exist. The coordinator currently passes the synthesis output straight to the report agent. Which change best addresses gaps like this?",
     "options": [
      {
       "id": "A",
       "text": "Add a second synthesis agent that re-reads the same inputs and double-checks the first one's output."
      },
      {
       "id": "B",
       "text": "After synthesis, have the coordinator check for coverage gaps, re-delegate targeted queries to the search and analysis subagents, and re-invoke synthesis until coverage is sufficient."
      },
      {
       "id": "C",
       "text": "Raise the search agent's result limit from 10 to 50 per query so that more sources reach synthesis."
      },
      {
       "id": "D",
       "text": "Give the report agent web search tools so that it can fill in missing sections itself while it writes the final report, with no extra round trips and no coordinator involvement."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "An iterative refinement loop led by the coordinator lets it detect missing topic areas and send targeted follow-up work, then synthesize again. That addresses coverage directly.",
      "wrong": {
       "A": "A second synthesizer sees the same inputs, so it cannot add material that was never retrieved.",
       "C": "More results of the same untargeted kind add volume, not the missing regulatory content.",
       "D": "Making the report agent search blurs roles and bypasses the coordinator's control; it also happens too late to be verified by synthesis."
      }
     },
     "studyRef": "Task Statement 1.2 (iterative refinement loops)"
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
     "tests": "Restricting each agent's tool set to its role",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The synthesis subagent was given 14 tools, including `web_search`, `fetch_url`, file tools, and database tools. It often runs its own web searches (duplicating the search agent) and frequently chooses the wrong tool. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Add a bold instruction to its prompt: \"Never use web search; the search agent does that\", and keep all 14 tools available."
      },
      {
       "id": "B",
       "text": "Cut its 14 tools to synthesis needs (read findings, one fact-check tool); route the rest via the coordinator."
      },
      {
       "id": "C",
       "text": "Give every subagent the same complete tool set so that any agent can finish any task without delegating to others."
      },
      {
       "id": "D",
       "text": "Remove web tools from the search agent and keep the synthesis agent's tools unchanged, since it probably copies the search agent."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Agents with too many or out-of-specialization tools tend to misuse them. Scoping each agent to the tools its role requires improves selection reliability and prevents cross-specialization misuse.",
      "wrong": {
       "A": "A prompt prohibition is probabilistic, and the 14-tool surface still makes tool choice unreliable.",
       "C": "Giving everyone every tool increases decision complexity, which is the cause of the misuse.",
       "D": "The search agent is behaving correctly; stripping its tools would break the real search workload."
      }
     },
     "studyRef": "Task Statement 2.3 (scoped tool access; too many tools degrade selection)"
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
      "correct": "`tool_choice: \"any\"` guarantees that the model returns a tool call rather than text while leaving the choice among tools to the model, which suits an unknown document type.",
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
     "tests": "Few-shot examples for varied document structures",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent extracts claims with their citations. It works for papers with inline citations (\"[12]\"), but for reports that put numbered references in a bibliography at the end it often leaves the source blank, and for reports where methodology is embedded in prose it misses sample sizes. Detailed instructions are already in the prompt. What is the best next step?",
     "options": [
      {
       "id": "A",
       "text": "Expand the prompt with a long rule list that describes each possible document layout in words, with exceptions for every variant seen so far."
      },
      {
       "id": "B",
       "text": "Convert every document to plain text first so that all documents share one format."
      },
      {
       "id": "C",
       "text": "Add 2 to 4 few-shot examples showing correct extraction for each structure (inline vs end-bibliography citations, separate vs embedded methodology)."
      },
      {
       "id": "D",
       "text": "Process each document three times and keep the majority result, which should average out the layout-specific extraction misses that appear across the separate runs."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Few-shot examples demonstrating correct handling of varied document structures are the most effective way to fix structural inconsistency when instructions alone fall short, and they help the model generalize to similar layouts.",
      "wrong": {
       "A": "More prose rules were already insufficient and tend to be interpreted inconsistently across layouts.",
       "B": "Flattening to plain text loses the very layout cues (bibliography position, section headings) that the model needs, and it does not teach the mapping.",
       "D": "Majority voting repeats the same systematic miss three times; it does not teach the model the structure."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot for varied document structures)"
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
     "tests": "Project-scoped .mcp.json with environment variable expansion",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team wants everyone who clones the repo to have the shared GitHub MCP server configured automatically, without committing anyone's access token. Which setup is correct?",
     "options": [
      {
       "id": "A",
       "text": "Have each developer add the server to their own `~/.claude.json` with their token, following instructions on a team wiki page."
      },
      {
       "id": "B",
       "text": "Commit the server definition with the token pasted in, since the repository is private and only team members can read it, so setup needs no extra steps for anyone."
      },
      {
       "id": "C",
       "text": "Describe the server and token in the project's `CLAUDE.md` so that Claude configures it at startup."
      },
      {
       "id": "D",
       "text": "Define the server in the project-level `.mcp.json` with the token as `${GITHUB_TOKEN}`, and have each developer set the variable locally."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Project-scoped `.mcp.json` is shared through version control, and environment variable expansion (such as `${GITHUB_TOKEN}`) keeps secrets out of the repository while each developer supplies their own value.",
      "wrong": {
       "A": "User-scoped configuration is personal and manual, so it is not shared automatically and drifts between developers.",
       "B": "Committing a secret is a security risk even in a private repository.",
       "C": "CLAUDE.md provides instructions and context; it is not where MCP servers are configured."
      }
     },
     "studyRef": "Task Statement 2.4 (.mcp.json scoping and ${ENV_VAR} expansion)"
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
     "tests": "Choosing an existing community MCP server over a custom one for standard integrations",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Engineers want the agent to read and update Jira tickets. Nothing about your Jira usage is unusual. What is the most sensible approach?",
     "options": [
      {
       "id": "A",
       "text": "Write a custom MCP server wrapping Jira's REST API from scratch, so you control every tool description."
      },
      {
       "id": "B",
       "text": "Configure an existing community Jira MCP server in the project's `.mcp.json`, and reserve custom servers for team-specific workflows."
      },
      {
       "id": "C",
       "text": "Let the agent call Jira's REST endpoints with `curl` in Bash using an API token hardcoded in the system prompt, for simplicity."
      },
      {
       "id": "D",
       "text": "Build a skill that scrapes the Jira web UI into text files for the agent to read."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "For standard integrations such as Jira, an existing community MCP server avoids needless build and maintenance effort. Custom servers are best reserved for team-specific workflows.",
      "wrong": {
       "A": "A custom server is more work than needed for a standard integration with no special requirements.",
       "C": "Hardcoded tokens in a prompt are a security risk, and raw curl calls give the agent no structured tool interface.",
       "D": "Scraping a UI is brittle and unnecessary when an API-based MCP server exists."
      }
     },
     "studyRef": "Task Statement 2.4 (community vs custom MCP servers)"
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
     "tests": "Diagnosing CLAUDE.md hierarchy issues: user-level vs project-level",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A new teammate's Claude Code does not follow your team's conventions (use `pnpm`, run lint before committing), while everyone else's does. It turns out the senior developers all wrote those instructions in their own `~/.claude/CLAUDE.md`. What is the right fix?",
     "options": [
      {
       "id": "A",
       "text": "Ask the new teammate to copy a senior developer's `~/.claude/CLAUDE.md` onto their machine and keep it in sync with theirs manually."
      },
      {
       "id": "B",
       "text": "Move the conventions into the project-level CLAUDE.md and commit it, so everyone receives them through version control."
      },
      {
       "id": "C",
       "text": "Add the conventions to a `.claude/config.json` file in the repository."
      },
      {
       "id": "D",
       "text": "Put the conventions in each developer's `~/.claude/commands/` directory, where Claude Code loads them for that developer in every session."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "User-level CLAUDE.md applies only to that user and is not shared via version control. Team-wide standards belong in the project-level CLAUDE.md that ships with the repository.",
      "wrong": {
       "A": "Copying files by hand is a fragile workaround that will drift again and leaves the root cause in place.",
       "C": "There is no `.claude/config.json` mechanism for instructions.",
       "D": "`~/.claude/commands/` holds personal slash commands, not always-loaded standards, and is also not shared."
      }
     },
     "studyRef": "Task Statement 3.1 (CLAUDE.md hierarchy; user-level not shared)"
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
      "correct": "`context: fork` runs the skill in its own subagent context so verbose intermediate output does not pollute the main conversation, and `allowed-tools` limits what the skill can do while it runs.",
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
     "tests": "Path-specific rules with glob patterns for conventions spread across directories",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Terraform files (`*.tf`) live in `infra/`, `services/*/deploy/`, and `tools/provisioning/`. They need specific conventions (naming, module layout), but those conventions should not consume context when developers are editing application code. What is the most maintainable setup?",
     "options": [
      {
       "id": "A",
       "text": "Place a CLAUDE.md containing the Terraform conventions in each directory that contains `.tf` files, and keep the copies in sync manually as the conventions change."
      },
      {
       "id": "B",
       "text": "Put the conventions in the root CLAUDE.md and `@import` the Terraform file, so they are always available."
      },
      {
       "id": "C",
       "text": "Create a skill containing the conventions and have developers invoke it by hand before editing any infrastructure code."
      },
      {
       "id": "D",
       "text": "Create `.claude/rules/terraform.md` with `paths: [\"**/*.tf\"]` in its frontmatter, so it loads only when matching files are in play."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Path-scoped rules with glob patterns load only when matching files are being edited, wherever they live, which avoids duplicated files and unnecessary context.",
      "wrong": {
       "A": "Multiple copies drift apart, and each directory-bound CLAUDE.md must be maintained separately.",
       "B": "Importing into the root file makes the conventions always loaded, wasting context when editing unrelated code.",
       "C": "A skill needs manual invocation, so conventions would be missed whenever someone forgets."
      }
     },
     "studyRef": "Task Statement 3.3 (.claude/rules with paths globs)"
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 3,
     "ts": "3.4",
     "tests": "Plan mode vs direct execution depending on scope and complexity",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your sprint has two tasks. Task 1: a `NullPointerException` in `parseDate()` with a stack trace pointing to line 88 of a single file. Task 2: migrating from a logging library to another across 52 files with inconsistent usage patterns. Which approach fits?",
     "options": [
      {
       "id": "A",
       "text": "Use plan mode for both so that nothing is ever changed without a plan."
      },
      {
       "id": "B",
       "text": "Use direct execution for Task 1 and plan mode for Task 2, then execute the approved plan."
      },
      {
       "id": "C",
       "text": "Use direct execution for both tasks and give very detailed upfront instructions for the migration as well."
      },
      {
       "id": "D",
       "text": "Use plan mode for Task 1 and direct execution for Task 2, since the larger task needs speed."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A well-scoped fix with a clear stack trace suits direct execution. A multi-file migration with variable patterns benefits from plan mode, which explores and designs before making changes, followed by direct execution of the plan.",
      "wrong": {
       "A": "Plan mode adds overhead for a single-line, clearly located fix.",
       "C": "A 52-file migration with inconsistent patterns cannot be fully specified upfront without exploring the code.",
       "D": "This inverts the guidance: the small, clear fix needs no planning, and the large uncertain change does."
      }
     },
     "studyRef": "Task Statement 3.4 (plan mode vs direct execution)"
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
     "tests": "Including prior review findings to avoid duplicate comments on re-runs",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The review job re-runs on every push to a PR. Developers complain that the bot posts the same comments again each time, including ones they have already fixed or acknowledged. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Run the review only on the first push of each PR, so later commits never get a second round of comments."
      },
      {
       "id": "B",
       "text": "Compare comment text by exact string match before posting and skip any comment already posted on an earlier push."
      },
      {
       "id": "C",
       "text": "Lower the severity threshold so fewer comments are produced on each push and developers have less to read."
      },
      {
       "id": "D",
       "text": "Pass the prior review findings into each re-run and have Claude report only new or still-unaddressed issues."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Giving Claude the previous findings and asking for only new or still-unaddressed issues prevents duplicates while still catching problems introduced by new commits.",
      "wrong": {
       "A": "Skipping later pushes would miss bugs introduced in later commits.",
       "B": "Rephrased findings will not match exactly, so duplicates leak through, and it does not detect fixed issues.",
       "C": "Raising the threshold reduces valid findings and does not distinguish repeated from new ones."
      }
     },
     "studyRef": "Task Statement 3.6 (prior findings in context on re-runs)"
    },
    {
     "n": 48,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Providing existing test files to avoid duplicate test scenarios",
     "difficulty": "medium",
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
     "tests": "Explicit categorical criteria over vague 'be conservative' instructions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The review prompt says \"Be conservative and only report high-confidence findings,\" yet developers dismiss about 40% of comments as nitpicks about naming and formatting. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Ask the model to output a confidence score from 0 to 100 for each finding and post only the findings scoring above 80."
      },
      {
       "id": "B",
       "text": "Add \"be extremely conservative\" to the instruction."
      },
      {
       "id": "C",
       "text": "Replace the vague instruction with explicit criteria: report bugs and security issues, skip minor style and local patterns."
      },
      {
       "id": "D",
       "text": "Limit each review to at most five comments per PR, so that developers are not overwhelmed with feedback on any one change and the most important issues are shown first."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Specific categorical criteria that say what to report and what to skip improve precision; general instructions such as \"be conservative\" or \"only high-confidence\" do not.",
      "wrong": {
       "A": "Self-reported confidence thresholds do not reliably separate nitpicks from real issues and are not a substitute for criteria about what counts as a finding.",
       "B": "Stronger vague wording is the same ineffective approach.",
       "D": "A cap drops comments arbitrarily, so real bugs can be cut while nitpicks remain."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit criteria; failure of confidence-based filtering)"
    },
    {
     "n": 52,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Temporarily disabling a high false-positive category to restore trust",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "False-positive rates by category: security 8%, correctness 12%, comment/documentation accuracy 58%. Developers have started ignoring all bot comments, including security ones. What should you do first?",
     "options": [
      {
       "id": "A",
       "text": "Temporarily disable the comment-accuracy category to restore trust, and refine its prompt with explicit criteria before re-enabling."
      },
      {
       "id": "B",
       "text": "Keep every category on and add a note to each comment that it might be wrong, so that developers know to verify it themselves."
      },
      {
       "id": "C",
       "text": "Downgrade all categories to \"suggestion\" severity so that developers feel less pressure to act on every comment the bot posts on a pull request."
      },
      {
       "id": "D",
       "text": "Disable the bot completely until all categories are below 10%."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A high false-positive category undermines trust in accurate ones. Pausing the noisy category while improving its prompt restores confidence in the security and correctness findings.",
      "wrong": {
       "B": "Disclaimers do not fix the noise and further erode trust.",
       "C": "Relabeling severity does not reduce the number of wrong comments and may bury valid security issues.",
       "D": "Disabling everything throws away the accurate categories that are already providing value."
      }
     },
     "studyRef": "Task Statement 4.1 (false positive rates and developer trust)"
    },
    {
     "n": 53,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Explicit severity criteria with concrete code examples",
     "difficulty": "hard",
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
     "difficulty": "medium",
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
     "tests": "Self-correction validation: calculated vs stated totals, conflict_detected",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI job has Claude extract test results from build logs into JSON through a tool schema: per-suite `passed`/`failed`/`skipped` counts and a `total_tests` value. Output is always valid JSON, yet about 3% of records have a `total_tests` that differs from the sum of the suites, and in roughly 1% of logs the printed summary line itself disagrees with the per-suite lines. Which design best surfaces these problems?",
     "options": [
      {
       "id": "A",
       "text": "Tighten the schema with strict mode so that the model can no longer emit a total that differs from the suite sums."
      },
      {
       "id": "B",
       "text": "Retry any record whose totals disagree, up to five times, until the extracted numbers are consistent."
      },
      {
       "id": "C",
       "text": "Drop the per-suite counts and extract only `total_tests`, so there is nothing left that can disagree."
      },
      {
       "id": "D",
       "text": "Extract `stated_total` as printed and `calculated_total` from the suites, plus a `conflict_detected` flag, and route mismatches for review."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Strict schemas remove syntax errors but cannot catch semantic ones. Extracting the stated and calculated totals side by side, with a conflict flag, makes discrepancies (including inconsistent source logs) visible and routable.",
      "wrong": {
       "A": "Strict mode guarantees well-formed output, not that values agree with each other; this is a semantic error that a schema cannot prevent.",
       "B": "Retrying cannot fix a log whose own summary contradicts its suite lines, and it pressures the model to force consistency by inventing numbers.",
       "C": "Discarding the per-suite counts throws away useful data and hides the inconsistency rather than flagging it."
      }
     },
     "studyRef": "Task Statement 4.4 (calculated_total vs stated_total, conflict_detected; semantic vs syntax errors)"
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
     "difficulty": "medium",
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
     "tests": "Splitting generic tools into purpose-specific tools with defined contracts",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your agent has a single tool `manage_account(action: string, payload: object)` whose description reads \"Manages customer accounts.\" Its `action` values include `update_email`, `close_account`, `pause_subscription`, and `reset_password`, each expecting different payload fields. Logs show that about 15% of calls carry the wrong payload shape, and the agent has closed accounts when the customer asked only to pause a subscription. What is the most effective redesign?",
     "options": [
      {
       "id": "A",
       "text": "Keep the single tool but paste a table of valid actions and their payload shapes into the system prompt, with an example payload for each action."
      },
      {
       "id": "B",
       "text": "Add a pre-processing classifier that predicts the customer's intended action from the message and rewrites the tool call before it is executed."
      },
      {
       "id": "C",
       "text": "Rename the tool to `account_operations_v2` and keep the same schema, so the model treats it as a new tool and re-reads its description."
      },
      {
       "id": "D",
       "text": "Split it into purpose-specific tools (`update_email`, `pause_subscription`, ...), each with its own input schema."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Generic tools with free-form payloads force the model to infer boundaries and shapes. Purpose-specific tools with defined input/output contracts and clear boundary descriptions improve selection and make misuse (closing vs pausing) structurally harder.",
      "wrong": {
       "A": "This leaves one ambiguous interface and depends on the model reading the table correctly every time; it does not give each action a defined input/output contract.",
       "B": "An extra classification layer is over-engineered and papers over a tool design that is too generic.",
       "C": "Renaming without changing the contract or description does nothing to differentiate the actions or constrain payloads."
      }
     },
     "studyRef": "Task Statement 2.1 (splitting generic tools; descriptions as the primary selection mechanism)."
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
      "correct": "Subagents run with isolated context and do not inherit the coordinator's history or share memory, so everything they need (customer ID, order data, dispute details) must be included explicitly in the Task prompt.",
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
     "tests": "Returning structured error metadata and customer-friendly explanations for business rule violations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "`process_refund` currently returns `{\"isError\": true, \"content\": \"Operation failed\"}` for every failure: gateway timeouts, malformed order IDs, and orders outside the 60-day return window. The agent retries all of them, and for window violations apologizes vaguely and offers no alternative. What change should you make?",
     "options": [
      {
       "id": "A",
       "text": "Return structured errors with a category (transient, validation, business, permission) and `isRetryable`; mark the 60-day case non-retryable with a customer-friendly explanation."
      },
      {
       "id": "B",
       "text": "Raise the retry count and add exponential backoff to every failed `process_refund` call, then show the customer the final error text if all retries fail, and log each retry attempt for the support dashboard."
      },
      {
       "id": "C",
       "text": "Return an empty successful result for business-rule failures so the agent stops retrying them, and log the real reason for engineers to review, while the full failure details are kept in an internal audit table."
      },
      {
       "id": "D",
       "text": "Instruct the agent in the prompt to retry once on any failure and, if it fails again, apologize and say the system is temporarily unavailable."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Uniform generic errors prevent appropriate recovery. Structured metadata (category, retryability, explanation) lets the agent retry transient failures, correct validation errors, and communicate business-rule violations helpfully without wasted retries.",
      "wrong": {
       "B": "Retrying a business-rule violation or malformed input can never succeed; blanket retries waste calls and delay the customer.",
       "C": "Marking a failure as success hides the problem from the agent, which then cannot explain the decision or offer alternatives.",
       "D": "A uniform generic error cannot be classified by prompt wording alone; the agent has no signal to tell transient from business failures."
      }
     },
     "studyRef": "Task Statement 2.2 (transient vs validation vs business vs permission errors; isRetryable)."
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
       "text": "Raise the sentiment threshold so that only extremely negative messages trigger escalation, tuning the cutoff on a sample of last month's conversations, re-checking the threshold each quarter."
      },
      {
       "id": "C",
       "text": "Ask the agent to self-rate its confidence from 1 to 10 before each response and automatically escalate to a human when the rating is below 7, and route low-rated conversations to the human queue automatically."
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
     "tests": "Implementing PostToolUse hooks to normalize heterogeneous data formats",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Three MCP tools return time and status in different forms: `get_customer.created_at` is a Unix timestamp in seconds, `lookup_order.placed_at` is an ISO 8601 string, and a billing tool returns `status` as a numeric code (1 = paid, 2 = disputed, 3 = written_off). The agent frequently misjudges 30-day windows and misreports statuses. Which TWO changes best fix this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Add a PostToolUse hook that converts every timestamp field to a single ISO 8601 UTC format before the result reaches the model."
      },
      {
       "id": "B",
       "text": "Add a conversion table for the three formats and the status codes to the system prompt, and tell the agent to convert carefully."
      },
      {
       "id": "C",
       "text": "Have the same hook translate numeric status codes into labeled values such as `disputed` before the model sees them."
      },
      {
       "id": "D",
       "text": "Require the agent to show its date arithmetic step by step in every reply."
      },
      {
       "id": "E",
       "text": "Wait for each backend team to migrate its service to a shared date and status format before changing the agent."
      }
     ],
     "answer": [
      "A",
      "C"
     ],
     "explanation": {
      "correct": "PostToolUse hooks intercept tool results and transform them before the model processes them. Normalizing timestamps and mapping status codes in a hook gives the agent consistent data deterministically.",
      "wrong": {
       "B": "This relies on the model performing conversions correctly each time; normalization is a deterministic transformation that belongs in code.",
       "D": "This exposes errors rather than preventing them, and still leaves heterogeneous inputs for the model to interpret.",
       "E": "Waiting on several upstream services is slow and out of the agent team's control; a hook fixes the issue now at the integration boundary."
      }
     },
     "studyRef": "Task Statement 1.5 (PostToolUse normalization of timestamps and status codes)."
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Decomposing multi-concern requests and investigating in parallel with shared context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"I was charged twice for order #8841, my package for #8790 never arrived, and I also need to change my shipping address on #8902.\" The agent currently handles the issues one after another, repeating `get_customer` each time and sending three separate messages, which takes about 3x the latency. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Handle only the first concern, then ask the customer to send the other two as separate requests once the first has been resolved, and then close the conversation."
      },
      {
       "id": "B",
       "text": "Spawn three fully independent agents, each re-verifying the customer and sending its own reply as soon as it finishes, with a separate message for each outcome."
      },
      {
       "id": "C",
       "text": "Decompose the message into three items, investigate them in parallel with the shared verified-customer context, then synthesize one unified resolution."
      },
      {
       "id": "D",
       "text": "Escalate any message containing more than one concern to a human agent, because multi-part requests are too risky for the agent."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Multi-concern requests are best split into distinct items, investigated in parallel with shared customer context, and then synthesized into one coherent resolution.",
      "wrong": {
       "A": "This pushes work onto the customer and ignores that the issues share context; first-contact resolution drops.",
       "B": "Independent agents duplicate verification and fragment the response; the items share context that should be reused and the answer should be unified.",
       "D": "Multiple concerns are not an escalation trigger; this sacrifices resolution rate for no policy reason."
      }
     },
     "studyRef": "Task Statement 1.4 (decomposing multi-concern customer requests)."
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Asking for additional identifiers when tool results return multiple matches",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A customer says: \"Hi, I'm Maria Garcia, I need a refund on my last order.\" `get_customer` searched by name returns three matching records. The agent currently picks the record with the most recent order activity and proceeds. A privacy review flags this behavior. What should the agent do instead?",
     "options": [
      {
       "id": "A",
       "text": "Pick the record whose shipping region best matches the customer's IP address, and confirm the choice only if the refund later fails."
      },
      {
       "id": "B",
       "text": "Ask the customer for additional identifying information, such as the email on file or an order number, and then match the record."
      },
      {
       "id": "C",
       "text": "Proceed with all three records and process the refund against whichever account has an eligible order."
      },
      {
       "id": "D",
       "text": "Escalate to a human immediately, because an ambiguous search result means the agent cannot continue safely."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When tool results return multiple matches, the agent should request more identifiers rather than choosing by heuristic. A clarifying question is cheap and safe.",
      "wrong": {
       "A": "This is still a heuristic selection among multiple people; a wrong guess exposes another customer's data.",
       "C": "This could issue refunds on, and reveal data from, accounts that do not belong to the caller.",
       "D": "Ambiguity from multiple matches is resolvable by one clarifying question; escalating is premature and lowers resolution."
      }
     },
     "studyRef": "Task Statement 5.2 (multiple customer matches require clarification)."
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
     "tests": "Compiling structured handoff summaries for human agents who lack the transcript",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "When the agent calls `escalate_to_human`, it currently passes only `{\"reason\": \"customer unhappy\"}`. Human agents cannot see the conversation transcript, so they re-ask the customer for everything, and handle times have increased by several minutes. What is the best improvement?",
     "options": [
      {
       "id": "A",
       "text": "Attach the complete raw transcript and every tool output to the ticket body, so the human agent can find whatever they need in the log, however long it is."
      },
      {
       "id": "B",
       "text": "Have the agent compile a structured handoff: customer ID, root cause, amounts at issue, actions already taken, and a recommended next step."
      },
      {
       "id": "C",
       "text": "Tell the customer to repeat the full story to the human agent, so the details are fresh and accurate for the person handling the case."
      },
      {
       "id": "D",
       "text": "Give the human agent a link to the live session so they can ask Claude what happened and what it recommends."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Mid-process escalations should carry a structured handoff (customer ID, root cause, refund amount, recommended action) because humans receiving them lack the transcript.",
      "wrong": {
       "A": "The human agents cannot see the transcript, and a raw dump forces them to read a long record to find the facts; a concise structured summary is more usable.",
       "C": "This is exactly the poor experience the change is meant to avoid.",
       "D": "Handoff relies on information the agent sends with the escalation, not on live access to its session."
      }
     },
     "studyRef": "Task Statement 1.4 (structured handoff protocols)."
    },
    {
     "n": 13,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "Extracting transactional facts into a persistent case-facts block outside summarized history",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "In long sessions, your pipeline summarizes older turns when the context passes 60% of the budget. After summarization the agent told a customer: \"your refund of about $50 was processed recently\", though the refund was $47.83 on Oct 3 for order #5521, and the customer's stated expectation (\"back on my original card by Friday\") had been lost. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Extract transactional facts (amounts, dates, order numbers, statuses, customer expectations) into a persistent case-facts block in every prompt, outside the summarized history."
      },
      {
       "id": "B",
       "text": "Ask the summarizer to produce longer, more detailed summaries and to preserve every number and date it encounters, and to keep the summaries in the same position in every prompt."
      },
      {
       "id": "C",
       "text": "Disable summarization and keep the full transcript in every request until the context window is exhausted, and rely on the long context to keep earlier details available."
      },
      {
       "id": "D",
       "text": "Call `lookup_order` again before every response to refresh the order data, and compare it with the summary, so that stale numbers are replaced by fresh ones each time."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "A persistent case-facts block keeps exact transactional values and customer expectations stable and always in context, avoiding the loss of numbers, dates, and commitments that progressive summarization causes.",
      "wrong": {
       "B": "Summaries are still lossy, and progressive summarization tends to compress exact values and expectations into vague wording.",
       "C": "This delays but does not solve the problem, and the long unfiltered history dilutes attention to the critical facts.",
       "D": "Re-querying cannot recover things only the customer said (such as the Friday expectation) and adds latency and cost to every turn."
      }
     },
     "studyRef": "Task Statement 5.1 (progressive summarization risks; case-facts block)."
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
     "tests": "Using /memory to verify which memory files are loaded and diagnose inconsistent behavior",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Two developers work on the same branch of the same repository. Ana's Claude Code consistently uses `pnpm` and Vitest as the team intends; Ben's keeps generating `npm` commands and Jest tests. No one is sure where the team's conventions were written down. What is the best first step to diagnose the difference?",
     "options": [
      {
       "id": "A",
       "text": "Ask Ben to re-clone the repository so that he has a clean working copy with exactly the same tracked files as Ana."
      },
      {
       "id": "B",
       "text": "Add \"IMPORTANT: use pnpm and Vitest\" to the project CLAUDE.md in capitals and ask Ben to retry."
      },
      {
       "id": "C",
       "text": "Run `/compact` in Ben's session so it forgets the conflicting context."
      },
      {
       "id": "D",
       "text": "Have both developers run `/memory` and compare which memory files are loaded in each session."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`/memory` shows which memory files are loaded, making it the way to diagnose inconsistent behavior across sessions (for example conventions living only in one user's `~/.claude/CLAUDE.md`, which is not shared via version control).",
      "wrong": {
       "A": "A fresh clone gives the same tracked files; it does not reveal which untracked or user-level memory files differ.",
       "B": "This may mask the cause without establishing why the sessions differ, and emphasis is not enforcement.",
       "C": "`/compact` condenses the current conversation and does not change which CLAUDE.md files are loaded."
      }
     },
     "studyRef": "Task Statement 3.1 (hierarchy diagnosis; the /memory command)."
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
     "stem": "Your team's `/release-notes` skill reads `.release/changes.md` and writes `CHANGELOG.md`. A teammate worries that during execution the skill might run an unintended shell command such as `git reset` or `rm`. You want the restriction to be enforced, not requested. What should you do?",
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
      "correct": "Skill frontmatter `allowed-tools` limits the tools available during skill execution, which prevents destructive actions by construction.",
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
     "tests": "Using the interview pattern to surface design considerations in unfamiliar domains",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You must add a distributed cache in front of the product catalog API. You have never designed cache invalidation, and the requirements around staleness, stampedes, and Redis outages are unclear. You worry that asking Claude to \"add caching with best practices\" will produce a plausible implementation that misses important cases. What approach is best?",
     "options": [
      {
       "id": "A",
       "text": "Ask for the full implementation first and review the finished code afterward, looking for anything that seems to be missing."
      },
      {
       "id": "B",
       "text": "Provide three example cache keys with sample values and tell Claude to generalize from them to the rest of the catalog API."
      },
      {
       "id": "C",
       "text": "Ask Claude to interview you about invalidation strategy, staleness tolerance, and failure modes before implementing."
      },
      {
       "id": "D",
       "text": "Write integration tests first and iterate on the failures until they pass, adding cases as unexpected behavior shows up."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The interview pattern has Claude ask questions that surface considerations the developer may not have anticipated (cache invalidation, failure modes) before implementing in an unfamiliar domain.",
      "wrong": {
       "A": "You don't know what to look for in an unfamiliar domain, so unseen gaps will pass review.",
       "B": "Input/output examples clarify transformations; they do not surface invalidation and failure-mode decisions you haven't thought of.",
       "D": "Tests encode requirements you already know; the problem is discovering the ones you do not."
      }
     },
     "studyRef": "Task Statement 3.5 (interview pattern)."
    },
    {
     "n": 21,
     "scenario": 2,
     "domain": 5,
     "ts": "5.4",
     "tests": "Maintaining scratchpad files to counteract context degradation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You've spent two hours with Claude Code exploring a 400-file legacy repository. Early on it identified `HandlerFactoryV2` in `core/dispatch.ts` as the entry point for request handling. Now, when asked how requests are dispatched, it answers that the project \"typically uses a factory pattern for handlers\" and gives slightly different answers on repeated questions. What is the best remedy?",
     "options": [
      {
       "id": "A",
       "text": "Have Claude record key findings (class names, paths, flows) in a scratchpad file and consult it for follow-up questions."
      },
      {
       "id": "B",
       "text": "Add \"be specific and name actual classes\" to CLAUDE.md so that every answer in the project refers to concrete code."
      },
      {
       "id": "C",
       "text": "Switch to a model with a larger context window and carry on in the same session with the same history and re-ask the dispatch question there."
      },
      {
       "id": "D",
       "text": "Ask the same question three times and accept the answer that appears most often as the final answer."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Long sessions degrade: the model starts to refer to typical patterns instead of specific discovered classes. Scratchpad files persist key findings across context boundaries so they can be re-read.",
      "wrong": {
       "B": "The model has lost specifics from the early context; an instruction to be specific doesn't restore the information.",
       "C": "A larger window doesn't fix degradation in extended sessions where details from earlier exploration are no longer reliably used.",
       "D": "Consensus over degraded context does not recover missing facts, and it triples the cost of each question."
      }
     },
     "studyRef": "Task Statement 5.4 (context degradation; scratchpad files)."
    },
    {
     "n": 22,
     "scenario": 2,
     "domain": 3,
     "ts": "3.2",
     "tests": "Using context: fork to isolate skills with verbose output",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The `/analyze-deps` skill scans 300 files and prints roughly 25,000 tokens of intermediate output into the conversation. Developers only need the final 20-line summary, but the verbose output crowds out their ongoing work. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Add `context: fork` to the skill's frontmatter so it runs in an isolated subagent and returns only its result."
      },
      {
       "id": "B",
       "text": "Add `allowed-tools: Read` to the skill's frontmatter so the skill can only read files while it runs the scan."
      },
      {
       "id": "C",
       "text": "Move the skill's content into the project CLAUDE.md so that the analysis instructions are always loaded."
      },
      {
       "id": "D",
       "text": "Ask developers to run `/compact` after each invocation to remove the verbose output from the conversation."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "`context: fork` runs a skill in an isolated sub-agent context, preventing verbose or exploratory output from polluting the main conversation.",
      "wrong": {
       "B": "Restricting tools may reduce what the skill can do, but its output would still land in the main conversation.",
       "C": "CLAUDE.md is for always-on standards; it does not run the analysis or contain its output.",
       "D": "Manual compaction happens after the context has already been polluted and doesn't prevent the verbose output."
      }
     },
     "studyRef": "Task Statement 3.2 (context: fork)."
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
     "difficulty": "medium",
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
     "difficulty": "hard",
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
     "tests": "Including prior review findings when re-running reviews after new commits",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your CI job runs `claude -p` to review each pull request on every push and posts comments. Developers complain that after each push the same comments are posted again, including for issues they have already fixed. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Run the review only on the final commit, by requiring a `ready-for-review` label, and post a single review at that point."
      },
      {
       "id": "B",
       "text": "Include the prior review findings in each re-run's context and instruct Claude to report only new or still-unaddressed issues."
      },
      {
       "id": "C",
       "text": "Post the comments as before, then delete any new comment whose text exactly matches an earlier one."
      },
      {
       "id": "D",
       "text": "Add the `--max-turns 1` flag so that each review is shorter and posts fewer comments."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When re-running reviews after new commits, giving Claude the previous findings and asking for only new or unresolved issues avoids duplicate comments.",
      "wrong": {
       "A": "This avoids early feedback and does not solve duplicate reporting on any re-run.",
       "C": "Wording varies between runs, so exact-match deduplication will miss rephrased duplicates, and fixed issues would still be reported.",
       "D": "Shortening the review changes its length, not whether it repeats prior findings."
      }
     },
     "studyRef": "Task Statement 3.6 (prior findings in context for CI re-runs)."
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
     "tests": "Using Read followed by Write when Edit cannot find unique anchor text",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your agent must change the timeout in the third of four identical stanzas in a generated file, `config/generated/routes.ts`. Each stanza is byte-for-byte identical, including the lines around it, so no `old_string` is unique and Edit fails with \"multiple matches\". What is the most reliable way to complete the change?",
     "options": [
      {
       "id": "A",
       "text": "Retry the same Edit call with a longer identical `old_string`."
      },
      {
       "id": "B",
       "text": "Use Read to load the full file, then Write the file back with the third stanza modified."
      },
      {
       "id": "C",
       "text": "Use Grep to find the stanza's line number and pass it to Edit."
      },
      {
       "id": "D",
       "text": "Use Glob on `config/generated/**` to select the stanza."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "When Edit fails because the target text is not unique, fall back to Read to load the whole file and Write to rewrite it with the modification.",
      "wrong": {
       "A": "The stanzas are identical, so any longer excerpt still matches multiple locations.",
       "C": "Edit matches on unique text, not on line numbers.",
       "D": "Glob matches file paths, not text blocks within a file."
      }
     },
     "studyRef": "Task Statement 2.5 (Edit limits; Read + Write fallback)."
    },
    {
     "n": 32,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Tracing function usage across wrapper modules by identifying exported names first",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You must find every place in a TypeScript monorepo that triggers a refund. `src/billing/index.ts` contains:\n\n```ts\nexport { refundOrder as issueRefund } from \"./refunds\";\nexport const processRefund = withAudit(refundOrder);\n```\n\nA Grep for `refundOrder` returns only three hits, all inside `src/billing/`. Callers elsewhere clearly exist. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Read the module's exports to list every exported name (`issueRefund`, `processRefund`, ...), then Grep for each name across the repo."
      },
      {
       "id": "B",
       "text": "Grep for `refundOrder` again with a broader file filter, in case more results appear in other directories, and treat any remaining hits as the full set of callers."
      },
      {
       "id": "C",
       "text": "Use Glob for `**/*refund*` and read every file that it returns."
      },
      {
       "id": "D",
       "text": "Read every file under `src/` and look for refund-related calls by eye."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Tracing usage across wrappers means first identifying all exported names that wrap or alias the function, then searching for each one, not just the original name.",
      "wrong": {
       "B": "Callers outside the module use the re-exported or wrapped names, which never contain the string `refundOrder`.",
       "C": "Glob finds files by name; callers live in files whose names need not contain \"refund\".",
       "D": "This reads the whole codebase upfront, which wastes context versus targeted Grep on known names."
      }
     },
     "studyRef": "Task Statement 2.5 (tracing usage across wrapper modules)."
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
     "tests": "Spawning parallel subagents with multiple Task calls in a single coordinator response",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A coordinator agent analyzes three independent modules (`auth`, `billing`, `search`) by spawning one subagent each. Currently it spawns one subagent per turn and waits for the result before the next, so total time is roughly 3x a single analysis. How can it reduce latency?",
     "options": [
      {
       "id": "A",
       "text": "Give one subagent all three modules in a single prompt, so its single context analyzes the modules one after another."
      },
      {
       "id": "B",
       "text": "Instruct the coordinator in the prompt to work faster and to skip verifying each subagent's result before moving on."
      },
      {
       "id": "C",
       "text": "Have each subagent spawn the next one when it finishes, so the coordinator is no longer involved in routing or errors."
      },
      {
       "id": "D",
       "text": "Emit all three Task calls in one coordinator response so the subagents run in parallel."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Parallel subagents are spawned by emitting multiple Task tool calls in a single coordinator response rather than across separate turns.",
      "wrong": {
       "A": "This serializes the work inside one context and removes the isolation that keeps each analysis focused.",
       "B": "This doesn't change the sequential turn structure, and skipping verification reduces quality.",
       "C": "This is still sequential and bypasses the coordinator's role in routing and error handling."
      }
     },
     "studyRef": "Task Statement 1.3 (parallel spawning)."
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
      "correct": "The Task tool is the mechanism for spawning subagents, and `allowedTools` must include `\"Task\"` for a coordinator to invoke them.",
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
     "difficulty": "hard",
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
     "tests": "Choosing prompt chaining for predictable workflows and dynamic decomposition for open-ended investigation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your developer tools team supports two workflows: (1) a pull-request convention check that always examines formatting, tests, and documentation in the same way, and (2) \"investigate why checkout latency regressed this week,\" where the next step depends on what is found. Which decomposition strategies are best?",
     "options": [
      {
       "id": "A",
       "text": "A fixed prompt chain for the convention check; dynamic, adaptive decomposition for the latency investigation."
      },
      {
       "id": "B",
       "text": "A fixed prompt chain for both workflows, so that behavior is predictable in each case, whether the task is a routine check or an open-ended investigation."
      },
      {
       "id": "C",
       "text": "Dynamic decomposition for both workflows, since an adaptive plan is always more capable than a fixed one."
      },
      {
       "id": "D",
       "text": "Dynamic decomposition for the convention check and a fixed chain for the latency investigation."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Use prompt chaining for predictable multi-aspect work and adaptive decomposition for open-ended investigation.",
      "wrong": {
       "B": "The investigation's steps depend on intermediate findings, which a fixed chain cannot accommodate.",
       "C": "The convention check is predictable; adding dynamic planning adds variance and cost with no benefit.",
       "D": "This reverses the correct assignment."
      }
     },
     "studyRef": "Task Statement 1.6 (chaining vs dynamic decomposition)."
    },
    {
     "n": 41,
     "scenario": 4,
     "domain": 1,
     "ts": "1.7",
     "tests": "Using fork_session to explore divergent approaches from a shared baseline",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After a long analysis of the payments module, you want to compare two refactoring approaches (strategy classes vs a functional pipeline). You want both to start from the same analysis without redoing it, and without one approach's changes influencing the other. What is the best way to do this?",
     "options": [
      {
       "id": "A",
       "text": "Try the first approach in the current session, then revert and try the second in the same session."
      },
      {
       "id": "B",
       "text": "Use `fork_session` to branch twice from the analyzed baseline, one fork per approach."
      },
      {
       "id": "C",
       "text": "Start two brand-new sessions and repeat the full analysis in each."
      },
      {
       "id": "D",
       "text": "Resume the same named session in two terminals and give each a different instruction."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`fork_session` creates independent branches from a shared analysis baseline, ideal for comparing divergent approaches.",
      "wrong": {
       "A": "The second attempt would carry the first approach's reasoning and context, contaminating the comparison.",
       "C": "This wastes the analysis you already have.",
       "D": "Both would share and append to a single session history, so the branches would not be independent."
      }
     },
     "studyRef": "Task Statement 1.7 (fork_session)."
    },
    {
     "n": 42,
     "scenario": 4,
     "domain": 3,
     "ts": "3.4",
     "tests": "Combining plan mode for investigation with direct execution for implementation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You need to migrate from `moment` to `date-fns` across 52 files. Most usages are mechanical, but several wrap `moment-timezone` in ways that require design decisions about a shared timezone helper. What approach is best?",
     "options": [
      {
       "id": "A",
       "text": "Use direct execution from the beginning and settle the timezone helper's design on the fly, file by file, as cases appear."
      },
      {
       "id": "B",
       "text": "Remain in plan mode for the entire task, including the edits to all 52 files, so that nothing changes without review."
      },
      {
       "id": "C",
       "text": "Use plan mode to design the migration, then switch to direct execution to implement it."
      },
      {
       "id": "D",
       "text": "Ask Claude to migrate the first five files and then decide whether any planning is needed for the rest."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Combine plan mode for investigation and design with direct execution for implementing the agreed approach on large, multi-file work.",
      "wrong": {
       "A": "With design decisions in play across 52 files, late discoveries cause rework.",
       "B": "Plan mode is for exploration and design before changes; implementation is done by executing the plan.",
       "D": "The complexity is already known from the requirements; waiting to find out wastes effort."
      }
     },
     "studyRef": "Task Statement 3.4 (combining plan mode and direct execution)."
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 5,
     "ts": "5.4",
     "tests": "Summarizing key findings from one exploration phase before spawning subagents",
     "difficulty": "hard",
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
     "difficulty": "hard",
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
      "correct": "`\"any\"` guarantees that a tool is called while letting the model pick which schema fits, ideal when multiple extraction schemas exist and the document type is unknown.",
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
      "correct": "Forced tool selection ensures a specific tool runs first (such as metadata extraction before enrichment), with subsequent steps processed in follow-up turns.",
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
     "difficulty": "medium",
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
     "tests": "Few-shot examples for varied document structures",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You extract cited sources from research papers. Some papers use inline citations like \"(Smith, 2021)\" with a bibliography at the end, while others use numbered footnotes. The model reliably handles the first format but returns incomplete source lists for footnote-style papers despite detailed instructions. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Add more detailed prose to the prompt that describes every possible citation format and where each one appears."
      },
      {
       "id": "B",
       "text": "Run the extraction twice and keep only the citations that appear in both runs."
      },
      {
       "id": "C",
       "text": "Lower the temperature to 0 so that the model reads the footnotes more carefully."
      },
      {
       "id": "D",
       "text": "Add a few targeted examples showing correct extraction for both citation styles, including the footnote format."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Few-shot examples of varied document structures (inline citations vs bibliographies, footnotes) help the model generalize to the formats it handles poorly.",
      "wrong": {
       "A": "Instructions have already proven insufficient; examples demonstrate handling better than longer descriptions.",
       "B": "This reduces recall for the very citations the model finds inconsistently.",
       "C": "Temperature changes randomness, not the model's understanding of an unfamiliar structure."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot for varied structures)."
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
     "difficulty": "hard",
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
     "tests": "Calculating batch submission frequency from SLA constraints",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Compliance requires extraction results within 36 hours of a document's arrival. Documents arrive continuously. The Message Batches API can take up to 24 hours to process a batch, and you submit batches on a fixed schedule. What is the longest submission interval that still guarantees the SLA?",
     "options": [
      {
       "id": "A",
       "text": "Every 6 hours, for a worst case of 30 hours between arrival and results."
      },
      {
       "id": "B",
       "text": "Every 24 hours, matching the length of the batch processing window."
      },
      {
       "id": "C",
       "text": "Every 12 hours: a document waits at most 12 hours for submission, plus 24 hours of processing, equals 36 hours."
      },
      {
       "id": "D",
       "text": "Every 36 hours, matching the length of the SLA itself."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Worst-case turnaround is the wait for the next submission plus the maximum processing window. With a 36-hour SLA and 24-hour processing, the wait window can be at most 12 hours.",
      "wrong": {
       "A": "This meets the SLA but is not the longest interval that does so; it submits more often than required.",
       "B": "A document could wait 24 hours for submission and then take 24 hours to process, totaling 48 hours.",
       "D": "This ignores the 24-hour processing time entirely; the worst case would be 60 hours."
      }
     },
     "studyRef": "Task Statement 4.5 (SLA-based batch frequency)."
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
     "tests": "Programmatic prerequisites that block downstream tool calls until a prior step has completed",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Compliance requires that `process_refund` may only run after `get_customer` has returned a verified customer in the current session, and that the `customer_id` argument matches that verified customer. Today this rule is stated in the system prompt. An audit of 400 refunds found 3 that violated it, and any violation is a reportable incident. Where should the rule be enforced?",
     "options": [
      {
       "id": "A",
       "text": "A hook that blocks `process_refund` until `get_customer` has returned a matching verified ID."
      },
      {
       "id": "B",
       "text": "Move the rule to the top of the system prompt and rewrite it in capitals with the word NEVER so the model treats it as the highest-priority instruction."
      },
      {
       "id": "C",
       "text": "Add a sentence to the `process_refund` tool description saying that it requires a prior `get_customer` verification and matching `customer_id`."
      },
      {
       "id": "D",
       "text": "After each refund, run a second Claude call that reads the transcript and judges whether verification happened, and flag failures for review."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Tool-call interception gives a deterministic guarantee. The gate runs before execution, regardless of what the model decides, and the error message lets the agent recover by calling `get_customer`. This is the programmatic-prerequisite pattern.",
      "wrong": {
       "B": "Prompt emphasis is still probabilistic compliance. The non-zero failure rate remains, which is unacceptable when each violation is a reportable incident.",
       "C": "Tool descriptions guide selection and usage but do not enforce anything. The model can still call the tool out of order; the rule needs a gate outside the model.",
       "D": "This is a post-hoc, probabilistic check that runs after the money has already moved. It detects some violations instead of preventing them."
      }
     },
     "studyRef": "Task Statement 1.4 (+ review programmatic prerequisites and gating of financial tools versus prompt-only guidance)"
    },
    {
     "n": 2,
     "scenario": 1,
     "domain": 1,
     "ts": "1.5",
     "tests": "PostToolUse hooks that normalize heterogeneous data formats before the model processes them",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "`lookup_order` returns `created_at` as a Unix timestamp and `status` as a numeric code (for example `3`), while `get_customer` returns ISO 8601 dates and string statuses. In 15% of return-eligibility checks the agent misjudges the 30-day window or misreads the order status. Which change most reliably fixes this?",
     "options": [
      {
       "id": "A",
       "text": "Add a system prompt section explaining that `created_at` is a Unix epoch and listing what each numeric status code means."
      },
      {
       "id": "B",
       "text": "Change `get_customer` to also emit Unix timestamps so both tools use the same date format."
      },
      {
       "id": "C",
       "text": "Add a PostToolUse hook that converts timestamps to ISO 8601 and maps numeric status codes to labels before the tool result reaches the model."
      },
      {
       "id": "D",
       "text": "Add a `convert_timestamp` tool and instruct the agent to call it on every date field it receives."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "A PostToolUse hook transforms tool results deterministically before the model sees them, so every consumer gets one consistent format. This is the intended use of data-normalization hooks.",
      "wrong": {
       "A": "This asks the model to perform date arithmetic and code lookups itself on every call, which is the probabilistic behavior that is already failing 15% of the time.",
       "B": "This touches the tool that is not the problem, and it leaves the numeric status codes untouched. It also pushes the consumer toward the less readable format.",
       "D": "This adds extra tool calls and relies on the agent remembering to use them. It is a prompt-dependent workaround instead of a guaranteed transformation."
      }
     },
     "studyRef": "Task Statement 1.5 (+ PostToolUse hooks for normalizing Unix timestamps, ISO 8601, and status codes)"
    },
    {
     "n": 3,
     "scenario": 1,
     "domain": 1,
     "ts": "1.4",
     "tests": "Structured handoff summaries for human agents who lack the conversation transcript",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "When the agent calls `escalate_to_human`, it passes only a short `reason` string such as \"customer upset, wants refund\". Human agents cannot see the conversation transcript and report that they re-ask customers for the order, amounts, and what was already tried. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Tell the agent in the system prompt to write a longer, more detailed `reason` string, including everything it can recall, when it escalates."
      },
      {
       "id": "B",
       "text": "A structured handoff payload on `escalate_to_human`: customer ID, order, root cause, amount, recommended action."
      },
      {
       "id": "C",
       "text": "Attach the full raw transcript to every escalation so the human agent can read back through the conversation and work out the history."
      },
      {
       "id": "D",
       "text": "Have a second model summarize the ticket on demand when the human agent opens it."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A structured handoff compiled by the agent carries exactly what a human with no transcript access needs and is consistent from ticket to ticket. This is the handoff-summary pattern.",
      "wrong": {
       "A": "Longer free text is inconsistent and unstructured. Nothing guarantees the key facts (IDs, amounts, recommendation) are present.",
       "C": "Raw transcripts are long and push root-cause analysis onto the human. The point of a handoff is a compact, decision-ready summary, not a document dump.",
       "D": "This adds latency and another failure point, and the summarizer would lack the agent's in-session root-cause analysis and recommendation."
      }
     },
     "studyRef": "Task Statement 1.4 (+ structured handoff protocol for mid-process escalation)"
    },
    {
     "n": 4,
     "scenario": 1,
     "domain": 2,
     "ts": "2.1",
     "tests": "Reviewing system prompts for keyword-sensitive instructions that override tool descriptions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Both `get_customer` and `lookup_order` have detailed, well-differentiated descriptions. Yet after a prompt update, the agent calls `get_customer` for messages like \"Where is my refund for order #88213?\" even though an order number is supplied. The new system prompt contains this line:\n\n```\nWhenever a customer mentions a refund or money back, always start by checking their account.\n```\n\nTool names are hard-coded in downstream analytics and cannot change. What is the most likely root cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "The descriptions are still too short; add more example queries and boundary notes to both tool descriptions."
      },
      {
       "id": "B",
       "text": "Add a routing layer that inspects each message for order-number patterns and forces `lookup_order` when one is found."
      },
      {
       "id": "C",
       "text": "Rename `get_customer` to `lookup_account` and update its description so the refund keyword no longer maps to it."
      },
      {
       "id": "D",
       "text": "Reword the keyword-triggered rule to be tool-neutral, consistent with the tool descriptions."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Keyword-sensitive system prompt wording can override good tool descriptions and bias selection. Auditing and rewriting the instruction removes the conflicting signal at its source.",
      "wrong": {
       "A": "The stem says the descriptions are already detailed and the behavior began after the prompt change, so this fixes a different problem.",
       "B": "This is over-engineered and bypasses the model's tool selection to cover for a prompt wording problem that can be fixed by editing one line.",
       "C": "Renaming does not remove the explicit instruction telling the agent to check the account first. The conflicting prompt line would still drive the behavior."
      }
     },
     "studyRef": "Task Statement 2.1 (+ system prompt wording versus tool descriptions)"
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
     "difficulty": "hard",
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
      "correct": "Forced tool selection guarantees `classify_request` runs first. Switching back to `auto` afterward lets the agent call the backend tools and eventually end its turn.",
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
     "tests": "Choosing existing community MCP servers over custom implementations for standard integrations",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your support agent must now create and update tickets in the company's existing Jira instance. The team is deciding how to integrate it, given that the four custom order and customer tools are already custom MCP tools. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Build a custom Jira MCP server so tool names and descriptions are fully under your own control."
      },
      {
       "id": "B",
       "text": "Give the agent a Bash tool and instruct it to call the Jira REST API with `curl` and an API token."
      },
      {
       "id": "C",
       "text": "Use a community Jira MCP server; reserve custom servers for team-specific logic."
      },
      {
       "id": "D",
       "text": "Paste the Jira API reference into the system prompt and have the agent describe the ticket changes in text for staff to apply."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "For standard integrations, an existing community server avoids maintenance cost and is a proportionate choice. Custom servers belong where the workflow is unique to your team.",
      "wrong": {
       "A": "This reproduces what a community server already provides. Custom implementations should be reserved for team-specific workflows.",
       "B": "This bypasses MCP, puts credentials and API details into prompts, and gives the agent unstructured shell access instead of a typed tool.",
       "D": "This does not integrate anything: a human performs the action, and it bloats the system prompt."
      }
     },
     "studyRef": "Task Statement 2.4 (+ community versus custom MCP servers)"
    },
    {
     "n": 9,
     "scenario": 1,
     "domain": 5,
     "ts": "5.1",
     "tests": "Extracting transactional facts into a persistent case-facts block outside summarized history",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In sessions longer than about 25 turns, the platform summarizes older turns to save context. Afterwards the agent quotes \"around $40\" instead of $42.17 and forgets that the customer said they need the refund on their original card by Friday. What should you change?",
     "options": [
      {
       "id": "A",
       "text": "Extract transactional facts (amounts, dates, order numbers, statuses, and stated expectations) into a persistent case-facts block that is included in every prompt, outside the summarized history."
      },
      {
       "id": "B",
       "text": "Summarize more often so each summary covers fewer turns and loses less detail."
      },
      {
       "id": "C",
       "text": "Add an instruction to the summarizer prompt: \"Make sure to preserve all important details.\""
      },
      {
       "id": "D",
       "text": "Switch to a model with a larger context window and stop summarizing."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Progressive summarization compresses exact values into vague phrases. A structured case-facts block keeps them verbatim on every turn.",
      "wrong": {
       "B": "More frequent summarization compounds the compression of exact numbers and dates; it does not protect them.",
       "C": "\"Important details\" is a vague criterion. Without a dedicated structure for the facts, the summarizer still paraphrases amounts and dates.",
       "D": "A larger window delays the problem and does not address attention and cost issues. It also leaves verbose tool output competing with the critical facts."
      }
     },
     "studyRef": "Task Statement 5.1 (+ case facts block and progressive summarization risks)"
    },
    {
     "n": 10,
     "scenario": 1,
     "domain": 5,
     "ts": "5.2",
     "tests": "Asking for additional identifiers when tool results return multiple matches",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"Hi, this is Maria Garcia, I want to return my jacket.\" `get_customer` returns three matching Maria Garcia accounts. In the current design the agent picks the account with the most recent order, and two wrong-account refunds were logged last month. What should the agent do instead?",
     "options": [
      {
       "id": "A",
       "text": "Ask the customer for another identifier (email, phone, or order number) and proceed only once one account matches."
      },
      {
       "id": "B",
       "text": "Keep choosing by most recent order, but tell the customer which account was selected and ask them to object before any refund is processed."
      },
      {
       "id": "C",
       "text": "Pick the first match returned by `get_customer`, since results are already ranked by relevance."
      },
      {
       "id": "D",
       "text": "Escalate every request where `get_customer` returns more than one match."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "When a tool returns multiple matches, the agent should request more identifying information rather than choose by heuristic.",
      "wrong": {
       "B": "This still acts on a heuristic guess, and customers are unlikely to catch a wrong account before an action is taken on it.",
       "C": "Ranking does not establish identity; with identical names any pick can touch the wrong person's data.",
       "D": "This is unnecessarily conservative. A one-line request for an identifier resolves most cases within the agent's capability."
      }
     },
     "studyRef": "Task Statement 5.2 (+ ambiguity resolution with multiple customer matches)"
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
     "tests": "Decomposing multi-concern requests and investigating items in parallel with shared context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A customer writes: \"I was charged twice for order #A, order #B never arrived, and I also need to change the shipping address on my open order #C.\" The agent currently works through them one at a time, sometimes forgetting the third item, and re-verifies the customer for each. What is the best redesign?",
     "options": [
      {
       "id": "A",
       "text": "Ask the customer to open three separate tickets, one per issue."
      },
      {
       "id": "B",
       "text": "Split it into three items, verify once, investigate them in parallel, then synthesize one answer."
      },
      {
       "id": "C",
       "text": "Launch three independent agents, each of which verifies the customer separately and replies to the customer on its own."
      },
      {
       "id": "D",
       "text": "Resolve the first issue completely, then tell the customer to write back about the other two issues in a new chat."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Decomposition into distinct items with shared context avoids re-verification and dropped concerns, and the synthesis step gives the customer a single coherent response.",
      "wrong": {
       "A": "This pushes the burden onto the customer and hurts first-contact resolution.",
       "C": "Without shared context each agent repeats verification and the customer receives three uncoordinated responses.",
       "D": "This ignores the other concerns and guarantees multiple contacts, working against the 80% first-contact resolution target."
      }
     },
     "studyRef": "Task Statement 1.4 (+ multi-concern decomposition and unified synthesis)"
    },
    {
     "n": 15,
     "scenario": 1,
     "domain": 1,
     "ts": "1.1",
     "tests": "Adding tool results to conversation history between loop iterations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "After `lookup_order` runs, the loop sends the next request with only the new `tool_result` block as the sole message. The agent then repeats `get_customer` and `lookup_order` calls and sometimes loses track of the customer's question, and the API sometimes rejects the request. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Keep sending only the latest tool result, but add a system prompt line summarizing the customer's question."
      },
      {
       "id": "B",
       "text": "Send the tool result as plain text in a new user message so no `tool_use_id` matching is required."
      },
      {
       "id": "C",
       "text": "Increase `max_tokens` so the model has room to rebuild context from the single tool result."
      },
      {
       "id": "D",
       "text": "Append the assistant message containing the `tool_use` block, then a user message with the matching `tool_result`, and resend the full history."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The model reasons from conversation history. The assistant `tool_use` turn and the `tool_result` keyed by its `tool_use_id` must both be appended so the next iteration sees prior context and the result.",
      "wrong": {
       "A": "The tool_result still arrives without its matching `tool_use` turn, and a summary line does not restore the earlier tool calls and results.",
       "B": "Dropping the `tool_use` and `tool_result` pairing breaks the protocol, and the model no longer sees which call produced the data.",
       "C": "The problem is missing history, not output length; the model cannot rebuild turns it was never sent."
      }
     },
     "studyRef": "Task Statement 1.1 (+ appending assistant tool_use and tool_result turns to history)"
    },
    {
     "n": 16,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Routing all subagent communication through the coordinator for observability and controlled information flow",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "To cut latency, a teammate proposes letting the document-analysis subagent write its output directly to a shared channel that the synthesis subagent reads, bypassing the coordinator. Last week a malformed analysis output crashed synthesis and nobody could see what had been passed. What is the best architectural response?",
     "options": [
      {
       "id": "A",
       "text": "Adopt the direct channel but add a retry on the synthesis subagent for malformed inputs."
      },
      {
       "id": "B",
       "text": "Let the synthesis subagent spawn its own document-analysis subagents when it needs more input."
      },
      {
       "id": "C",
       "text": "Keep hub-and-spoke: route all subagent outputs through the coordinator."
      },
      {
       "id": "D",
       "text": "Merge the document-analysis and synthesis subagents into one agent so no handoff is needed."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Routing communication through the coordinator provides observability, consistent error handling, and controlled information flow. These are exactly what was missing.",
      "wrong": {
       "A": "Retrying does not fix malformed input or restore visibility into what was exchanged. It also adds latency to the very path you wanted to speed up.",
       "B": "This hides more orchestration inside a subagent, further reducing observability and creating nested, uncontrolled delegation.",
       "D": "This removes specialization and bloats the agent's tool set and prompt, instead of fixing the unobservable handoff."
      }
     },
     "studyRef": "Task Statement 1.2 (+ hub-and-spoke coordinator responsibilities)"
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
     "tests": "Coordinator prompts that specify goals and quality criteria rather than step-by-step procedures",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The coordinator's prompts to the web-search subagent are procedural: \"Step 1: search for X on site A. Step 2: open the first three results. Step 3: copy the statistics.\" When site A is paywalled the subagent stalls or fabricates results. How should you restructure the prompts?",
     "options": [
      {
       "id": "A",
       "text": "Add fallback branches to every step, such as \"If site A is paywalled, try site B, then site C\"."
      },
      {
       "id": "B",
       "text": "Remove the coordinator's task description entirely and let the subagent infer the goal from the topic and from whatever sources it finds."
      },
      {
       "id": "C",
       "text": "Lower the sampling temperature so the subagent follows the numbered steps more exactly."
      },
      {
       "id": "D",
       "text": "Describe the research goal and quality criteria (scope, recency, source types) and let the subagent choose its approach."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Goal-and-criteria prompts allow subagents to adapt when a source is unavailable, while the coordinator still controls what is needed.",
      "wrong": {
       "A": "More procedural branching is still brittle and covers only the failures you predicted in advance.",
       "B": "Without a stated goal or criteria the subagent has no basis for scope or quality and may drift or duplicate other agents' work.",
       "C": "More literal compliance with a brittle procedure increases the stalls rather than fixing them."
      }
     },
     "studyRef": "Task Statement 1.3 (+ coordinator prompts: goals and quality criteria)"
    },
    {
     "n": 19,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Task tool and allowedTools requirement for the coordinator to spawn subagents",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "All four subagents are defined via `AgentDefinition`. The coordinator writes \"I'll delegate this to the web search agent\" but no subagent ever runs. The coordinator is configured as:\n\n```json\n{ \"allowedTools\": [\"Read\", \"WebSearch\"], \"agents\": { \"web_search\": {...}, \"doc_analysis\": {...}, \"synthesis\": {...}, \"report\": {...} } }\n```\n\nWhat is the root cause?",
     "options": [
      {
       "id": "A",
       "text": "`allowedTools` does not include `\"Task\"`, so the coordinator cannot invoke subagents."
      },
      {
       "id": "B",
       "text": "The subagent descriptions are too long to be selected."
      },
      {
       "id": "C",
       "text": "The coordinator needs `tool_choice: \"any\"`, otherwise it is allowed to answer in text instead."
      },
      {
       "id": "D",
       "text": "Subagents cannot run unless each one repeats the coordinator's full conversation history in its own `AgentDefinition`."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Subagents are spawned through the Task tool, so the coordinator's `allowedTools` must include `\"Task\"`.",
      "wrong": {
       "B": "Long descriptions affect selection quality, not whether a subagent can be invoked at all.",
       "C": "`any` forces some tool call but cannot make a missing Task tool available. The coordinator could not delegate even then.",
       "D": "Subagents do not inherit history, and their definitions do not need it to be invoked. This is not what blocks delegation."
      }
     },
     "studyRef": "Task Statement 1.3 (+ Task tool and allowedTools)"
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
     "tests": "Choosing prompt chaining for predictable multi-aspect work versus dynamic decomposition for open-ended investigation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The system produces a weekly competitor snapshot that always covers the same four aspects: pricing, features, hiring, and press. Today a coordinator dynamically invents the subtasks each time, so section coverage varies, runs are costly, and some weeks omit hiring entirely. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Keep dynamic decomposition but add a system prompt line asking the coordinator to always include hiring."
      },
      {
       "id": "B",
       "text": "Use a fixed sequential pipeline (prompt chain): one focused step per aspect, then a final step that assembles the sections."
      },
      {
       "id": "C",
       "text": "Switch all research tasks, including open-ended ones, to the same fixed pipeline so the system is uniform."
      },
      {
       "id": "D",
       "text": "Run the dynamic coordinator three times and merge sections that appear in at least two runs."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "For predictable, multi-aspect work, prompt chaining guarantees consistent coverage and lower cost, while dynamic decomposition is better kept for open-ended investigations.",
      "wrong": {
       "A": "This is a patch that keeps the unpredictability and cost and relies on prompt compliance to cover the aspects.",
       "C": "A fixed pipeline cannot adapt to leads found mid-investigation, so it is the wrong tool for open-ended tasks.",
       "D": "This triples cost and consensus merging would drop sections that appear only once. It still does not make coverage predictable."
      }
     },
     "studyRef": "Task Statement 1.6 (+ prompt chaining versus dynamic decomposition)"
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
     "tests": "Using fork_session to explore divergent approaches from a shared analysis baseline",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "After a long session analyzing 40 sources, you want to compare two report structures (chronological versus thematic) without either draft influencing the other. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Write the chronological draft, then ask for the thematic one in the same session."
      },
      {
       "id": "B",
       "text": "Use `fork_session` to create two independent branches from the shared analysis baseline and develop one structure in each."
      },
      {
       "id": "C",
       "text": "Start two brand-new sessions and have each re-analyze all 40 sources."
      },
      {
       "id": "D",
       "text": "Ask for both structures in a single prompt and compare the two outputs."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Forking creates independent branches from a common baseline, so both structures start from the same analysis without cross-contamination.",
      "wrong": {
       "A": "The second draft would be shaped by the first draft in context, which defeats an independent comparison.",
       "C": "This repeats the expensive analysis and, being run twice, can produce different baselines that muddy the comparison.",
       "D": "Both drafts share one context and one pass of attention, so they are not independent explorations."
      }
     },
     "studyRef": "Task Statement 1.7 (+ fork_session for divergent exploration)"
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
     "tests": "Splitting a generic tool into purpose-specific tools with defined input/output contracts",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent has one tool, `analyze_document`, described as \"Analyzes a document\". Sometimes it returns a summary, sometimes extracted statistics, and sometimes a yes/no on a claim, depending on how the model happens to use it. Downstream agents cannot rely on the output shape, and a previous attempt to lengthen the description left the mix of output shapes unchanged. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Lengthen the `analyze_document` description to list all three behaviors, the output each one returns, and when each one applies."
      },
      {
       "id": "B",
       "text": "Add a free-text `mode` parameter and let the model pass whatever it thinks suits the task."
      },
      {
       "id": "C",
       "text": "Split it into `extract_data_points`, `summarize_content`, and `verify_claim_against_source` tools with defined contracts."
      },
      {
       "id": "D",
       "text": "Add several few-shot examples to the system prompt showing each kind of output."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Purpose-specific tools with clear contracts remove the ambiguity about what each call does and make outputs predictable for downstream agents.",
      "wrong": {
       "A": "A long description for one multi-purpose tool leaves the output shape undefined, so downstream agents still cannot rely on it.",
       "B": "An unconstrained parameter reintroduces the ambiguity inside a single tool and offers no contract.",
       "D": "Examples may help the model, but the tool still has no fixed contract and the root cause (an overloaded tool) remains."
      }
     },
     "studyRef": "Task Statement 2.1 (+ splitting generic tools into focused ones)"
    },
    {
     "n": 27,
     "scenario": 3,
     "domain": 2,
     "ts": "2.4",
     "tests": "Exposing content catalogs as MCP resources to reduce exploratory tool calls",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document-analysis subagent spends 6 to 10 exploratory calls to `search_documents` just to discover which internal reports exist before it can start analysis. Which design reduces this overhead best?",
     "options": [
      {
       "id": "A",
       "text": "Increase the `search_documents` tool description with more example queries."
      },
      {
       "id": "B",
       "text": "Expose a catalog of available documents as an MCP resource."
      },
      {
       "id": "C",
       "text": "Paste the full text of every internal report into the subagent's system prompt."
      },
      {
       "id": "D",
       "text": "Have the coordinator run ten generic searches before invoking the subagent and pass the results along."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "MCP resources are intended for content catalogs. Visibility into what is available removes the exploratory calls.",
      "wrong": {
       "A": "Better examples may improve query quality but the agent would still have to explore blindly to learn what exists.",
       "C": "This floods the context with content that is mostly irrelevant for any given topic; a catalog is lighter than the content.",
       "D": "This keeps the exploration, just moved to the coordinator, and the searches are guesses without a catalog."
      }
     },
     "studyRef": "Task Statement 2.4 (+ MCP resources as content catalogs)"
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
     "difficulty": "hard",
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
     "difficulty": "medium",
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
     "tests": "Providing existing test files in context so test generation avoids duplicate scenarios",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI job runs `claude -p` on each PR to propose new unit tests. Reviewers find that about 40% of the proposed tests duplicate scenarios already covered in the module's existing test file. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Include the module's existing test files in the context of the generation run."
      },
      {
       "id": "B",
       "text": "Add \"avoid duplicate tests\" to the prompt alone."
      },
      {
       "id": "C",
       "text": "Post-process the output with a name-similarity filter that drops tests with names resembling existing ones."
      },
      {
       "id": "D",
       "text": "Run generation three times and keep only the tests that appear in all three of the outputs."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Duplicate suggestions arise because the model cannot see the current tests. Providing them in context is the direct fix.",
      "wrong": {
       "B": "The model cannot avoid duplicates of tests it cannot see, so the instruction has nothing to compare against.",
       "C": "Name matching misses semantically duplicate tests with different names and discards new tests with similar names.",
       "D": "Consistency across runs says nothing about whether a test is already covered."
      }
     },
     "studyRef": "Task Statement 3.6 (+ existing tests in context for generation)"
    },
    {
     "n": 32,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Documenting testing standards, valuable test criteria, and fixtures in CLAUDE.md for CI-invoked Claude Code",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Generated tests often assert on mock call counts, test trivial getters, and re-implement fixtures that already exist in `tests/fixtures/`. Six pipelines each embed their own copy of testing guidance in the `claude -p` prompt string, and the copies have drifted. What is the best improvement?",
     "options": [
      {
       "id": "A",
       "text": "Put the testing standards, valuable-test criteria, and fixtures in the project CLAUDE.md that CI loads."
      },
      {
       "id": "B",
       "text": "Keep the guidance in each pipeline's prompt string and have a teammate synchronize the six drifting copies by hand each sprint."
      },
      {
       "id": "C",
       "text": "Add the standards only to a lead engineer's `~/.claude/CLAUDE.md` file."
      },
      {
       "id": "D",
       "text": "Have Claude infer the standards from existing tests on every run."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "CLAUDE.md is the mechanism for providing project context to CI runs. One shared, version-controlled source ends the drift and improves test quality.",
      "wrong": {
       "B": "Duplicated guidance in prompt strings is what drifted. Manual syncing is fragile and not the designated context mechanism.",
       "C": "User-level files apply only to that user's machine, so CI runners and teammates would never see them.",
       "D": "Inference from existing tests, which may include low-value ones, is inconsistent and wastes context on each run."
      }
     },
     "studyRef": "Task Statement 3.6 (+ CLAUDE.md as CI context)"
    },
    {
     "n": 33,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Using --output-format json with --json-schema for machine-parseable findings",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The review job parses Claude's free-form text with regular expressions to create inline PR comments. About 1 in 8 runs breaks the parser. Which change is most reliable?",
     "options": [
      {
       "id": "A",
       "text": "Tell the prompt to \"respond only in JSON\" and keep the regular expressions as a fallback."
      },
      {
       "id": "B",
       "text": "Add the flag `--format=pr-comments` so Claude Code emits GitHub-ready comments directly."
      },
      {
       "id": "C",
       "text": "Use `--output-format json` with a `--json-schema` for the findings."
      },
      {
       "id": "D",
       "text": "Send each response to a second Claude call that rewrites it into a consistent text layout for the parser."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "The documented CI flags produce schema-conforming, machine-parseable output suited to posting inline comments.",
      "wrong": {
       "A": "A prompt request does not guarantee format, so this keeps the fragility.",
       "B": "No such flag exists; structured output is obtained via `--output-format json` and `--json-schema`.",
       "D": "A second model call adds cost and its own variance, instead of constraining the output format at the source."
      }
     },
     "studyRef": "Task Statement 3.6 (+ --output-format json and --json-schema)"
    },
    {
     "n": 34,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Including prior review findings when re-running reviews after new commits",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Each new commit to a PR triggers a fresh `claude -p` review, and the bot re-posts comments for issues it already reported and developers already fixed or acknowledged. Which TWO changes best fix the duplicate comments? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Pass the prior review findings into the new run's context."
      },
      {
       "id": "B",
       "text": "Deduplicate afterwards by matching on file path and line number against previously posted comments."
      },
      {
       "id": "C",
       "text": "Limit each run to the latest commit's diff only."
      },
      {
       "id": "D",
       "text": "Instruct Claude to report only new issues or ones that remain unaddressed, relative to those prior findings."
      },
      {
       "id": "E",
       "text": "Run the review at temperature 0 so output is identical across runs."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "Without seeing earlier findings the model cannot know what was already reported. The instruction turns the prior findings into a filter, so resolved issues are not re-posted and unresolved ones still are.",
      "wrong": {
       "B": "Line numbers shift between commits, so this misses duplicates and may suppress new issues on the same line.",
       "C": "Reviewing only the newest diff loses earlier unaddressed issues and cross-commit context.",
       "E": "Deterministic phrasing would not remove reports of issues that are already fixed or already posted."
      }
     },
     "studyRef": "Task Statement 3.6 (+ re-running reviews without duplicate comments)"
    },
    {
     "n": 35,
     "scenario": 5,
     "domain": 3,
     "ts": "3.1",
     "tests": "Diagnosing CLAUDE.md hierarchy issues: user-level instructions are not shared",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A senior engineer's local reviews catch missing input validation, but the CI review and new teammates' reviews never mention it. Her rule \"flag any new endpoint lacking input validation\" lives in `~/.claude/CLAUDE.md`. What is the right fix?",
     "options": [
      {
       "id": "A",
       "text": "Copy her `~/.claude/CLAUDE.md` into the CI runner's home directory and ask each teammate to do the same."
      },
      {
       "id": "B",
       "text": "Move the rule into the project-level CLAUDE.md (root or `.claude/CLAUDE.md`) and commit it."
      },
      {
       "id": "C",
       "text": "Add the rule to a new file `.claude/team-instructions.yaml` that Claude Code will load automatically."
      },
      {
       "id": "D",
       "text": "Ask each reviewer to paste the rule into the prompt of every review."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "User-level files apply only to that user. Project-level CLAUDE.md is version-controlled and reaches CI and every teammate.",
      "wrong": {
       "A": "This relies on manual per-machine copying that will drift, and the project files remain without the rule.",
       "C": "No such file is loaded by Claude Code; only CLAUDE.md files and `.claude/rules/` are.",
       "D": "Manual repetition is unreliable, which is the reason for putting standards in shared configuration."
      }
     },
     "studyRef": "Task Statement 3.1 (+ user vs project CLAUDE.md scope)"
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
     "tests": "argument-hint frontmatter to prompt developers for required parameters",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You added a project skill `.claude/skills/gen-tests/SKILL.md` that generates tests for one module. When developers invoke `/gen-tests` without naming a module, Claude guesses and writes tests for an arbitrary file. How do you prompt developers for the required module path?",
     "options": [
      {
       "id": "A",
       "text": "Add `required-args: true` to the skill's frontmatter."
      },
      {
       "id": "B",
       "text": "Set `context: fork` so the skill runs in an isolated subagent that will ask for the path."
      },
      {
       "id": "C",
       "text": "Add `argument-hint: <path-to-module>` to the skill's frontmatter."
      },
      {
       "id": "D",
       "text": "Add a line to the root CLAUDE.md telling Claude to always ask for a path before running any skill."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "`argument-hint` is the frontmatter option that shows developers what parameter to supply when invoking the skill.",
      "wrong": {
       "A": "That is not a real frontmatter option.",
       "B": "`context: fork` isolates the skill's output from the main conversation; it does not prompt for arguments.",
       "D": "CLAUDE.md is always-loaded context and would apply to every skill and task rather than this one."
      }
     },
     "studyRef": "Task Statement 3.2 (+ skill frontmatter: argument-hint, context, allowed-tools)"
    },
    {
     "n": 38,
     "scenario": 5,
     "domain": 3,
     "ts": "3.4",
     "tests": "Combining plan mode for investigation with direct execution for implementation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "You need to migrate the repository's test-generation tooling from Jest to Vitest. About 60 test files are affected, with different mocking approaches and shared helpers. Which approach is best?",
     "options": [
      {
       "id": "A",
       "text": "Start with direct execution and convert files one by one, adapting as problems appear."
      },
      {
       "id": "B",
       "text": "Use plan mode to investigate the mocking patterns and design the migration, then switch to direct execution to carry out the agreed plan."
      },
      {
       "id": "C",
       "text": "Stay in plan mode and never execute edits, since planning avoids mistakes."
      },
      {
       "id": "D",
       "text": "Ask the Explore subagent to perform all the file conversions and report back."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "A large multi-file migration with multiple valid approaches suits plan mode for exploration and design, and direct execution for implementing the decided plan.",
      "wrong": {
       "A": "Dependencies and shared helpers discovered late cause rework across files already converted.",
       "C": "A plan that is never executed delivers no migration; planning is for the investigation phase.",
       "D": "Explore is for isolating verbose discovery and returning summaries, not for making edits."
      }
     },
     "studyRef": "Task Statement 3.4 (+ plan mode then direct execution)"
    },
    {
     "n": 39,
     "scenario": 5,
     "domain": 3,
     "ts": "3.5",
     "tests": "Providing specific test cases with example input and expected output to fix edge-case handling",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Claude generated a fixture-builder utility that crashes whenever `shipping_address` is null. You have described the problem twice in prose (\"handle missing addresses gracefully\"), and each revision handles some null cases differently. What is the best next step?",
     "options": [
      {
       "id": "A",
       "text": "Rephrase the description with stronger wording."
      },
      {
       "id": "B",
       "text": "Give test cases with example inputs, including nulls, and exact expected outputs."
      },
      {
       "id": "C",
       "text": "Paste the entire production database schema and ask Claude to infer the correct behavior."
      },
      {
       "id": "D",
       "text": "Ask Claude to wrap the whole function in a try/except block so that it never crashes on bad input."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Concrete input/output examples remove the ambiguity that prose descriptions leave, and tests give a verifiable target for the edge cases.",
      "wrong": {
       "A": "More prose is exactly what has produced inconsistent interpretations twice.",
       "C": "A schema shows which fields can be null but not what the desired behavior is for each case.",
       "D": "A blanket catch hides the failure but does not define correct output for null addresses."
      }
     },
     "studyRef": "Task Statement 3.5 (+ test cases with example input and expected output)"
    },
    {
     "n": 40,
     "scenario": 5,
     "domain": 3,
     "ts": "3.5",
     "tests": "Providing all issues in a single message when fixes interact versus sequential iteration",
     "difficulty": "hard",
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
       "C": "The others are independent causes and will not resolve themselves.",
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
     "tests": "Explicit categorical criteria instead of vague or confidence-based instructions",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The review prompt says: \"Check that code comments are accurate. Be conservative and only report findings you are highly confident about.\" Developers dismiss 60% of comment-related findings as nitpicks, and trust in the other categories is dropping. What is the best prompt change?",
     "options": [
      {
       "id": "A",
       "text": "Tighten the instruction to \"only report findings you are at least 95% confident about\" in every category."
      },
      {
       "id": "B",
       "text": "Run the comment check three times and report only the findings that appear in at least two of the runs."
      },
      {
       "id": "C",
       "text": "Ask developers to mark nitpicks on the PR."
      },
      {
       "id": "D",
       "text": "Report a comment finding only when its claimed behavior contradicts what the code does."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Specific categorical criteria define what to report and what to skip, which improves precision more than general requests for conservatism.",
      "wrong": {
       "A": "General confidence thresholds do not improve precision; the model's confidence does not separate nitpicks from real defects.",
       "B": "Consensus voting may suppress real findings that appear intermittently, and it does not define what counts as a nitpick.",
       "C": "This adds developer work and does not give the prompt any criteria beyond the individual examples."
      }
     },
     "studyRef": "Task Statement 4.1 (+ explicit criteria over confidence-based filtering)"
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
     "tests": "detected_pattern field to analyze false-positive dismissal patterns",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Developers dismiss about 30% of automated review findings, but the team cannot tell which kinds of code constructs trigger the false positives. What should you add to the structured finding output?",
     "options": [
      {
       "id": "A",
       "text": "Ask the model to attach a free-text apology whenever it is unsure about a finding."
      },
      {
       "id": "B",
       "text": "Analyze dismissals by severity level only, ignoring which code construct triggered the finding."
      },
      {
       "id": "C",
       "text": "Add a `detected_pattern` field to each finding."
      },
      {
       "id": "D",
       "text": "Drop all categories with a dismissal rate above 20% permanently."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Tracking the triggering construct lets you see which patterns produce frequent dismissals and then fix the prompt for those.",
      "wrong": {
       "A": "Free-text hedging is not a structured signal and cannot be analyzed systematically.",
       "B": "Severity tells you how serious a finding was claimed to be, not which construct triggered it.",
       "D": "Disabling a category may be a useful temporary measure, but without pattern data you cannot fix the underlying cause."
      }
     },
     "studyRef": "Task Statement 4.4 (+ detected_pattern and dismissal analysis)"
    },
    {
     "n": 45,
     "scenario": 5,
     "domain": 2,
     "ts": "2.4",
     "tests": "Project .mcp.json with environment variable expansion for credentials",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "The CI review job needs a GitHub MCP server shared by the whole team, but the access token must never be committed to the repository. What is the right configuration?",
     "options": [
      {
       "id": "A",
       "text": "Define the server in the project's `.mcp.json` and reference the token as `${GITHUB_TOKEN}`, injected from the CI secret store."
      },
      {
       "id": "B",
       "text": "Put the literal token in `.mcp.json` and restrict repository access."
      },
      {
       "id": "C",
       "text": "Configure the server in each developer's `~/.claude.json` and have CI read it from there."
      },
      {
       "id": "D",
       "text": "Write the token into the root CLAUDE.md so Claude can read it when it needs to call GitHub."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Project-scoped `.mcp.json` shares the server config via version control, and environment variable expansion keeps secrets out of the repository.",
      "wrong": {
       "B": "A committed secret is exposed to everyone with repository access and remains in git history.",
       "C": "User-level configuration is personal and not shared, so the CI runner would not have it.",
       "D": "CLAUDE.md is committed context, so the secret would be in the repository, and the model would hold the secret in its prompt."
      }
     },
     "studyRef": "Task Statement 2.4 (+ .mcp.json and ${ENV_VAR} expansion)"
    },
    {
     "n": 46,
     "scenario": 6,
     "domain": 4,
     "ts": "4.3",
     "tests": "Optional/nullable fields so the model does not fabricate values for absent information",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your invoice extraction schema marks `po_number` as a required string. About 20% of invoices have no purchase order, and the extractions for those contain invented values such as \"PO-0000\". What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a regular-expression check that rejects values like \"PO-0000\" and retries until the model returns a different value."
      },
      {
       "id": "B",
       "text": "Keep the field required and add \"never guess\" to the system prompt."
      },
      {
       "id": "C",
       "text": "Make `po_number` optional and nullable so the model can return null when the document has no purchase order."
      },
      {
       "id": "D",
       "text": "Remove `po_number` from the schema entirely."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "A required field pushes the model to supply something. Nullable or optional fields let it report absence honestly.",
      "wrong": {
       "A": "Retrying cannot create information that is absent; it will produce a different fabricated value.",
       "B": "The schema still demands a value, and the instruction competes with that requirement, so fabrication persists.",
       "D": "Removing it discards the value for the 80% of invoices that do have one."
      }
     },
     "studyRef": "Task Statement 4.3 (+ required vs optional/nullable fields)"
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
      "correct": "`any` guarantees a tool call while letting the model choose the right schema for an unknown document type.",
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
     "tests": "Enum values such as unclear and other plus a detail field for extensible categories",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The schema field `document_category` is an enum of six values. New document types such as customs declarations appear, and the model forces them into the closest wrong category, polluting downstream reports. Which schema change is best?",
     "options": [
      {
       "id": "A",
       "text": "Expand the enum to 40 values covering every document type anyone can think of today."
      },
      {
       "id": "B",
       "text": "Change the field to unconstrained free text so any category can be written in."
      },
      {
       "id": "C",
       "text": "Keep the six values and instruct the model to pick the nearest one in every case."
      },
      {
       "id": "D",
       "text": "Add `\"other\"` with a `category_detail` string, plus `\"unclear\"`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "An `other` plus detail pattern captures novel categories without forcing a wrong label, and `unclear` marks ambiguity.",
      "wrong": {
       "A": "A long enum is unmaintainable, and new types will still appear.",
       "B": "Free text loses consistency, which breaks downstream grouping and reporting.",
       "C": "This is exactly the behavior that is misclassifying new document types."
      }
     },
     "studyRef": "Task Statement 4.3 (+ enum other/unclear patterns)"
    },
    {
     "n": 49,
     "scenario": 6,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples demonstrating extraction from varied document structures",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your pipeline extracts cited works from research papers. Papers with inline citations like \"(Smith, 2021)\" extract well, but papers with numbered bibliographies at the end return empty `citations` arrays about 35% of the time. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Add a paragraph of rules describing what a bibliography looks like."
      },
      {
       "id": "B",
       "text": "Make `citations` a required field with a minimum of one item."
      },
      {
       "id": "C",
       "text": "Add 2 to 4 few-shot examples covering both inline citations and end-of-document numbered bibliographies."
      },
      {
       "id": "D",
       "text": "Pre-convert every paper to inline citation format with a regex before sending it to Claude, so only one layout reaches the model."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Few-shot examples of varied document structures teach the model to handle formats the instructions alone did not cover.",
      "wrong": {
       "A": "Prose rules were not enough here; examples demonstrate the mapping much more effectively.",
       "B": "Requiring items for papers where the model failed to find any would lead to fabricated citations.",
       "D": "Regex normalization of arbitrary paper layouts is brittle engineering that few-shot examples can solve."
      }
     },
     "studyRef": "Task Statement 4.2 (+ few-shot for varied document structures)"
    },
    {
     "n": 50,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Self-correction validation: calculated_total alongside stated_total and conflict_detected",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Schema validation passes for every extraction, but in 4% of invoices the line items do not add up to the stated total. A teammate suggests enabling strict mode so the numbers are always consistent. What should you do?",
     "options": [
      {
       "id": "A",
       "text": "Extract both `stated_total` and a model-computed `calculated_total`, and flag mismatches, optionally with a `conflict_detected` boolean."
      },
      {
       "id": "B",
       "text": "Enable strict mode only; consistent output structure means the arithmetic will be consistent too."
      },
      {
       "id": "C",
       "text": "Retry any invoice whose total mismatches up to five times with the same prompt."
      },
      {
       "id": "D",
       "text": "Drop `stated_total` and use only the sum of the line items."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Strict schemas eliminate syntax errors but not semantic ones. Capturing both totals makes discrepancies detectable.",
      "wrong": {
       "B": "Strict schemas guarantee structure, not that values agree with each other.",
       "C": "Blind retries without error feedback may just repeat the discrepancy, which can come from the source document itself.",
       "D": "This silently hides source inconsistencies; the stated total may be right and a line item mis-extracted."
      }
     },
     "studyRef": "Task Statement 4.4 (+ semantic vs syntax errors; calculated vs stated values)"
    },
    {
     "n": 51,
     "scenario": 6,
     "domain": 4,
     "ts": "4.4",
     "tests": "Retry limits: effective for format errors, ineffective when information is absent from the source",
     "difficulty": "hard",
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
     "tests": "Calculating batch submission frequency from SLA constraints",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Documents must have extracted results within 36 hours of arrival. The Message Batches API can take up to 24 hours per batch, and you reserve 4 hours after completion for validation and delivery. What is the longest interval between batch submissions that still guarantees the SLA?",
     "options": [
      {
       "id": "A",
       "text": "12 hours, half of the batch processing window"
      },
      {
       "id": "B",
       "text": "24 hours, matching the batch processing window"
      },
      {
       "id": "C",
       "text": "4 hours, the post-processing reserve"
      },
      {
       "id": "D",
       "text": "8 hours, since 36 - 24 - 4 = 8."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "The worst-case document waits one full interval, then up to 24 hours processing, then 4 hours of post-processing. 8 + 24 + 4 = 36 hours.",
      "wrong": {
       "A": "A document arriving just after a submission waits 12 hours, plus 24 hours, plus 4 hours of post-processing, for 40 hours.",
       "B": "A 24-hour interval allows 24 + 24 + 4 = 52 hours in the worst case, far beyond the SLA.",
       "C": "This meets the SLA but is not the longest interval; it submits more often than needed."
      }
     },
     "studyRef": "Task Statement 4.5 (+ SLA window math for batches)"
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
     "tests": "Format normalization rules in the prompt alongside strict output schemas",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Extractions from hundreds of vendors pass the strict schema, but `invoice_date` is a string field and arrives as \"03/04/25\", \"4 March 2025\", or \"2025-03-04\", and `amount` sometimes includes currency symbols and thousands separators. Downstream systems need one consistent format. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Rely on strict mode, which will force the model to emit a consistent date and amount format."
      },
      {
       "id": "B",
       "text": "Write per-vendor regular expressions in a post-processing step to reformat each date and amount."
      },
      {
       "id": "C",
       "text": "Retry any extraction that does not match ISO 8601 up to five times with no added guidance."
      },
      {
       "id": "D",
       "text": "Add explicit normalization rules to the prompt (ISO 8601 dates, plain decimal amounts) alongside the schema, with examples of source variations."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "A schema constrains type and shape, but a string field accepts any format. Normalization rules in the prompt tell the model how to convert inconsistent source formatting.",
      "wrong": {
       "A": "Strict schemas eliminate syntax errors, but a plain string type accepts every one of those date styles.",
       "B": "With hundreds of vendors and new layouts appearing, regexes are brittle and fix at the wrong stage what the model can normalize while extracting.",
       "C": "A retry without telling the model the expected format or what failed can repeat the same output."
      }
     },
     "studyRef": "Task Statement 4.3 (+ normalization rules alongside strict schemas)"
    },
    {
     "n": 56,
     "scenario": 6,
     "domain": 5,
     "ts": "5.5",
     "tests": "Routing low-confidence or contradictory extractions to human review given limited capacity",
     "difficulty": "medium",
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
     "tests": "Aggregate accuracy masking poor segment performance; validate by document type and field",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Validation shows 97% overall accuracy, above your 95% automation threshold, and you plan to auto-approve high-confidence extractions. The mix is: typed invoices (90% of volume, 98.8% accurate), scanned receipts (8%, 88%), and handwritten notes (2%, 70%). What should you do before automating?",
     "options": [
      {
       "id": "A",
       "text": "Automate everything, since 97% is above the 95% target."
      },
      {
       "id": "B",
       "text": "Raise the confidence threshold for all document types equally."
      },
      {
       "id": "C",
       "text": "Break accuracy down by document type and field; keep human review for weak segments like receipts and handwriting."
      },
      {
       "id": "D",
       "text": "Wait until overall accuracy across the whole validation set reaches 99%, then automate all document types with no further review."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "An aggregate can hide weak segments. Segment-level validation shows where automation is safe.",
      "wrong": {
       "A": "The overall figure is dominated by the high-volume easy segment and hides two weak ones.",
       "B": "A global threshold does not address the segment-specific accuracy problem and wastes review on invoices.",
       "D": "Chasing a higher aggregate still hides segments and ignores that invoices could be automated now."
      }
     },
     "studyRef": "Task Statement 5.5 (+ accuracy by document type and field)"
    },
    {
     "n": 58,
     "scenario": 6,
     "domain": 5,
     "ts": "5.1",
     "tests": "Placing key findings at the beginning and using section headers to mitigate position effects",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A reconciliation prompt concatenates the extraction results from 12 sections of a long contract (about 60K tokens). The final summary regularly omits findings from sections 5 through 8. What is the best prompt change?",
     "options": [
      {
       "id": "A",
       "text": "Switch to a model with a larger context window."
      },
      {
       "id": "B",
       "text": "Randomly shuffle the order of sections on each run, then take the union of everything found across runs."
      },
      {
       "id": "C",
       "text": "Add \"read all sections carefully and do not skip anything\" to the end of the prompt, just before the output format."
      },
      {
       "id": "D",
       "text": "Put a key-findings summary first and use explicit headers for the detailed results."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Models handle the start and end of long inputs best and may omit the middle. A leading summary plus headers mitigate the position effect.",
      "wrong": {
       "A": "A larger window does not fix attention to middle content.",
       "B": "Shuffling does not give any section a stable position and adds cost without removing the effect.",
       "C": "A generic instruction does not change where the model's attention concentrates."
      }
     },
     "studyRef": "Task Statement 5.1 (+ lost in the middle)"
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
     "difficulty": "hard",
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
     "tests": "Using glob patterns in path-specific rules to cover files by type regardless of location",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A rule file `.claude/rules/api-errors.md` was added with this content:\n\n```\n---\npaths:\n  - \"src/api/*.ts\"\n---\nAll handlers must return errors using the `ApiError` envelope.\n```\n\nDevelopers report that the convention is applied when Claude edits `src/api/index.ts`, but ignored when it edits `src/api/v2/orders/handler.ts`. What is the most likely cause and fix?",
     "options": [
      {
       "id": "A",
       "text": "Rule files only load for files at the top level of a directory; add a copy of the rule as a `CLAUDE.md` in each nested API folder, which also lets each team customize the rule for its own endpoints."
      },
      {
       "id": "B",
       "text": "Add a `scope: recursive` field to the frontmatter so the rule applies to subdirectories."
      },
      {
       "id": "C",
       "text": "The `*` glob does not match across directory boundaries, so the rule only matches files directly in `src/api/`; change the pattern to `src/api/**/*.ts`."
      },
      {
       "id": "D",
       "text": "Move the content into the root `CLAUDE.md` so it applies everywhere."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Path-specific rules activate by matching glob patterns against files in play. A single `*` matches within one directory level only; `**` is needed to match nested directories.",
      "wrong": {
       "A": "Path-scoped rules are not limited to top-level files; the glob determines the match. Copying the rule into many CLAUDE.md files duplicates content and misdiagnoses the problem.",
       "B": "No such frontmatter field exists; path matching is controlled by the glob patterns in `paths`.",
       "D": "This would make the rule apply to every task, defeating conditional loading and adding irrelevant context, and it does not fix the faulty pattern."
      }
     },
     "studyRef": "Task Statement 3.3 (study glob syntax in .claude/rules/ frontmatter)"
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
     "tests": "Using /compact to reduce context usage during extended exploration",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "After two hours exploring a legacy billing codebase, your Claude Code session history is full of Grep and Read output. Responses have become slower and Claude is re-asking questions you already settled, but you still need the conclusions reached in this session. What is the best action?",
     "options": [
      {
       "id": "A",
       "text": "Run `/clear` and start over with an empty conversation."
      },
      {
       "id": "B",
       "text": "Switch to a model with a larger context window and continue the session unchanged, whose bigger window gives the long discovery history room to fit without any need to condense or restart."
      },
      {
       "id": "C",
       "text": "Delete the project `CLAUDE.md` for the rest of the session to free up context."
      },
      {
       "id": "D",
       "text": "Run `/compact`, optionally with instructions about what to preserve, to condense the verbose discovery output while keeping the conclusions."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "`/compact` reduces context usage by summarizing the conversation, which is the intended remedy when an extended exploration session fills with verbose discovery output.",
      "wrong": {
       "A": "`/clear` discards the conclusions you still need; you would have to rediscover them.",
       "B": "A larger window does not fix degradation caused by accumulated, mostly irrelevant tool output.",
       "C": "CLAUDE.md is a small part of context compared to the exploration output, and removing it drops useful project guidance."
      }
     },
     "studyRef": "Task Statement 5.4 (context degradation, /compact, scratchpads)"
    },
    {
     "n": 9,
     "scenario": 2,
     "domain": 1,
     "ts": "1.6",
     "tests": "Decomposing open-ended tasks by mapping structure, prioritizing, and adapting the plan",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "You are asked to add comprehensive tests to a 120k-line legacy codebase that has almost none. Your first attempt was the prompt \"Write tests for everything in `src/`, module by module in alphabetical order.\" After a day, many tests cover trivial utilities while the payment core is untested, and several later modules turned out to depend on helpers that must be refactored before they can be tested. How should you restructure the work?",
     "options": [
      {
       "id": "A",
       "text": "Keep the module-by-module fixed sequence but add a requirement that each module reach 100% line coverage."
      },
      {
       "id": "B",
       "text": "Map structure, prioritize high-impact areas, and adapt the plan as dependencies emerge."
      },
      {
       "id": "C",
       "text": "Split `src/` by top-level directory and have a separate subagent write tests for each directory in parallel with no shared plan."
      },
      {
       "id": "D",
       "text": "Ask Claude to generate tests for the entire codebase in one pass and review the output afterward."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Open-ended tasks call for adaptive decomposition: map structure first, identify high-impact areas, build a prioritized plan, and adjust it as dependencies emerge, rather than following a fixed pre-set sequence.",
      "wrong": {
       "A": "A fixed order ignores risk and dependencies; a coverage target for each module does not fix the prioritization problem.",
       "C": "Parallelizing without a prioritized, adaptive plan still ignores impact and cross-module dependencies discovered along the way.",
       "D": "One enormous pass dilutes attention, offers no prioritization, and cannot adapt to discovered dependencies."
      }
     },
     "studyRef": "Task Statement 1.6 (prompt chaining vs dynamic decomposition)"
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
      "correct": "`/memory` shows which memory files (user, project, directory-level) are actually loaded in a session, so you can see, for example, that conventions live in one developer's `~/.claude/CLAUDE.md` or that a file is missing.",
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
     "tests": "Maintaining scratchpad files to counteract context degradation",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "In a three-hour session mapping a 400-class codebase, Claude initially cited specific classes such as `LedgerReconciler` and `FeeScheduleResolver`. It now answers with generic statements like \"a service layer probably handles this\" and contradicts its earlier findings. What is the most effective mitigation going forward?",
     "options": [
      {
       "id": "A",
       "text": "Have Claude keep a scratchpad file (for example `notes/findings.md`) of key findings such as class names and paths, and consult it for later questions."
      },
      {
       "id": "B",
       "text": "Tell Claude in the next message to try harder to recall the specific classes it found earlier, which costs nothing and tells it plainly what standard of answer you expect from now on."
      },
      {
       "id": "C",
       "text": "Raise the `max_tokens` setting so Claude can give longer, more detailed answers."
      },
      {
       "id": "D",
       "text": "Have Claude re-read all 400 classes to refresh its understanding."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Generic 'typical pattern' answers and inconsistency are symptoms of context degradation. Scratchpad files persist key findings across context boundaries so they can be referenced later.",
      "wrong": {
       "B": "A reminder cannot recover details that have degraded in a long context; persisting them outside the conversation can.",
       "C": "`max_tokens` limits output length; it has no effect on how well earlier findings are retained.",
       "D": "Re-reading everything would consume still more context and worsen the degradation."
      }
     },
     "studyRef": "Task Statement 5.4 (scratchpad files, subagent delegation, /compact)"
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
     "tests": "Summarizing findings from one exploration phase and injecting them into the next phase",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Phase 1 of a refactor, mapping the authentication module, is finished and produced about 80k tokens of exploration output. For phase 2 you will spawn three subagents to implement changes in the session, token, and middleware layers. Each subagent runs with its own isolated context. How should you give them what they need from phase 1?",
     "options": [
      {
       "id": "A",
       "text": "Rely on the subagents inheriting the main conversation history automatically."
      },
      {
       "id": "B",
       "text": "Paste the full 80k-token exploration transcript into each subagent's prompt, so each subagent starts with the complete record of everything that was discovered."
      },
      {
       "id": "C",
       "text": "Tell each subagent to re-explore the authentication module from scratch."
      },
      {
       "id": "D",
       "text": "Write a structured summary of the phase 1 findings (key files, interfaces, constraints) and inject it into each subagent's initial prompt."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Because subagents do not share the parent's context, summarize the key findings from the completed phase and inject them into each subagent's initial prompt.",
      "wrong": {
       "A": "Subagents have isolated context and do not inherit the parent's history.",
       "B": "This floods each subagent's context with mostly irrelevant exploration output, defeating the purpose of isolation.",
       "C": "Re-exploration duplicates the phase 1 work three times and risks inconsistent conclusions."
      }
     },
     "studyRef": "Task Statement 5.4 (phase summaries injected into subagent context; also Task Statement 1.3)"
    },
    {
     "n": 16,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Coordinator dynamically selects which subagents to invoke based on query complexity",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your coordinator always runs the full pipeline (web search, document analysis, synthesis, report generation) for every request. A user asks, \"What year was the Paris Agreement adopted?\" The system takes 90 seconds and uses the same resources as a deep research request. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Add a separately trained classifier in front of the coordinator that labels each request as simple or complex and sets the pipeline depth."
      },
      {
       "id": "B",
       "text": "Skip document analysis for any query shorter than ten words."
      },
      {
       "id": "C",
       "text": "Reduce each subagent's `max_tokens` and lower search depth so the full pipeline finishes faster on every request."
      },
      {
       "id": "D",
       "text": "Have the coordinator invoke only the subagents each query needs, e.g. one web search for a fact."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Coordinators should dynamically select which subagents to invoke based on query complexity rather than always routing through the full pipeline.",
      "wrong": {
       "A": "A new ML component is over-engineered when the coordinator itself can assess complexity and select subagents.",
       "B": "A word-count rule is a brittle heuristic that does not reflect what the query actually requires.",
       "C": "This does not avoid unnecessary subagents and would truncate output for complex research requests."
      }
     },
     "studyRef": "Task Statement 1.2 (coordinator task decomposition and dynamic subagent selection)"
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
     "tests": "Distinguishing access failures from valid empty results",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The web search subagent returns `{\"results\": []}` both when the search API times out after its retries and when a query legitimately matches nothing. The coordinator treats every empty result as \"no coverage needed,\" so reports state \"no evidence found\" for topics that were never actually searched. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Have the subagent raise the timeout to the top-level handler and stop the entire research workflow, on the view that a failed search means the research cannot be trusted and should not continue."
      },
      {
       "id": "B",
       "text": "Return a generic \"results unavailable\" status for every empty response."
      },
      {
       "id": "C",
       "text": "Return a successful empty result when a query has no matches, and a structured failure (failure type, attempted query, partial results, alternatives) for access problems."
      },
      {
       "id": "D",
       "text": "Have the coordinator re-run every query that returns empty three times before accepting the result."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Access failures need retry or recovery decisions, whereas valid empty results are successful queries with no matches. Reporting them differently, with structured error context, lets the coordinator respond correctly.",
      "wrong": {
       "A": "Terminating everything on a single failure is an anti-pattern; the coordinator could recover with other approaches.",
       "B": "A generic status hides the difference between a failed access and a valid empty result and gives the coordinator no recovery information.",
       "D": "Retrying valid empty results wastes calls, and the coordinator still cannot tell failure from absence."
      }
     },
     "studyRef": "Task Statement 5.3 (also 2.2: access failures vs valid empty results)"
    },
    {
     "n": 20,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "Spawning parallel subagents with multiple Task calls in a single coordinator response",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A research request breaks into four independent subtopics. The coordinator issues one Task call, waits for the result, then issues the next, so end-to-end time is roughly four times what a single subtopic takes. What is the correct fix?",
     "options": [
      {
       "id": "A",
       "text": "Set a `parallel: true` option on each AgentDefinition so the SDK runs them concurrently."
      },
      {
       "id": "B",
       "text": "Combine the four subtopics into a single subagent prompt and let one subagent handle them all, with the subagent's longer prompt covering each subtopic in its own labeled section."
      },
      {
       "id": "C",
       "text": "Increase the timeout on each Task call so later subagents are not cut off."
      },
      {
       "id": "D",
       "text": "Have the coordinator emit all four Task tool calls in a single response so the subagents run in parallel."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Parallel subagents are spawned by emitting multiple Task tool calls in one coordinator response, rather than across separate turns.",
      "wrong": {
       "A": "No such AgentDefinition option exists; parallelism comes from multiple Task calls in one coordinator response.",
       "B": "This removes parallelism and loads one subagent with all subtopics, reducing focus.",
       "C": "Timeouts are not the problem; the delay comes from issuing calls across separate turns."
      }
     },
     "studyRef": "Task Statement 1.3 (Task tool, parallel spawning)"
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
     "difficulty": "hard",
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
      "correct": "`\"auto\"` allows text responses, `\"any\"` guarantees a tool call while letting the model choose which, and forced selection names one tool. 'any' fits when multiple tools are valid.",
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
     "tests": "Adding tool results to conversation context between loop iterations",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A web search subagent's loop is shown below. In testing, it repeatedly calls `web_search` with the same query until it times out.\n\n```python\nwhile True:\n    resp = client.messages.create(model=MODEL, tools=TOOLS, messages=messages)\n    if resp.stop_reason == \"end_turn\":\n        break\n    for block in resp.content:\n        if block.type == \"tool_use\":\n            result = run_tool(block.name, block.input)\n            print(result)\n```\n\nWhat is the root cause?",
     "options": [
      {
       "id": "A",
       "text": "The loop has no maximum iteration count, so a cap such as 10 iterations must be added."
      },
      {
       "id": "B",
       "text": "The loop should end when the response contains no text content, rather than on `stop_reason`."
      },
      {
       "id": "C",
       "text": "`tool_choice` should be set to `\"any\"` so the model always calls a tool instead of replying with text."
      },
      {
       "id": "D",
       "text": "Tool results are never appended to `messages`, so the model never sees them."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "In an agentic loop the assistant response and the resulting `tool_result` blocks must be appended to the conversation history so the model can reason about the next action with the new information.",
      "wrong": {
       "A": "A cap would only stop the symptom; the model repeats because it never receives tool results.",
       "B": "Text presence is not a reliable completion signal and does not supply the missing tool results.",
       "C": "The model already calls tools; forcing calls does not give it the results it needs to progress."
      }
     },
     "studyRef": "Task Statement 1.1 (loop lifecycle; tool results in history)"
    },
    {
     "n": 27,
     "scenario": 3,
     "domain": 1,
     "ts": "1.2",
     "tests": "Routing all subagent communication through the coordinator",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The document analysis subagent often finds that a PDF cites a dataset, and it needs the web search subagent to locate the latest version. The team proposes letting subagents message each other directly to avoid coordinator round trips. A previous incident showed that when one subagent failed silently, nobody could tell where the research had stopped. Which approach best fits the system's requirements?",
     "options": [
      {
       "id": "A",
       "text": "Route all subagent communication through the coordinator for observability and consistent error handling."
      },
      {
       "id": "B",
       "text": "Let subagents message each other directly over a shared channel, each logging its own errors and retrying failed requests on its own."
      },
      {
       "id": "C",
       "text": "Give the document analysis subagent the web search tools as well, so it never needs to ask another agent for lookups."
      },
      {
       "id": "D",
       "text": "Create a shared memory store that every subagent can read from and write to freely."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "In the hub-and-spoke pattern, the coordinator manages all inter-subagent communication, error handling, and information routing, which gives observability and control.",
      "wrong": {
       "B": "Direct peer messaging scatters error handling and removes the central visibility that was missing in the incident.",
       "C": "This over-provisions the analysis agent with tools outside its specialization.",
       "D": "An uncontrolled shared store removes controlled information flow and makes failures harder to trace."
      }
     },
     "studyRef": "Task Statement 1.2 (hub-and-spoke architecture)"
    },
    {
     "n": 28,
     "scenario": 3,
     "domain": 1,
     "ts": "1.3",
     "tests": "allowedTools must include Task for a coordinator to invoke subagents",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You defined four subagents with AgentDefinitions (clear descriptions, system prompts, scoped tools). At runtime the coordinator answers research questions on its own and your logs show no Task invocations. What is the most likely cause?",
     "options": [
      {
       "id": "A",
       "text": "The subagents' tool lists are too restrictive for them to start."
      },
      {
       "id": "B",
       "text": "The coordinator's `allowedTools` lacks `\"Task\"`."
      },
      {
       "id": "C",
       "text": "The coordinator's context window is too small to hold four subagent definitions."
      },
      {
       "id": "D",
       "text": "The subagents' system prompts are too long for the Task tool to accept."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "The Task tool is the mechanism for spawning subagents, and the coordinator's `allowedTools` must include \"Task\" for it to delegate.",
      "wrong": {
       "A": "Subagent tool lists affect what they can do after being spawned, not whether the coordinator can invoke them.",
       "C": "Four short definitions would not exhaust context, and that would cause errors, not silent non-delegation.",
       "D": "There is no such limit on subagent prompts that would prevent the Task tool from being used."
      }
     },
     "studyRef": "Task Statement 1.3 (Task tool, allowedTools, AgentDefinition)"
    },
    {
     "n": 29,
     "scenario": 3,
     "domain": 5,
     "ts": "5.6",
     "tests": "Rendering different content types appropriately in synthesis output",
     "difficulty": "medium",
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
     "tests": "Restricting each subagent's tool set to its role",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The report-generation subagent was given 18 tools (web search, `fetch_url`, database queries, file operations, and others). It sometimes runs web searches mid-draft and picks the wrong tool for simple formatting steps. Its real job is to format sections, insert citations, and write the report file. What is the best change?",
     "options": [
      {
       "id": "A",
       "text": "Keep all 18 tools and add prompt rules describing when each should not be used."
      },
      {
       "id": "B",
       "text": "Add few-shot examples for all 18 tools to the subagent's prompt."
      },
      {
       "id": "C",
       "text": "Restrict the subagent to the four or five tools its role needs, and route anything else through the coordinator."
      },
      {
       "id": "D",
       "text": "Insert a routing layer that pre-selects the tool for each step before the model acts."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Agents with too many tools, especially ones outside their specialization, select tools less reliably. Scoped tool access improves reliability.",
      "wrong": {
       "A": "Too many tools increases decision complexity, and prompt rules are probabilistic.",
       "B": "This adds heavy token overhead and does not remove the choice complexity or out-of-role tools.",
       "D": "A routing layer is over-engineered when scoping the tool set solves the problem."
      }
     },
     "studyRef": "Task Statement 2.3 (scoped tool access)"
    },
    {
     "n": 31,
     "scenario": 4,
     "domain": 2,
     "ts": "2.5",
     "tests": "Tracing function usage across wrapper modules: enumerate exported names, then search each",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Your agent must find every caller of an internal event emitter. The function `emitEvent` lives in `lib/telemetry/internal/emit.ts`, but application code imports it through the wrapper `lib/telemetry/index.ts`, which re-exports it under the names `trackEvent` and `logEvent`. Searching only for `emitEvent` finds just two call sites, yet the team knows there are many more. Which TWO steps will most reliably find all callers? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Read the wrapper module to enumerate every exported name that refers to the function, including aliases and re-exports."
      },
      {
       "id": "B",
       "text": "Use Glob with `**/*telemetry*` to find the files that call the function."
      },
      {
       "id": "C",
       "text": "Read every file under `src/` and scan for usages manually."
      },
      {
       "id": "D",
       "text": "Use Grep to search the codebase for each of those exported names, not just the original function name."
      },
      {
       "id": "E",
       "text": "Grep for `emitEvent` with a higher match limit to see more results."
      }
     ],
     "answer": [
      "A",
      "D"
     ],
     "explanation": {
      "correct": "Callers that go through wrapper modules use the exported names, so first identify all exported names (Read), then Grep for each name across the codebase.",
      "wrong": {
       "B": "Glob matches file paths, not file contents, so it finds telemetry-named files rather than callers.",
       "C": "Loading the entire codebase wastes context; targeted Grep is the efficient way to locate usages.",
       "E": "The missing callers do not contain the string `emitEvent`; a larger limit cannot find them."
      }
     },
     "studyRef": "Task Statement 2.5 (Grep vs Glob; tracing usage across wrapper modules)"
    },
    {
     "n": 32,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Exposing content catalogs as MCP resources to reduce exploratory tool calls",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your agent uses a team Postgres MCP server that exposes only a `run_query` tool. On every task the agent spends six to eight tool calls listing tables and describing columns before it writes a useful query. What is the best way to reduce this exploration?",
     "options": [
      {
       "id": "A",
       "text": "Paste a hand-written schema description into each task prompt and update it by hand whenever a migration changes the tables."
      },
      {
       "id": "B",
       "text": "Expose the database schema (tables, columns, relationships) as an MCP resource the agent sees up front."
      },
      {
       "id": "C",
       "text": "Add many specialized `describe_*` tools, one per table."
      },
      {
       "id": "D",
       "text": "Let the agent run `psql` through Bash to inspect the database directly instead of going through the MCP server."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "MCP resources expose content catalogs such as database schemas so agents gain visibility into available data without exploratory tool calls.",
      "wrong": {
       "A": "Hand-maintained copies go stale and require manual effort on each prompt; a resource provides the catalog from the server.",
       "C": "More tools add selection complexity and still require exploratory calls, rather than exposing the catalog.",
       "D": "This bypasses the MCP server's access controls and does not remove the exploratory calls."
      }
     },
     "studyRef": "Task Statement 2.4 (MCP resources vs tools)"
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
     "tests": "Falling back to Read + Write when Edit cannot find unique anchor text",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The agent tries to update a generated configuration file in which the same four-line block appears six times with only whitespace differences. Its `Edit` call fails with an error that the `old_string` matches multiple locations, and no short distinguishing anchor text exists near the target block. What should the agent do?",
     "options": [
      {
       "id": "A",
       "text": "Retry the same `Edit` call with the same `old_string` in case the match was transient."
      },
      {
       "id": "B",
       "text": "Use `Read` to load the full file, then use `Write` to save the file with the intended modification applied."
      },
      {
       "id": "C",
       "text": "Use `Write` with only the replacement block as the content of the file path."
      },
      {
       "id": "D",
       "text": "Use `Glob` to find the file again and then repeat the `Edit`."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`Edit` requires unique text matches. When it cannot find a unique anchor, the reliable fallback is to Read the whole file and Write the modified version.",
      "wrong": {
       "A": "The failure is deterministic: the text is non-unique, so retrying cannot succeed.",
       "C": "Write replaces the whole file, so supplying only the block would destroy the rest of the file.",
       "D": "The file is already located; Glob finds paths and does not resolve the ambiguity in the matched text."
      }
     },
     "studyRef": "Task Statement 2.5 (Edit vs Read + Write)"
    },
    {
     "n": 35,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Project-scoped .mcp.json with environment variable expansion for credentials",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team wants every developer to get the same GitHub MCP server when they clone the repository. Each developer has a personal access token, and the token must never be committed. How should you configure this?",
     "options": [
      {
       "id": "A",
       "text": "Put the token directly in `.mcp.json` and rely on the repository staying private."
      },
      {
       "id": "B",
       "text": "Have each developer add the server, with their own token, to their personal `~/.claude.json`."
      },
      {
       "id": "C",
       "text": "Reference `${GITHUB_TOKEN}` in `.mcp.json`; developers set it locally."
      },
      {
       "id": "D",
       "text": "Define the server in a shared `.claude/mcp-servers.json` file with a `tokenFromEnv` field."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Project-scoped `.mcp.json` is shared through version control, and `${ENV_VAR}` expansion lets each developer supply credentials without committing secrets.",
      "wrong": {
       "A": "Committing a secret exposes it to everyone with repository access and in history, which the requirement forbids.",
       "B": "User-level configuration is not shared via version control, so the team would not receive a common server definition.",
       "D": "No such file or field exists in Claude Code; shared servers are configured in `.mcp.json`."
      }
     },
     "studyRef": "Task Statement 2.4 (.mcp.json vs ~/.claude.json; env var expansion)"
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
       "text": "Rewrite the system prompt with stronger wording and bold capitalization for these two rules, since explicit emphasis on the two rules makes them far more salient than the other instructions."
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
     "tests": "Enhancing MCP tool descriptions so the agent does not prefer built-in tools",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "An MCP server exposes `find_symbol_references`, which understands imports and types across languages. Its description reads \"Finds references.\" The agent almost always uses built-in Grep instead, returning noisy matches from comments and strings. What is the most effective fix?",
     "options": [
      {
       "id": "A",
       "text": "Remove Grep from the agent's available tools."
      },
      {
       "id": "B",
       "text": "Add a system prompt rule: \"Never use Grep.\""
      },
      {
       "id": "C",
       "text": "Expand the MCP tool's description to explain its capabilities, outputs, and when to prefer it over Grep."
      },
      {
       "id": "D",
       "text": "Build a wrapper that intercepts every Grep call and silently redirects it to `find_symbol_references`, which would guarantee the preferred tool is used."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Tool descriptions drive selection. A detailed description of capabilities and outputs prevents the agent from defaulting to familiar built-in tools like Grep.",
      "wrong": {
       "A": "Grep remains valuable for plain text searches; removing it breaks other legitimate uses.",
       "B": "A blunt keyword-style rule is overbroad and can create unintended tool associations.",
       "D": "A redirection layer is over-engineered; a better description lets the model choose correctly."
      }
     },
     "studyRef": "Task Statement 2.4 (descriptions of MCP tools vs built-ins)"
    },
    {
     "n": 38,
     "scenario": 4,
     "domain": 3,
     "ts": "3.1",
     "tests": "Diagnosing CLAUDE.md hierarchy issues (user-level vs project-level)",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "A new developer cloned the repository, but Claude Code ignores conventions that the rest of the team sees applied (use `pnpm`, run `make lint` before finishing). The senior engineer who wrote those instructions placed them in their own `~/.claude/CLAUDE.md`. What is the correct fix?",
     "options": [
      {
       "id": "A",
       "text": "Move the instructions into the project-level `CLAUDE.md` (or `.claude/CLAUDE.md`) and commit it so everyone receives them."
      },
      {
       "id": "B",
       "text": "Ask each new developer to copy the senior engineer's `~/.claude/CLAUDE.md` into their home directory."
      },
      {
       "id": "C",
       "text": "Save the instructions as a command in `.claude/commands/` and ask developers to run it at the start of each session."
      },
      {
       "id": "D",
       "text": "Place the instructions in a `CLAUDE.md` inside the `src/` directory only."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "User-level `~/.claude/CLAUDE.md` applies only to that user and is not shared through version control; team instructions belong in the project-level file.",
      "wrong": {
       "B": "Manual copying drifts and relies on every individual; project-level files are shared automatically.",
       "C": "Commands are invoked manually; always-on conventions belong in CLAUDE.md.",
       "D": "Directory-level files load only when working in that directory, so conventions that apply to the whole repo would still be missed elsewhere."
      }
     },
     "studyRef": "Task Statement 3.1 (hierarchy: user, project, directory; /memory)"
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
     "tests": "Crash recovery using structured agent state exports (manifests)",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "A long-running code migration uses a coordinator and five subagents, one per service. After roughly three hours, the coordinator process crashes, and the rerun begins from scratch, redoing finished work and sometimes making conflicting changes. What design best supports recovery?",
     "options": [
      {
       "id": "A",
       "text": "Log the full chat transcript of every agent to disk and replay all of it to each agent on restart."
      },
      {
       "id": "B",
       "text": "Rely on agents scanning `git diff` on restart to infer what was already done."
      },
      {
       "id": "C",
       "text": "Save a single checkpoint only when the entire migration finishes successfully."
      },
      {
       "id": "D",
       "text": "Have each subagent export state (completed files, pending work, decisions) to a known location; on resume the coordinator loads a manifest of those exports and injects it into agent prompts."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Structured state persistence, with each agent exporting state to a known location and the coordinator loading a manifest on resume, supports reliable crash recovery.",
      "wrong": {
       "A": "Replaying whole transcripts is bulky and unstructured and can reintroduce stale context.",
       "B": "Inferring progress from diffs is unreliable and misses pending work and decisions.",
       "C": "A final-only checkpoint provides nothing to recover from a mid-run crash."
      }
     },
     "studyRef": "Task Statement 5.4 (manifests and state exports)"
    },
    {
     "n": 41,
     "scenario": 4,
     "domain": 1,
     "ts": "1.5",
     "tests": "PostToolUse hooks normalizing heterogeneous data formats",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Two MCP tools return different formats. `get_deploy_status` returns `{\"updated\": 1714000000, \"state\": 2}`, while `get_build_info` returns `{\"finished\": \"2024-04-25T00:26:40Z\", \"state\": \"SUCCESS\"}`. The agent sometimes misorders events and misreads `state: 2`. What is the most reliable fix?",
     "options": [
      {
       "id": "A",
       "text": "Add a system prompt paragraph explaining Unix timestamps and the meaning of each numeric status code, with a worked example."
      },
      {
       "id": "B",
       "text": "Add a PostToolUse hook that normalizes timestamps to ISO 8601 and status codes to labels."
      },
      {
       "id": "C",
       "text": "Create a `convert_format` tool and instruct the agent to call it on the result of every other tool."
      },
      {
       "id": "D",
       "text": "Ask the owners of both MCP servers to adopt the same format before proceeding."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "PostToolUse hooks intercept tool results and transform them, deterministically normalizing heterogeneous formats before the model processes them.",
      "wrong": {
       "A": "This relies on the model applying conversions correctly every time, rather than guaranteeing normalized data.",
       "C": "This adds extra calls and still depends on the agent remembering to use it.",
       "D": "This depends on external teams and delays the fix; normalization can be applied in the agent layer."
      }
     },
     "studyRef": "Task Statement 1.5 (PostToolUse normalization)"
    },
    {
     "n": 42,
     "scenario": 4,
     "domain": 3,
     "ts": "3.2",
     "tests": "Using argument-hint frontmatter to prompt developers for required skill parameters",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team's project skill `/new-endpoint` generates boilerplate for a REST endpoint and needs an endpoint name and an HTTP method. Developers often type `/new-endpoint` with no arguments, and Claude then invents a placeholder such as `exampleEndpoint`. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Add `argument-hint: [endpoint-name] [http-method]` to the skill's frontmatter."
      },
      {
       "id": "B",
       "text": "Move the skill into `~/.claude/skills/` so each developer can customize the default endpoint name locally."
      },
      {
       "id": "C",
       "text": "Set `context: fork` in the frontmatter so the skill runs in isolation and cannot guess values from the main conversation."
      },
      {
       "id": "D",
       "text": "Hard-code a default endpoint name in the skill body."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "The `argument-hint` frontmatter field prompts developers for the required parameters when they invoke the skill without arguments.",
      "wrong": {
       "B": "Personal skills are not shared with the team, and a locally customized default name still lets Claude generate placeholder endpoints.",
       "C": "`context: fork` isolates the skill's output and context; it does not prompt for or require parameters.",
       "D": "A hard-coded default produces wrongly named endpoints that developers must rename; it does not collect the required inputs."
      }
     },
     "studyRef": "Task Statement 3.2 (SKILL.md frontmatter: argument-hint)"
    },
    {
     "n": 43,
     "scenario": 4,
     "domain": 2,
     "ts": "2.4",
     "tests": "Choosing existing community MCP servers for standard integrations",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "Your team wants the agent to search and update Jira issues. A well-maintained community Jira MCP server exists and covers the operations you need. The team's only unusual requirement is a custom internal workflow for release approvals. What is the best plan?",
     "options": [
      {
       "id": "A",
       "text": "Build a fully custom Jira MCP server so you control every detail."
      },
      {
       "id": "B",
       "text": "Have the agent call the Jira REST API through Bash `curl` commands."
      },
      {
       "id": "C",
       "text": "Use the community Jira MCP server for the standard operations, and build a custom MCP server only for the team-specific release-approval workflow."
      },
      {
       "id": "D",
       "text": "Use the community server for all work, including release approvals, by prompting around its limits."
      }
     ],
     "answer": [
      "C"
     ],
     "explanation": {
      "correct": "Existing community MCP servers should be preferred for standard integrations; custom servers should be reserved for team-specific workflows.",
      "wrong": {
       "A": "Reimplementing a standard integration adds maintenance cost with no benefit when a suitable server exists.",
       "B": "This loses structured tool definitions and puts authentication and request construction on the model each time.",
       "D": "Team-specific workflows are what custom servers are for; prompting around gaps is unreliable."
      }
     },
     "studyRef": "Task Statement 2.4 (community vs custom MCP servers)"
    },
    {
     "n": 44,
     "scenario": 4,
     "domain": 1,
     "ts": "1.4",
     "tests": "Decomposing multi-concern requests and investigating in parallel with shared context",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A developer sends one message to the agent: \"Upgrade `lodash` in the API package, regenerate the OpenAPI client, and fix the lint failures in `/scripts`.\" The agent handles it as one blended stream and loses track, leaving the lint fixes half done. What is the best design?",
     "options": [
      {
       "id": "A",
       "text": "Process the request strictly in the order written, in one continuous stream with no separation between the items."
      },
      {
       "id": "B",
       "text": "Split into three items, investigate in parallel with shared context, then synthesize."
      },
      {
       "id": "C",
       "text": "Ask the developer to resend the three tasks as three separate requests, each in a new session."
      },
      {
       "id": "D",
       "text": "Add a system prompt line telling the agent to \"never forget any part of a request\" and to confirm each part at the end."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Multi-concern requests should be broken into distinct items, investigated (in parallel when independent) with shared context, and synthesized into a unified resolution.",
      "wrong": {
       "A": "A single blended stream is the behavior causing lost work; distinct items need separate tracking.",
       "C": "Separate sessions lose shared context and push the burden onto the developer.",
       "D": "A vague instruction does not create a structure for tracking multiple concerns."
      }
     },
     "studyRef": "Task Statement 1.4 (multi-concern decomposition)"
    },
    {
     "n": 45,
     "scenario": 4,
     "domain": 5,
     "ts": "5.1",
     "tests": "Trimming verbose tool outputs to relevant fields before they accumulate",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "An MCP tool `get_ticket` returns about 60 fields per ticket (full history, attachment metadata, audit trail), but the agent only needs `id`, `title`, `status`, `assignee`, and `linked_prs`. After about 25 lookups the context is largely filled with irrelevant fields. What is the best fix?",
     "options": [
      {
       "id": "A",
       "text": "Run `/compact` after every lookup."
      },
      {
       "id": "B",
       "text": "Tell the agent in the system prompt to ignore irrelevant fields, since fields the model has been told to ignore will not affect its reasoning or cost anything."
      },
      {
       "id": "C",
       "text": "Move to a model with a larger context window."
      },
      {
       "id": "D",
       "text": "Trim each tool result to the five relevant fields before it enters the conversation (PostToolUse hook or field-limited tool response)."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Tool results accumulate in context disproportionately to their relevance; trimming them to only the relevant fields before accumulation preserves context.",
      "wrong": {
       "A": "Repeated compaction adds overhead and is lossy; the irrelevant data should never have entered context.",
       "B": "The tokens are still consumed whether or not the model ignores them.",
       "C": "A larger window only delays the problem and does not remove the wasted tokens."
      }
     },
     "studyRef": "Task Statement 5.1 (trimming verbose tool outputs)"
    },
    {
     "n": 46,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Documenting testing standards, valuable test criteria, and fixtures in CLAUDE.md for CI",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "A CI job runs `claude -p` to generate tests for each pull request. The output includes trivial getter tests, recreates helpers that already exist in `tests/fixtures/`, and uses a mocking library the team has banned. What is the most effective way to improve quality?",
     "options": [
      {
       "id": "A",
       "text": "Add a `--strict-tests` flag to the CI command to enforce higher-quality output."
      },
      {
       "id": "B",
       "text": "Generate five candidate test sets per PR and automatically keep the one with the most assertions."
      },
      {
       "id": "C",
       "text": "Filter out any generated test shorter than ten lines with a post-processing script."
      },
      {
       "id": "D",
       "text": "Document test standards and fixtures in the project `CLAUDE.md`."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "CLAUDE.md provides project context (testing standards, fixture conventions, review criteria) to CI-invoked Claude Code, improving test generation quality and reducing low-value output.",
      "wrong": {
       "A": "No such flag exists; project context for CI comes from CLAUDE.md.",
       "B": "Assertion count does not measure test value, and extra runs do not tell Claude about fixtures or banned libraries.",
       "C": "Length filtering is a crude proxy that discards some good tests and still lets bad, long ones through."
      }
     },
     "studyRef": "Task Statement 3.6 (CLAUDE.md as CI context)"
    },
    {
     "n": 47,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Temporarily disabling high false-positive categories while improving prompts",
     "difficulty": "hard",
     "type": "multi",
     "select": 2,
     "stem": "Your PR review bot reports four categories. Measured precision: security 90%, bugs 85%, naming/style 35%, comment accuracy 40%. Developers have started dismissing all bot comments, including the security findings. Which TWO actions best restore trust? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Add \"only report high-confidence findings\" to the prompt for all categories."
      },
      {
       "id": "B",
       "text": "Temporarily disable the naming/style and comment-accuracy categories while their prompts are being improved."
      },
      {
       "id": "C",
       "text": "Keep all categories on but label the bot's comments \"low confidence\" so developers know to be careful."
      },
      {
       "id": "D",
       "text": "Run each review three times and post only findings that appear in at least two runs."
      },
      {
       "id": "E",
       "text": "Rewrite those categories' prompts with explicit criteria (for example, flag a comment only when its claimed behavior contradicts the code) before re-enabling them."
      }
     ],
     "answer": [
      "B",
      "E"
     ],
     "explanation": {
      "correct": "High false-positive categories erode confidence in accurate ones. Disabling them temporarily and then tightening them with specific, explicit criteria restores trust, whereas vague confidence instructions do not.",
      "wrong": {
       "A": "General confidence-based instructions do not improve precision compared with specific categorical criteria.",
       "C": "Labeling does not remove the noisy comments, so the false positives keep undermining trust in the accurate categories.",
       "D": "Consensus voting can suppress real bugs that are caught only intermittently and does not fix the underlying criteria."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit criteria; false positives and developer trust)"
    },
    {
     "n": 48,
     "scenario": 5,
     "domain": 4,
     "ts": "4.5",
     "tests": "Calculating batch submission frequency based on SLA constraints",
     "difficulty": "hard",
     "type": "single",
     "select": 1,
     "stem": "Regression-test suggestions for merged PRs must be delivered within 36 hours of merge. You use the Message Batches API (processing may take up to 24 hours, with no latency guarantee) and submit all PRs merged since the last submission on a fixed schedule. A PR can be merged just after a submission has been sent. What is the longest submission interval that still guarantees the 36-hour requirement?",
     "options": [
      {
       "id": "A",
       "text": "Every 6 hours, because batches should be submitted four times per day."
      },
      {
       "id": "B",
       "text": "Every 12 hours (12 h wait + 24 h processing = 36 h)."
      },
      {
       "id": "C",
       "text": "Every 24 hours, because that matches the batch processing window."
      },
      {
       "id": "D",
       "text": "Every 36 hours, because that equals the required delivery time."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Worst-case latency is the wait for the next submission plus the 24-hour processing window. To guarantee 36 hours, the interval can be at most 36 - 24 = 12 hours.",
      "wrong": {
       "A": "Six hours would meet the requirement but is not the longest interval; it submits more often than necessary.",
       "C": "A PR merged just after a submission would wait up to 24 hours and then up to 24 more, for 48 hours total, breaching the 36-hour limit.",
       "D": "The waiting time alone would consume the whole 36 hours, leaving no time for processing."
      }
     },
     "studyRef": "Task Statement 4.5 (SLA arithmetic for batch windows)"
    },
    {
     "n": 49,
     "scenario": 5,
     "domain": 3,
     "ts": "3.6",
     "tests": "Including prior review findings when re-running reviews to avoid duplicate comments",
     "difficulty": "medium",
     "type": "multi",
     "select": 2,
     "stem": "Your CI review runs on every push to a PR. After each new commit, developers receive duplicate comments about issues that were already flagged earlier or already fixed. Which TWO changes best address this? (Select TWO.)",
     "options": [
      {
       "id": "A",
       "text": "Delete all earlier bot comments before every run so each review starts clean."
      },
      {
       "id": "B",
       "text": "Add a `--dedupe` option to the `claude -p` command."
      },
      {
       "id": "C",
       "text": "Include the prior review findings in the context of each re-run."
      },
      {
       "id": "D",
       "text": "Run the review only on the first push and skip reviews on later commits."
      },
      {
       "id": "E",
       "text": "Instruct Claude to report only new issues or issues from the prior findings that remain unaddressed."
      }
     ],
     "answer": [
      "C",
      "E"
     ],
     "explanation": {
      "correct": "Giving Claude the previous findings and telling it to report only new or still-unaddressed issues prevents duplicate comments across re-runs.",
      "wrong": {
       "A": "This removes review history and resolved threads and does not stop the model from re-reporting already-known issues.",
       "B": "No such CLI option exists.",
       "D": "New commits can introduce new issues; skipping reviews leaves them undetected."
      }
     },
     "studyRef": "Task Statement 3.6 (re-running reviews after new commits)"
    },
    {
     "n": 50,
     "scenario": 5,
     "domain": 4,
     "ts": "4.2",
     "tests": "Few-shot examples distinguishing acceptable patterns from genuine issues",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Your review prompt flags every use of the TypeScript `any` type, and 60% of those findings are false positives: many are justified at third-party SDK boundaries and carry a comment such as `// boundary: untyped SDK`. Adding a list of exceptions to the prompt catches the known cases but fails on new variants. What is the most effective improvement?",
     "options": [
      {
       "id": "A",
       "text": "Expand the exception list to 40 specific patterns covering every variant seen so far, so that each justified variant is handled explicitly by a dedicated rule."
      },
      {
       "id": "B",
       "text": "Add \"be conservative and avoid false positives\" to the prompt."
      },
      {
       "id": "C",
       "text": "Post-filter findings with a regex that drops any line containing the word \"boundary\"."
      },
      {
       "id": "D",
       "text": "Add three or four few-shot examples contrasting acceptable boundary uses with genuine problems, with brief reasoning, so the model generalizes."
      }
     ],
     "answer": [
      "D"
     ],
     "explanation": {
      "correct": "Few-shot examples that distinguish acceptable patterns from genuine issues reduce false positives while letting the model generalize judgment to novel patterns.",
      "wrong": {
       "A": "Enumerated rules match only the pre-specified cases and will keep failing on new variants.",
       "B": "Vague conservatism instructions do not improve precision compared with concrete examples and criteria.",
       "C": "A text filter is brittle and misses justified uses that are phrased differently."
      }
     },
     "studyRef": "Task Statement 4.2 (few-shot for ambiguous cases and generalization)"
    },
    {
     "n": 51,
     "scenario": 5,
     "domain": 4,
     "ts": "4.4",
     "tests": "Adding detected_pattern fields to analyze false-positive patterns from dismissals",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "Developers dismiss about 30% of the review bot's findings, but you cannot tell which kinds of code constructs are producing the dismissed findings. What change best enables systematic analysis?",
     "options": [
      {
       "id": "A",
       "text": "Add a `detected_pattern` field naming the construct behind each finding; analyze dismissals by pattern."
      },
      {
       "id": "B",
       "text": "Require developers to write a free-text explanation each time they dismiss a finding, then read the explanations monthly."
      },
      {
       "id": "C",
       "text": "Lower the severity of all findings so dismissals matter less."
      },
      {
       "id": "D",
       "text": "Log the full text of every review and have an engineer periodically read samples to look for recurring false positives."
      }
     ],
     "answer": [
      "A"
     ],
     "explanation": {
      "correct": "Structured findings with a `detected_pattern` field let you group dismissed findings by trigger and identify false-positive patterns to fix.",
      "wrong": {
       "B": "Free-text explanations are costly and hard to aggregate, and they still do not identify the triggering construct systematically.",
       "C": "Changing severity labels does not reveal which patterns are producing false positives.",
       "D": "Manual reading does not scale and lacks a structured field to group by."
      }
     },
     "studyRef": "Task Statement 4.4 (detected_pattern feedback loop)"
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
     "tests": "Using --output-format json with --json-schema for machine-parseable findings",
     "difficulty": "easy",
     "type": "single",
     "select": 1,
     "stem": "You want CI to post each Claude Code review finding as an inline PR comment, which requires reliably parsing file, line, severity, and message from the output. Currently the job parses free-form text using regular expressions and breaks on small wording changes. What is the best approach?",
     "options": [
      {
       "id": "A",
       "text": "Add \"respond only in JSON\" to the prompt and parse the text with `json.loads`."
      },
      {
       "id": "B",
       "text": "Run `claude -p` with `--output-format json` and `--json-schema` for the findings structure, then post comments from the parsed JSON."
      },
      {
       "id": "C",
       "text": "Use a more elaborate regular expression that handles more wording variants."
      },
      {
       "id": "D",
       "text": "Pass `--format github-comments` so the CLI posts the comments directly."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "`--output-format json` with `--json-schema` yields machine-parseable structured findings in CI that can be posted automatically as inline PR comments.",
      "wrong": {
       "A": "A prompt instruction does not enforce a schema; malformed or extra text can still break parsing.",
       "C": "Regexes over free text remain fragile and tied to specific wording.",
       "D": "No such flag exists; structured output is controlled with `--output-format` and `--json-schema`."
      }
     },
     "studyRef": "Task Statement 3.6 (CLI flags for CI output)"
    },
    {
     "n": 54,
     "scenario": 5,
     "domain": 4,
     "ts": "4.1",
     "tests": "Defining explicit severity criteria with concrete code examples",
     "difficulty": "medium",
     "type": "single",
     "select": 1,
     "stem": "The review bot labels similar null-dereference issues \"critical\" in some PRs and \"minor\" in others, so developers cannot triage reliably. The prompt currently says \"assign an appropriate severity.\" What change best produces consistent classification?",
     "options": [
      {
       "id": "A",
       "text": "Ask the model to attach a self-rated confidence score from 1 to 10 to each finding and sort by it."
      },
      {
       "id": "B",
       "text": "Define explicit criteria per severity level, each with a concrete code example."
      },
      {
       "id": "C",
       "text": "Add \"use severity conservatively\" to the prompt."
      },
      {
       "id": "D",
       "text": "Map severity automatically from the directory of the changed file in a post-processing step, e.g. `payments/` is critical."
      }
     ],
     "answer": [
      "B"
     ],
     "explanation": {
      "correct": "Consistent severity classification requires explicit severity criteria with concrete examples for each level, rather than vague instructions.",
      "wrong": {
       "A": "Confidence is not severity, and self-reported scores are poorly calibrated for this purpose.",
       "C": "A general instruction does not define the boundaries between levels.",
       "D": "File location does not reflect the actual impact of a given issue."
      }
     },
     "studyRef": "Task Statement 4.1 (explicit severity criteria)"
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
     "difficulty": "hard",
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
     "difficulty": "medium",
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
     "difficulty": "hard",
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
