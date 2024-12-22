import * as Yup from 'yup';
import {v4 as uuidv4} from 'uuid';
import {useNavigate} from "react-router-dom";
import React, {useMemo, useState} from 'react';
import {yupResolver} from "@hookform/resolvers/yup";
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useForm, FormProvider} from 'react-hook-form';
import {useDrag, useDrop, DndProvider} from 'react-dnd';

import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import {Box, Card, Stack, Button, Dialog, IconButton, Typography, DialogActions, DialogContent} from '@mui/material';

import {FormComponent} from "./types/types";
import Iconify from "../../components/iconify";
import {fData} from '../../utils/format-number';
import {useSnackbar} from "../../components/snackbar";
import {RHFTextField, RHFUploadAvatar} from '../../components/hook-form';
import AddressPreview from "../../components/form-builder/address-preview";
import CheckboxPreview from "../../components/form-builder/checkbox-preview";
import FullNamePreview from "../../components/form-builder/full-name-preview";
import SignatureComponent from "../../components/form-builder/SignatureCanvasPreview";


export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState<FormComponent[]>([]);
  // eslint-disable-next-line
  const [logo, setLogo] = useState<File | string | null>(null);

  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [formUrls, setFormUrls] = useState({previewUrl: '', publicUrl: '', submissionsUrl: ''});

  const {enqueueSnackbar} = useSnackbar();

  const toolboxComponents: FormComponent[] = [
    {id: 'fullname-1', type: 'fullname', name: 'fullname', label: 'Full Name', placeholder: 'Enter your full name...'},
    {id: 'checkbox-1', type: 'checkbox', name: 'example-checkbox', label: 'Example Checkbox'},
    {id: 'address-1', type: 'address', name: 'exmple-address', label: 'Example Address'},
    {id: 'signature-1', type: 'signature', name: 'example-signature', label: 'Example signature'}
  ];

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Form name is required'), // changed from formName to name
    photoURL: Yup.string().required('Logo is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',  // changed from formName to name
      photoURL: '',
    }),
    []
  );


  const methods = useForm({
    defaultValues,
    resolver: yupResolver(NewUserSchema),
  });


  const {handleSubmit} = methods

  useNavigate();

  const handleAddComponent = (component: FormComponent) => {
    const newComponent = {...component, id: `${Date.now()}`};
    console.log(newComponent)
    setFormConfig((prev) => [newComponent, ...prev]); // Add to top of the list
  };

  const handleDeleteComponent = (index: number) => {
    setFormConfig((prevConfig) => prevConfig.filter((_, i) => i !== index));
  };

  const handleDrop = (item: FormComponent) => {
    if (!formConfig.find((component) => component.id === item.id)) {
      const newComponent = {...item, id: `${Date.now()}`};
      setFormConfig((prev) => [newComponent, ...prev]); // Add to top when dropped
    }
  };

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    setFormConfig((prevConfig) => {
      const updatedConfig = [...prevConfig];
      const [movedItem] = updatedConfig.splice(dragIndex, 1);
      updatedConfig.splice(hoverIndex, 0, movedItem);
      return updatedConfig;
    });
  };

  const handleFile = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        methods.setValue('photoURL', reader.result as string, {shouldValidate: true});
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (data: any) => {
    try {
      const formId = uuidv4();
      const formData = {
        id: formId,
        name: data.name,
        logo: data.photoURL,
        components: formConfig,
        submissions: 0,
        createdAt: new Date().toISOString()
      };


      try {
        localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {

          const forms = Object.keys(localStorage).filter(key => key.startsWith('form_')).sort((a, b) => {
            const formA = JSON.parse(localStorage.getItem(a) || '{}');
            const formB = JSON.parse(localStorage.getItem(b) || '{}');
            return new Date(formA.createdAt).getTime() - new Date(formB.createdAt).getTime();
          })

          while (forms.length > 0) {

            const oldestForm = forms.shift();
            if (oldestForm) {
              localStorage.removeItem(oldestForm)
            }
            try {
              localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
              break;
            } catch (e) {
              if (forms.length === 0) {
                throw new Error('Unable to free enough storage space')
              }
            }
          }
        }

        console.error('Error creating form:', storageError);
        enqueueSnackbar('Error creating form', {variant: 'error'})
      }
      setFormUrls({
        previewUrl: `/dashboard/gdpr/form/${formId}`,
        publicUrl: `/public/form/${formId}`,
        submissionsUrl: `/dashboard/gdpr/form/${formId}/submissions`
      });

      setShowUrlDialog(true);
      enqueueSnackbar('Form created successfully!', {variant: 'success'});

    } catch (error) {
      console.error('Error creating form:', error)
      enqueueSnackbar('Error creating form: Storage quota exceeded. Try deleting some old forms.', {
        variant: 'error',
        persist: true
      });
    }
  }


  return (
    <FormProvider {...methods}>
      <DndProvider backend={HTML5Backend}>
        <Box sx={{padding: 4}}>
          <Typography variant="h4" sx={{marginBottom: 3}}>
            Drag-and-Drop Form Builder
          </Typography>

          <Stack direction="row" spacing={4}>
            <Box
              sx={{
                width: 300,
                padding: 2,
                border: '1px solid #ccc',
                borderRadius: 4,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Typography variant="h6">Toolbox</Typography>
              {toolboxComponents.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  onAdd={handleAddComponent}
                />
              ))}
            </Box>

            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
              <RHFTextField
                fullWidth
                name="name"
                label="Form Name"
                required/>
              <Card sx={{padding: 3}}>
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
                <DroppableArea
                  components={formConfig}
                  onDrop={handleDrop}
                  moveComponent={moveComponent}
                  handleDelete={handleDeleteComponent}
                />
              </Box>
            </Box>
          </Stack>

          <Button variant="contained" color="primary" sx={{marginTop: 3}} onClick={handleSubmit(handleSubmitForm)}>
            Submit Form
          </Button>
        </Box>
        <Dialog open={showUrlDialog} onClose={() => setShowUrlDialog(false)}>
          <DialogTitle>Form Created Successfully!</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Preview URL"
                value={formUrls.previewUrl}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + formUrls.previewUrl);
                      enqueueSnackbar('Preview URL copied!');
                    }}>
                      <Iconify icon="eva:copy-fill"/>
                    </IconButton>
                  ),
                }}
              />
              <TextField
                label="Public URL"
                value={formUrls.publicUrl}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + formUrls.publicUrl);
                      enqueueSnackbar('Public URL copied!');
                    }}>
                      <Iconify icon="eva:copy-fill"/>
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUrlDialog(false)}>Close</Button>
            <Button
              variant="contained"
              href={formUrls.submissionsUrl}
            >
              View Submissions
            </Button>
          </DialogActions>
        </Dialog>
      </DndProvider>
    </FormProvider>
  );
}

