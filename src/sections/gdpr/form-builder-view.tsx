import React, {useCallback, useState} from 'react';
import {Box, Button, Card, Stack, Typography} from '@mui/material';
import {FormProvider, useForm} from 'react-hook-form';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {RHFUploadAvatar} from '../../components/hook-form';
import {fData} from '../../utils/format-number';
import {HTML5Backend} from "react-dnd-html5-backend";

// Define type for form components
type FormComponent = {
  id: string;
  type: 'text' | 'textarea' | 'autocomplete' | 'checkbox';
  name: string;
  label: string;
  placeholder?: string;
};

export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState<FormComponent[]>([]);
  const [logo, setLogo] = useState<File | string | null>(null);

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

  const handleDeleteComponent = (index: number) => {
    setFormConfig((prevConfig) => prevConfig.filter((_, i) => i !== index));
  };

  const handleFile = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;
        methods.setValue('photoURL', base64data, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = (item: FormComponent) => {
    const newComponent = { ...item, id: `${Date.now()}` };
    setFormConfig((prev) => [...prev, newComponent]);
  };

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    setFormConfig((prevConfig) => {
      const updatedConfig = [...prevConfig];
      const [movedItem] = updatedConfig.splice(dragIndex, 1);
      updatedConfig.splice(hoverIndex, 0, movedItem);
      return updatedConfig;
    });
  };

  const handleSubmitForm = () => {
    const formData = {
      logo,
      components: formConfig,
    };
    console.log('Form Configuration:', JSON.stringify(formData, null, 2));
    alert('Form submitted successfully!');
  };

  return (
    <FormProvider {...methods}>
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ padding: 4 }}>
          <Typography variant="h4" sx={{ marginBottom: 3 }}>
            Drag-and-Drop Form Builder
          </Typography>

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
                <DraggableComponent key={component.id} component={component} />
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
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Live Preview
              </Typography>
              <Card sx={{ padding: 3, marginBottom: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
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
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Card>
              <DroppableArea
                components={formConfig}
                onDrop={handleDrop}
                moveComponent={moveComponent}
                handleDelete={handleDeleteComponent}
              />
            </Box>
          </Stack>

          <Button variant="contained" color="primary" sx={{ marginTop: 3 }} onClick={handleSubmitForm}>
            Submit Form
          </Button>
        </Box>
      </DndProvider>
    </FormProvider>
  );
}

function DraggableComponent({ component }: { component: FormComponent }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_COMPONENT',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
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

function DroppableArea({
                         components,
                         onDrop,
                         moveComponent,
                         handleDelete,
                       }: {
  components: FormComponent[];
  onDrop: (item: FormComponent) => void;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  handleDelete: (index: number) => void;
}) {
  return (
    <Box>
      {components.map((component, index) => (
        <DroppableComponent
          key={component.id}
          component={component}
          index={index}
          moveComponent={moveComponent}
          handleDelete={handleDelete}
        />
      ))}
    </Box>
  );
}

function DroppableComponent({
                              component,
                              index,
                              moveComponent,
                              handleDelete,
                            }: {
  component: FormComponent;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  handleDelete: (index: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'FORM_COMPONENT',
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: { index: number }) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_COMPONENT',
    item: { id: component.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        margin: '4px 0',
        border: '1px solid #ccc',
        borderRadius: 8,
        background: '#f9f9f9',
      }}
      data-handler-id={handlerId}
    >
      <Typography>{component.label}</Typography>
      <Button color="error" onClick={() => handleDelete(index)}>
        Delete
      </Button>
    </div>
  );
}
