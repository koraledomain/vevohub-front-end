import React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { Icon } from '@iconify/react';

type FormConfig = {
  id: string;
  name: string;
  submissions: number;
  createdAt: string;
};

type FormListProps = {
  forms: FormConfig[];
};

export default function FormList({ forms }: FormListProps) {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Form Name</TableCell>
              <TableCell>Submissions</TableCell>
              <TableCell>Last Edited</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id} hover>
                <TableCell padding="checkbox">
                  <Icon icon="eva:file-text-outline" />
                </TableCell>

                <TableCell>
                  <RouterLink
                    href={`/dashboard/gdpr/form/${form.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {form.name}
                    </Typography>
                  </RouterLink>
                </TableCell>

                <TableCell>{form.submissions}</TableCell>

                <TableCell>
                  {new Date(form.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    component={RouterLink}
                    href={`/dashboard/gdpr/form/${form.id}`}
                  >
                    <Icon icon="eva:eye-fill" />
                  </IconButton>
                  <IconButton>
                    <Icon icon="eva:edit-fill" />
                  </IconButton>
                  <IconButton>
                    <Icon icon="eva:trash-2-outline" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
