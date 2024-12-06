// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profiles: {
      root: `${ROOTS.DASHBOARD}/profiles`,
      list: `${ROOTS.DASHBOARD}/profiles/list`,
      new: `${ROOTS.DASHBOARD}/profiles/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/profiles/${id}/edit`,
    },
    gdpr: {
      root: `${ROOTS.DASHBOARD}/gdpr`,
      builder: `${ROOTS.DASHBOARD}/gdpr/form-builder`,
      generated: `${ROOTS.DASHBOARD}/gdpr/generated-form`,
    },
    two: `${ROOTS.DASHBOARD}/gdpr`,
    reporting: `${ROOTS.DASHBOARD}/reporting`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      account: `${ROOTS.DASHBOARD}/group/account`,
    },
  },
};
