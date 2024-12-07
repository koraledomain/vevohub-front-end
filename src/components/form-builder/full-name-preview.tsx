import {Stack} from "@mui/material";
import React from "react";
import {RHFTextField} from "../hook-form";
import {PreviewComponentProps} from "./types/types";

export default function FullNamePreview({disabled = false, id = ""}: PreviewComponentProps) {
  return (
    <Stack direction="row" spacing={2} sx={{width: "100%"}}>
      <RHFTextField
        disabled={disabled}
        size="small"
        label="First Name"
        name={`${id}firstName`}
        defaultValue=""
        sx={{opacity: disabled ? 0.7 : 1}} // Adjust opacity only if disabled
      />
      <RHFTextField
        disabled={disabled}
        size="small"
        name={`${id}lastName`}
        label="Last Name"
        defaultValue=""
        sx={{opacity: disabled ? 0.7 : 1}} // Adjust opacity only if disabled
      />
    </Stack>
  );
}
