import { defineStore } from 'pinia';

// Define the type for your state
interface MyState {
  count: number;
  name: string;
}

// Define the type for your actions (optional)
interface MyActions {
  increment(): void;
  setName(newName: string): void;
}

// Define the type for your getters (optional)
interface MyGetters {
  doubleCount: (state: MyState) => number;
  [key: string]: any;
}

// Combine all types into a single type for the store
export type MyStore = ReturnType<typeof useMyStore>;

// Define the store with types
export const useMyStore = defineStore<'myStore', MyState, MyGetters, MyActions>('myStore', {
  state: (): MyState => ({
    count: 0,
    name: '',
  }),
  getters: {
    doubleCount: (state: MyState): number => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
    setName(newName: string) {
      this.name = newName;
    },
  },

});

const store: MyStore = useMyStore();

store.count;

