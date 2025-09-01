"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { GroceryItemWithMeasurement } from "../types/grocery";

interface UseItemConfirmationQueueOptions {
  onCommitted: (item: GroceryItemWithMeasurement) => void;
}

export function useItemConfirmationQueue({ onCommitted }: UseItemConfirmationQueueOptions) {
  // Animation timing constants
  const APPEAR_MS = 300;
  const HOLD_MS = 5000;
  const FADE_MS = 300;

  const queueRef = useRef<GroceryItemWithMeasurement[]>([]);
  const processingRef = useRef(false);
  const [currentItem, setCurrentItem] = useState<GroceryItemWithMeasurement | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isMountedRef = useRef(true);
  const cancelRef = useRef(false);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        if (!isMountedRef.current || cancelRef.current) break;
        const next = queueRef.current.shift()!;
        if (!isMountedRef.current || cancelRef.current) break;
        setCurrentItem(next);
        setIsFadingOut(false);

        // Phase 1: Appear (300ms)
        await sleep(APPEAR_MS);
        if (!isMountedRef.current || cancelRef.current) break;
        // Phase 2: Hold (5000ms)
        await sleep(HOLD_MS);
        if (!isMountedRef.current || cancelRef.current) break;
        // Phase 3: Disappear (300ms)
        setIsFadingOut(true);
        await sleep(FADE_MS);

        // Commit to main list after disappearance
        if (isMountedRef.current && !cancelRef.current) {
          onCommitted(next);
        }

        // Reset card
        if (!isMountedRef.current || cancelRef.current) break;
        setCurrentItem(null);
      }
    } finally {
      processingRef.current = false;
      // If new items arrived as we finished, kick processing again
      if (queueRef.current.length > 0) {
        processQueue();
      }
    }
  }, [onCommitted]);

  const enqueueItems = useCallback((items: unknown) => {
    if (Array.isArray(items)) {
      const validItems = items.filter(
        (it): it is GroceryItemWithMeasurement => !!it && typeof it === "object" && "item" in (it as any)
      );
      for (const it of validItems) {
        queueRef.current.push(it);
      }
      // Start processor if idle
      if (!processingRef.current) processQueue();
    }
  }, [processQueue]);

  useEffect(() => {
    isMountedRef.current = true;
    cancelRef.current = false;
    return () => {
      // Signal cancellation and prevent state updates after unmount
      isMountedRef.current = false;
      cancelRef.current = true;
    };
  }, []);

  return { currentItem, isFadingOut, enqueueItems };
}
