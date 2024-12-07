import {Helmet} from 'react-helmet-async';
import GeneratedFormView from "../../../sections/gdpr/generated-form-view";

// ----------------------------------------------------------------------

export default function GeneratedForm() {
  return (
    <>
      <Helmet>
        <title> GDPR </title>
      </Helmet>

      <GeneratedFormView/>
    </>
  );
}
