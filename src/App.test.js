import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from './router';

jest.mock('./supabaseClient', () => {
  const dataByTable = {
    services_hero: [
      {
        id: '1',
        service_slug: 'training',
        heading: 'Compassionate training',
        subheading: 'Personalised plans for happy, confident pets.',
        primary_cta_label: 'Get started',
        primary_cta_url: '#',
      },
    ],
    care_plans: [],
    faqs: [],
    testimonials: [],
    services_faq: [],
  };

  const createQuery = (table) => {
    const response = { data: dataByTable[table] ?? [], error: null };
    return {
      select: () => createQuery(table),
      order: () => Promise.resolve(response),
      eq: () => ({
        order: () => Promise.resolve(response),
        maybeSingle: () => Promise.resolve({
          data: response.data[0] ?? null,
          error: null,
        }),
      }),
      maybeSingle: () => Promise.resolve({ data: response.data[0] ?? null, error: null }),
    };
  };

  return {
    supabase: {
      from: (table) => createQuery(table),
    },
  };
});

test('renders the home page hero heading', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const heading = await screen.findByRole('heading', { name: /compassionate training/i });
  expect(heading).toBeInTheDocument();
});
