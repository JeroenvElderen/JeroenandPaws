import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const serviceGroups = [
  {
    id: 'daily-strolls',
    label: 'Daily strolls',
    description: 'Neighborhood walks with updates, photos, and GPS logs.',
    variants: [
      {
        id: 'daily-stroll-30',
        title: 'Daily stroll',
        subtitle: '30-minute visit',
        duration: 30,
        price: '€15 / walk',
        path: '/services/daily-strolls',
        accent: 'violet',
      },
      {
        id: 'daily-stroll-60',
        title: 'Daily stroll',
        subtitle: '60-minute visit',
        duration: 60,
        price: '€25 / walk',
        path: '/services/daily-strolls',
        accent: 'violet',
      },
      {
        id: 'daily-stroll-custom',
        title: 'Custom stroll',
        subtitle: 'Tailored timing',
        duration: 45,
        price: 'Custom',
        path: '/services/daily-strolls',
        accent: 'violet',
      },
    ],
  },
  {
    id: 'home-check-ins',
    label: 'Home check-ins',
    description: 'Potty breaks, feeding, and play while you are away.',
    variants: [
      {
        id: 'home-check-in-30',
        title: 'Home check-in',
        subtitle: '30-minute visit',
        duration: 30,
        price: '€15 / visit',
        path: '/services/home-check-ins',
        accent: 'violet',
      },
      {
        id: 'home-check-in-60',
        title: 'Home check-in',
        subtitle: '60-minute visit',
        duration: 60,
        price: '€25 / visit',
        path: '/services/home-check-ins',
        accent: 'violet',
      },
      {
        id: 'home-check-in-custom',
        title: 'Custom check-in',
        subtitle: 'Flexible timing',
        duration: 45,
        price: 'Tailored',
        path: '/services/home-check-ins',
        accent: 'violet',
      },
    ],
  },
  {
    id: 'group-adventures',
    label: 'Group adventures',
    description: 'Social, supervised outings with friendly pups.',
    variants: [
      {
        id: 'group-adventure-120',
        title: 'Group adventure',
        subtitle: '2-hour adventure',
        duration: 120,
        price: '€22',
        path: '/services/group-adventures',
        accent: 'mint',
      },
      {
        id: 'group-adventure-240',
        title: 'Group adventure',
        subtitle: 'Half-day (3–4 hrs)',
        duration: 240,
        price: '€35',
        path: '/services/group-adventures',
        accent: 'mint',
      },
      {
        id: 'group-adventure-480',
        title: 'Group adventure',
        subtitle: 'Full-day (6–8 hrs)',
        duration: 480,
        price: '€55',
        path: '/services/group-adventures',
        accent: 'mint',
      },
      {
        id: 'group-adventure-custom',
        title: 'Custom adventure',
        subtitle: 'Tailored group time',
        duration: 180,
        price: 'Custom',
        path: '/services/group-adventures',
        accent: 'mint',
      },
    ],
  },
  {
    id: 'solo-journeys',
    label: 'Solo journeys',
    description: 'One-on-one adventure blocks for focused enrichment.',
    variants: [
      {
        id: 'solo-journey-180',
        title: 'Solo journey',
        subtitle: 'Half-day (3 hrs)',
        duration: 180,
        price: '€60',
        path: '/services/solo-journeys',
        accent: 'mint',
      },
      {
        id: 'solo-journey-360',
        title: 'Solo journey',
        subtitle: 'Full-day (6 hrs)',
        duration: 360,
        price: '€110',
        path: '/services/solo-journeys',
        accent: 'mint',
      },
      {
        id: 'solo-journey-custom',
        title: 'Custom journey',
        subtitle: 'Flexible hours',
        duration: 240,
        price: 'Tailored',
        path: '/services/solo-journeys',
        accent: 'mint',
      },
    ],
  },
  {
    id: 'overnights',
    label: 'Overnight & multi-day',
    description: 'Boarding with bedtime routines, morning walks, and check-ins.',
    variants: [
      {
        id: 'overnight-stay',
        title: 'Overnight stay',
        subtitle: 'Multi-day stay',
        duration: 60,
        price: 'From €90 / night',
        path: '/services/overnight-stays',
        accent: 'indigo',
        multiDay: true,
      },
      {
        id: 'overnight-boarding',
        title: 'Boarding stay',
        subtitle: 'Full stay with walks',
        duration: 60,
        price: '€110 / night',
        path: '/services/overnight-stays',
        accent: 'indigo',
        multiDay: true,
      },
    ],
  },
  {
    id: 'daytime-care',
    label: 'Daytime care',
    description: 'Drop-off care with play, naps, and updates.',
    variants: [
      {
        id: 'daytime-care-4h',
        title: 'Daytime care',
        subtitle: 'Half-day (up to 4 hrs)',
        duration: 240,
        price: '€20 / day',
        path: '/services/daytime-care',
        accent: 'gold',
      },
      {
        id: 'daytime-care-8h',
        title: 'Daytime care',
        subtitle: 'Full-day (up to 8 hrs)',
        duration: 480,
        price: '€30 / day',
        path: '/services/daytime-care',
        accent: 'gold',
      },
      {
        id: 'daytime-care-custom',
        title: 'Custom care',
        subtitle: 'Flexible options',
        duration: 300,
        price: 'Tailored',
        path: '/services/daytime-care',
        accent: 'gold',
      },
    ],
  },
  {
    id: 'training',
    label: 'Training & support',
    description: 'Training help, meds, and special routines—tailored together.',
    variants: [
      {
        id: 'training-help',
        title: 'Training help',
        subtitle: '45-minute session',
        duration: 45,
        price: '€55',
        path: '/services/training-help',
        accent: 'pink',
      },
      {
        id: 'training-meet',
        title: 'Meet & greet',
        subtitle: '30-minute intro',
        duration: 30,
        price: 'Included',
        path: '/services/training-help',
        accent: 'pink',
      },
    ],
  },
  {
    id: 'custom',
    label: 'Custom solutions',
    description: 'Design a plan together for unique routines or schedules.',
    variants: [
      {
        id: 'custom-solutions',
        title: 'Custom booking',
        subtitle: 'Set the plan',
        duration: 60,
        price: 'From €35',
        path: '/services/custom-solutions',
        accent: 'teal',
      },
      {
        id: 'custom-meet-greet',
        title: 'Meet & greet',
        subtitle: 'Intro session',
        duration: 30,
        price: 'Included',
        path: '/services/custom-solutions',
        accent: 'teal',
      },
    ],
  },
];

