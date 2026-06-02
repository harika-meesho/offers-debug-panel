import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Optin, Offer, LifecycleType } from '@pages/DebugPanel/types';

interface DebugPanelState {
  // Path A/B inputs
  eventId: string;
  supplierId: string;
  // Direct Path C inputs
  productId: string;

  // Fetched data
  optins: Optin[];
  offers: Offer[];

  // Selection state
  selectedOptin: Optin | null;
  selectedOffer: Offer | null;

  // Derived state
  isOptinEvent: boolean;
  lifecycle: LifecycleType | null;

  // UI state
  loading: boolean;
  error: string | null;
}

const initialState: DebugPanelState = {
  eventId: '',
  supplierId: '',
  productId: '',
  optins: [],
  offers: [],
  selectedOptin: null,
  selectedOffer: null,
  isOptinEvent: false,
  lifecycle: null,
  loading: false,
  error: null,
};

const debugPanelSlice = createSlice({
  name: 'debugPanel',
  initialState,
  reducers: {
    setEventId(state, action: PayloadAction<string>) { state.eventId = action.payload; },
    setSupplierId(state, action: PayloadAction<string>) { state.supplierId = action.payload; },
    setProductId(state, action: PayloadAction<string>) { state.productId = action.payload; },
    setOptins(state, action: PayloadAction<Optin[]>) { state.optins = action.payload; },
    setOffers(state, action: PayloadAction<Offer[]>) { state.offers = action.payload; },
    setSelectedOptin(state, action: PayloadAction<Optin | null>) { state.selectedOptin = action.payload; },
    setSelectedOffer(state, action: PayloadAction<Offer | null>) { state.selectedOffer = action.payload; },
    setIsOptinEvent(state, action: PayloadAction<boolean>) { state.isOptinEvent = action.payload; },
    setLifecycle(state, action: PayloadAction<LifecycleType | null>) { state.lifecycle = action.payload; },
    setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
    setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
    reset: () => initialState,
  },
});

export const {
  setEventId, setSupplierId, setProductId,
  setOptins, setOffers,
  setSelectedOptin, setSelectedOffer,
  setIsOptinEvent, setLifecycle,
  setLoading, setError, reset,
} = debugPanelSlice.actions;

export default debugPanelSlice.reducer;
