import React from "react";

import {Stack} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

import {RHFTextField} from "../hook-form";
import {PreviewComponentProps} from "./types/types";

export default function CheckboxPreview({disabled = false, id = ''}: PreviewComponentProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Checkbox/>
      <RHFTextField disabled={disabled} name={`${id}state`} label=""/>
    </Stack>
  );
}
