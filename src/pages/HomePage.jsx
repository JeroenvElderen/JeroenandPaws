import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MainLayout } from '../components/layout/MainLayout';
import { HeroSection } from '../components/hero/HeroSection';
import { ServiceGrid } from '../components/services/ServiceGrid';
import { CarePlanList } from '../components/carePlans/CarePlanList';
import { TestimonialsSection } from '../components/testimonials/TestimonialsSection';
import { FaqList } from '../components/faq/FaqList';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export function HomePage() {
  const [state, setState] = useState({
    heroes: [],
    carePlans: [],
    faqs: [],
    testimonials: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const [heroRes, carePlanRes, faqRes, testimonialRes] = await Promise.all([
          supabase.from('services_hero').select('*').order('created_at', { ascending: true }),
          supabase.from('care_plans').select('*').order('sort_order', { ascending: true }),
          supabase.from('faqs').select('*').order('display_order', { ascending: true }),
          supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true }),
        ]);

        const firstError = [heroRes, carePlanRes, faqRes, testimonialRes].find((result) => result.error)?.error;

        if (firstError) {
          throw firstError;
        }

        if (!isMounted) {
          return;
        }

        setState({
          heroes: heroRes.data ?? [],
          carePlans: carePlanRes.data ?? [],
          faqs: faqRes.data ?? [],
          testimonials: testimonialRes.data ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({
          ...previous,
          loading: false,
          error,
        }));
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const { heroes, carePlans, faqs, testimonials, loading, error } = state;
  const featuredHero = heroes[0];

  return (
    <MainLayout>
      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && (
        <>
          <HeroSection hero={featuredHero} />
          <ServiceGrid services={heroes} title="Our services" />
          <CarePlanList plans={carePlans} />
          <TestimonialsSection testimonials={testimonials} />
          <FaqList faqs={faqs} />
        </>
      )}
    </MainLayout>
  );
}
