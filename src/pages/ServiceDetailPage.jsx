import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MainLayout } from '../components/layout/MainLayout';
import { HeroSection } from '../components/hero/HeroSection';
import { CarePlanList } from '../components/carePlans/CarePlanList';
import { FaqList } from '../components/faq/FaqList';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useRouteParams } from '../router';

export function ServiceDetailPage() {
  const { serviceSlug } = useRouteParams();
  const [state, setState] = useState({
    hero: null,
    carePlans: [],
    faqs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadService() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const [heroRes, carePlanRes, faqRes] = await Promise.all([
          supabase
            .from('services_hero')
            .select('*')
            .eq('service_slug', serviceSlug)
            .maybeSingle(),
          supabase
            .from('care_plans')
            .select('*')
            .eq('service_slug', serviceSlug)
            .order('sort_order', { ascending: true }),
          supabase
            .from('services_faq')
            .select('*')
            .eq('service_slug', serviceSlug)
            .order('sort_order', { ascending: true }),
        ]);

        const firstError = [heroRes, carePlanRes, faqRes].find((result) => result.error)?.error;

        if (firstError) {
          throw firstError;
        }

        if (!isMounted) {
          return;
        }

        setState({
          hero: heroRes.data ?? null,
          carePlans: carePlanRes.data ?? [],
          faqs: faqRes.data ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({ ...previous, loading: false, error }));
      }
    }

    loadService();

    return () => {
      isMounted = false;
    };
  }, [serviceSlug]);

  const { hero, carePlans, faqs, loading, error } = state;

  return (
    <MainLayout>
      {loading && <LoadingState label="Loading service…" />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && !hero && <ErrorState message="Service not found." />}
      {!loading && !error && hero && (
        <>
          <HeroSection hero={hero} />
          <CarePlanList plans={carePlans} title="Care plans for this service" />
          <FaqList faqs={faqs} title="Service FAQs" id="service-faqs" />
        </>
      )}
    </MainLayout>
  );
}
