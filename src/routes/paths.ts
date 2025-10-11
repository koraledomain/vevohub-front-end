// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  docs: 'https://docs.minimals.cc',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  changelog: 'https://docs.minimals.cc/changelog',
  components: '/components',
  figma:
    'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',
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
