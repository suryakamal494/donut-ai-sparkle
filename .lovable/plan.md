## What I understood

You are pointing to three connected Copilot problems, not one isolated UI issue:

1. **Inline MCQ practice is not behaving like an interactive exam/practice card.**
   - You ask for “5 MCQ questions on Kinematics”.
   - The assistant text currently includes the question and options inside the chat bubble itself.
   - You want the question to appear inline, but the options should be selectable UI controls.
   - After selecting an option, the UI should show whether it is correct or wrong, explain/hint if wrong, then move to the next question.

2. **The Copilot session is not maintaining continuity.**
   - When you answer a practice question, the system routes that answer like a brand-new chat message.
   - Because a short answer such as “A” or “B” has no subject/chapter context, the router classifies it as a new generic doubt/chat.
   - Result: every answer or study-plan task can open or switch to another chat instead of staying inside the current session.

3. **Study plan task flow is also losing context.**
   - A generated study plan should have one persistent learning chat/session.
   - Clicking Day 1, Day 2, or any “Start” button should continue inside the same plan thread.
   - Right now, each Start action is sent through the generic router and can create a new chat instead of continuing the plan.

4. **The left rail/demo data is polluted.**
   - Active showing 41 means the rail is being filled by too many generated/demo/router-created sessions.
   - Some of those sessions and chart/progress artifacts are not useful for the demo experience.
   - The left rail should show a small, meaningful set of conversations, not every artifact/chart/demo item.

## Root cause

The current Copilot architecture routes almost every user action through the same `handleSend -> sessionRouter.route()` path.

That is correct for normal free-text questions, but wrong for structured interactions.

Structured actions need to stay bound to their parent context:

```text
Practice artifact answer
  should update the practice card only
  should not route as a new chat

Study plan Start button
  should continue the same study-plan thread
  should not create a new thread

Follow-up inside an existing active thread
  should prefer the current thread unless the user clearly asks for a different topic/tool
```

The second issue is that the backend prompt currently tells the AI that small practice sessions should be written directly in chat text. That is why the question/options are being printed inside the assistant message instead of consistently becoming an interactive practice artifact/card.

## Implementation plan

### 1. Make small MCQ practice always render as interactive inline cards

Update the Copilot AI instructions and tool behavior so requests like:

- “5 MCQ questions on Kinematics”
- “Give me 5 MCQs”
- “Quick quiz on Kinematics”

create a `practice_session` artifact instead of dumping all questions/options into assistant text.

The chat reply should be short, for example:

```text
Here are 5 Kinematics MCQs. Try them one by one below.
```

Then the inline card handles:

- Question number: `Question 1 of 5`
- Question text only once
- Selectable options as buttons/cards
- Correct/wrong feedback
- Explanation/hint after answer
- Next button
- End summary after the last question

### 2. Fix MCQ option normalization

The current normalizer converts options into `{ label, text }`, but the inline practice hook partly flattens them back to strings. This causes answer matching issues because the correct answer may be stored as `A`, while the selected option value may be the full option text.

I will make the inline practice model canonical:

```text
question: string
options: [{ label: "A", text: "..." }]
correctLabel: "A"
correctText: "..."
explanation: string
```

Then selection can compare by label, not fragile text matching.

### 3. Improve inline practice UI

Update `InlinePracticeCard` so MCQ options look like proper selectors:

- Mobile-first single column.
- Tablet/desktop can use a compact 2-column grid if there is enough width.
- Each option has a clear A/B/C/D pill and text.
- Selected wrong option becomes red with a short “Not quite” explanation.
- Correct answer becomes green.
- The card should not send the selected answer to the chat router.

Expected behavior:

```text
Student clicks B
  -> card records answer
  -> card shows correct/wrong
  -> explanation appears
  -> Next button appears
  -> same chat remains active
```

### 4. Stop practice answers from creating new chats

Practice answers should remain local to the practice artifact and only be saved as attempts/mastery data.

I will ensure `onPracticeAnswer` only calls the inline-practice state + attempt persistence. It should not call `handleSend`, should not invoke the AI, and should not route.

