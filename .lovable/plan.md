## Updated understanding of the requirement

You are not saying “never create structured data for small practice.” You are saying:

```text
For <=10 MCQs:
  Do not create a separate visible artifact card in the right artifact pane.
  Do render an inline interactive question UI inside the chat itself.
```

So the distinction is:

```text
Wrong interpretation:
  <=10 questions should be plain AI chat text only.

Correct interpretation:
  <=10 questions should become an inline chat interaction, not a right-pane artifact card.
```

That means we need a structured internal representation for the questions, but it should be treated as an **inline chat activity**, not as a full right-side artifact.

Your second clarification is even more important:

```text
Router should run only when deciding the first message / session entry.
After a session is active, normal replies should stay in the same thread.
```

So the root rule becomes:

```text
No current thread / first intent -> activate router
Inside an active thread -> continue same thread by default
Only explicit “new topic / new tool / start fresh” should invoke router again
```

This is the core fix. The previous design still routed every message, which is why the bug kept coming back.

---

# Root problem

The current Copilot treats the chat composer as if every message is a new intent that needs routing.

That is wrong for an active tutoring session.

In a live learning session, messages like these are not new intents:

```text
A
B
I think option C
next
explain this
yes
start day 2
continue
I did not understand
```

They are continuations of the current thread.

Currently, the platform does this:

```text
Every user message -> routeMessage() -> classify intent/scope -> maybe switch/create thread
```

What it should do:

```text
No active thread -> routeMessage()
Active thread -> send in same thread
Explicit new intent -> routeMessage()
Explicit new chat -> create fresh thread
```

---

# Correct architecture going forward

## Session decision model

```text
User sends message
      |
      v
Is there an active current thread?
      |
      |-- No --> Router decides thread/tool/scope
      |
      |-- Yes --> Is this explicitly a new session request?
                    |
                    |-- No --> Continue current thread directly
                    |
                    |-- Yes --> Router decides new thread/tool/scope
```

## Inline practice model

```text
Small practice <=10 questions
  -> Stored/handled as inline activity
  -> Rendered inside chat
  -> Not shown as right-pane artifact card

Large practice >10 questions
  -> Can be a full practice artifact
  -> May appear in right pane
```

This preserves your intention: small MCQ practice feels like a live chat exercise, not a separate document/card.

---

# Phase-wise implementation plan

## Phase 1 — Fix the router root behavior

### Goal
Stop the platform from treating every message as a new routing event.

### Changes
Create two separate send paths in `StudentCopilotPage.tsx`:

```text
sendWithRouter(text, images?)
  - Used only when no thread exists or user explicitly starts a new intent.

sendInCurrentThread(text, images?)
  - Used for all normal follow-up messages inside the active thread.
  - Does not call routeMessage().
```

Current behavior:

```text
handleSend -> always routeMessage
```

New behavior:

```text
handleSend -> decide:
  if no currentThread: sendWithRouter
  else if explicit new intent: sendWithRouter
  else: sendInCurrentThread
```

### Explicit new intent examples
These can still activate the router:

```text
new chat
start fresh
create a new study plan for chemistry
give me 10 MCQs on organic chemistry
switch to maths
show my progress
prepare me for JEE Main
```

### Continuation examples
These should not activate the router:

```text
A
B
option C
next
yes
no
explain this
why is this wrong?
continue
start day 2
teach this topic
I did not understand
```

### Expected result
Once the user is inside a Copilot session, replies stay in that same session. This directly fixes the “every answer opens a new chat” bug.

---

## Phase 2 — Create an inline activity contract for small practice

### Goal
Make <=10 MCQs interactive inside chat without showing a separate artifact card in the right pane.

### Current issue
The backend prompt currently tells the AI:

```text
<=10 practice: do not create artifact; write question/options in chat
```

That produces plain text and gives the UI nothing reliable to render.

### New rule
For small practice, the AI should return structured practice data, but mark it as inline-only.

Possible internal shape:

```text
type: practice_session
presentation: inline
show_in_artifact_pane: false
questions: [...]
```

### Important distinction
This is still “not a separate artifact” from the user’s perspective because:

- It will not appear as a card in the right artifact pane.
- It will render directly below the assistant message in the chat.
- It behaves like an inline exam/practice widget.

### Expected result
When user asks:

```text
5 MCQ questions on Kinematics
```

The chat shows:

```text
Here are 5 Kinematics MCQs. Try them one by one.
[Inline question card appears here]
```

Not:

```text
Q1 ...
A ...
B ...
C ...
D ...
```

---

## Phase 3 — Update backend Copilot prompt and tool contract

### Goal
Align AI output with the UI contract.

### Backend prompt change
Replace the current small-practice instruction with:

```text
For practice requests of 1-10 questions:
- Use create_practice_session with presentation='inline'.
- Keep assistant text short.
- Do not dump all options into the chat message.
- The UI will render questions/options interactively inside chat.

For practice requests above 10 questions:
- Use create_practice_session with presentation='artifact'.
- This may appear in the artifact pane.
```

### Tool schema change
Extend `create_practice_session.content` with optional metadata:

```text
presentation: 'inline' | 'artifact'
show_in_artifact_pane: boolean
```

### Expected result
The AI and UI stop fighting each other. The backend produces structured data; the frontend decides where it appears.

---

## Phase 4 — Fix MCQ option and answer data model

### Goal
Make answer checking reliable.

### Current bug
Options may be stored as:

