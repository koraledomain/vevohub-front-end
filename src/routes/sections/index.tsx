import {Navigate, useRoutes} from 'react-router-dom';

import {PATH_AFTER_LOGIN} from 'src/config-global';

import { HomePage, mainRoutes } from './main';
import {authRoutes} from './auth';
import {dashboardRoutes} from './dashboard';
import {useFeatureFlags} from "../../utils/featureflags";
import DashboardLayout from "../../layouts/dashboard";
import MainLayout from "../../layouts/main";

// ----------------------------------------------------------------------

export default function Router() {
  const featureFlags = useFeatureFlags()
  return useRoutes([

    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: (
        <MainLayout>
          <HomePage />
        </MainLayout>
      ),
    },
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace/>,
    },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes(featureFlags),

    // Main routes
    ...mainRoutes,

    // testchange

    // No match 404
    {path: '*', element: <Navigate to="/404" replace/>},
  ]);
}