If later we want AI-powered feedback per answer, it should be a separate controlled path tied to the same `thread_id` and `artifact_id`, not the generic router.

### 5. Make the router current-thread aware

For normal composer messages, I will add a “continue current session” rule:

If the student is inside an active thread and sends a short/contextual message like:

- `A`
- `B`
- `next`
- `yes`
- `explain this`
- `continue`
- `start day 2`

then the system should continue the current thread instead of creating a new one.

The router should only create/switch threads when the message clearly asks for a different scope, for example:

```text
Give me 10 MCQs on Organic Chemistry
Create a 7-day plan for Thermodynamics
Show my progress in Chemistry
Explain integration by parts
```

### 6. Fix study-plan Start behavior

Study-plan task clicks need to stay attached to the study plan artifact/thread.

I will change the Start flow so it sends a contextual continuation to the same thread, such as:

```text
Continue this study plan. Start Day 2 Task 1: Revise Newton's 3 Laws with examples.
```

But technically it should bypass fresh routing and use the existing study-plan thread.

Expected behavior:

```text
Study plan generated in one thread
  Day 1 Start -> same thread
  Day 2 Start -> same thread
  Task Start -> same thread
  No new chat created
```

### 7. Persist study-plan task completion correctly

The UI currently has support for completed study tasks, but the main page is not fully wiring `completedTasks`, `onToggleTask`, and task persistence into the artifact pane.

I will wire this so:

- Completed tasks stay checked.
- Starting a task does not accidentally mark unrelated tasks.
- Day/task state belongs to the plan artifact.
- The same plan remains visible and usable.

### 8. Clean the Copilot left-rail demo data, not the whole app mock data

I will clean only the Copilot demo/session data, not unrelated mock data across the platform.

The goal is:

- Active should show only genuinely active/unfinished learning sessions.
- Recent should show useful recent examples.
- Archived should contain older examples only.
- Remove or reduce unnecessary chart/progress-heavy demo sessions from the left rail.
- Avoid showing a large number like `Active 41` in the demo.

A good demo target would be approximately:

```text
Active: 3-5 meaningful sessions
Recent: 3-5 meaningful sessions
Archived: 2-4 examples
```

### 9. Keep important charts, remove noisy chart clutter

I will not delete every chart/artifact. I will keep the useful ones:

- Practice session summary
- Study plan
- One mastery/progress insight if it helps the demo

But I will prevent unnecessary progress/chart artifacts from crowding the session list or artifact pane.

### 10. Validate the demo flow end-to-end

After implementation, the demo flow should work like this:

```text
User: 5 MCQ questions on Kinematics
Copilot: short intro
Inline card: Question 1 of 5 + selectable options
User selects option
Inline card: correct/wrong + explanation
User clicks Next
Inline card: Question 2 of 5
No new chat is created

User opens study plan
Clicks Day 2 Start
Same plan thread continues
No new chat is created

Left rail
Active/Recent/Archived are readable and not polluted by 40+ active sessions
```

## Files likely to change

- `src/components/student/copilot/StudentCopilotPage.tsx`
- `src/components/student/copilot/InlinePracticeCard.tsx`
- `src/components/student/copilot/useInlinePractice.ts`
- `src/components/student/copilot/ChatMessageList.tsx`
- `src/components/student/copilot/artifactNormalizers.ts`
- `src/components/student/copilot/artifacts/StudyPlanView.tsx`
- `src/components/student/copilot/StudentArtifactPane.tsx`
- `src/components/student/copilot/router/sessionRouter.ts`
- `src/components/student/copilot/seedCopilotData.ts`
- `src/data/student/copilotMockData.ts`
- `supabase/functions/student-copilot-chat/index.ts`

## My recommendation

The right fix is not to make every answer go back to the AI. For the demo to feel perfect and stable, MCQ answering should be handled locally inside the inline practice card, while the AI is used to generate the practice set and explanations.

That gives the best experience:

- Fast response
- No accidental new chats
- No routing confusion
- Reliable demo
- Clean mastery tracking
- Still AI-generated questions and explanations