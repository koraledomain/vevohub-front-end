import { isFeatureEnabled, type FeatureFlagName } from 'src/config/featureFlags';

export function useFeatureFlag(name: FeatureFlagName) {
  return isFeatureEnabled(name);
}


