import { describe, it, expect } from 'vitest';
import reducer, {
  setLoading,
  setError,
  setPid,
  setSid,
  setData,
  reset,
} from '../debugPanelSlice';
import type { ProductSupplierResponse } from '../../types';

const initialState = {
  loading: false,
  error: null,
  pid: '',
  sid: '',
  data: null,
};

describe('debugPanelSlice', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets loading to true', () => {
    const state = reducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('sets loading to false', () => {
    const dirty = { ...initialState, loading: true };
    expect(reducer(dirty, setLoading(false)).loading).toBe(false);
  });

  it('sets error string', () => {
    const state = reducer(initialState, setError('something went wrong'));
    expect(state.error).toBe('something went wrong');
  });

  it('clears error with null', () => {
    const dirty = { ...initialState, error: 'prior error' };
    expect(reducer(dirty, setError(null)).error).toBeNull();
  });

  it('sets pid', () => {
    expect(reducer(initialState, setPid('42')).pid).toBe('42');
  });

  it('sets sid', () => {
    expect(reducer(initialState, setSid('99')).sid).toBe('99');
  });

  it('sets data', () => {
    const payload: ProductSupplierResponse = { events: [] };
    expect(reducer(initialState, setData(payload)).data).toEqual(payload);
  });

  it('clears data with null', () => {
    const payload: ProductSupplierResponse = { events: [] };
    const dirty = { ...initialState, data: payload };
    expect(reducer(dirty, setData(null)).data).toBeNull();
  });

  it('resets all fields to initial state', () => {
    const dirty = {
      loading: true,
      error: 'err',
      pid: '1',
      sid: '2',
      data: { events: [] } as ProductSupplierResponse,
    };
    expect(reducer(dirty, reset())).toEqual(initialState);
  });
});
