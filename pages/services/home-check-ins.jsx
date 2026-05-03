import HomeCheckins from '../../src/views/Services/Home-checkins/HomeCheckins';
import SeoMeta from '../../src/components/SeoMeta';

const HomeCheckinsPage = () => (
  <>
    <SeoMeta
      title="Home Check-ins"
      description="Professional home check-ins services tailored to your dog's routine and comfort."
    />
    <HomeCheckins />
  </>
);

export default HomeCheckinsPage;
