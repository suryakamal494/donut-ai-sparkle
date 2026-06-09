## WhatsApp Communications Hub — Phase-wise Implementation

UI-only, mock data + local state. No backend, no real sending. Each phase is shippable and independently verifiable.

---

### Phase 0 — Foundations (types, mock data, routing, nav)
Scaffolding everything else depends on. No visible feature yet beyond an empty hub shell.
- `src/types/whatsappComms.ts`: types for `WhatsAppBalance`, `RechargePack`, `AlertConfigRow` (with preview template), `BroadcastDraft`, `HistoryEntry` (with frozen `audienceSnapshot`).
- `src/data/institute/whatsappComms.ts`: deterministic mock — balance, packs (5k/10k/25k), seeded alert rows (Teachers + Parents), seeded history entries, mock class/section/recipient counts.
- Routing: add lazy `communications` route in `InstituteRoutes.tsx`.
- Nav: add "Communications" item (MessageCircle) in `InstituteSidebar.tsx`.
- Page shell: `Communications.tsx` with the 4-tab `Tabs` host (empty tab bodies).
- **Verify:** sidebar item navigates to hub, tabs switch, build clean.

---

### Phase 1 — Wallet shell: balance pill, Pause banner, Recharge dialog
The money/state spine that every other tab reads from.
- `localStorage`-backed balance state (hook: `useWhatsAppWallet`).
- Persistent **balance pill** at top of hub (green/amber/red by threshold).
- Global **Auto-Pause banner** above tabs when balance is 0 (renders on all tabs).
- `RechargeDialog` (mock): packs, per-message rate, subtotal, GST 18%, total, "Pay & Recharge" → updates balance + success toast.
- Low-balance (non-zero) amber inline notice.
- **Verify:** recharge raises balance and clears banner; manually zeroing balance shows pause banner on every tab.

---

### Phase 2 — Overview tab
- Balance card (remaining / used this month / est. days left).
- Usage breakdown (by type + by audience), mock.
- Low-balance explainer + last principal-alert timestamp.
- Recent-activity mini-feed linking into History.
- **Verify:** numbers render, responsive at 320/768/1280, links jump to History tab.

---

### Phase 3 — Automated Alerts tab (toggle matrix + mandatory previews)
- Audience groups: Teachers, Parents (Students off by default).
- Each row: title, what/when description, on/off `Switch`, and an **always-visible** `MessagePreview` (WhatsApp-style bubble with realistic merge fields).
- "Enable all / disable all" per group.
- Toggle state persists in `localStorage` (mirrors `useNotificationPreferences`).
- **Verify:** toggles persist on reload; previews always visible; rows stack cleanly ≤375px with 44px targets.

---

### Phase 4 — Broadcast tab (composer)
- Audience multi-select chips (Teachers/Parents/Students).
- Cascading Class → Section selectors with "All classes / All sections".
- Message textarea + char count + always-visible live preview bubble; optional template picker.
- Review block: live recipient count + estimated messages to deduct; send disabled when over balance or paused at zero.
- "Send broadcast" → deduct balance, toast, append immutable History entry.
- **Verify:** recipient math updates with scope; send blocked at zero; entry appears in History.

---

### Phase 5 — History tab (immutable audit log)
- List of entries with **frozen audience snapshot** (resolved sections like 8A/8B/8C + recipient count captured at send time).
- Columns/cards: date/time, type (Automated/Broadcast/System), audience+sections, recipients, status.
- Filters (type, audience, date range) + content search; "Show more" pagination.
- Row → detail drawer: full message text, frozen section list, delivery breakdown (mock).
- **Verify:** snapshot does not change if mock class data changes; filters/search/drawer work.

---

### Phase 6 — Responsive polish + QA pass
- Tab bar horizontal-scroll / 2-row grid on narrow screens; pill + banner truncate gracefully.
- History: cards on mobile, table on `md+`; Recharge dialog capped-height scroll.
- Full sweep at 320 / 375 / 768 / 1024 / 1280; verify 44px+ touch targets and token-only colors.
- **Verify:** screenshots across breakpoints, no clipping/overlap.

---

### Files created (summary)
- `src/types/whatsappComms.ts`
- `src/data/institute/whatsappComms.ts`
- `src/hooks/useWhatsAppWallet.ts`
- `src/pages/institute/communications/Communications.tsx`
- `src/pages/institute/communications/{OverviewTab,AutomatedAlertsTab,BroadcastTab,HistoryTab}.tsx`
- `src/pages/institute/communications/{RechargeDialog,MessagePreview,PauseBanner}.tsx`

### Files edited
- `src/routes/InstituteRoutes.tsx` (route)
- `src/components/layout/InstituteSidebar.tsx` (nav item)

### Out of scope
Real WhatsApp/Twilio sending, real payments/invoicing, DB persistence beyond `localStorage` — structured so a backend can attach later without UI rework.
