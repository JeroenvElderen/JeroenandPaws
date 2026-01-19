import React, { useEffect, useMemo, useState } from "react";
import PricingStyles from "../../components/Pricing/PricingStyles";

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Custom";
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
};

const parsePriceValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatServicePrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Custom";
  }

  if (typeof value === "number") {
    return formatCurrency(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Custom";
    }

    if (/^[0-9,.]+$/.test(trimmed)) {
      const parsed = parsePriceValue(trimmed);
      return parsed !== null ? formatCurrency(parsed) : trimmed;
    }

    return trimmed;
  }

  return "Custom";
};

const formatAddonPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Custom";
  }

  if (typeof value === "string" && /[^0-9,.-]/.test(value)) {
    return value;
  }

  const parsed = parsePriceValue(value);
  return parsed !== null ? formatCurrency(parsed) : "Custom";
};

const formatDuration = (minutes) => {
  if (!minutes || Number.isNaN(minutes)) return null;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${hours.toFixed(1)} hours`;
};

const Pricing = () => {
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [servicesRes, addonsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/addons"),
        ]);

        if (!servicesRes.ok || !addonsRes.ok) {
          throw new Error("Failed to load pricing data");
        }

        const servicesData = await servicesRes.json();
        const addonsData = await addonsRes.json();

        if (!isActive) return;

        setServices(servicesData.services || []);
        setAddons(addonsData.addons || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const groupedServices = useMemo(() => {
    const grouped = new Map();
    services.forEach((service) => {
      const category = service.category || "Other services";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category).push(service);
    });
    return Array.from(grouped.entries());
  }, [services]);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="header is-align-center">
            <div className="heading_h1">Pricing</div>
            <h2 className="heading_h3">Transparent pricing for every service</h2>
            <p className="subheading max-width_large">
              Every service lists its base price upfront, and every add-on is
              shown with its cost. No clicks needed, just clear choices.
            </p>
          </div>
        </div>
      </section>

      <section className="section is-secondary">
        <div className="container">
          <div className="header is-align-center">
            <div className="heading_h2">Services &amp; plans</div>
            <p className="subheading max-width_large">
              All prices are shown per visit unless noted. Multi-dog discounts
              and recurring options are available in the booking flow.
            </p>
          </div>

          {isLoading && (
            <div className="text-align_center">
              <p>Loading pricing details…</p>
            </div>
          )}

          {!isLoading && groupedServices.length === 0 && (
            <div className="text-align_center">
              <p>No services are available right now.</p>
            </div>
          )}

          {!isLoading &&
            groupedServices.map(([category, items]) => (
              <div key={category} className="margin-top_large">
                <div className="header is-align-center">
                  <div className="heading_h3">{category}</div>
                </div>
                <ul className="grid_3-col tablet-1-col gap-xsmall text-align_center w-list-unstyled">
                  {items.map((service) => {
                    const durationLabel = formatDuration(service.duration_minutes);
                    return (
                      <li key={service.slug || service.id} className="card on-secondary">
                        <div className="card_body is-small">
                          <div className="margin_bottom-auto">
                            <h4>{service.title}</h4>
                            {durationLabel && (
                              <div className="eyebrow">{durationLabel}</div>
                            )}
                            <p className="heading_h3">{formatServicePrice(service.price)}</p>
                            {service.description && <p>{service.description}</p>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="header is-align-center">
            <div className="heading_h2">Additional care</div>
            <p className="subheading max-width_large">
              Optional add-ons are listed here with their pricing, so you can
              personalize care while staying fully informed.
            </p>
          </div>

          {!isLoading && addons.length === 0 && (
            <div className="text-align_center">
              <p>No add-ons are available right now.</p>
            </div>
          )}

          <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
            {addons.map((addon) => (
              <div key={addon.value || addon.id} className="card">
                <div className="card_body">
                  <div className="eyebrow">Add-on</div>
                  <h4>{addon.label || addon.title}</h4>
                  <p className="heading_h3">{formatAddonPrice(addon.price)}</p>
                  {addon.description && <p>{addon.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PricingStyles />
    </main>
  );
};

export default Pricing;