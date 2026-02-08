"use client";

import { useEffect, useRef } from "react";
import { useTamboThread } from "@tambo-ai/react";
import { getPersistedThreadId, persistThreadId, clearPersistedThreadId } from "@/lib/thread-persistence";

interface ThreadPersistenceProps {
  panelKey: string;
  onNewChat?: number;
}
export function ThreadPersistence({ panelKey, onNewChat }: ThreadPersistenceProps) {
  const { thread, switchCurrentThread, startNewThread } = useTamboThread();
  const prevNewChatRef = useRef(onNewChat);
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    const persistedThreadId = getPersistedThreadId(panelKey);
    if (persistedThreadId) {
      try {
        switchCurrentThread(persistedThreadId);
      } catch (error) {
        console.warn(`Failed to restore thread for panel ${panelKey}:`, error);
        clearPersistedThreadId(panelKey);
      }
    }
  }, [panelKey, switchCurrentThread]);
  useEffect(() => {
    if (thread?.id) {
      persistThreadId(panelKey, thread.id);
    }
  }, [thread?.id, panelKey]);
  useEffect(() => {
    if (onNewChat !== undefined && onNewChat !== prevNewChatRef.current) {
      prevNewChatRef.current = onNewChat;
      startNewThread();
      clearPersistedThreadId(panelKey);
    }
  }, [onNewChat, panelKey, startNewThread]);
  return null;
}
