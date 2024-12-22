import {v4 as uuidv4} from 'uuid';
import React, {useState, useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';

import {Box, Stack, Button, Checkbox, Typography, FormControlLabel} from '@mui/material';

import {useParams} from 'src/routes/hooks';

import {useSnackbar} from 'src/components/snackbar';

import AddressPreview from '../../components/form-builder/address-preview';
import FullNamePreview from '../../components/form-builder/full-name-preview';
import SignatureComponent from '../../components/form-builder/SignatureCanvasPreview';

type FormData = {
  id: string;
  name: string;
  logo: string | null;
  submissions: number;
  components: Array<{
    id: string;
    type: string;
    name: string;
    label: string;
  }>;
};

type Props = {
  public?: boolean;
};

export default function GeneratedFormView({public: isPublic = false}: Props) {
  const {formId} = useParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const methods = useForm();
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {

    console.log('Current formId:', formId);
    const allKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allKeys);
    const submissionKeys = allKeys.filter(key => key.includes('submission'));
    console.log('Submission keys:', submissionKeys);

    if (formId) {
      const storedConfig = localStorage.getItem(`form_${formId}`);
      if (storedConfig) {
        setFormData(JSON.parse(storedConfig));
      }
    }
  }, [formId]);

  const handleSubmit = async (data: any) => {
    if (!formData || !formId) return;

    try {
      const submissionId = uuidv4();
      const submission = {
        id: submissionId,
        formId,
        date: new Date().toISOString(),
        data,
        gdprConsent: data.gdprConsent || false,
        approved: false,
        signature: data.signature || null
      };

      // Save submission
      localStorage.setItem(`${formId}_submission_${submissionId}`, JSON.stringify(submission));

      // Update form submission count
      const updatedFormData = {
        ...formData,
        submissions: (formData.submissions || 0) + 1
      };
      localStorage.setItem(`form_${formId}`, JSON.stringify(updatedFormData));
      setFormData(updatedFormData);

      if (isPublic) {
        enqueueSnackbar('Form submitted successfully!', {variant: 'success'});
        methods.reset();
      } else {
        window.location.href = `/dashboard/gdpr/form/${formId}/submissions`;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Error submitting form', {variant: 'error'});
    }
  };

  if (!formData) {
    return <Typography>Loading form...</Typography>;
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{
        padding: 4,
        maxWidth: 800,
        margin: "auto",
        ...(isPublic && {
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        })
      }}>
        {formData.logo && (
          <Box sx={{textAlign: "center", mb: 3}}>
            <img src={formData.logo} alt="Form Logo" style={{maxHeight: 100}}/>
          </Box>
        )}

        <Typography variant="h4" sx={{marginBottom: 3}}>
          {formData.name}
        </Typography>

        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Stack spacing={3}>
            {formData.components.map((component) => (
              <Box key={component.id}>
                {component.type === "fullname" && (
                  <FullNamePreview disabled={false} id={component.id}/>
                )}

                {component.type === "address" && (
                  <Box sx={{flex: 1}}>
                    <Typography variant="subtitle1">Address</Typography>
                    <AddressPreview disabled={false} id={component.id}/>
                  </Box>
                )}

                {component.type === "checkbox" && (
                  <FormControlLabel
                    control={<Checkbox/>}
                    label={component.label}
                  />
                )}

                {component.type === "signature" && (
                  <Box sx={{flex: 1}}>
                    <Typography variant="subtitle2" sx={{mb: 1}}>
                      Signature
                    </Typography>
                    <SignatureComponent
                      disabled={false}
                      width={500}
                      height={250}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{mt: 3}}
            fullWidth={isPublic}
          >
            Submit Form
          </Button>
        </form>
      </Box>
    </FormProvider>
  );
}
