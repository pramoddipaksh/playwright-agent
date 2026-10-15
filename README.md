# Playwright Agents & MCP: AI Agents in VS Code with GitHub Copilot

## GenAI integration with the Playwright framework

This project demonstrates how GitHub Copilot agent mode, custom Playwright
testing agents, and the Playwright MCP server can work together to explore an
application, plan coverage, generate browser tests, and investigate failures.
It applies that workflow to the GreenKart shopping demo:
<https://rahulshettyacademy.com/seleniumPractise/#/>.

The outcome is both a set of runnable Playwright end-to-end tests and a practical
example of prompt-driven AI test engineering. The tests cover catalog search,
product quantity controls, cart totals, invalid promo codes, order checkout, and
the Top Deals offers table and delivery-date picker.

**Project highlights:** Playwright MCP · GitHub Copilot agent mode · custom
Planner/Generator/Healer roles · prompt-driven test planning and generation ·
live browser validation · Playwright Test execution

## Contents

- [Requirements and installation](#requirements)
- [Running the tests](#run-the-tests)
- [Test coverage](#test-coverage)
- [GenAI integration with Playwright and Copilot](#generative-ai-integration-with-playwright-and-github-copilot)
- [What MCP is and how it helps](#what-mcp-is-and-how-playwright-mcp-helps)
- [Agent roles and built-in vs. custom agents](#playwright-agent-roles-and-how-they-work)
- [How agents work under the hood](#how-the-agent-workflow-works-under-the-hood)
- [Setting up agents and chat modes](#setting-up-agents-and-choosing-a-copilot-chat-mode)
- [Workflow used in this project](#workflow-used-for-this-project)
- [Prompt examples and reusable templates](#prompt-examples-and-prompt-engineering-approach)

## Requirements

- Node.js and npm
- The demo site must be reachable from your machine

## Install

Install the project dependencies and the Playwright browsers:

```bash
npm install
npx playwright install
```

## Run the tests

Run the complete Playwright suite:

```bash
npx playwright test
```

Run only the GreenKart tests:

```bash
npx playwright test tests/catalog-and-cart
```

Run an individual test file:

```bash
npx playwright test tests/catalog-and-cart/promo-code.spec.ts
```

Run tests in one browser project:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

By default, Playwright runs headless. To watch the browser while tests run, use
headed mode:

```bash
npx playwright test --headed
```

To open the HTML report after a run:

```bash
npx playwright show-report
```

## Test coverage

The `tests/catalog-and-cart/` directory contains:

- `catalog-search.spec.ts` — matching and unmatched product searches
- `quantity-and-cart-calculations.spec.ts` — quantity stepper behavior and cart calculations
- `empty-cart.spec.ts` — empty-cart messaging and checkout gating
- `promo-code.spec.ts` — invalid promo-code feedback and unchanged totals
- `order-checkout.spec.ts` — country selection, terms consent, and order completion
- `offers-table.spec.ts` — Top Deals sorting, searching, and pagination
- `offers-delivery-date.spec.ts` — delivery-date selection and clearing

Each test is designed to start independently with a fresh Playwright page and
builds any required cart state within the test.

## Generative AI integration with Playwright and GitHub Copilot

GitHub Copilot agent mode was used in VS Code to coordinate browser exploration,
scenario planning, test generation, and failure investigation. The project
defines focused agent profiles in `.github/agents/`; their instructions specify
each role's objective and allowed tools. The agents can inspect and operate the
live application through MCP, then create or repair ordinary Playwright test
files.

This is an example of **GenAI-assisted test authoring**, not an AI dependency in
the test runtime: generated specs use `@playwright/test` and run with the normal
Playwright Test runner. A Copilot subscription/extension and MCP-capable VS Code
environment are needed for the authoring workflow, but not to execute the
already-generated tests.

### What MCP is and how Playwright MCP helps

The Model Context Protocol (MCP) is a standard way for an AI client to discover
and call tools exposed by a separate server. Here, VS Code/Copilot acts as the
MCP client and the Playwright MCP server exposes browser and test-runner
capabilities to the agent. This lets an agent ground its work in the live page:
it can navigate, inspect accessible snapshots, interact with controls, and
observe results instead of guessing selectors and behavior from a description
alone.

The project-level `.vscode/mcp.json` registers a server named `playwright-test`
and launches it over standard input/output (stdio) with:

```text
npx playwright run-test-mcp-server
```

The agent profile frontmatter also declares which MCP server to connect to and
which tools are available to that role. At a high level, the workflow is:

1. Copilot loads the selected agent profile and its instructions.
2. The agent requests a browser or test operation using an MCP tool.
3. The MCP client forwards that tool call to the Playwright MCP server.
4. The server performs the operation and returns page state, test output, or
   other results to the agent.
5. The agent uses that observed result to decide the next action or produce an
   artifact, such as a test plan or a Playwright spec.

Install the project dependencies first with `npm install`. The MCP server and
Copilot are used for the AI-assisted authoring workflow; the generated test
files can be run without MCP.

### Playwright agent roles and how they work

This repository contains three **custom Copilot agent profiles**:

- [Planner](.github/agents/playwright-test-planner.agent.md) — explores the
  application, identifies user journeys and edge cases, and saves a structured
  plan with steps and expected outcomes.
- [Generator](.github/agents/playwright-test-generator.agent.md) — follows
  planned scenarios, exercises each step in the browser, reads the interaction
  log, and writes a focused Playwright spec.
- [Healer](.github/agents/playwright-test-healer.agent.md) — runs tests,
  investigates failures with test/debug and browser tools, edits the failing
  spec, and reruns it to verify a repair.

These are repository-defined roles built from agent instructions and tool
access; they should not be confused with Playwright Test's normal test runner
or represented as built-in Playwright agents. Playwright Test itself supplies
the test runner and assertions; the three agent roles here are custom Copilot
agents defined by this repository. The `.agent.md` profiles describe each role
and workflow. Copilot uses those instructions together with the selected model
and available MCP tools to perform the task step by step.

#### Built-in Playwright agents vs. this project's agents

The names **Planner**, **Generator**, and **Healer** describe the roles used in
this workflow, not features that are automatically provided by
`@playwright/test`. In this repository, they are Copilot custom agents stored
under `.github/agents/` and wired to browser/test tools through MCP. Playwright
Test is the automation framework and runner; Copilot supplies the AI
orchestration; MCP connects that orchestration to tools. Keeping these roles
separate makes it clear which pieces are part of this repository and which are
provided by Playwright or VS Code.

**What was exercised for this project:**

| Capability | Project evidence | Used in this work |
| --- | --- | --- |
| Planner role | Live-site exploration and saved test plan | Yes |
| Generator role | Browser walkthroughs and seven generated specs | Yes |
| Playwright MCP | Browser interaction and Playwright test/debug tools | Yes |
| Healer role | Reusable custom profile for run/debug/repair/verify | Profile included; the promo-code fix used MCP test/debug tools rather than invoking the Healer profile as a separate agent |
| Playwright Test | Executes the generated TypeScript specs | Yes |

#### How the agent workflow works under the hood

An agent profile is not a separate test framework. It combines:

- **Role instructions** in the Markdown body: the objective, workflow, quality
  rules, and expected artifacts.
- **Tool declarations** in frontmatter: the capabilities that role may use,
  including browser interactions, test execution, or file editing.
- **MCP server configuration**: the connection to the Playwright MCP server
  that implements the browser and test tools.
- **Copilot agent orchestration**: the model interprets the user's prompt,
  follows the role instructions, calls tools as needed, and uses their results
  to determine the next action.

For example, the Generator's instructions require it to exercise a planned flow
in the browser, retrieve the interaction log, and then write the corresponding
test. The Healer instructions call for running/debugging the test, investigating
the page and failure, editing the test, and verifying the repair. The detailed
instructions live in the linked `.agent.md` files, so they can be reviewed and
adapted with the project.

### Setting up agents and choosing a Copilot chat mode

In a compatible VS Code installation with GitHub Copilot Chat and MCP support:

1. Open this repository as the workspace and install dependencies with
   `npm install`.
2. Start or enable the `playwright-test` MCP server from the project's
   `.vscode/mcp.json` when VS Code prompts or when managing MCP servers.
3. Open Copilot Chat and choose the relevant repository agent from the agent
   picker: **Playwright Test Planner**, **Playwright Test Generator**, or
   **Playwright Test Healer**.
4. Give the selected agent a bounded task, the relevant test plan/scenario, and
   concrete expected results. Review its plan or changes, then run the resulting
   tests with Playwright.

Copilot Chat has different interaction modes and agent selection controls
depending on the VS Code/Copilot version. This repository specifically
contributes the three custom agent profiles above; it does not redefine all
Copilot chat modes. A useful mental model for the common choices is:

| Chat mode | Typical role | Fit for this project |
| --- | --- | --- |
| Ask | Explain code, answer questions, or suggest an approach. | Useful for understanding the app, tests, or MCP configuration. |
| Edit | Make a user-directed code change. | Useful for a focused test or documentation edit. |
| Agent | Plan and carry out a multi-step task, calling tools when needed. | Use with the Planner, Generator, or Healer profile for browser exploration and test workflows. |

Names and available modes can change across Copilot/VS Code versions. The custom
agent picker entries in this repository define the three specialized roles;
they are not replacements for every built-in chat mode.

### Workflow used for this project

1. **Planner — explore and plan:** The planning workflow explored the live GreenKart site
   using browser snapshots and interactions. It identified the catalog, cart,
   checkout, policy, offers table, and date-picker flows. The resulting scenarios
   and expected outcomes are recorded in
   [`tests/selenium-practise-test-plan.md`](tests/selenium-practise-test-plan.md).
2. **Generator — create scripts from the plan:** The generation workflow followed the scenarios,
   performed the interactions in a real browser, and created the seven specs in
   [`tests/catalog-and-cart/`](tests/catalog-and-cart/).
3. **Run and investigate:** Playwright test tools ran the specs and exposed issues
   such as whitespace-sensitive cart assertions, ambiguous multi-row locators,
   and asynchronous promo-code feedback. Those assertions and waits were
   adjusted, then the tests were rerun. For the promo-code case, the invalid-code
   response timeout was increased and the spec subsequently passed in Chromium.

4. **Healer role — repair workflow:** The Healer profile documents a repeatable
   run, debug, inspect, edit, and verify process. For the promo-code failure
   described above, investigation and reruns were performed using MCP
   test-runner/debug tools; the custom Healer agent profile was not invoked as a
   separate agent during that particular fix.

The generated specs are standard Playwright tests and do not call an AI model or
require the MCP server when they run. MCP and agent mode support the authoring
and maintenance workflow; `npx playwright test` executes the tests.

### Prompt examples and prompt-engineering approach

The workflow used focused prompts with a clear deliverable, application URL,
scope, and observable expected outcomes. The following are the project requests
used during this work, followed by representative scenario instructions sent to
the planner/generator workflow.

#### Project-level requests

These requests were given during the project:

> Explore the app and create test plan for https://rahulshettyacademy.com/seleniumPractise/#/

> add tests for ### 1. Catalog and cart

> can you run the tests which you created and show me results

> the test which failed, please investigate and fix.

> reran in chromium headed mode to see it

#### Planner instruction

The planning request gave the target URL and asked for exploration and a
structured test plan. For example:

> Explore the app and create test plan for https://rahulshettyacademy.com/seleniumPractise/#/

The planner then explored the actual app and saved scenarios with steps and
expected results. The saved plan is the source of truth for test scope:
[`tests/selenium-practise-test-plan.md`](tests/selenium-practise-test-plan.md).

#### Generator scenario instructions

The generator was given individual plan scenarios, not just a request to
"generate tests." These examples show the detailed actions and expected behavior
provided for the **Catalog and cart** suite:

> ### 1. Catalog and cart  
> #### Search catalog for matching and non-matching products  
> 1. Open the app from its base URL in a fresh browser context and confirm the catalog loads with product cards and an empty-cart item/price summary.  
> 2. Enter a known partial term such as "apple" in the catalog search field.  
> 3. Replace the query with a unique unmatched term, such as "zzzz-no-match".  
> 4. Clear the search query.  
> Verify the catalog displays product names, prices, quantity steppers, and Add to Cart actions; matching search filters to Apple; no match displays the no-matching-products message; clearing restores the full catalog.

> ### 1. Catalog and cart  
> #### Add a multi-quantity item and verify cart calculations  
> 1. Open the app from its base URL in a fresh browser context and inspect the first product and empty cart.  
> 2. Increase Brocolli - 1 Kg quantity once.  
> 3. Add it to cart.  
> 4. Open the cart preview and proceed to the cart page.  
> 5. Return to a fresh catalog state and decrement the first product at quantity 1.  
> Verify quantity starts at 1, increments to 2, item count is 1, line total equals quantity multiplied by unit price, cart total matches, and decrement does not go below 1.

This pattern made the output testable: it specified the starting state, user
actions, test data, boundary conditions, and assertions in advance. The
generator then exercised each flow in the browser before writing the matching
Playwright spec.

#### Reusable prompts for future work

The following are **prompt templates for future runs**, not claims that these
exact expanded prompts were used in this session. Replace bracketed values with
the target app, scenario, and paths before sending them to the corresponding
agent in Copilot Chat:

**Planner**

> Explore [application URL] using the browser tools. Map the main user journeys,
> forms, navigation, and validation behavior. Create an independent test plan
> grouped by feature, with numbered actions and observable expected results.
> Include happy paths, negative cases, and boundary conditions. Save the plan
> to [plan path]. Do not write test code yet.

**Generator**

> Use [plan path] and implement the scenario "[scenario name]" in
> [destination spec path]. First exercise every step in the browser using the
> Playwright MCP tools. Then write a single Playwright Test spec using
> `@playwright/test`, resilient locators, and assertions for the stated expected
> results. Keep the test independent and do not use fixed sleeps. Do not change
> unrelated files.

**Healer**

> Run [failing spec path] and investigate the failure using the test/debug and
> browser tools. Identify whether the root cause is the test, selector, timing,
> data, or application behavior. Make the smallest justified test-only fix,
> rerun the spec, and report the original cause, the change, and the final
> result. Do not hide a real failure by skipping or weakening the assertion.

#### Failure-investigation instruction

When a generated test failed, the follow-up request was scoped to the failing
test and asked for diagnosis and repair:

> the test which failed, please investigate and fix.

For example, the promo-code test initially asserted on the invalid-code message
with the default short timeout. Browser runs showed that this response is
asynchronous, so the assertion was given a longer timeout and the test was
rerun. This documents the actual repair workflow; it does not imply the custom
Healer agent was invoked for that fix.

## Notes

- The tests interact with a live external demo, so availability and response time
  depend on that site and the network connection.
- The demo may change its content or behavior independently of this repository.
- Promo-code validation is asynchronous; its test allows additional time for the
  response.

## Author
pramoddipaksh
