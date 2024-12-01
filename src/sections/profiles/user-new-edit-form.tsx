import * as Yup from 'yup';
import {useForm} from 'react-hook-form';
import React, {useMemo, useEffect} from 'react';
import {yupResolver} from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import {paths} from 'src/routes/paths';
import {useRouter} from 'src/routes/hooks';

import {countries} from 'src/assets/data';

import {useSnackbar} from 'src/components/snackbar';
import FormProvider, {RHFTextField, RHFAutocomplete} from 'src/components/hook-form';

import {IUserItem} from 'src/types/user';
import {createCandidate, updateCandidate} from "../../_mock";

type Props = {
  currentUser?: IUserItem;
};

export default function UserNewEditForm({currentUser}: Props) {
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    profile: Yup.string().required('Profile is required'),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.first_name || '',
      lastName: currentUser?.last_name || '',
      profile: currentUser?.profile || '',
      email: currentUser?.contacts?.[0]?.email || '',  // Assuming first contact email
      phoneNumber: currentUser?.contacts?.[0]?.phone || '',  // Assuming first contact phone
      country: currentUser?.contacts?.[0]?.country || '',
      city: currentUser?.contacts?.[0]?.city || '',
      address: currentUser?.contacts?.[0]?.address || '',
      zipCode: '',  // Add mapping if it exists in IUserItem
      company: '',  // Add mapping if it exists in IUserItem
      role: '',  // Add mapping if it exists in IUserItem
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {reset, watch, handleSubmit, formState: {isSubmitting}} = methods;

  const values = watch();

  useEffect(() => {
  }, [values.firstName, values.lastName]);

  const onSubmit = async (data: any) => {
    console.log('Form submitted'); // Debugging log
    try {
      console.log('Submitting data:', data); // Log the data being submitted

      if (currentUser) {
        // Update existing user
        await updateCandidate(data);
        enqueueSnackbar('Update success!');
      } else {
        // Create new user
        await createCandidate(data);
        enqueueSnackbar('Create success!');
      }

      reset();
      router.push(paths.dashboard.profiles.list);
      console.info('DATA', data);
    } catch (error) {
      console.error('Error in submission:', error);
    }
  };

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={3}>
        <Grid xs={12} md={10}>
          <Card sx={{p: 3}}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label="First Name"/>
              <RHFTextField name="lastName" label="Last Name"/>
              <RHFTextField name="email" label="Email Address"/>
              <RHFTextField name="phoneNumber" label="Phone Number"/>
              <RHFAutocomplete
                name="country"
                type="country"
                label="Country"
                placeholder="Choose a country"
                fullWidth
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
              />
              <RHFTextField name="state" label="State/Region"/>
              <RHFTextField name="city" label="City"/>
              <RHFTextField name="address" label="Address"/>
              <RHFTextField name="zipCode" label="Zip/Code"/>
              <RHFTextField name="company" label="Company"/>
              <RHFTextField name="role" label="Role"/>
            </Box>

            <Stack alignItems="flex-end" sx={{mt: 3}}>
              <LoadingButton
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                loading={isSubmitting}
              >
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={8}/>
      </Grid>
    </FormProvider>
  );
}
