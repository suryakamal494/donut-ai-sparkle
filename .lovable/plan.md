What I understood

You want Student Copilot to stop treating every learning action as only text/charts/library artifacts. Sometimes the agent should recommend an existing platform resource, especially a PowerPoint presentation, directly inside the chat.

Expected student experience:

1. The agent says something like: “Before we solve this, read this short PowerPoint.”
2. Below that message, the chat shows a compact resource card, for example:
   - “Electromagnetic Induction - Complete Lecture”
   - Type: PowerPoint
   - Subject/chapter/topic metadata
   - CTA: “Open slides”
3. When the student clicks it, a popup opens inside the Copilot screen, not a new browser tab.
4. The popup displays the actual resource in a smaller, scrollable/previewable format:
   - PPT/Google Slides: embedded slide viewer if available
   - Video: embedded video player
   - Animation/iframe: embedded interactive frame
   - PDF/document: embedded document viewer
5. The student can close the popup and continue the same chat thread.
6. Later this same pattern can be used inside study-plan tasks, doubt explanations, target preparation, and revision flows.

How this fits the current system

Right now Student Copilot has three connected concepts:

```text
Quick tools / selected routine
        ↓
Current thread + routing tool
        ↓
Chat messages + generated student_copilot_artifacts
        ↓
Right-side Library filters those artifacts by routine/thread/subject
```

The current “Library” is mostly for generated learning outputs: study plans, target trackers, explanations, formula sheets, progress reports, etc.

The new requirement is slightly different: a PowerPoint/video/animation recommendation should be a “resource attachment” in the chat. It should not always become a large generated library artifact. It should behave like an inline content recommendation that can open an in-chat preview popup.

Implementation plan

1. Add a reusable inline resource model

Create a small typed structure for resources recommended inside chat:

```text
LearningResource
- id
- title
- type: ppt | video | pdf | animation | image | iframe
- subject
- chapter
- topic
- description
- url
- embedUrl
- thumbnailUrl
- source
```

Use the existing platform content data first. The project already has PPT-style resources in mock/library data, including Google Slides embed URLs. So the first implementation can use existing content-library items rather than inventing new data.

2. Add a new Student Copilot artifact type for inline resources

Add a new artifact type, for example:

```text
resource_recommendation
```

Its content will contain one or more recommended resources:

```text
{
  presentation: "inline",
  show_in_artifact_pane: false,
  resources: [LearningResource]
}
```

This keeps the right-side Library clean while still allowing chat to show the PPT/video/animation link exactly where the agent mentions it.

3. Build the chat resource card

Add a new component in Student Copilot chat:

```text
InlineResourceCard
```

Behavior:
- Renders under the relevant assistant message, similar to the existing inline practice card.
- Shows type icon, title, subject/chapter, short description, and an “Open” button.
- Mobile/tablet first: card width should fit within chat, buttons should be thumb-friendly, and text should not overflow.
- Supports multiple resources in one message if the agent recommends more than one.

4. Build the in-chat resource preview popup

Add a reusable preview dialog/sheet:

```text
ResourcePreviewDialog
```

Preview rules:
- PPT with `embedUrl`: show an iframe using the existing Google Slides/PowerPoint embed URL.
- PPT without `embedUrl`: show a fallback card with “Open original”.
- Video: show embedded video iframe if available.
- Animation/iframe: show iframe.
- PDF: show iframe document viewer.
- Image: show contained image preview.

Responsive behavior:
- Desktop/tablet: centered modal, large preview area.
- Mobile: near-fullscreen bottom sheet/dialog so slides are still readable.
- Keep close button visible at all times.

5. Connect resource cards to assistant messages

Mirror the existing inline practice implementation:

Current pattern:
```text
assistant message
  ↓ nearest matching artifact
InlinePracticeCard renders below that message
```

New pattern:
```text
assistant message
  ↓ nearest resource_recommendation artifact
InlineResourceCard renders below that message
```

This gives the exact UX you asked for: the agent says “read this PowerPoint,” and the clickable PowerPoint appears inline below that chat message.

6. Teach the agent when to recommend PPTs/resources

Update the Student Copilot backend prompt/tooling so the agent can call a resource recommendation tool when useful.

Add a tool such as:

```text
recommend_learning_resource
```

The tool will accept:
- title
- reason
- resources array

Prompt behavior:
- When explaining a topic where a platform PPT/video/animation would help, recommend one resource inline.
- For study-plan tasks, the agent can say: “First review these slides, then come back and I’ll quiz you.”
- For target prep, the agent can recommend the most relevant PPT/video for the current weak chapter.
- Do not overuse resources; only recommend when it supports the immediate learning step.

7. Use existing content library resources first

Initial implementation will map from existing mock/library content already present in the codebase:
- PPT/Google Slides items from content data
- Videos from content library
- Animations/iframe content where available

This avoids creating a new backend table immediately. Later, when real uploaded content needs to be fully persisted and searched from Lovable Cloud, we can add a proper `learning_resources` table and assignment rules.

8. Keep Library filtering behavior separate

For this first fix:
- If no quick tool/routine is selected, the right Library should continue showing all meaningful library items by timeline.
- Inline resource recommendations should not clutter the Library unless we intentionally decide to save them there.
- Subject filter should still apply globally where relevant.

This separation keeps the UI understandable:

```text
Chat inline card = “Open this resource now”
Right Library = “Saved/generated learning outputs and important items”
```

Technical implementation details

Files likely to change:

```text
src/components/student/copilot/types.ts
- Add resource_recommendation type and resource content interfaces.

src/components/student/copilot/ChatMessageList.tsx
- Detect resource_recommendation artifacts near assistant messages.
- Render InlineResourceCard below the message.
- Manage preview dialog open state.

src/components/student/copilot/InlineResourceCard.tsx
- New compact card for PPT/video/pdf/animation links.

src/components/student/copilot/ResourcePreviewDialog.tsx
- New in-chat popup viewer for PPTs/videos/animations/documents.

src/components/student/copilot/artifactNormalizers.ts
- Normalize resource_recommendation content.

src/components/student/copilot/StudentArtifactPane.tsx
- Exclude inline resource recommendations from the right Library by default.

supabase/functions/student-copilot-chat/index.ts
- Add recommend_learning_resource tool.
- Add system prompt guidance for using platform resources.
- Store resource recommendations as inline artifacts.
```

Possible data-source files:

```text
src/data/mockData.ts
src/data/contentLibraryData.ts
src/data/instituteData.ts
```

Validation plan

After implementation:

1. Build check to ensure TypeScript passes.
2. Test chat rendering with a seeded/sample resource recommendation artifact.
3. Verify that clicking a PPT card opens the in-chat popup.
4. Verify popup is usable on the current viewport and mobile/tablet sizes.
5. Verify inline resources do not inflate the right-side Library unless explicitly configured.
6. Verify existing inline practice and clarification cards still work.

Important note

This first implementation focuses on the PowerPoint/resource opening experience inside Student Copilot chat. It will create the architecture so the same component can later support videos, animations, PDFs, and study-plan resource links cleanly.