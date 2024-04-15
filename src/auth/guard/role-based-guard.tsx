import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Theme, SxProps } from '@mui/material/styles';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

import { User } from '../types';

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  hasContent?: boolean;
  roles?: string[];
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function RoleBasedGuard({ hasContent, roles, children, sx }: RoleBasedGuardProp) {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await useMockedUser();
        console.log(userData)
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  // Logic here to get current user role

  // const currentRole = 'user';
  const currentRole = user?.role; // admin;

  if (typeof roles !== 'undefined' && !roles.includes(currentRole as string)) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>
      </Container>
    ) : null;
  }

  return <> {children} </>;
}
