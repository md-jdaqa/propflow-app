"use client";
/**
 * NavOrderProvider
 * Provides the ordered nav links to all nav components via context.
 * Lives in the app shell layout so both Sidebar and BottomNav share state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ALL_NAV_LINKS, type NavLink, BOTTOM_NAV_MAX } from "./links";
import { loadNavOrder, saveNavOrder, resetNavOrder, reorder } from "@/lib/nav-order";

interface NavOrderCtx {
  orderedLinks: NavLink[];
  bottomLinks: NavLink[];
  order: number[];
  moveItem: (from: number, to: number) => void;
  reset: () => void;
}

const NavOrderContext = createContext<NavOrderCtx | null>(null);

export function NavOrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<number[]>(() => ALL_NAV_LINKS.map((_, i) => i));

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setOrder(loadNavOrder());
  }, []);

  const orderedLinks = order.map((i) => ALL_NAV_LINKS[i]);
  const bottomLinks = orderedLinks.slice(0, BOTTOM_NAV_MAX);

  const moveItem = useCallback((from: number, to: number) => {
    setOrder((prev) => {
      const next = reorder(prev, from, to);
      saveNavOrder(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    resetNavOrder();
    setOrder(ALL_NAV_LINKS.map((_, i) => i));
  }, []);

  return (
    <NavOrderContext.Provider value={{ orderedLinks, bottomLinks, order, moveItem, reset }}>
      {children}
    </NavOrderContext.Provider>
  );
}

export function useNavOrder() {
  const ctx = useContext(NavOrderContext);
  if (!ctx) throw new Error("useNavOrder must be used inside NavOrderProvider");
  return ctx;
}
