import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductSupplierResponse } from '../types';

interface DebugState {
  loading: boolean;
  error: string | null;
  pid: string;
  sid: string;
  data: ProductSupplierResponse | null;
}

const initialState: DebugState = {
  loading: false,
  error: null,
  pid: '',
  sid: '',
  data: null,
};

const debugPanelSlice = createSlice({
  name: 'debugPanel',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setPid(state, action: PayloadAction<string>) {
      state.pid = action.payload;
    },
    setSid(state, action: PayloadAction<string>) {
      state.sid = action.payload;
    },
    setData(state, action: PayloadAction<ProductSupplierResponse | null>) {
      state.data = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setLoading, setError, setPid, setSid, setData, reset } =
  debugPanelSlice.actions;

export default debugPanelSlice.reducer;
