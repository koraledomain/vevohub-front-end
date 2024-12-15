import FormProvider, {RHFAutocomplete, RHFTextField} from "../hook-form";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import {countries} from "../../assets/data";
import React from "react";
import {useForm} from "react-hook-form";
import {PreviewComponentProps} from "./types/types";


export default function AddressPreview({disabled = false, id = ''}: PreviewComponentProps) {

  const methods = useForm()

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
              <RHFAutocomplete
                disabled={disabled}
                name={`${id}country`}
                type="country"
                label="Country"
                placeholder="Choose a country"
                fullWidth
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
              />
              <RHFTextField disabled={disabled} name={`${id}state`} label="State/Region"/>
              <RHFTextField disabled={disabled} name={`${id}city`} label="City"/>
              <RHFTextField disabled={disabled} name={`${id}address`} label="Address"/>
              <RHFTextField disabled={disabled} name={`${id}zipCode`} label="Zip/Code"/>
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}/>
      </Grid>
    </FormProvider>)
}
