import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navConfig = [
  {
    title: 'Home',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
    path: '/',
  },
  {
    title: 'Log In',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
    path: paths.auth.jwt.login,
  },
  {
    title: 'Get Started',
    icon: <Iconify icon="solar:rocket-3-bold-duotone" />,
    path: '/#contact',
  },
];
