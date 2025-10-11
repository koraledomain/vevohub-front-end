import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const HighlightCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.secondary.light, 0.24)}`,
  backgroundColor: alpha(theme.palette.secondary.lighter, 0.2),
  backdropFilter: 'blur(10px)',
}));

const highlights = [
  {
    client: 'Seastar Bank',
    impact: 'Scaled a 14-person Korale pod across product and risk within eight weeks.',
    stat: '32% faster lending approvals',
  },
  {
    client: 'NorthCurrent Energy',
    impact: 'Introduced leased data stewards while coaching internal product leads.',
    stat: 'Adoption up 45% in 3 months',
  },
  {
    client: 'Lotus Mobility',
    impact: 'Blended Korale storytellers with UX strategists to relaunch rider onboarding.',
    stat: 'CSAT 4.8 ★ across new cohorts',
  },
];

// ----------------------------------------------------------------------

export default function HomeClientHighlights() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 12, md: 16 },
        background: (theme) =>
          `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.secondary.lighter, 0.55)} 0%, transparent 55%),
          radial-gradient(circle at 80% 0%, ${alpha(theme.palette.primary.light, 0.4)} 0%, transparent 50%),
          ${theme.palette.background.paper}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Typography variant="overline" color="secondary">
            Client highlights
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Trusted by teams who build with empathy and pace.
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: 18, md: 20 } }}>
            Korale pods grow inside your organisation, creating coral reefs of capability that outlast the
            initial engagement.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: { xs: 6, md: 8 } }}>
          {highlights.map((highlight) => (
            <HighlightCard key={highlight.client}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ color: 'secondary.darker', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {highlight.client}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {highlight.stat}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{highlight.impact}</Typography>
              </Stack>
            </HighlightCard>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
