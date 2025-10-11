import { Outlet } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';

import { useFeatureFlag } from 'src/hooks/use-feature-flag';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterPage = lazy(() => import('src/pages/auth/jwt/register'));
const ClassicForgotPasswordView = lazy(() => import('src/pages/auth/jwt/forgot-password'));


// ----------------------------------------------------------------------

const authJwt = {
  path: 'jwt',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'login',
      element: <LoginGate />,
    },
    {
      path: 'register',
      element: (
        <GuestGuard>
          <AuthClassicLayout title="Manage the job more effectively with Minimal">
            <JwtRegisterPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'forgot-password',
      element: (
        <AuthClassicLayout>
          <ClassicForgotPasswordView />
        </AuthClassicLayout>
      ),
    }
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authJwt],
  },
];

function LoginGate() {
  const enabled = useFeatureFlag('login');
  if (!enabled) return null;
  return (
    <GuestGuard>
      <AuthClassicLayout>
        <JwtLoginPage />
      </AuthClassicLayout>
    </GuestGuard>
  );
}