const allServices = serviceGroups.flatMap((group) =>
  group.variants.map((variant) => ({
    ...variant,
    groupId: group.id,
    groupLabel: group.label,
    groupDescription: group.description,
  })),
);

const formatSlotLabel = (date, clockFormat) =>
  date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: clockFormat === '12h',
  });

const buildSlots = (selectedDate, durationMinutes, clockFormat) => {
  const dateKey = selectedDate.toISOString().split('T')[0];
  const baseTimes = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

  return baseTimes.map((time) => {
    const start = new Date(`${dateKey}T${time}:00`);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatSlotLabel(start, clockFormat),
    };
  });
};

const buildMonthDays = (anchorDate) => {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const startDay = startOfMonth.getDay();
  const firstVisible = new Date(year, month, 1 - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    return date;
  });
};

const Booking = () => {
  const router = useRouter();
  const normalizedServiceId = useMemo(() => {
    if (!router.isReady) return '';
    const { serviceId } = router.query;
    return Array.isArray(serviceId) ? serviceId[0] : serviceId || '';
  }, [router.isReady, router.query]);

  const getQueryParam = useCallback(
    (param) => {
      if (!router.isReady) return '';
      const value = router.query[param];
      return Array.isArray(value) ? value[0] : value || '';
    },
    [router.isReady, router.query],
  );
  const [selectedService, setSelectedService] = useState(allServices[0]);
  const [isServiceLocked, setIsServiceLocked] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [clockFormat, setClockFormat] = useState('12h');
  const [timezone, setTimezone] = useState('Europe/Dublin');

  const [availability, setAvailability] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState('Choose a date to see times.');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dogName, setDogName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastBooking, setLastBooking] = useState(null);
  const [calendarBookings, setCalendarBookings] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('jp_calendar_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Unable to load saved bookings', error);
      return [];
    }
  });

  const bookingBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/booking';

    const { origin } = window.location;
    return `${origin}/booking`;
  }, []);

  const bookingShareLink = useMemo(
    () => `${bookingBaseUrl}/${selectedService.id}`,
    [bookingBaseUrl, selectedService.id],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const requestedService = normalizedServiceId || getQueryParam('service');
    if (requestedService) {
      const match = allServices.find((service) => service.id === requestedService);
      if (match) {
        setSelectedService(match);
        setIsServiceLocked(Boolean(normalizedServiceId));
        return;
      }
    }
    setIsServiceLocked(false);
  }, [getQueryParam, normalizedServiceId, router.isReady]);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError('');
      setAvailability([]);
      setAvailabilityStatus('Loading times…');
      setSelectedSlot(null);

      const slots = buildSlots(selectedDate, selectedService.duration, clockFormat);
      const filtered = slots.filter((slot) => {
        const start = new Date(slot.start);
        const now = new Date();
        const isToday = start.toDateString() === now.toDateString();
        if (isToday && start <= now) return false;
        return true;
      });

      setAvailability(filtered);
      setAvailabilityStatus(
        filtered.length
          ? `${filtered.length} open times · ${selectedService.subtitle} · ${selectedService.price}`
          : 'No open times for that day (try another date).',
      );
      setIsLoading(false);
    };

    fetchAvailability();
  }, [clockFormat, selectedDate, selectedService.duration, selectedService.price, selectedService.subtitle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('jp_calendar_bookings', JSON.stringify(calendarBookings));
    } catch (error) {
      console.warn('Unable to persist bookings', error);
    }
  }, [calendarBookings]);

  const updateServiceQuery = useCallback(
    (serviceId) => {
      if (!router.isReady) return;
      const nextQuery = { ...router.query };
      if (serviceId) {
        nextQuery.service = serviceId;
      } else {
        delete nextQuery.service;
      }

      router.replace(
        { pathname: '/booking', query: nextQuery },
        undefined,
        { shallow: true },
      );
    },
    [router, router.isReady, router.query],
  );

  const updateServiceSelection = (service) => {
    if (isServiceLocked && service.id !== selectedService.id) return;
    setSelectedService(service);
    if (!isServiceLocked) {
      updateServiceQuery(service.id);
    }
    setSelectedSlot(null);
    setSuccessMessage('');
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    const isoDate = day.toISOString().split('T')[0];
    if (new Date(isoDate) > new Date(endDate)) {
      setEndDate(isoDate);
    }
  };

  const handleStartDateChange = (value) => {
    const dateValue = new Date(value);
    setSelectedDate(dateValue);
    setVisibleMonth(dateValue);
    if (dateValue > new Date(endDate)) {
      setEndDate(value);
    }
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  const getCalendarDetails = (bookingContext = null) => {
    const serviceInfo = bookingContext?.service || selectedService;
    const slotInfo = bookingContext?.slot || selectedSlot;
    if (!slotInfo) return null;
    const endDateValue = bookingContext?.endDate || endDate;
    const start = new Date(slotInfo.start);
    const end = (() => {
      if (!serviceInfo.multiDay) return new Date(slotInfo.end);
      const [, timePart] = slotInfo.end.split('T');
      return new Date(`${endDateValue}T${timePart}`);
    })();
    return {
      title: `${serviceInfo.title} — ${bookingContext?.dogName || dogName || 'Dog booking'}`,
      start,
      end,
      description: `Service: ${serviceInfo.title}\nClient: ${
        bookingContext?.clientName || clientName || 'Name pending'
      }\nNotes: ${bookingContext?.notes || notes || 'N/A'}`,
      location: serviceInfo.path,
    };
  };

  const buildGoogleCalendarLink = (details) => {
    const formatDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(details.title)}&dates=${formatDate(details.start)}/${formatDate(details.end)}&details=${encodeURIComponent(details.description)}&location=${encodeURIComponent(details.location)}`;
  };

  const buildICSData = (details) => {
    const formatDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '') + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jeroen and Paws//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${details.start.getTime()}-${selectedService.id}@jeroenandpaws`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(details.start)}`,
      `DTEND:${formatDate(details.end)}`,
      `SUMMARY:${details.title}`,
      `DESCRIPTION:${details.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${details.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedSlot) {
      setError('Pick a time before confirming.');
      return;
    }

    if (selectedService.multiDay && new Date(endDate) < new Date(selectedSlot.start)) {
      setError('End date cannot be before the start date.');
      return;
    }

    if (!clientName || !clientEmail) {
      setError('Name and email are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setTimeout(() => {
        const confirmationCode = `${selectedService.id}-${new Date(selectedSlot.start).getTime()}`;
        setSuccessMessage(
          `You are booked for ${selectedService.title} on ${new Date(selectedSlot.start).toLocaleString()} · Confirmation: ${confirmationCode}`,
        );
        const newBooking = {
          id: confirmationCode,
          service: selectedService,
          slot: selectedSlot,
          endDate: selectedService.multiDay ? endDate : selectedDate.toISOString().split('T')[0],
          clientName,
          clientEmail,
          dogName,
          notes,
        };
        setLastBooking({
          id: confirmationCode,
          service: selectedService,
          slot: selectedSlot,
          endDate: newBooking.endDate,
          clientName,
          clientEmail,
          dogName,
          notes,
        });
        setCalendarBookings((prev) => {
          const next = [newBooking, ...prev].slice(0, 20);
          return next;
        });
        setNotes('');
        setDogName('');
        setClientEmail('');
        setClientName('');
        setSelectedSlot(null);
        setIsSubmitting(false);
      }, 350);
    } catch (err) {
      setError(err.message || 'Unable to complete booking right now.');
      setIsSubmitting(false);
    }
  };

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const removeBooking = (bookingId) => {
    setCalendarBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    if (lastBooking?.id === bookingId) {
      setLastBooking(null);
    }
  };

  const formatBookingDateRange = (booking) => {
    const start = new Date(booking.slot.start);
    const end = booking.service.multiDay
      ? new Date(`${booking.endDate}T${booking.slot.end.split('T')[1]}`)
      : new Date(booking.slot.end);

    const startString = `${start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} · ${formatSlotLabel(start, clockFormat)}`;
    const endString = booking.service.multiDay
      ? `${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      : formatSlotLabel(end, clockFormat);

    return booking.service.multiDay ? `${startString} → ${endString}` : `${startString} – ${endString}`;
  };

  return (
    <main className="booking-shell">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Book instantly</p>
          <h1 className="booking-hero__title">Signature Jeroen &amp; Paws calendar</h1>
          <p className="booking-hero__subtitle">
            Every service has its own link, so your buttons can jump straight into a pre-selected booking form. No
            Cal.com or third-party scheduler—everything saves locally and exports to your own calendar.
          </p>
          <div className="booking-hero__cta">
            <span className="pill pill--glow">{availabilityStatus}</span>
            <a className="service-share" href={bookingShareLink}>
              {bookingShareLink}
            </a>
          </div>
          {isServiceLocked && (
            <div className="service-lock-note">
              You opened a service-specific booking link. Service selection is locked to {selectedService.title}. Want to
              switch? <Link href="/booking" className="service-lock-note__link">Start from the booking hub.</Link>
            </div>
          )}
          {error && <div className="booking-banner booking-banner--error">{error}</div>}
          {successMessage && <div className="booking-banner booking-banner--success">{successMessage}</div>}
        </div>
      </section>

      <section className="service-switcher">
        <div className="service-switcher__header">
          <div>
            <p className="eyebrow">Services</p>
            <h2>Each booking link is unique</h2>
            <p className="muted">Attach the matching link to your homepage buttons for a one-click booking start.</p>
          </div>
          <div className="legend">
            <span className="legend__dot" /> pre-selected in the current link
          </div>
        </div>
        <div className="service-groups">
          {serviceGroups.map((group) => (
            <div key={group.id} className="service-group">
              <div className="service-group__meta">
                <h3>{group.label}</h3>
                <p className="muted small">{group.description}</p>
              </div>
              <div className="service-variants">
                {group.variants.map((variant) => {
                  const isActive = selectedService.id === variant.id;
                  const isDisabled = isServiceLocked && !isActive;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`variant-tile variant-tile--${variant.accent}${isActive ? ' is-active' : ''}${
                        isDisabled ? ' is-disabled' : ''
                      }`}
                      disabled={isDisabled}
                      onClick={() => updateServiceSelection({
                        ...variant,
                        groupId: group.id,
                        groupLabel: group.label,
                        groupDescription: group.description,
                      })}
                    >
                      <div className="variant-tile__top">
                        <span className="pill">{variant.subtitle}</span>
                        {isActive && <span className="legend__dot legend__dot--active" aria-hidden="true" />}
                      </div>
                      <div className="variant-tile__body">
                        <p className="variant-title">{variant.title}</p>
                        <p className="variant-copy">{group.description}</p>
                        <p className="variant-meta">{variant.price}</p>
                      </div>
                      <Link className="variant-link" href={variant.path} onClick={(event) => event.stopPropagation()}>
                        View service page
                      </Link>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="booking-frame">
        <aside className="booking-frame__sidebar">
          <div className="sidebar-card">
            <p className="eyebrow">Selected service</p>
            <h2 className="sidebar-title">{selectedService.title}</h2>
            <p className="sidebar-subtitle">{selectedService.subtitle}</p>
            <p className="sidebar-meta">{selectedService.price}</p>
            <p className="muted small">{selectedService.groupDescription}</p>
            <div className="sidebar-share">
              <p className="muted small">Direct link:</p>
              <a className="service-share" href={bookingShareLink}>
                {bookingShareLink}
              </a>
            </div>
          </div>

          <div className="sidebar-card">
            <p className="eyebrow">Time format</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip${clockFormat === '12h' ? ' is-active' : ''}`}
                onClick={() => setClockFormat('12h')}
              >
                12h
              </button>
              <button
                type="button"
                className={`chip${clockFormat === '24h' ? ' is-active' : ''}`}
                onClick={() => setClockFormat('24h')}
              >
                24h
              </button>
            </div>
            <label className="timezone-picker">
              <span className="muted small">Timezone</span>
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                <option value="Europe/Dublin">Europe/Dublin</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
          </div>

          {selectedService.multiDay && (
            <div className="sidebar-card">
              <p className="eyebrow">Multi-day checkout</p>
              <label className="booking-form__field">
                <span>Checkout date</span>
                <input
                  type="date"
                  value={endDate}
                  min={selectedDateKey}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                />
              </label>
              <p className="muted small">Blocks your calendar until checkout.</p>
            </div>
          )}
        </aside>

        <div className="booking-frame__main">
          <div className="calendar-card">
            <div className="calendar-header">
              <div>
                <p className="eyebrow">Availability</p>
                <h3>
                  {visibleMonth.toLocaleString('default', { month: 'long' })} {visibleMonth.getFullYear()}
                </h3>
              </div>
              <div className="calendar-controls">
                <button
                  type="button"
                  className="nav-button"
                  aria-label="Previous month"
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="nav-button"
                  aria-label="Next month"
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="calendar-grid__heading">
                  {day}
                </div>
              ))}
              {monthDays.map((day) => {
                const dayKey = day.toISOString().split('T')[0];
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = dayKey === selectedDateKey;
                const isToday = dayKey === new Date().toISOString().split('T')[0];
                return (
                  <button
                    type="button"
                    key={dayKey}
                    className={`calendar-day${isSelected ? ' is-selected' : ''}${!isCurrentMonth ? ' is-muted' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <span>{day.getDate()}</span>
                    {isToday && <small className="today-dot">Today</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="times-card">
            <div className="times-card__header">
              <div>
                <p className="eyebrow">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                <h3>Pick a time</h3>
                <p className="muted small">{availabilityStatus}</p>
              </div>
              {selectedService.multiDay && (
                <div className="pill pill--ghost">Multi-day stay · checkout {endDate}</div>
              )}
            </div>
            <div className="times-card__slots">
              {isLoading && <div className="muted">Loading availability…</div>}
              {!isLoading && availability.length === 0 && <div className="muted">No open times on this day.</div>}
              {!isLoading &&
                availability.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    className={`slot-chip${selectedSlot?.start === slot.start ? ' is-selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span className="slot-time">{slot.label}</span>
                    <span className="slot-meta">{selectedService.subtitle}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="booking-card booking-card--details">
        <div className="booking-card__header">
          <p className="eyebrow">Step 3</p>
          <h2>Confirm details</h2>
          <p className="muted">We’ll email you to confirm and share pickup notes.</p>
        </div>
        <form className="booking-form" onSubmit={handleSubmit}>
          <label className="booking-form__field">
            <span>Name</span>
            <input
              type="text"
              required
              value={clientName}
              placeholder="Your name"
              onChange={(event) => setClientName(event.target.value)}
            />
          </label>
          <label className="booking-form__field">
            <span>Dog’s name</span>
            <input
              type="text"
              value={dogName}
              placeholder="Optional—helps us greet them right"
              onChange={(event) => setDogName(event.target.value)}
            />
          </label>
          <label className="booking-form__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={clientEmail}
              placeholder="you@example.com"
              onChange={(event) => setClientEmail(event.target.value)}
            />
          </label>
          <label className="booking-form__field">
            <span>Notes for us</span>
            <textarea
              value={notes}
              placeholder="Let us know about your dog, pickup instructions, or goals."
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <p className="muted">
            A lightweight in-house scheduler: pick a slot, send details, and we’ll confirm your booking by email.
          </p>
          <div className="booking-form__actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Locking in…' : 'Confirm booking'}
            </button>
            <div className="tiny-note">Built in-house to match your calendar style</div>
          </div>
        </form>
      </section>

      <section className="booking-card booking-card--calendar">
        <div className="booking-card__header">
          <p className="eyebrow">Your calendar</p>
          <h2>Private, in-house scheduling</h2>
          <p className="muted">
            Saved bookings stay in your browser and export to your own calendar—no external scheduling platforms.
          </p>
        </div>
        {calendarBookings.length === 0 && (
          <div className="empty-note">Confirm a booking to populate your private list.</div>
        )}
        {calendarBookings.length > 0 && (
          <div className="calendar-entry__list">
            {calendarBookings.map((booking) => (
              <div key={booking.id} className="calendar-entry">
                <div className="calendar-entry__info">
                  <div className="calendar-entry__header">
                    <span className={`pill variant-pill variant-pill--${booking.service.accent}`}>
                      {booking.service.subtitle}
                    </span>
                    <strong>{booking.service.title}</strong>
                  </div>
                  <p className="calendar-entry__meta">{formatBookingDateRange(booking)}</p>
                  <p className="calendar-entry__meta muted small">{booking.clientName || 'Client pending'}</p>
                  <Link className="service-share" href={booking.service.path}>
                    {booking.service.path}
                  </Link>
                </div>
                <div className="calendar-entry__actions">
                  <button className="chip ghost" type="button" onClick={() => removeBooking(booking.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lastBooking && (
        <section className="calendar-card add-on">
          <div>
            <p className="eyebrow">Optional</p>
            <h3>Add to your calendar</h3>
            <p className="muted">
              Drop this booking into Google Calendar or download an .ics file for Outlook/Apple Calendar. We fill in the
              details so you never lose track.
            </p>
          </div>
          {(() => {
            const calendarDetails = getCalendarDetails(lastBooking);
            if (!calendarDetails) return null;
            const icsData = buildICSData(calendarDetails);
            const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsData)}`;
            const googleHref = buildGoogleCalendarLink(calendarDetails);

            return (
              <div className="calendar-actions">
                <a className="submit-button ghost" href={googleHref} target="_blank" rel="noreferrer">
                  Add to Google Calendar
                </a>
                <a className="submit-button ghost" href={icsHref} download={`${selectedService.id}-booking.ics`}>
                  Download .ics
                </a>
                <div className="calendar-meta">
                  <p className="muted small">Service link:</p>
                  <Link href={lastBooking.service.path} className="service-share">
                    {lastBooking.service.path}
                  </Link>
                </div>
              </div>
            );
          })()}
        </section>
      )}
    </main>
  );
};

export default Booking;