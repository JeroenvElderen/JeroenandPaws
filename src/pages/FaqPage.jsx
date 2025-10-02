import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MainLayout } from '../components/layout/MainLayout';
import { FaqList } from '../components/faq/FaqList';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export function FaqPage() {
  const [state, setState] = useState({ faqs: [], loading: true, error: null });

  useEffect(() => {
    let isMounted = true;

    async function loadFaqs() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setState({ faqs: data ?? [], loading: false, error: null });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({ ...previous, loading: false, error }));
      }
    }

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const { faqs, loading, error } = state;

  return (
    <MainLayout>
      {loading && <LoadingState label="Loading FAQs…" />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && <FaqList faqs={faqs} />}
    </MainLayout>
  );
}
