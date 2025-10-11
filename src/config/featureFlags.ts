export const featureFlags = {
  login: false,
  profilesPage: false,
} as const;

export type FeatureFlagName = keyof typeof featureFlags;

export const isFeatureEnabled = (name: FeatureFlagName) => featureFlags[name];


