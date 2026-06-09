// WhatsApp wallet — localStorage-backed balance + history (UI-only mock)
import { useCallback, useEffect, useState } from "react";
import {
  defaultBalance,
  seedHistory,
  LOW_BALANCE_THRESHOLD,
} from "@/data/institute/whatsappComms";
import type { WhatsAppBalance, HistoryEntry } from "@/types/whatsappComms";

const BALANCE_KEY = "institute_whatsapp_balance";
const HISTORY_KEY = "institute_whatsapp_history";

type BalanceLevel = "ok" | "low" | "empty";

function loadBalance(): WhatsAppBalance {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (raw) return { ...defaultBalance, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultBalance;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return seedHistory;
}

export function useWhatsAppWallet() {
  const [balance, setBalance] = useState<WhatsAppBalance>(loadBalance);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem(BALANCE_KEY, JSON.stringify(balance));
    } catch {
      /* ignore */
    }
  }, [balance]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  const level: BalanceLevel =
    balance.remaining <= 0 ? "empty" : balance.remaining < LOW_BALANCE_THRESHOLD ? "low" : "ok";

  const isPaused = level === "empty";

  /** Add messages from a recharge */
  const recharge = useCallback((messages: number) => {
    setBalance((b) => ({ ...b, remaining: b.remaining + messages }));
  }, []);

  /** Record a send: deduct balance, prepend to history. Returns false if blocked. */
  const recordSend = useCallback(
    (entry: Omit<HistoryEntry, "id" | "sentAt">) => {
      let ok = true;
      setBalance((b) => {
        if (b.remaining < entry.messagesUsed) {
          ok = false;
          return b;
        }
        return {
          ...b,
          remaining: b.remaining - entry.messagesUsed,
          usedThisMonth: b.usedThisMonth + entry.messagesUsed,
        };
      });
      if (ok) {
        const full: HistoryEntry = {
          ...entry,
          id: `hist-${Date.now()}`,
          sentAt: new Date().toISOString(),
        };
        setHistory((h) => [full, ...h]);
      }
      return ok;
    },
    [],
  );

  /** Dev helper to zero the balance for testing the pause banner */
  const setRemaining = useCallback((remaining: number) => {
    setBalance((b) => ({ ...b, remaining }));
  }, []);

  return { balance, history, level, isPaused, recharge, recordSend, setRemaining };
}

export type UseWhatsAppWallet = ReturnType<typeof useWhatsAppWallet>;
