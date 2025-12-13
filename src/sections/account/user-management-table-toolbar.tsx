import React, { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

import { IUserManagementTableFilters } from 'src/types/user';

type Props = {
  filters: IUserManagementTableFilters;
  onFilters: (name: keyof IUserManagementTableFilters, value: string) => void;
  onExport: VoidFunction;
  onNewUser: VoidFunction;
};

const JOINED_OPTIONS = [
  { value: 'Anytime', label: 'Anytime' },
  { value: 'Today', label: 'Today' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' },
  { value: 'This Year', label: 'This Year' },
];

const PERMISSIONS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Viewer', label: 'Viewer' },
  { value: 'Contributor', label: 'Contributor' },
];

export default function UserManagementTableToolbar({
  filters,
  onFilters,
  onExport,
  onNewUser,
}: Props) {
  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );

  const handleFilterJoined = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('joined', event.target.value);
    },
    [onFilters]
  );

  const handleFilterPermissions = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('permissions', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <TextField
        fullWidth
        value={filters.search}
        onChange={handleFilterSearch}
        placeholder="Search items..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          maxWidth: { xs: 1, md: 297.54 },
        }}
      />

      <TextField
        select
        value={filters.joined}
        onChange={handleFilterJoined}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          },
        }}
        sx={{
          width: { xs: 1, md: 242.06 },
        }}
      >
        {JOINED_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        value={filters.permissions}
        onChange={handleFilterPermissions}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          },
        }}
        sx={{
          width: { xs: 1, md: 242.06 },
        }}
      >
        {PERMISSIONS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="outlined"
        onClick={onExport}
        startIcon={<Iconify icon="solar:export-bold" />}
        sx={{
          width: { xs: 1, md: 'auto' },
        }}
      >
        Export
      </Button>

      <Button
        variant="contained"
        onClick={onNewUser}
        startIcon={<Iconify icon="mingcute:add-line" />}
        sx={{
          background: 'linear-gradient(191deg, rgba(251, 107, 3, 1) 0%, rgba(255, 139, 55, 1) 100%)',
          width: { xs: 1, md: 'auto' },
          borderRadius: '5px',
        }}
      >
        New User
      </Button>
    </Stack>
  );
}

