import { Chip } from '@mui/material';
import { OfferStatus } from '../types';

const STATUS_COLOR: Record<OfferStatus, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  CREATED: 'warning',
  DISABLED: 'default',
};

interface Props {
  status?: OfferStatus;
}

export default function StatusChip({ status }: Props) {
  if (!status) return <Chip label="UNKNOWN" size="small" />;
  return <Chip label={status} color={STATUS_COLOR[status] ?? 'default'} size="small" />;
}
