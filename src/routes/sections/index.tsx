import {Navigate, useRoutes} from 'react-router-dom';

import {PATH_AFTER_LOGIN} from 'src/config-global';

import {mainRoutes} from './main';
import {authRoutes} from './auth';
import {dashboardRoutes} from './dashboard';
import {useFeatureFlags} from "../../utils/featureflags";

// ----------------------------------------------------------------------

export default function Router() {
  const featureFlags = useFeatureFlags()
  return useRoutes([
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

    // No match 404
    {path: '*', element: <Navigate to="/404" replace/>},
  ]);
}
