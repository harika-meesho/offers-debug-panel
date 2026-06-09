import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppHeader from '@components/AppHeader';
import { RootState } from '@store/index';
import { setLoading, setError, setPid, setSid, setData } from '@store/debugPanelSlice';
import { getProductSupplierOffers } from '@services/api';
import { EventGroup, ProductDetails } from '../../types';
import { formatTime } from '../../utils/format';

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductDetails }) {
  return (
    <Card variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Product Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {product.image_url && (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {product.name || '—'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip label={`Catalog ID: ${product.catalog_id}`} size="small" variant="outlined" />
              {product.category_name && (
                <Chip label={product.category_name} size="small" color="secondary" variant="outlined" />
              )}
              {product.sku && (
                <Chip label={`SKU: ${product.sku}`} size="small" variant="outlined" />
              )}
              <Chip
                label={product.valid_for_supplier ? 'Valid for Supplier' : 'Not Valid for Supplier'}
                size="small"
                color={product.valid_for_supplier ? 'success' : 'error'}
              />
            </Box>
            {product.description && (
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── TypeChip ────────────────────────────────────────────────────────────────

function TypeChip({ eventType }: { eventType: string }) {
  if (eventType === 'optin') return <Chip label="Optin" size="small" color="secondary" />;
  if (eventType === 'direct') return <Chip label="Direct" size="small" color="info" />;
  return <Chip label="Unknown" size="small" />;
}

// ─── EventsTable ─────────────────────────────────────────────────────────────

function EventsTable({ groups }: { groups: EventGroup[] }) {
  const navigate = useNavigate();

  return (
    <Box>
      {/* summary chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip
          label={`${groups.length} Event${groups.length !== 1 ? 's' : ''}`}
          color="primary"
          size="small"
        />
        <Chip
          label={`${groups.reduce((n, g) => n + g.timeslots.length, 0)} Offer${groups.reduce((n, g) => n + g.timeslots.length, 0) !== 1 ? 's' : ''}`}
          variant="outlined"
          size="small"
        />
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'white' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {['ID', 'Event ID', 'Type', 'Event Name', 'Event Category', '# Offers', 'Start Time', 'End Time', 'Actions'].map((col) => (
                <TableCell
                  key={col}
                  sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group, i) => (
              <TableRow
                key={group.event_id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/event/${group.event_id}`)}
              >
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', width: 40 }}>
                  {i + 1}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                  >
                    {group.event_id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TypeChip eventType={group.event_type} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary', minWidth: 140 }}>
                  {group.event_name || '—'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', minWidth: 120 }}>
                  {group.event_category || '—'}
                </TableCell>
                <TableCell>
                  <Chip label={group.timeslots.length} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {formatTime(group.start_time)}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {formatTime(group.end_time)}
                </TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    View/Debug Offers
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const dispatch = useDispatch();
  const { loading, error, data, pid, sid } = useSelector(
    (state: RootState) => state.debugPanel,
  );

  const [localPid, setLocalPid] = useState(pid);
  const [localSid, setLocalSid] = useState(sid);

  const canLoad = localPid.trim() !== '' && localSid.trim() !== '' && !loading;

  async function handleLoad() {
    if (!canLoad) return;
    const trimmedPid = localPid.trim();
    const trimmedSid = localSid.trim();
    dispatch(setPid(trimmedPid));
    dispatch(setSid(trimmedSid));
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setData(null));

    try {
      const result = await getProductSupplierOffers(trimmedPid, trimmedSid);
      dispatch(setData(result));
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const msg =
        axiosErr.response?.data?.error ??
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        'Failed to load events';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLoad();
  }

  const hasResults = data !== null;
  const isEmpty = hasResults && data!.events.length === 0;
  const productDetails = data?.product_details ?? null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      <AppHeader />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Input card ── */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Debug an Offer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter a Product ID and Supplier ID to load all Event IDs and their associated offers.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                label="Product ID (PID)"
                value={localPid}
                onChange={(e) => setLocalPid(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                sx={{ width: 220 }}
                placeholder="e.g. 316314041"
              />
              <TextField
                label="Supplier ID (SID)"
                value={localSid}
                onChange={(e) => setLocalSid(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                sx={{ width: 220 }}
                placeholder="e.g. 78"
              />
              <Button
                variant="contained"
                disabled={!canLoad}
                onClick={handleLoad}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{ height: 40, px: 3 }}
              >
                {loading ? 'Loading…' : 'Load Events'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* ── Product card ── */}
        {productDetails && <ProductCard product={productDetails} />}

        {/* ── Empty state ── */}
        {isEmpty && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No offer timeslots found for PID <strong>{pid}</strong> and SID <strong>{sid}</strong>.
          </Alert>
        )}

        {/* ── Results ── */}
        {hasResults && !isEmpty && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Event ID list
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PID <strong>{pid}</strong> · SID <strong>{sid}</strong>
              </Typography>
            </Box>
            <EventsTable groups={data!.events} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
