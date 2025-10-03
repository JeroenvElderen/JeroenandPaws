import React, { useEffect, useMemo, useState } from 'react';
import ServicesFeatureSection from './sections/ServicesFeatureSection';
import ServicesPricingSection from './sections/ServicesPricingSection';
import ServicesTestimonialsSection from './sections/ServicesTestimonialsSection';
import ServicesCtaSection from './sections/ServicesCtaSection';
import ServicesFaqSection from './sections/ServicesFaqSection';
import { supabase } from '../../supabaseClient';

const SERVICES_PAGE_SLUG = 'services';

const buildCta = (heroEntry) => {
  if (!heroEntry) {
    return null;
  }

  const {
    heading,
    primary_cta_label: primaryLabel,
    primary_cta_url: primaryUrl,
    secondary_cta_label: secondaryLabel,
    secondary_cta_url: secondaryUrl,
  } = heroEntry;

  return {
    heading: heading || null,
    primaryCta: primaryLabel && primaryUrl ? { label: primaryLabel, url: primaryUrl } : null,
    secondaryCta: secondaryLabel && secondaryUrl ? { label: secondaryLabel, url: secondaryUrl } : null,
  };
};

const Services = () => {
  const [servicesHero, setServicesHero] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchServicesContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const [heroResponse, carePlanResponse, testimonialResponse, faqResponse] = await Promise.all([
          supabase
            .from('services_hero')
            .select('*')
            .order('created_at', { ascending: true }),
          supabase
            .from('care_plans')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }),
          supabase
            .from('testimonials')
            .select('*')
            .order('display_order', { ascending: true }),
          supabase
            .from('services_faq')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }),
        ]);

        if (!isMounted) {
          return;
        }

        const responseErrors = [
          heroResponse.error,
          carePlanResponse.error,
          testimonialResponse.error,
          faqResponse.error,
        ].filter(Boolean);

        if (responseErrors.length > 0) {
          throw new Error(responseErrors.map((item) => item.message).join(' | '));
        }

        setServicesHero(heroResponse.data ?? []);
        setCarePlans(carePlanResponse.data ?? []);
        setTestimonials(testimonialResponse.data ?? []);
        setFaqs(faqResponse.data ?? []);
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServicesContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const ctaContent = useMemo(() => buildCta(servicesHero[0]), [servicesHero]);

  const filteredFaqs = useMemo(
    () =>
      faqs.filter(
        (faq) => !faq.service_slug || faq.service_slug === SERVICES_PAGE_SLUG,
      ),
    [faqs],
  );

  return (
    <main>
      {(loading || error) && (
        <section className="section">
          <div className="container">
            {loading && <p>Loading services...</p>}
            {error && (
              <p role="alert">
                There was an issue loading the services content. {error}
              </p>
            )}
          </div>
        </section>
      )}
      <ServicesFeatureSection heroEntries={servicesHero} />
      <ServicesPricingSection carePlans={carePlans} />
      <ServicesTestimonialsSection testimonials={testimonials} />
      <ServicesFaqSection faqs={filteredFaqs} />
      <ServicesCtaSection
        heading={ctaContent?.heading}
        primaryCta={ctaContent?.primaryCta}
        secondaryCta={ctaContent?.secondaryCta}
      />
    </main>
  );
};

export default Services;