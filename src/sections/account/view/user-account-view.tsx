import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { usePathname, useRouter } from 'src/routes/hooks';

import { paths } from '../../../routes/paths';
import AccountGeneral from '../account-general';
import { useAuthContext } from '../../../auth/hooks';
import AccountNotifications from '../account-notifications';
import AccountChangePassword from '../account-change-password';
import UserManagementView from './user-management-view';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'account',
    label: 'Account',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'manage-users',
    label: 'Manage Users',
    icon: <Iconify icon="solar:users-group-rounded-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

const ACCOUNT_TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: <Iconify icon="solar:bell-bing-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState('account');
  const [currentAccountTab, setCurrentAccountTab] = useState('general');

  // Detect which tab should be active based on the current route
  useEffect(() => {
    if (pathname === paths.dashboard.group.manageUsers) {
      setCurrentTab('manage-users');
    } else {
      setCurrentTab('account');
    }
  }, [pathname]);

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
      // Navigate to the appropriate route when tab changes
      if (newValue === 'manage-users') {
        router.push(paths.dashboard.group.manageUsers);
      } else {
        router.push(paths.dashboard.group.account);
      }
    },
    [router]
  );

  const handleChangeAccountTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentAccountTab(newValue);
  }, []);

  useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="User Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User Management', href: paths.dashboard.group.account },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentTab === 'account' && (
        <>
          <Tabs
            value={currentAccountTab}
            onChange={handleChangeAccountTab}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
            ))}
          </Tabs>

          {currentAccountTab === 'general' && <AccountGeneral />}
          {currentAccountTab === 'notifications' && <AccountNotifications />}
          {currentAccountTab === 'security' && <AccountChangePassword />}
        </>
      )}

      {currentTab === 'manage-users' && <UserManagementView />}
    </Container>
  );
}
