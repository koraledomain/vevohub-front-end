// FormSubmissionRow component
import { TableRow } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Label from "../label";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Iconify from "../iconify";

export default function FormSubmissionRow({
                                            row,
                                            selected,
                                            onSelectRow,
                                            onView
                                          }: {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onView: VoidFunction;
}) {
  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow}/>
      </TableCell>

      <TableCell>
        {new Date(row.submissionDate).toLocaleString()}
      </TableCell>

      <TableCell>
        {/* Access the form data based on the component IDs */}
        {row.formData[`${row.formId}-firstName`]} {' '}
        {row.formData[`${row.formId}-lastName`]}
      </TableCell>

      <TableCell>
        {row.formData.gdprConsent ? (
          <Label color="success">Consented</Label>
        ) : (
          <Label color="error">Not Consented</Label>
        )}
      </TableCell>

      <TableCell>
        {row.formData.signature ? (
          <Box
            component="img"
            src={row.formData.signature}
            sx={{
              maxWidth: 100,
              maxHeight: 40,
              objectFit: 'contain'
            }}
            alt="Signature"
          />
        ) : (
          'No Signature'
        )}
      </TableCell>

      <TableCell>
        <IconButton onClick={onView}>
          <Iconify icon="eva:eye-fill"/>
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
