import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

import { HEADER } from 'src/layouts/config-layout';

import { varFade, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

const HeroRoot = styled('section')(({ theme }) => ({
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.88)} 0%, ${alpha(
    theme.palette.secondary.main,
    0.92
  )} 45%, ${alpha(theme.palette.primary.main, 0.95)} 100%)`,
  color: theme.palette.common.white,
  paddingTop: `${HEADER.H_MOBILE + 40}px`,
  paddingBottom: theme.spacing(16),
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    paddingTop: `${HEADER.H_DESKTOP + 80}px`,
  },
}));

const CoralBackdrop = styled('img')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.24,
  mixBlendMode: theme.palette.mode === 'light' ? 'screen' : 'luminosity',
}));

const CoralAccent = styled('img')(({ theme }) => ({
  position: 'absolute',
  right: -120,
  bottom: -80,
  width: 420,
  opacity: 0.32,
  filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.25))',
  [theme.breakpoints.up('md')]: {
    right: 40,
    bottom: -40,
    width: 520,
  },
}));

// ----------------------------------------------------------------------

export default function HomeHeroKorale() {
  return (
    <HeroRoot id="hero">
      <CoralBackdrop src="/assets/korale/hero-coral-pattern.svg" alt="Korale coral texture" />
      <CoralAccent src="/assets/korale/hero-coral-reef.svg" alt="Korale coral reef" />

      <Container component={MotionContainer} maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={6} maxWidth={720}>
          <m.div variants={varFade().inUp}>
            <Typography variant="overline" sx={{ color: 'common.white', letterSpacing: 2 }}>
              Workforce Leasing, Reimagined
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 64 }, fontWeight: 800, lineHeight: 1.1 }}>
              Shape resilient teams with Korale&apos;s people-first consultancy.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography sx={{ color: alpha('#FFFFFF', 0.88), fontSize: { xs: 18, md: 20 } }}>
              We connect the right specialists to the right challenges, blending leasing flexibility with
              leadership coaching so your delivery squads stay adaptive, inclusive, and future-ready.
            </Typography>
          </m.div>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <m.div variants={varFade().inUp}>
              <Button size="large" color="secondary" variant="contained" component="a" href="#contact">
                Build my Korale team
              </Button>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Button
                size="large"
                color="inherit"
                variant="outlined"
                component="a"
                href="#services"
                sx={{ borderColor: alpha('#FFFFFF', 0.48) }}
              >
                Discover our playbooks
              </Button>
            </m.div>
          </Stack>
        </Stack>
      </Container>
    </HeroRoot>
  );
}
