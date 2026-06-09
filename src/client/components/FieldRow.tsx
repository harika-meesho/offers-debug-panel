import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  label: string;
  children?: React.ReactNode;
  value?: React.ReactNode;
  mono?: boolean;
  border?: boolean;
  labelColor?: string;
}

export default function FieldRow({ label, children, value, mono, border = true, labelColor }: Props) {
  const content = children ?? (
    <Typography
      variant="caption"
      fontFamily={mono ? 'monospace' : undefined}
      sx={{ wordBreak: 'break-all' }}
    >
      {value ?? '—'}
    </Typography>
  );
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
        ...(border
          ? { py: 0.5, borderBottom: '1px solid', borderColor: 'grey.100', '&:last-child': { borderBottom: 'none' } }
          : { mb: 0.5 }),
      }}
    >
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ minWidth: 110, flexShrink: 0, color: labelColor ?? (border ? 'text.secondary' : '#7B6A9C') }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{content}</Box>
    </Box>
  );
}
