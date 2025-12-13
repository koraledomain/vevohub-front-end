export const featureFlags = {
  login: true,
  profilesPage: false,
} as const;

export type FeatureFlagName = keyof typeof featureFlags;

export const isFeatureEnabled = (name: FeatureFlagName) => featureFlags[name];


