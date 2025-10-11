import { useScroll } from 'framer-motion';

import Box from '@mui/material/Box';

import ScrollProgress from 'src/components/scroll-progress';

import HomeServices from '../home-services';
import HomeHeroKorale from '../home-hero-korale';
import HomeContactCta from '../home-contact-cta';
import HomeTestimonials from '../home-testimonials';
import HomeClientHighlights from '../home-client-highlights';

// ----------------------------------------------------------------------

export default function HomeView() {
  const { scrollYProgress } = useScroll();

  return (
    <>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <HomeHeroKorale />

      <Box component="div" sx={{ bgcolor: 'background.default' }}>
        <HomeServices />
        <HomeClientHighlights />
        <HomeTestimonials />
        <HomeContactCta />
      </Box>
    </>
  );
}
