import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MainLayout } from '../components/layout/MainLayout';
import { TestimonialsSection } from '../components/testimonials/TestimonialsSection';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export function TestimonialsPage() {
  const [state, setState] = useState({ testimonials: [], loading: true, error: null });

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setState({ testimonials: data ?? [], loading: false, error: null });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({ ...previous, loading: false, error }));
      }
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  const { testimonials, loading, error } = state;

  return (
    <MainLayout>
      {loading && <LoadingState label="Loading testimonials…" />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && <TestimonialsSection testimonials={testimonials} />}
    </MainLayout>
  );
}
