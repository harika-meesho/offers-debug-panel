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
  InputAdornment,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppHeader from '@components/AppHeader';
import { apiError } from '@utils/apiError';
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

const PAGE_SIZE = 20;
type TypeFilter = 'all' | 'optin' | 'direct';

function EventsTable({ groups }: { groups: EventGroup[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);

  const totalOffers = groups.reduce((n, g) => n + g.timeslots.length, 0);

  const filtered = groups.filter((g) => {
    const matchType = typeFilter === 'all' || g.event_type === typeFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      g.event_id.toLowerCase().includes(q) ||
      (g.event_name ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleType(t: TypeFilter) {
    setTypeFilter(t);
    setPage(1);
  }

  const isFiltered = search.trim() !== '' || typeFilter !== 'all';

  return (
    <Box>
      {/* summary chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={`${groups.length} Event${groups.length !== 1 ? 's' : ''}`} color="primary" size="small" />
        <Chip
          label={`${totalOffers} Offer${totalOffers !== 1 ? 's' : ''}`}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by event ID or name…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 280 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'optin', 'direct'] as TypeFilter[]).map((t) => (
            <Chip
              key={t}
              label={t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              onClick={() => handleType(t)}
              color={typeFilter === t ? 'primary' : 'default'}
              variant={typeFilter === t ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        {isFiltered && (
          <Typography variant="caption" color="text.secondary">
            {filtered.length} of {groups.length} events
          </Typography>
        )}
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
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No events match your search.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((group, i) => (
                <TableRow
                  key={group.event_id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/event/${group.event_id}`)}
                >
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', width: 40 }}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
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
                      sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' } }}
                    >
                      View/Debug Offers
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filtered.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            size="small"
            shape="rounded"
          />
        </Box>
      )}
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
      dispatch(setError(apiError(err)));
    } finally {
      dispatch(setLoading(false));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLoad();
  }

  const hasResults = data !== null;
  const isEmpty = hasResults && data?.events.length === 0;
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
            <EventsTable groups={data?.events ?? []} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
