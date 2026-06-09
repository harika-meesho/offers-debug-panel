import { Box, CircularProgress } from '@mui/material';

export const M = {
  purple:      '#6C3FC5',
  purpleDeep:  '#5a33a8',
  purpleLight: '#F0EAFB',
  purpleMid:   '#9B7EE0',
  purpleBorder:'#DDD0F0',
  purpleFaint: '#EDE7F6',
};

export type StepState = 'done' | 'warn' | 'error' | 'loading' | 'pending';

export function StepCircle({ n, state }: { n: number; state: StepState }) {
  const base = {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontSize: '0.78rem', fontWeight: 700,
  };
  if (state === 'loading') {
    return (
      <Box sx={{ ...base, border: `2px solid ${M.purple}` }}>
        <CircularProgress size={14} sx={{ color: M.purple }} />
      </Box>
    );
  }
  const cfg: Record<Exclude<StepState, 'loading'>, { bg: string; border: string; color: string }> = {
    done:    { bg: M.purple,      border: M.purple,        color: '#fff'      },
    error:   { bg: '#D32F2F',     border: '#D32F2F',       color: '#fff'      },
    warn:    { bg: '#ED6C02',     border: '#ED6C02',       color: '#fff'      },
    pending: { bg: M.purpleLight, border: M.purpleBorder,  color: M.purpleMid },
  };
  const c = cfg[state];
  return (
    <Box sx={{ ...base, bgcolor: c.bg, border: `2px solid ${c.border}`, color: c.color }}>
      {n}
    </Box>
  );
}