function DraggableComponent({component, onAdd}: {
  component: FormComponent;
  onAdd: (component: FormComponent) => void;
}) {
  const [, drag] = useDrag({
    type: 'FORM_COMPONENT',
    item: component,
  });

  return (
    <div ref={drag}>
      <Card
        onClick={() => onAdd(component)}
        sx={{
          padding: 2,
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: 4,
          backgroundColor: '#f9f9f9',
          marginBottom: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#e3f2fd',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        <Typography>{component.label}</Typography>
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
  const [{isOver}, drop] = useDrop({
    accept: 'FORM_COMPONENT',
    drop: (item: FormComponent) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Box ref={drop} sx={{backgroundColor: isOver ? '#e0f7fa' : undefined, padding: 2}}>
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

  const [, drop] = useDrop({
    accept: 'FORM_COMPONENT',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: 'FORM_COMPONENT',
    item: {id: component.id, index},
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        margin: '4px 0',
        border: '1px solid #ccc',
        borderRadius: 8,
        background: '#f9f9f9',
        cursor: 'grab',
      }}
    >
      {(() => {
        switch (component.type) {
          case 'fullname':
            return (
              <Box sx={{flex: 1}}>
                <Typography variant="subtitle2" sx={{mb: 1}}>Full Name</Typography>
                <FullNamePreview disabled/>
              </Box>
            );
          case 'address':
            return (
              <Box sx={{flex: 1}}>
                <Typography variant="subtitle2" sx={{mb: 1}}>Address</Typography>
                <AddressPreview disabled/>
              </Box>
            );
          case 'checkbox':
            return (
              <Box sx={{flex: 1}}>
                <Typography/>
                <CheckboxPreview disabled={false}/>
              </Box>
            );
          case 'signature':
            return (
              <Box sx={{flex: 1}}>
                <Typography variant="subtitle2" sx={{mb: 1}}>
                  Signature
                </Typography>
                <SignatureComponent
                  disabled
                  width={300}
                  height={150}
                />
              </Box>
            );
          default:
            return <Typography sx={{flex: 1}}>{component.label}</Typography>;
        }
      })()}
      <Button color="error" onClick={() => handleDelete(index)}>
        Delete
      </Button>
    </div>
  );
}

