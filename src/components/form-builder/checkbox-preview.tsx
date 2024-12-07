import {Stack} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import {PreviewComponentProps} from "./types/types";
import {RHFTextField} from "../hook-form";
import React from "react";

export default function CheckboxPreview({disabled = false, id = ''}: PreviewComponentProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Checkbox/>
      <RHFTextField disabled={disabled} name={`${id}state`} label=""/>
    </Stack>
  );
}
