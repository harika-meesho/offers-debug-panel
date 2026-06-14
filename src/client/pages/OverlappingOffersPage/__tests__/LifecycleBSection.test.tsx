import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LifecycleBSection from '../LifecycleBSection';
import type { OfferDetail } from '../../../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeOffer(overrides: Partial<OfferDetail> = {}): OfferDetail {
  return {
    id: 'offer-1',
    status: 'ACTIVE',
    start_time: 1700000000,
    end_time: 1700003600,
    discounts: {},
    funding_type: 'SUPPLIER',
    created_by: 'system',
    ...overrides,
  };
}

interface RenderProps {
  offerDetail?: OfferDetail;
  eventId?: string;
  eventType?: string;
  eventName?: string;
  eventCategory?: string;
  eventStartTime?: number;
  eventEndTime?: number;
  slotStartTime?: number;
  slotEndTime?: number;
}

function renderSection(props: RenderProps = {}) {
  return render(
    <LifecycleBSection
      eventId={props.eventId ?? 'evt-42'}
      eventType={props.eventType ?? 'FLASH_SALE'}
      eventName={props.eventName ?? 'Summer Flash Sale'}
      eventCategory={props.eventCategory ?? 'Electronics'}
      eventStartTime={props.eventStartTime ?? 1700000000}
      eventEndTime={props.eventEndTime ?? 1700003600}
      slotStartTime={props.slotStartTime ?? 1700000000}
      slotEndTime={props.slotEndTime ?? 1700003600}
      offerDetail={props.offerDetail}
    />,
  );
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('LifecycleBSection — structure', () => {
  it('renders without crashing', () => {
    expect(() => renderSection()).not.toThrow();
  });

  it('shows both step titles', () => {
    renderSection();
    expect(screen.getByText('Event Details')).toBeInTheDocument();
    expect(screen.getByText('Offer Live State')).toBeInTheDocument();
  });

  it('shows STEP 1 and STEP 2 labels', () => {
    renderSection();
    expect(screen.getByText('STEP 1')).toBeInTheDocument();
    expect(screen.getByText('STEP 2')).toBeInTheDocument();
  });

  it('shows the eventId in the header', () => {
    renderSection({ eventId: 'evt-999' });
    // eventId appears in both the header subtitle and the Event Details field;
    // use getAllByText and assert at least one match exists.
    expect(screen.getAllByText(/evt-999/).length).toBeGreaterThan(0);
  });

  it('shows the eventType in the header subtitle', () => {
    renderSection({ eventType: 'MEGA_SALE' });
    // The header subtitle reads "Event <id> · MEGA_SALE flow"
    expect(screen.getByText(/MEGA_SALE flow/)).toBeInTheDocument();
  });
});

describe('LifecycleBSection — Event Details step', () => {
  it('renders the event ID field', () => {
    renderSection({ eventId: 'evt-77' });
    expect(screen.getByText('evt-77')).toBeInTheDocument();
  });

  it('renders the event type field', () => {
    renderSection({ eventType: 'CLEARANCE' });
    // eventType appears both in header and in Event Details content
    expect(screen.getAllByText('CLEARANCE').length).toBeGreaterThan(0);
  });

  it('renders event name when provided', () => {
    renderSection({ eventName: 'Big Billion Days' });
    expect(screen.getByText('Big Billion Days')).toBeInTheDocument();
  });

  it('renders category when provided', () => {
    renderSection({ eventCategory: 'Fashion' });
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });
});

describe('LifecycleBSection — Offer Live State step (no offer)', () => {
  it('shows "No offer detail available." when offerDetail is undefined', () => {
    renderSection({ offerDetail: undefined });
    expect(screen.getByText('No offer detail available.')).toBeInTheDocument();
  });
});

describe('LifecycleBSection — Offer Live State step (status-based)', () => {
  it('shows "DISABLED" chip when status is DISABLED', () => {
    renderSection({ offerDetail: makeOffer({ status: 'DISABLED' }) });
    expect(screen.getByText('DISABLED')).toBeInTheDocument();
  });

  it('shows "NOT ACTIVATED" chip when status is CREATED', () => {
    renderSection({ offerDetail: makeOffer({ status: 'CREATED' }) });
    expect(screen.getByText('NOT ACTIVATED')).toBeInTheDocument();
  });
});

describe('LifecycleBSection — Offer Live State step (time-based)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows "LIVE" when ACTIVE and current time is within the slot window', () => {
    // Set now to 1700001800 — inside [1700000000, 1700003600]
    vi.setSystemTime(new Date(1700001800 * 1000));
    renderSection({
      offerDetail: makeOffer({ status: 'ACTIVE', start_time: 1700000000, end_time: 1700003600 }),
      slotStartTime: 1700000000,
      slotEndTime: 1700003600,
    });
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('shows "UPCOMING" when ACTIVE and current time is before the start', () => {
    // Set now to before start
    vi.setSystemTime(new Date(1699990000 * 1000));
    renderSection({
      offerDetail: makeOffer({ status: 'ACTIVE', start_time: 1700000000, end_time: 1700003600 }),
      slotStartTime: 1700000000,
      slotEndTime: 1700003600,
    });
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
  });

  it('shows "EXPIRED" when ACTIVE and current time is past the end', () => {
    // Set now to after end
    vi.setSystemTime(new Date(1700010000 * 1000));
    renderSection({
      offerDetail: makeOffer({ status: 'ACTIVE', start_time: 1700000000, end_time: 1700003600 }),
      slotStartTime: 1700000000,
      slotEndTime: 1700003600,
    });
    expect(screen.getByText('EXPIRED')).toBeInTheDocument();
  });

  it('shows "LIVE" for ACTIVE offer with no end time (ongoing)', () => {
    vi.setSystemTime(new Date(1700001800 * 1000));
    renderSection({
      offerDetail: makeOffer({ status: 'ACTIVE', start_time: 0, end_time: 0 }),
      slotStartTime: 0,
      slotEndTime: 0,
    });
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });
});

describe('LifecycleBSection — OfferLiveContent fields', () => {
  it('renders funding_type when present', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1700001800 * 1000));
    renderSection({ offerDetail: makeOffer({ funding_type: 'MEESHO' }) });
    expect(screen.getByText('MEESHO')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders created_by when present', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1700001800 * 1000));
    renderSection({ offerDetail: makeOffer({ created_by: 'batch-job' }) });
    expect(screen.getByText('batch-job')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders disabled_by and disabled_reason when present', () => {
    renderSection({
      offerDetail: makeOffer({
        status: 'DISABLED',
        disabled_by: 'admin-panel',
        disabled_reason: 'Price mismatch',
      }),
    });
    expect(screen.getByText('admin-panel')).toBeInTheDocument();
    expect(screen.getByText('Price mismatch')).toBeInTheDocument();
  });
});