```text
[{ label: 'A', text: '...' }]
```

But the inline hook converts them to:

```text
['option text']
```

Then it compares:

```text
option text === answer
```

This breaks when the answer is `A`, `B`, `C`, or `D`.

### New canonical format
Use this inside `useInlinePractice` and `InlinePracticeCard`:

```text
question: string
options: [
  { label: 'A', text: '...' },
  { label: 'B', text: '...' }
]
correctLabel: 'B'
correctText: '...'
explanation: string
```

### Answer checking
When a student clicks option B:

```text
selectedLabel === correctLabel
```

No fragile text comparison.

### Expected result
Correct/wrong feedback becomes accurate even when the AI stores answers as labels.

---

## Phase 5 — Redesign inline MCQ interaction UI

### Goal
Make the inline practice feel like an exam interaction, not a normal chat paragraph.

### UI behavior
For each question:

```text
Question 1 of 5
Question text
A option card
B option card
C option card
D option card
```

After selection:

```text
If correct:
  Show green selected option
  Show short explanation
  Show Next button

If wrong:
  Show red selected option
  Highlight correct option in green
  Show “Not quite — here is why” explanation/hint
  Show Next button
```

### Responsive layout
Because student panel must be mobile/tablet-first:

```text
Mobile: one option per row
Tablet/Desktop: two-column options only if enough width
```

### Expected result
The student selects options directly; they do not type A/B into the composer for inline MCQs.

---

## Phase 6 — Hide inline practice from the right artifact pane

### Goal
Prevent small MCQs from becoming separate right-pane cards.

### Changes
Update `StudentArtifactPane` filtering:

```text
if artifact.type === 'practice_session' and content.presentation === 'inline'
  do not show in artifact pane
```

Or if implemented as a separate inline activity type:

```text
inline activities are rendered only in ChatMessageList
```

### Expected result
Small practice appears only in chat. The artifact pane remains clean.

---

## Phase 7 — Make study-plan Start continue the same session

### Goal
Fix Day 1 / Day 2 / task Start creating new chats.

### Current behavior
Study-plan task Start does:

```text
handleSend('Teach me about: ...')
```

That can hit the router and create/switch thread.

### New behavior
Study-plan task Start uses:

```text
sendInCurrentThread(
  'Continue this study plan. Start Day 2 Task 1: ...'
)
```

No router.

### Additional context
Include metadata in the message or extra system context:

```text
study_plan_artifact_id
day_index
item_index
task title
```

### Expected result
Every Start button continues the existing study-plan thread.

---

## Phase 8 — Wire study-plan task completion persistence

### Goal
Make study plan progress stable.

### Changes
Use existing APIs:

```text
fetchStudyTaskCompletions
markStudyTaskComplete
```

Add state:

```text
completedTasksByArtifactId
```

Pass the correct task set into `StudyPlanView` based on the selected plan artifact.

### Expected result
Completed tasks stay checked and are tied to the correct plan.

---

## Phase 9 — Clean session rail behavior

### Goal
Prevent “Active 41” and noisy demo sessions.

### Root issue
Old generated/router-created sessions remain in the backend and the rail displays too many of them.

### Fix
Implement a display-level cleanup policy:

```text
Active:
  show only active, useful, scoped sessions
  cap visible rows initially

Recent:
  show finished or idle recent sessions

Archived:
  show older sessions
```

For unscoped/generated sessions:

```text
If they are stale or generic, do not keep them in Active.
```

### Optional backend cleanup
If allowed during implementation, add a cleanup/backfill step that marks old generated sessions as recent/archived instead of active.

### Expected result
Left rail becomes readable and demo-friendly.

---

## Phase 10 — End-to-end validation checklist

Validate these exact flows:

### Flow A — First message starts routed practice

```text
1. Enter Copilot with no current thread.
2. Type: 5 MCQ questions on Kinematics.
3. Router runs once.
4. Practice session starts.
5. Inline MCQ card appears.
6. Right artifact pane does not show a separate small-practice card.
```

### Flow B — Answer does not create new chat

```text
1. Select option A/B/C/D in inline card.
2. Feedback appears in same card.
3. No new thread appears.
4. Active count does not increase.
5. Current thread remains selected.
```

### Flow C — Normal follow-up stays in thread

```text
1. Type: explain this.
2. Message stays in same thread.
3. Router is not called.
```

### Flow D — Explicit new intent can still route

```text
1. Inside Physics practice, type: create a 7-day chemistry study plan.
2. Router is allowed to create/switch session because this is clearly a new intent.
```

### Flow E — Study plan continuation

```text
1. Generate or open a study plan.
2. Click Day 2 Start.
3. Same study-plan thread continues.
4. No new chat opens.
```

### Flow F — Left rail sanity

```text
1. Active/Recent/Archived are visible.
2. Active is not polluted with dozens of generated sessions.
3. Inline practice does not create right-pane clutter.
```

---

# Implementation priority

```text
Phase 1: Router root fix
Phase 2: Inline activity contract
Phase 3: Backend prompt/tool contract
Phase 4: MCQ answer model
Phase 5: Inline UI polish
Phase 6: Hide inline practice from artifact pane
Phase 7: Study-plan continuation
Phase 8: Study task persistence
Phase 9: Left rail cleanup
Phase 10: Validation
```

The most important architectural correction is:

```text
Router is for session selection, not for every message.
```

Once that is fixed, the Copilot will behave like a continuous tutor instead of repeatedly starting new chats.