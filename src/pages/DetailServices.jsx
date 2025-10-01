import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { NavBar, Footer } from '../components/home';
import {
  DetailServicesHeroSection,
  CarePlansSection,
  ServicesFAQSection,
} from '../components/detailServices';

const DetailServices = () => {
  const { serviceId } = useParams();
  const [hero, setHero] = useState(null);
  const [carePlans, setCarePlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: heroData, error: heroError } = await supabase
          .from('services_hero')
          .select('*')
          .eq('service_slug', serviceId)
          .single();
        if (heroError) throw heroError;

        const { data: plans, error: plansError } = await supabase
          .from('care_plans')
          .select('*')
          .eq('service_slug', serviceId)
          .order('sort_order');
        if (plansError) throw plansError;

        const { data: faqData, error: faqError } = await supabase
          .from('services_faq')
          .select('*')
          .eq('service_slug', serviceId)
          .order('sort_order');
        if (faqError) throw faqError;

        setHero(heroData);
        setCarePlans(plans || []);
        setFaqs(faqData || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [serviceId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading service...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <>
      <NavBar />
      {hero && <DetailServicesHeroSection data={hero} />}
      {carePlans.length > 0 && <CarePlansSection data={carePlans} />}
      {faqs.length > 0 && <ServicesFAQSection data={faqs} />}
      <Footer />
    </>
  );
};

export default DetailServices;
