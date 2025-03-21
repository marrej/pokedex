import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface FiltersState {
  search: string;
  type?: string;
  isFavorite?: boolean;
  view: 'list'|'grid';
  limit: number;
  refetch: boolean;
}
export const LIMIT = 9;
const initialState = { view: 'grid', search: '', limit: LIMIT, refetch: false } satisfies FiltersState as FiltersState

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.refetch = true;
    },
    setType(state, action: PayloadAction<string>) {
      state.type = action.payload;
      state.refetch = true;
    },
    setIsFavorite(state, action: PayloadAction<boolean>) {
      state.isFavorite = action.payload;
      state.refetch = true;
    },
    setView(state, action: PayloadAction<'list'|'grid'>) {
      state.view = action.payload;
    },
    resetLimit(state) {
      state.limit = LIMIT;
      state.refetch = false;
    },
    increaseLimit(state) {
      state.limit += LIMIT;
    }
  },
})

export const { setSearch, setType, setIsFavorite, setView, resetLimit, increaseLimit } = filtersSlice.actions
export default filtersSlice.reducer