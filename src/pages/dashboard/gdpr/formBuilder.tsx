import {Helmet} from 'react-helmet-async';
import FormBuilderView from "../../../sections/gdpr/form-builder-view";

// ----------------------------------------------------------------------

export default function FormBuilder() {
  return (
    <>
      <Helmet>
        <title> GDPR </title>
      </Helmet>

      <FormBuilderView />
    </>
  );
}
