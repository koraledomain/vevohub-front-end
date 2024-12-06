import {lazy, Suspense} from 'react';
import {Outlet} from 'react-router-dom';

import {AuthGuard} from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import {LoadingScreen} from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/profiles/list'));
const PageTwo = lazy(() => import('src/pages/dashboard/gdpr/gdpr'));
const FormBuilder = lazy(() => import('src/pages/dashboard/gdpr/formbuilder'));
const GeneratedForm = lazy(() => import('src/pages/dashboard/gdpr/generatedform'));
const ReportingPage = lazy(() => import('src/pages/dashboard/reporting/reporting'));
const PageFour = lazy(() => import('src/pages/dashboard/user/usermanagement'));
const PageFive = lazy(() => import('src/pages/dashboard/five'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

// ----------------------------------------------------------------------

// Profiles

const UserCreatePage = lazy(() => import('src/pages/dashboard/profiles/new'));
const ProfileEditPage = lazy(() => import('src/pages/dashboard/profiles/edit'));

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen/>}>
            <Outlet/>
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {element: <IndexPage/>, index: true},
      {path: 'gdpr', children:[
          {path:'form-builder',element: <FormBuilder/>},
          {path:'generated-form',element: <GeneratedForm/>}
        ]},
      {path: 'reporting', element: <ReportingPage/>},
      {
        path: 'profiles',
        children: [
          {path: 'new', element: <UserCreatePage/>},
          {path: ':id/edit', element: <ProfileEditPage/>},
        ],
      },
      {
        path: 'group',
        children: [
          {element: <PageFour/>, index: true},
          {path: 'five', element: <PageFive/>},
          {path: 'account', element: <UserAccountPage/>},
        ],
      },
    ],
  },
];
