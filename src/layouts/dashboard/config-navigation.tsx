import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

import { useFeatureFlags } from "../../utils/featureflags";

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { isProfilePageEnabled } = useFeatureFlags();

  return useMemo(
    () => [
      // OVERVIEW
      {
        subheader: 'Dashboard',
        items: [
          ...(isProfilePageEnabled
            ? [{ title: 'profiles', path: paths.dashboard.root, icon: ICONS.dashboard }]
            : []),
          { title: 'jobs', path: paths.dashboard.two, icon: ICONS.job },
          {
            title: 'Reporting',
            path: paths.dashboard.reporting,
            icon: ICONS.analytics,
          },
        ],
      },
      // MANAGEMENT
      {
        subheader: 'gdpr',
        items: [
          {
            title: 'gdpr',
            path: paths.dashboard.gdpr.root,
            icon: ICONS.job,
            children: [
              { title: 'builder', path: paths.dashboard.gdpr.builder },
              { title: 'generated', path: paths.dashboard.gdpr.generated },
            ],
          },
        ],
      },
      // MANAGEMENT
      {
        subheader: 'management',
        items: [
          {
            title: 'user',
            path: paths.dashboard.group.root,
            icon: ICONS.user,
            children: [
              { title: 'account', path: paths.dashboard.group.account },
            ],
          },
        ],
      },
    ],
    [isProfilePageEnabled] // Add the dependency here
  );
}
