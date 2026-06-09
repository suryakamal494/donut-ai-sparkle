---
name: WhatsApp Communications Hub
description: Institute WhatsApp wallet, automated alert toggles, broadcast composer, and immutable history audit log
type: feature
---
Institute panel **Communications** hub at `/institute/communications` (top-level sidebar item, MessageCircle). UI-only, mock data + `localStorage` (no backend/real sending). Built as a 4-tab hub: Overview, Automated Alerts, Broadcast, History.

**Wallet / pay-as-you-go**
- Balance pill always at top (green/amber/red). Recharge packs: 5k/10k/25k messages, per-message INR rate, **GST 18%**. Mock "Pay & Recharge" adds to localStorage balance.
- `LOW_BALANCE_THRESHOLD = 1000`. Institute self-serves; NO super-admin involvement.
- Hook `useWhatsAppWallet` owns balance + history; `recordSend` deducts and prepends history, returns false if insufficient.

**Global Auto-Pause banner** (non-negotiable): when balance is 0, a persistent banner renders above the tabs on EVERY tab. Sending is blocked. Prevents principals from toggling alerts and assuming they fire.

**Automated Alerts**: toggle matrix grouped by audience (Teachers, Parents; Students off by default). Each row has a **mandatory always-visible** WhatsApp-style `MessagePreview` (not behind expand) with realistic merge fields. Toggles persist in `localStorage` key `institute_whatsapp_alert_toggles`.

**Broadcast**: audience chips (teachers/parents/students) → cascading class→section selectors → message + live preview → review (recipient count = messages to deduct). Recipient math: teachers add `teacherHeadcount`; parents/students each add sum of selected section recipients. Blocked when over balance or paused.

**History (immutable audit log)**: each entry stores a FROZEN `audienceSnapshot` (resolved section labels + recipient count captured at send time) — never re-derived from live class data. Detail drawer shows snapshot + full message + delivery breakdown. Card layout on mobile, table on md+.

Files: `src/types/whatsappComms.ts`, `src/data/institute/whatsappComms.ts`, `src/hooks/useWhatsAppWallet.ts`, `src/pages/institute/communications/*`.
