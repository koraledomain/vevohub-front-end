import {PDFDocument} from 'pdf-lib';
import {enqueueSnackbar} from "notistack";
import React, {useState, useEffect} from 'react';

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Container,
  TableBody,
  IconButton,
  Typography,
  TableContainer,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import {FormData, FormSubmission} from 'src/sections/gdpr/types/types'

import {useParams} from "../../routes/hooks";
import {TableHeadCustom} from "../../components/table";

const TABLE_HEAD = [
  {id: 'submissionDate', label: 'Submission Date'},
  {id: 'document', label: 'Signed Document'},
  {id: 'approvalStatus', label: 'Approval Status'},
  {id: 'gdprConsent', label: 'GDPR Consent'},
  {id: 'dateSigned', label: 'Date Signed'},
  {id: 'signature', label: 'Signature'},
];

export default function FormSubmissionsView() {
  const {formId} = useParams();
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);

  // Fetch form data and submissions
  useEffect(() => {

    console.log('Current formId:', formId);
    const allKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allKeys);
    const submissionKeys = allKeys.filter(key => key.includes('submission'));
    console.log('Submission keys:', submissionKeys);

    if (formId) {
      // Get form data

      const storedForm = localStorage.getItem(`form_${formId}`);
      if (storedForm) {
        setFormData(JSON.parse(storedForm));
      }

      // Get all submissions for this form
      const allSubmissions = Object.keys(localStorage)
        .filter(key => key.startsWith(`${formId}_submission_`))
        .map(key => {
          try {
            return JSON.parse(localStorage.getItem(key) || '');
          } catch (e) {
            console.error('Error parsing submission:', e);
            return null;
          }
        })
        .filter(Boolean) // Remove any null values
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setSubmissions(allSubmissions);
    }
  }, [formId]);

  const handleDownloadPDF = async (submissionId: string) => {
    try {
      const submission = JSON.parse(localStorage.getItem(`${formId}_submission_${submissionId}`) || '');

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.276, 841.890]); // A4 size

      // Add form name and submission date
      page.drawText(`Form Submission: ${formData?.name || 'Form'}`, {
        x: 50,
        y: 800,
        size: 20,
      });

      page.drawText(`Submitted on: ${new Date(submission.date).toLocaleString()}`, {
        x: 50,
        y: 750,
        size: 12,
      });

      // Add form data
      let yPosition = 700;
      Object.entries(submission.data).forEach(([key, value]) => {
        const label = key.split('-').pop();
        if (label && value) {
          page.drawText(`${label}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 12,
          });
          yPosition -= 20;
        }
      });

      // Add signature if exists
      if (submission.data.signature) {
        try {
          const signatureImage = await pdfDoc.embedPng(submission.data.signature);
          page.drawImage(signatureImage, {
            x: 50,
            y: yPosition - 100,
            width: 200,
            height: 100,
          });
        } catch (e) {
          console.error('Error embedding signature:', e);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submission_${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('PDF downloaded successfully', {variant: 'success'});
    } catch (error) {
      console.error('Error generating PDF:', error);
      enqueueSnackbar('Error generating PDF', {variant: 'error'});
    }
  };

  const handleDownloadAudit = async (submissionId: string) => {
    try {
      const submission = JSON.parse(localStorage.getItem(`${formId}_submission_${submissionId}`) || '');

      const auditDoc = await PDFDocument.create();
      const page = auditDoc.addPage([595.276, 841.890]);

      page.drawText('Audit Trail', {
        x: 50,
        y: 800,
        size: 20,
      });

      const auditEntries = [
        `Form Name: ${formData?.name || 'Form'}`,
        `Form Created: ${
          formData?.createdAt ? new Date(formData.createdAt).toLocaleString() : 'N/A'
        }`,
        `Form Accessed: ${new Date(submission.date).toLocaleString()}`,
        `Form Submitted: ${new Date(submission.date).toLocaleString()}`,
      ];

      auditEntries.forEach((entry, index) => {
        page.drawText(entry, {
          x: 50,
          y: 750 - (index * 30),
          size: 12,
        });
      });

      const pdfBytes = await auditDoc.save();
      const blob = new Blob([pdfBytes], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_trail_${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Audit trail downloaded successfully', {variant: 'success'});
    } catch (error) {
      console.error('Error generating audit trail:', error);
      enqueueSnackbar('Error generating audit trail', {variant: 'error'});
    }
  };

  const handleDownloadComplete = async (submissionId: string) => {
    try {
      await Promise.all([
        handleDownloadPDF(submissionId),
        handleDownloadAudit(submissionId)
      ]);
      enqueueSnackbar('All documents downloaded successfully', {variant: 'success'});
    } catch (error) {
      enqueueSnackbar('Error downloading documents', {variant: 'error'});
    }
  };

  if (!formData) {
    return <Typography>Loading form data...</Typography>;
  }

  return (
    <Container>
      <Stack direction="row" spacing={3}>
        {/* Left side - Table */}
        <Card sx={{flex: 2}}>
          <TableContainer>
            <Table>
              <TableHeadCustom headLabel={TABLE_HEAD}/>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    hover
                    selected={selectedSubmission?.id === submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <TableCell>
                      {new Date(submission.date).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(submission.id);
                          }}
                        >
                          <Iconify icon="eva:file-text-fill"/>
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAudit(submission.id);
                          }}
                        >
                          <Iconify icon="eva:file-add-fill"/>
                        </IconButton>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Label color={submission.approved ? 'success' : 'warning'}>
                        {submission.approved ? 'Approved' : 'Pending'}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <Label
                        color={submission.data.gdprConsent ? 'success' : 'error'}
                        sx={{bgcolor: 'warning.lighter'}}
                      >
                        {submission.data.gdprConsent ? 'Consented' : 'Not Consented'}
                      </Label>
                    </TableCell>

                    <TableCell>
                      {new Date(submission.date).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {submission.data.signature && (
                        <Box
                          component="img"
                          src={submission.data.signature}
                          sx={{
                            height: 40,
                            width: 'auto',
                            maxWidth: 100,
                            filter: 'contrast(1.5)'
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Right side - Details */}
        {selectedSubmission && (
          <Card sx={{flex: 1, p: 3}}>
            <Typography variant="h6" sx={{mb: 3}}>
              Submission Details
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted On
                </Typography>
                <Typography>
                  {new Date(selectedSubmission.date).toLocaleString()}
                </Typography>
              </Box>

              {Object.entries(selectedSubmission.data).map(([key, value]) => {
                if (key === 'signature') return null;
                return (
                  <Box key={key}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {key.split('-').pop()}
                    </Typography>
                    <Typography>{String(value)}</Typography>
                  </Box>
                );
              })}

              {selectedSubmission.data.signature && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Signature
                  </Typography>
                  <Box
                    component="img"
                    src={selectedSubmission.data.signature}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      mt: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2
                    }}
                  />
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Iconify icon="eva:download-fill"/>}
                  onClick={() => handleDownloadComplete(selectedSubmission.id)}
                >
                  Download All
                </Button>
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
