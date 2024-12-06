import {Helmet} from 'react-helmet-async';

import GdprView from 'src/sections/gdpr/gdprview';
import GeneratedFormView from "../../../sections/gdpr/generated-form-view";

// ----------------------------------------------------------------------

export default function Generatedform() {
  return (
    <>
      <Helmet>
        <title> GDPR </title>
      </Helmet>

      <GeneratedFormView/>
    </>
  );
}
