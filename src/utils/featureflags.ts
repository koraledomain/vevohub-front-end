import { useFeatureFlag } from 'src/hooks/use-feature-flag';

export const useFeatureFlags = () => ({
  isProfilePageEnabled: useFeatureFlag('profilesPage'),
});
