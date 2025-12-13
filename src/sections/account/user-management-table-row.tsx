import React from 'react';

import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

import { IUserManagementItem } from 'src/types/user';

type Props = {
  row: IUserManagementItem;
};

const getPermissionColor = (permission: string, theme: any) => {
  switch (permission) {
    case 'Admin':
      return theme.palette.error.main;
    case 'Viewer':
      return theme.palette.grey[800];
    case 'Contributor':
      return theme.palette.info.main;
    default:
      return theme.palette.grey[500];
  }
};

const formatDate = (date: Date | string) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function UserManagementTableRow({ row }: Props) {
  const theme = useTheme();
  const { fullName, email, location, joined, permissions, avatarUrl } = row;

  return (
    <TableRow hover>
      <TableCell>
        <Avatar
          alt={fullName}
          src={avatarUrl}
          sx={{
            width: 34,
            height: 34,
          }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {fullName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {email}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {location}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {formatDate(joined)}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={permissions}
          size="small"
          sx={{
            bgcolor: getPermissionColor(permissions, theme),
            color: '#FFFFFF',
            fontWeight: 400,
            fontSize: '14px',
            height: '29px',
            borderRadius: '3px',
          }}
        />
      </TableCell>
    </TableRow>
  );
}

