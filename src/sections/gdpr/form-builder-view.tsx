import React, {useCallback, useState} from 'react';
import {Box, Button, Card, Stack, Typography} from '@mui/material';
import {FormProvider, useForm} from 'react-hook-form';
import {useDrag, useDrop, DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {RHFTextField, RHFUploadAvatar} from '../../components/hook-form';
import Iconify from '../../components/iconify';
import {fData} from '../../utils/format-number';

// Define type for form components
type FormComponent = {
  id: string; // Unique ID for drag-and-drop
  type: 'text' | 'textarea' | 'autocomplete' | 'checkbox';
  name: string;
  label: string;
  placeholder?: string; // Optional for checkboxes
};

export default function FormBuilder() {
  // State for managing dynamic components and logo
  const [formConfig, setFormConfig] = useState<FormComponent[]>([]);
  const [logo, setLogo] = useState<File | string | null>(null);

  // Predefined components in the toolbox
  const toolboxComponents: FormComponent[] = [
    {
      id: 'text-1',
      type: 'text',
      name: 'example-text',
      label: 'Example Text Field',
      placeholder: 'Enter text...',
    },
    {
      id: 'textarea-1',
      type: 'textarea',
      name: 'example-textarea',
      label: 'Example Textarea',
      placeholder: 'Enter long text...',
    },
    {
      id: 'autocomplete-1',
      type: 'autocomplete',
      name: 'example-autocomplete',
      label: 'Example Autocomplete',
      placeholder: 'Select an option...',
    },
    {
      id: 'checkbox-1',
      type: 'checkbox',
      name: 'example-checkbox',
      label: 'Example Checkbox',
    },
  ];

  const methods = useForm();

  // Delete a specific component
  const handleDeleteComponent = (index: number) => {
    setFormConfig((prevConfig) => prevConfig.filter((_, i) => i !== index));
  };

  const handleFile = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;
        console.log(base64data);
        methods.setValue('photoURL', base64data, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Submit form configuration
  const handleSubmitForm = () => {
    const formData = {
      logo,
      components: formConfig,
    };
    console.log('Form Configuration:', JSON.stringify(formData, null, 2));
    alert('Form submitted successfully!');
  };

  // Drop handler
  const handleDrop = (item: FormComponent) => {
    const newComponent = {...item, id: `${Date.now()}`};
    setFormConfig((prev) => [...prev, newComponent]);
  };

  return (
    <FormProvider {...methods}>
      <DndProvider backend={HTML5Backend}>
        <Box sx={{padding: 4}}>
          <Typography variant="h4" sx={{marginBottom: 3}}>
            Drag-and-Drop Form Builder
          </Typography>

          {/* Upload Logo */}


          {/* Drag-and-Drop Context */}
          <Stack direction="row" spacing={4}>
            {/* Toolbox */}
            <Box
              sx={{
                width: 300,
                padding: 2,
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            >
              <Typography variant="h6">Toolbox</Typography>
              {toolboxComponents.map((component) => (
                <DraggableComponent key={component.id} component={component}/>
              ))}
            </Box>

            {/* Live Preview */}
            <Box
              sx={{
                flex: 1,
                padding: 2,
                border: '1px dashed #ccc',
                borderRadius: 4,
                minHeight: 300,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Typography variant="h6" sx={{marginBottom: 2}}>
                Live Preview
              </Typography>
              <Card sx={{padding: 3, marginBottom: 3}}>
                <Typography variant="h6" sx={{marginBottom: 2}}>
                  Upload Logo
                </Typography>
                <RHFUploadAvatar
                  name="photoURL"
                  maxSize={3145728}
                  onDrop={handleFile}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br/> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Card>
              <DroppableArea onDrop={handleDrop}>
                {formConfig.map((component, index) => (
                  <Card
                    key={component.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      padding: 2,
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      marginBottom: 2,
                    }}
                  >
                    <Box flex={1}>
                      {/* Render Dynamic Components */}
                      {component.type === 'textarea' && (
                        <RHFTextField
                          name={`textarea_${component.id}`} // Unique name for each textarea
                          label={component.label}
                          placeholder={component.placeholder}
                          multiline
                          rows={4}
                        />
                      )}
                      {component.type === 'text' && (
                        <RHFTextField
                          name={`text_${component.id}`} // Unique name for each text field
                          label={component.label}
                          placeholder={component.placeholder}
                        />
                      )}
                    </Box>

                    {/* Delete Button */}
                    <Button
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold"/>}
                      color="error"
                      onClick={() => handleDeleteComponent(index)}
                    >
                      Delete
                    </Button>
                  </Card>
                ))}
              </DroppableArea>
            </Box>
          </Stack>

          {/* Submit Button */}
          <Button variant="contained" color="primary" sx={{marginTop: 3}} onClick={handleSubmitForm}>
            Submit Form
          </Button>
        </Box>
      </DndProvider>
    </FormProvider>
  );
}

function DraggableComponent({component}: { component: FormComponent }) {
  const [{isDragging}, drag] = useDrag({
    type: 'FORM_COMPONENT',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{opacity: isDragging ? 0.5 : 1}}>
      <Card
        sx={{
          padding: 2,
          cursor: 'grab',
          border: '1px solid #ccc',
          borderRadius: 4,
          backgroundColor: '#f9f9f9',
          marginBottom: 2,
        }}
      >
        {component.label}
      </Card>
    </div>
  );
}

function DroppableArea({onDrop, children}: { onDrop: (item: FormComponent) => void; children: React.ReactNode }) {
  const [{isOver}, drop] = useDrop({
    accept: 'FORM_COMPONENT',
    drop: (item: FormComponent) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Box
      ref={drop}
      sx={{
        padding: 2,
        border: '1px dashed #ccc',
        borderRadius: 4,
        minHeight: 300,
        backgroundColor: isOver ? '#e0f7fa' : undefined,
      }}
    >
      {children}
    </Box>
  );
}
