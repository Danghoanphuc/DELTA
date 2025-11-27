// stores/useEditorStore.ts
// ✅ PHASE 1: Centralized State Management với Zustand
// Loại bỏ props drilling, optimize re-renders

import { create, type UseBoundStore, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { EditorItem, DecalItem, GroupItem } from '@/features/editor/types/decal.types';
import { toast } from "@/shared/utils/toast";

export type GizmoMode = 'translate' | 'scale' | 'rotate';
export type ToolMode = 'select' | 'pan';

// === STATE INTERFACE ===
interface EditorState {
  // Core data
  items: EditorItem[];
  selectedItemIds: string[];
  
  // UI state
  gizmoMode: GizmoMode;
  isSnapping: boolean;
  toolMode: ToolMode;
  activeToolbarTab: string;
  
  // History (Undo/Redo)
  history: EditorItem[][];
  historyIndex: number;
  maxHistory: number;
  
  // Dirty tracking (for auto-save)
  isDirty: boolean;
  lastSavedAt: Date | null;
}

// === ACTIONS INTERFACE ===
interface EditorActions {
  // Items management
  setItems: (items: EditorItem[]) => void;
  addItem: (item: EditorItem) => void;
  updateItem: (id: string, updates: Partial<EditorItem>) => void;
  deleteItems: (ids: string[]) => void;
  reorderItems: (activeId: string, overId: string | null, containerId: string | null) => void;
  
  // Selection
  selectItem: (id: string | null, isMultiSelect: boolean) => void;
  deselectAll: () => void;
  
  // Grouping
  groupSelectedItems: () => void;
  ungroupSelectedItem: () => void;
  
  // UI controls
  setGizmoMode: (mode: GizmoMode) => void;
  setIsSnapping: (isSnapping: boolean) => void;
  setToolMode: (mode: ToolMode) => void;
  setActiveToolbarTab: (tab: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Dirty tracking
  markDirty: () => void;
  markClean: () => void;
  
  // Reset
  reset: () => void;
}

type EditorStore = EditorState & EditorActions;

// === HELPER FUNCTIONS ===

const createId = (prefix: 'decal' | 'group') =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Recursive delete: xóa item và tất cả children
const getItemsToDelete = (items: EditorItem[], idsToDelete: string[]): Set<string> => {
  const result = new Set<string>(idsToDelete);
  const stack = [...idsToDelete];
  
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const children = items.filter(i => i.parentId === currentId);
    
    children.forEach(child => {
      result.add(child.id);
      if (child.type === 'group') {
        stack.push(child.id);
      }
    });
  }
  
  return result;
};

// === INITIAL STATE ===
const initialState: EditorState = {
  items: [],
  selectedItemIds: [],
  gizmoMode: 'translate',
  isSnapping: false,
  toolMode: 'select',
  activeToolbarTab: 'templates',
  history: [],
  historyIndex: -1,
  maxHistory: 50,
  isDirty: false,
  lastSavedAt: null,
};

// === STORE CREATION ===
const createEditorStore = () => create<EditorStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // === ITEMS MANAGEMENT ===
      
      setItems: (items) => set((state) => {
        state.items = items;
        state.isDirty = true;
      }),
      
      addItem: (item) => set((state) => {
        state.items.push(item);
        state.isDirty = true;
        // Auto-save to history
        get().saveToHistory();
      }),
      
      updateItem: (id, updates) => set((state) => {
        const item = state.items.find(i => i.id === id);
        if (item) {
          Object.assign(item, updates);
          state.isDirty = true;
        }
      }),
      
      deleteItems: (ids) => set((state) => {
        if (ids.length === 0) return;
        
        const itemsToDelete = getItemsToDelete(state.items, ids);
        state.items = state.items.filter(item => !itemsToDelete.has(item.id));
        state.selectedItemIds = state.selectedItemIds.filter(id => !itemsToDelete.has(id));
        state.isDirty = true;
        
        // Auto-save to history
        get().saveToHistory();
      }),
      
      reorderItems: (activeId, overId, containerId) => set((state) => {
        const activeItem = state.items.find(i => i.id === activeId);
        const overItem = state.items.find(i => i.id === overId);
        
        if (!activeItem || !overItem) return;
        
        const activeIndex = state.items.findIndex(i => i.id === activeId);
        const overIndex = state.items.findIndex(i => i.id === overId);
        
        // Same parent: just reorder
        if (activeItem.parentId === overItem.parentId) {
          const [removed] = state.items.splice(activeIndex, 1);
          state.items.splice(overIndex, 0, removed);
        } else {
          // Different parent: change parentId
          const newParentId = containerId === 'root' ? null : containerId;
          activeItem.parentId = newParentId;
          
          const [removed] = state.items.splice(activeIndex, 1);
          state.items.splice(overIndex, 0, removed);
        }
        
        state.isDirty = true;
        get().saveToHistory();
      }),
      
      // === SELECTION ===
      
      selectItem: (itemId, isMultiSelect) => set((state) => {
        if (!itemId) {
          state.selectedItemIds = [];
          return;
        }
        
        const item = state.items.find(i => i.id === itemId);
        
        // Không cho phép chọn item bị lock
        if (item?.isLocked) {
          toast.info('Lớp này đã bị khóa.');
          state.selectedItemIds = [];
          return;
        }
        
        if (isMultiSelect) {
          if (state.selectedItemIds.includes(itemId)) {
            state.selectedItemIds = state.selectedItemIds.filter(id => id !== itemId);
          } else {
            state.selectedItemIds.push(itemId);
          }
        } else {
          state.selectedItemIds = [itemId];
        }
      }),
      
      deselectAll: () => set((state) => {
        state.selectedItemIds = [];
      }),
      
      // === GROUPING ===
      
      groupSelectedItems: () => set((state) => {
        if (state.selectedItemIds.length < 2) {
          toast.warning('Cần chọn ít nhất 2 lớp để nhóm');
          return;
        }
        
        const newGroupId = createId('group');
        
        // Kiểm tra tất cả items có cùng parent không
        const firstParentId = state.items.find(i => i.id === state.selectedItemIds[0])?.parentId;
        const allHaveSameParent = state.selectedItemIds.every(
          id => state.items.find(i => i.id === id)?.parentId === firstParentId
        );
        
        const newGroup: GroupItem = {
          id: newGroupId,
          type: 'group',
          parentId: allHaveSameParent ? firstParentId || null : null,
          name: 'Nhóm mới',
          isVisible: true,
          isLocked: false,
        };
        
        // Update children
        state.items.forEach(item => {
          if (state.selectedItemIds.includes(item.id)) {
            item.parentId = newGroupId;
          }
        });
        
        // Add group
        state.items.push(newGroup);
        state.selectedItemIds = [newGroupId];
        state.isDirty = true;
        
        toast.success('Đã nhóm các lớp!');
        get().saveToHistory();
      }),
      
      ungroupSelectedItem: () => set((state) => {
        if (state.selectedItemIds.length !== 1) {
          toast.warning('Chỉ có thể rã 1 nhóm tại một thời điểm');
          return;
        }
        
        const selectedGroup = state.items.find(i => i.id === state.selectedItemIds[0]);
        
        if (!selectedGroup || selectedGroup.type !== 'group') {
          toast.warning('Vui lòng chọn một nhóm để rã');
          return;
        }
        
        const groupParentId = selectedGroup.parentId;
        
        // Update children to have group's parent
        state.items.forEach(item => {
          if (item.parentId === selectedGroup.id) {
            item.parentId = groupParentId;
          }
        });
        
        // Remove group
        state.items = state.items.filter(item => item.id !== selectedGroup.id);
        state.selectedItemIds = [];
        state.isDirty = true;
        
        toast.success('Đã rã nhóm!');
        get().saveToHistory();
      }),
      
      // === UI CONTROLS ===
      
      setGizmoMode: (mode) => set((state) => {
        state.gizmoMode = mode;
      }),
      
      setIsSnapping: (isSnapping) => set((state) => {
        state.isSnapping = isSnapping;
      }),
      
      setToolMode: (mode) => set((state) => {
        state.toolMode = mode;
      }),
      
      setActiveToolbarTab: (tab) => set((state) => {
        state.activeToolbarTab = tab;
      }),
      
      // === HISTORY (UNDO/REDO) ===
      
      saveToHistory: () => set((state) => {
        // ✅ IMMER: Chỉ cần assign, immer tự handle structural sharing
        const currentSnapshot = state.items;
        
        // Xóa các state sau historyIndex (khi user đã undo rồi làm action mới)
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        
        // Thêm snapshot mới
        newHistory.push(currentSnapshot);
        
        // Giới hạn max history
        if (newHistory.length > state.maxHistory) {
          newHistory.shift(); // Xóa snapshot cũ nhất
          state.history = newHistory;
          state.historyIndex = state.maxHistory - 1;
        } else {
          state.history = newHistory;
          state.historyIndex = newHistory.length - 1;
        }
      }),
      
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          state.items = state.history[state.historyIndex];
          state.isDirty = true;
          toast.info('Đã hoàn tác');
        } else {
          toast.info('Không thể hoàn tác thêm');
        }
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          state.items = state.history[state.historyIndex];
          state.isDirty = true;
          toast.info('Đã làm lại');
        } else {
          toast.info('Không thể làm lại thêm');
        }
      }),
      
      canUndo: () => {
        return get().historyIndex > 0;
      },
      
      canRedo: () => {
        const { historyIndex, history } = get();
        return historyIndex < history.length - 1;
      },
      
      // === DIRTY TRACKING ===
      
      markDirty: () => set((state: EditorStore) => {
        state.isDirty = true;
      }),
      
      markClean: () => set((state: EditorStore) => {
        state.isDirty = false;
        state.lastSavedAt = new Date();
      }),
      
      // === RESET ===
      
      reset: () => set(initialState),
    })),
    { name: 'EditorStore' }
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEditorStore = createEditorStore() as any;

// === SELECTORS (Computed values) ===

export const selectFlatDecals = (state: EditorStore): DecalItem[] => {
  return state.items.filter(item => item.type === 'decal') as DecalItem[];
};

export const selectFirstSelectedItem = (state: EditorStore): EditorItem | null => {
  if (state.selectedItemIds.length !== 1) return null;
  return state.items.find(item => item.id === state.selectedItemIds[0]) || null;
};

export const selectSelectedItems = (state: EditorStore): EditorItem[] => {
  return state.items.filter(item => state.selectedItemIds.includes(item.id));
};