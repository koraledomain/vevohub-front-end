import React from 'react';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemText from '@mui/material/ListItemText';

import {useBoolean} from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import {ConfirmDialog} from 'src/components/custom-dialog';
import CustomPopover, {usePopover} from 'src/components/custom-popover';

import {IUserItem} from 'src/types/user';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
                                       row,
                                       selected,
                                       onEditRow,
                                       onSelectRow,
                                       onDeleteRow,
                                     }: Props) {
  const {
    first_name,
    last_name,
    profile,
    financial_expectations,
    has_gdpr,
    linkedin_link,
    trello_id,
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleRowClick = () => {
    onEditRow();
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow}/>
        </TableCell>

        <TableCell>
          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              textAlign: 'left',
            }}
            onClick={handleRowClick}
          >
            <Avatar alt={first_name} src={'avatarUrl'} sx={{mr: 2}}/>
            <ListItemText
              primary={`${first_name ?? ''} ${last_name ?? ''}`.trim() || 'Unnamed User'}
              secondary={profile}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
              secondaryTypographyProps={{ variant: 'caption', color: 'text.disabled' }}
              sx={{ m: 0 }}
            />
          </ButtonBase>
        </TableCell>

        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'left', width: '15%'}}>
          <ButtonBase sx={{width: '100%'}} onClick={handleRowClick}>
            {financial_expectations}
          </ButtonBase>
        </TableCell>

        <TableCell sx={{whiteSpace: 'nowrap', textAlign: 'left', width: '15%'}}>
          <ButtonBase sx={{width: '100%'}} onClick={handleRowClick}>
            {has_gdpr}
          </ButtonBase>
        </TableCell>


        <TableCell>
          <Tooltip title="Trello Card Id Profile" placement="top" arrow>
            <IconButton component="a" href={`b;bala-${trello_id}`} target="_blank" rel="noopener noreferrer">
              <Iconify icon="mdi:trello"/>
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell align="center" sx={{whiteSpace: 'nowrap'}}>
          <Tooltip title="LinkedIn Profile" placement="top" arrow>
            <IconButton component="a" href={linkedin_link} target="_blank" rel="noopener noreferrer">
              <Iconify icon="mdi:linkedin"/>
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell align="right" sx={{px: 1, whiteSpace: 'nowrap'}}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold"/>
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill"/>
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse}/>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{width: 140}}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{color: 'error.main'}}
        >
          <Iconify icon="solar:trash-bin-trash-bold"/>
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold"/>
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
