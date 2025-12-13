import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { IUserManagementItem, IUserManagementTableFilters } from 'src/types/user';

import UserManagementTableRow from '../user-management-table-row';
import UserManagementTableToolbar from '../user-management-table-toolbar';
import { fetchUsers } from '../../../_mock/user-management';

const TABLE_HEAD = [
  { id: 'avatar', label: '', width: 60 },
  { id: 'fullName', label: 'Full Name' },
  { id: 'email', label: 'Email Address' },
  { id: 'location', label: 'Location' },
  { id: 'joined', label: 'Joined' },
  { id: 'permissions', label: 'Permissions' },
];

const defaultFilters: IUserManagementTableFilters = {
  search: '',
  joined: 'Anytime',
  permissions: 'All',
};

export default function UserManagementView() {
  const table = useTable();
  const [filters, setFilters] = useState<IUserManagementTableFilters>(defaultFilters);

  // Fetch users with filters, search and pagination
  const { data: apiData, isLoading, isFetching } = useQuery<{
    content: IUserManagementItem[];
    totalElements: number;
  }>({
    queryKey: ['userManagement', table.page, table.rowsPerPage, filters],
    queryFn: () => fetchUsers(table.page, table.rowsPerPage, filters),
    staleTime: 4 * 60 * 1000,
    gcTime: 4 * 60 * 1000,
  });

  const tableData = apiData?.content || [];
  const totalElements = apiData?.totalElements ?? 0;

  const handleFilters = useCallback(
    (name: keyof IUserManagementTableFilters, value: string) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  }, []);

  const handleNewUser = useCallback(() => {
    // TODO: Navigate to new user page or open dialog
    console.log('New User clicked');
  }, []);

  const denseHeight = table.dense ? 56 : 56 + 20;

  return (
    <Card>
        <UserManagementTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onExport={handleExport}
          onNewUser={handleNewUser}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={0}
                onSort={table.onSort}
              />
              <TableBody>
                {tableData.map((row) => (
                  <UserManagementTableRow key={row.id} row={row} />
                ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />
                <TableNoData notFound={!tableData.length && !isLoading && !isFetching} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={totalElements}
          page={table.page}
          dense={table.dense}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
    </Card>
  );
}

