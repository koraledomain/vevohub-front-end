import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const TestimonialCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.common.white, theme.palette.mode === 'light' ? 0.75 : 0.1),
  border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
  boxShadow: `0 25px 50px ${alpha(theme.palette.grey[900], theme.palette.mode === 'light' ? 0.15 : 0.5)}`,
  backdropFilter: 'blur(14px)',
}));

const testimonials = [
  {
    name: 'Carina West',
    role: 'Head of Digital, Seastar Bank',
    quote:
      'Korale delivered a blended team that felt like our own people within days. Their rituals and coaching kept everyone energised through regulatory sprints.',
  },
  {
    name: 'Josef Adeyemi',
    role: 'VP Product, NorthCurrent Energy',
    quote:
      'The Korale pod understood our culture quickly and lifted our data practice. We finally have a leasing model that scales responsibly.',
  },
  {
    name: 'Linh Tran',
    role: 'CX Director, Lotus Mobility',
    quote:
      'Storytelling strategists from Korale reframed our onboarding journey and empowered our internal squad to keep iterating with empathy.',
  },
];

// ----------------------------------------------------------------------

export default function HomeTestimonials() {
  return (
    <Box component="section" id="testimonials" sx={{ py: { xs: 12, md: 16 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
          <Typography variant="overline" color="primary">
            Voices from the reef
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Leaders choose Korale for sustained momentum.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: { xs: 6, md: 8 } }}>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name}>
              <Stack spacing={3}>
                <Rating value={5} readOnly sx={{ color: 'secondary.main' }} />
                <Typography sx={{ fontSize: { xs: 18, md: 20 }, color: 'text.primary' }}>
                  “{testimonial.quote}”
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>{testimonial.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </TestimonialCard>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
