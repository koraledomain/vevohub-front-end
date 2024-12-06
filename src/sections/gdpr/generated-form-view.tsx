import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
} from '@mui/material';

export default function GeneratedFormView() {
  const [formConfig, setFormConfig] = useState([]);

  useEffect(() => {
    const storedConfig = JSON.parse(localStorage.getItem('formConfig') as string);
    setFormConfig(storedConfig || []);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Submitted Data:', data);

    // You can send `data` to the database or API
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Generated Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {formConfig.map((component, index) => (
            <Box key={index}>
              {component.type === 'text' && (
                <TextField
                  name={`field_${index}`}
                  label={component.label}
                  placeholder={component.placeholder}
                  fullWidth
                />
              )}
              {component.type === 'textarea' && (
                <TextField
                  name={`field_${index}`}
                  label={component.label}
                  placeholder={component.placeholder}
                  multiline
                  rows={4}
                  fullWidth
                />
              )}
              {component.type === 'checkbox' && (
                <FormControlLabel
                  control={<Checkbox name={`field_${index}`} />}
                  label={component.label}
                />
              )}
              {component.type === 'logo' && (
                <Typography sx={{ textAlign: 'center' }}>
                  [LOGO Placeholder]
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 3 }}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
}
