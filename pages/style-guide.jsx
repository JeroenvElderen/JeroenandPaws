import StyleGuide from '../src/views/StyleGuide/StyleGuide';
import SeoMeta from '../src/components/SeoMeta';

const StyleGuidePage = () => (
  <>
    <SeoMeta
      title="Style Guide"
      description="Internal style reference for Jeroen & Paws interface components."
      noIndex
    />
    <StyleGuide />
  </>
);

export default StyleGuidePage;
