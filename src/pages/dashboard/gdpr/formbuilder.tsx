import { Helmet } from 'react-helmet-async';

import GdprView from 'src/sections/gdpr/gdprview';
import FormBuilderView from "../../../sections/gdpr/form-builder-view";

// ----------------------------------------------------------------------

export default function Formbuilder() {
  return (
    <>
      <Helmet>
        <title> GDPR </title>
      </Helmet>

      <FormBuilderView />
    </>
  );
}
