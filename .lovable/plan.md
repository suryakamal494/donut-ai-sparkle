Plan to fix the Student Copilot inline practice behavior

1. Make inline practice behave like a chat thread
- Change the inline practice state model so it stores an ordered list of question entries, not only one `currentIndex`.
- After a student submits Q1, keep Q1 visible with its submitted answer, result, and explanation/hint.
- When the student clicks Next, append Q2 below Q1 as a new inline card instead of replacing Q1.
- Continue this pattern until all 10 questions are visible in the same chat thread.
- Keep the end summary card after the final answered question.

2. Show the generated question immediately after the assistant response
- Ensure the new inline practice artifact is attached to the correct assistant message and rendered as soon as it is created.
- Avoid timestamp-only matching problems where the artifact appears in the wrong place or only after a refresh.
- Keep small practice artifacts out of the right artifact pane.

3. Fix math rendering in question, answer, and explanation text
- Improve `MathMarkdown` normalization so malformed escaped math such as `\$...\$`, `\pu{...}`, and generated strings like `$\pu{4 m/s^2}$` render correctly instead of showing raw symbols.
- Use `MathMarkdown` for displayed correct answers too, not plain `<strong>{question.answer}</strong>` text.
- Preserve KaTeX + mhchem support for physics/chemistry units and formulas.

4. Support the correct inline question types
- Extend inline question handling beyond only `mcq`, `short`, and `true_false`.
- Normalize `assertion_reason`, `multi_step`, and integer/numerical questions safely.
- For this requested 10-question practice flow, bias generation toward MCQs and assertion-reason MCQs rather than only integer/short-answer numericals.
- Keep `{ label, text }` option objects end-to-end for reliable answer matching.

5. Update the AI practice-generation instructions
- Tighten the backend function prompt/schema instructions for small practice sessions:
  - For ≤10 questions, generate mostly MCQ-style interactive questions.
  - Include a mix of conceptual MCQs, numerical MCQs, assertion-reason, and application questions.
  - Do not generate only integer input questions unless the student explicitly asks for integer/numerical-only practice.
  - Answers must remain option labels (`A`, `B`, etc.) for option-based questions.

6. Mobile/tablet-first polish
- Keep practice cards compact and readable at narrow widths.
- Ensure previous answered cards do not become too tall or overflow.
- Make the Next button and option tap targets comfortable on mobile/tablet.

Technical changes expected
- `src/components/student/copilot/useInlinePractice.ts`
  - Replace single `currentIndex` rendering assumptions with an append-only visible/answered question flow.
  - Store result per question index to prevent wrong answers appearing on a newly shown question.

- `src/components/student/copilot/ChatMessageList.tsx`
  - Render all visible inline practice question cards for a practice artifact, not only the current one.
  - Place the practice sequence under the assistant message that created it.

- `src/components/student/copilot/InlinePracticeCard.tsx`
  - Render submitted state from persisted props rather than local-only state where needed.
  - Add robust answer comparison and support option-based assertion-reason/multi-step MCQs.
  - Render correct answers/explanations through `MathMarkdown`.

- `src/components/student/copilot/MathMarkdown.tsx`
  - Add safer normalization for escaped dollar delimiters and common AI-generated LaTeX/mhchem patterns.

- `src/components/student/copilot/artifactNormalizers.ts`
  - Normalize mixed practice question types into stable inline-compatible shapes.

- `supabase/functions/student-copilot-chat/index.ts`
  - Update practice tool schema/prompt instructions to generate mixed MCQ-first inline practice sessions for ≤10 questions.

Validation
- Run the app build/type check.
- Test a 10-question practice request:
  - Question appears inline immediately after the assistant response.
  - Submitting Q1 keeps Q1 visible.
  - Clicking Next appends Q2 below Q1 instead of replacing it.
  - Answers do not leak into the next question.
  - Math/unit formatting renders correctly.
  - The generated set includes MCQs and assertion-reason/application variety, not only integer answers.