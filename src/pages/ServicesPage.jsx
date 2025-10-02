import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MainLayout } from '../components/layout/MainLayout';
import { ServiceGrid } from '../components/services/ServiceGrid';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export function ServicesPage() {
  const [state, setState] = useState({ services: [], loading: true, error: null });

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const { data, error } = await supabase
          .from('services_hero')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setState({ services: data ?? [], loading: false, error: null });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({ ...previous, loading: false, error }));
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const { services, loading, error } = state;

  return (
    <MainLayout>
      {loading && <LoadingState label="Loading services…" />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && <ServiceGrid services={services} title="All services" />}
    </MainLayout>
  );
}
