import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function HomeContactCta() {
  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: { xs: 12, md: 16 },
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.95)} 0%, ${alpha(
            theme.palette.primary.main,
            0.92
          )} 100%)`,
        color: 'common.white',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ maxWidth: 640 }}>
          <Typography variant="overline" sx={{ letterSpacing: 2 }}>
            Start your coral formation
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Ready to see how Korale can lease, coach, and elevate your next delivery wave?
          </Typography>
          <Typography sx={{ color: alpha('#FFFFFF', 0.86), fontSize: { xs: 18, md: 20 } }}>
            Share your upcoming milestones and we&apos;ll map the right Korale pod, complete with embedded
            leadership and onboarding rituals tailored for your context.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button size="large" color="inherit" variant="contained" component="a" href="mailto:hello@korale.studio">
              Book a discovery call
            </Button>
            <Button
              size="large"
              color="inherit"
              variant="outlined"
              component="a"
              href="#clients"
              sx={{ borderColor: alpha('#FFFFFF', 0.5) }}
            >
              Explore client stories
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
