import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Container from '@mui/material/Container';
import Typography from "@mui/material/Typography";

import {paths} from 'src/routes/paths';

import {useSettingsContext} from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import {IUserItem} from 'src/types/user';

import {fetchUserById} from "../../../_mock";
import ListUserForms from "../user-list-form";
import {queryClient} from "../../../hooks/queryClient";

type Props = {
  id: string;
};

const ProfileEditPage = ({id}: Props) => {
  const settings = useSettingsContext();

  // eslint-disable-next-line
  const {data: currentUser, error, isLoading, isFetching} = useQuery<IUserItem>({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    staleTime: 4 * 60 * 1000,
    gcTime: 4 * 60 * 1000,
    initialData: () => queryClient.getQueryData<IUserItem>(['user', id]),
  });

  console.log("currentUser Data:", currentUser);  // Log the currentUser data

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching user:', error);
    return <div>Error loading user.</div>;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar/>
        <Typography variant="h3">
          {`${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim()}
        </Typography>
        <Typography variant="h4">
          {`${currentUser?.profile ?? ''}`.trim()}
        </Typography>
      </Stack>
      <CustomBreadcrumbs
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Profile',
            href: paths.dashboard.profiles.root,
          },
          {name: `${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim()},
        ]}
        sx={{
          mb: {xs: 3, md: 5},
        }}
      />

      <ListUserForms currentUser={currentUser}/>
    </Container>
  );
};

export default ProfileEditPage;
