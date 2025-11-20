// apps/customer-frontend/src/stores/useConnectionStore.ts
// ✅ SOCIAL: Zustand store for managing connections

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Connection } from "../services/api/connection.api.service";

interface ConnectionState {
  // State
  friends: Connection[];
  pendingRequests: Connection[];
  sentRequests: Connection[];
  
  // Actions
  setFriends: (friends: Connection[]) => void;
  setPendingRequests: (requests: Connection[]) => void;
  setSentRequests: (requests: Connection[]) => void;
  
  addFriend: (connection: Connection) => void;
  removeFriend: (connectionId: string) => void;
  
  addPendingRequest: (request: Connection) => void;
  removePendingRequest: (requestId: string) => void;
  
  addSentRequest: (request: Connection) => void;
  removeSentRequest: (requestId: string) => void;
  
  // Helper functions
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  hasSentRequest: (userId: string) => boolean;
  
  // Clear all
  clearConnections: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      // Initial state
      friends: [],
      pendingRequests: [],
      sentRequests: [],

      // Actions
      setFriends: (friends) => set({ friends }),
      
      setPendingRequests: (requests) => set({ pendingRequests: requests }),
      
      setSentRequests: (requests) => set({ sentRequests: requests }),
      
      addFriend: (connection) =>
        set((state) => ({
          friends: [...state.friends, connection],
        })),
      
      removeFriend: (connectionId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f._id !== connectionId),
        })),
      
      addPendingRequest: (request) =>
        set((state) => ({
          pendingRequests: [...state.pendingRequests, request],
        })),
      
      removePendingRequest: (requestId) =>
        set((state) => ({
          pendingRequests: state.pendingRequests.filter(
            (r) => r._id !== requestId
          ),
        })),
      
      addSentRequest: (request) =>
        set((state) => ({
          sentRequests: [...state.sentRequests, request],
        })),
      
      removeSentRequest: (requestId) =>
        set((state) => ({
          sentRequests: state.sentRequests.filter((r) => r._id !== requestId),
        })),
      
      // Helper functions
      isFriend: (userId) => {
        const { friends } = get();
        return friends.some(
          (f) =>
            f.status === "accepted" &&
            (f.requester._id === userId || f.recipient._id === userId)
        );
      },
      
      hasPendingRequest: (userId) => {
        const { pendingRequests } = get();
        return pendingRequests.some((r) => r.requester._id === userId);
      },
      
      hasSentRequest: (userId) => {
        const { sentRequests } = get();
        return sentRequests.some((r) => r.recipient._id === userId);
      },
      
      clearConnections: () =>
        set({
          friends: [],
          pendingRequests: [],
          sentRequests: [],
        }),
    }),
    {
      name: "printz-connections",
      partialize: (state) => ({
        friends: state.friends,
        pendingRequests: state.pendingRequests,
        sentRequests: state.sentRequests,
      }),
    }
  )
);

