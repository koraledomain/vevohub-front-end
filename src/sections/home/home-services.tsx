import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const CapabilityCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.75 : 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
  boxShadow: `0 30px 60px ${alpha(theme.palette.grey[900], theme.palette.mode === 'light' ? 0.12 : 0.4)}`,
  backdropFilter: 'blur(12px)',
}));

const capabilities = [
  {
    title: 'Korale Mapping',
    description:
      'Align your roadmap to the human skills it needs. We analyse delivery rituals, velocity, and culture to build dynamic leasing plans.',
    highlights: ['Capability audit', 'Squad design', 'Leadership pairing'],
  },
  {
    title: 'Adaptive Staffing Pods',
    description:
      'Flexible, coral-like structures of specialists that scale with tides of demand. Always guided by our Korale talent partners.',
    highlights: ['On-demand specialists', 'Product & data leads', 'Progress rituals'],
  },
  {
    title: 'Enablement & Coaching',
    description:
      'We coach embedded leads and sponsors to keep energy high and psychological safety thriving across leased teams.',
    highlights: ['Executive labs', 'Squad retrospectives', 'DEI storytelling'],
  },
];

// ----------------------------------------------------------------------

export default function HomeServices() {
  return (
    <Box component="section" id="services" sx={{ py: { xs: 12, md: 16 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ textAlign: { xs: 'left', md: 'center' }, maxWidth: 720, mx: { md: 'auto' } }}>
          <Typography variant="overline" color="primary">Korale capabilities</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Coral-inspired operating models for modern teams.
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: 18, md: 20 } }}>
            Our consultants blend leasing agility with embedded leadership support so your squads can absorb
            change and still deliver with heart.
          </Typography>
        </Stack>

        <Grid container spacing={4} sx={{ mt: { xs: 6, md: 8 } }}>
          {capabilities.map((capability) => (
            <Grid key={capability.title} container spacing={12}>
              <CapabilityCard>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {capability.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 1 }}>{capability.description}</Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {capability.highlights.map((highlight) => (
                      <Chip key={highlight} label={highlight} color="primary" variant="soft" />
                    ))}
                  </Stack>
                </Stack>
              </CapabilityCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
