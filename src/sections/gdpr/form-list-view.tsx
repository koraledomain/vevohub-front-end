import {useEffect, useState} from "react";

import {
  Box,
  Card,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {RouterLink} from "src/routes/components";
import {Icon} from "@iconify/react";
import {FormData} from "./types/types";

export default function FormListView() {
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {
    const allForms = Object.keys(localStorage)
      .filter(key => key.startsWith('form_'))
      .map(key => {
        const formData = JSON.parse(localStorage.getItem(key) || '')
        return formData;
      })

    setForms(allForms)
  }, []);

  const handleDeleteForm = (formId: string) => {
    localStorage.removeItem(`form_${formId}`)
    setForms(forms.filter(form => form.id !== formId))
  }

  return (

    <Container>
      <Box sx={{mb: 5}}>
        <Typography variant="h4">My Forms</Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Form Name</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <Icon icon="eva:file-text-fill" width={24}/>
                      <RouterLink
                        href={`/dashboard/gdpr/form/${form.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <Typography variant="subtitle2">
                          {form.name}
                        </Typography>
                      </RouterLink>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {new Date(form.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {form.submissions || 0}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      href={`/dashboard/gdpr/form/${form.id}`}
                      title="View Form"
                    >
                      <Icon icon="eva:eye-fill"/>
                    </IconButton>

                    <IconButton
                      component={RouterLink}
                      href={`/dashboard/gdpr/form/${form.id}/edit`}
                      title="Edit Form"
                    >
                      <Icon icon="eva:edit-fill"/>
                    </IconButton>

                    <IconButton
                      onClick={() => handleDeleteForm(form.id)}
                      title="Delete Form"
                    >
                      <Icon icon="eva:trash-2-outline"/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {forms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{py: 3}}>
                      <Typography variant="subtitle1" sx={{mb: 1}}>
                        No forms created yet
                      </Typography>
                      <Typography variant="body2" sx={{color: 'text.secondary'}}>
                        Start by creating a new form in the form builder
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  )
}
