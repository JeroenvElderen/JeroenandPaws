import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_NAME = 'Jeroen & Paws';
const SITE_URL = 'https://jeroenandpaws.com';
const DEFAULT_IMAGE = '/logo3.svg';

const SeoMeta = ({ title, description, image = DEFAULT_IMAGE, noIndex = false }) => {
  const router = useRouter();
  const path = router.asPath?.split('#')[0]?.split('?')[0] || '/';
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#0c081f" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
};

export default SeoMeta;
