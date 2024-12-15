// src/types/form.ts

// Basic component type
export type FormComponent = {
  id: string;
  type: 'text' | 'textarea' | 'signature' | 'checkbox' | 'fullname' | 'address';
  name: string;
  label: string;
  placeholder?: string;
};

// Form configuration/definition
export type FormData = {
  id: string;
  name: string;
  logo: string | null;
  components: FormComponent[];
  submissions: number;
  createdAt: string;
};

// Form submission data
export type FormSubmission = {
  id: string;
  formId: string;
  date: string;
  data: Record<string, any>;
  approved?: boolean;
  gdprConsent?: boolean;
  signature?: string;
};


// URLs for form sharing
export type FormUrls = {
  previewUrl: string;
  publicUrl: string;
  submissionsUrl: string;
};
