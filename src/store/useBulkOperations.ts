import { create } from 'zustand';
import { produce } from 'immer';
import type { BulkOperation } from '@/types';

interface BulkOperationsState {
  operations: BulkOperation[];
  currentIndex: number;
  maxHistory: number;
  pushOperation: (op: Omit<BulkOperation, 'id' | 'timestamp' | 'status'>) => string;
  undo: () => BulkOperation | null;
  redo: () => BulkOperation | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

let opCounter = 0;

export const useBulkOperations = create<BulkOperationsState>((set, get) => ({
  operations: [],
  currentIndex: -1,
  maxHistory: 50,

  pushOperation: (op) => {
    const id = `bulk-op-${++opCounter}`;
    const operation: BulkOperation = {
      ...op,
      id,
      timestamp: Date.now(),
      status: 'applied',
    };

    set(produce((state: BulkOperationsState) => {
      // Remove any operations after current index (discard redo history)
      state.operations = state.operations.slice(0, state.currentIndex + 1);
      state.operations.push(operation);

      // Trim to max history
      if (state.operations.length > state.maxHistory) {
        state.operations = state.operations.slice(state.operations.length - state.maxHistory);
      }

      state.currentIndex = state.operations.length - 1;
    }));

    return id;
  },

  undo: () => {
    const { operations, currentIndex } = get();
    if (currentIndex < 0) return null;

    const operation = operations[currentIndex];

    set(produce((state: BulkOperationsState) => {
      state.operations[state.currentIndex].status = 'undone';
      state.currentIndex--;
    }));

    return operation;
  },

  redo: () => {
    const { operations, currentIndex } = get();
    if (currentIndex >= operations.length - 1) return null;

    const operation = operations[currentIndex + 1];

    set(produce((state: BulkOperationsState) => {
      state.currentIndex++;
      state.operations[state.currentIndex].status = 'applied';
    }));

    return operation;
  },

  canUndo: () => get().currentIndex >= 0,
  canRedo: () => get().currentIndex < get().operations.length - 1,

  clearHistory: () => set({ operations: [], currentIndex: -1 }),

  getUndoDescription: () => {
    const { operations, currentIndex } = get();
    return currentIndex >= 0 ? operations[currentIndex].description : null;
  },

  getRedoDescription: () => {
    const { operations, currentIndex } = get();
    return currentIndex < operations.length - 1 ? operations[currentIndex + 1].description : null;
  },
}));
