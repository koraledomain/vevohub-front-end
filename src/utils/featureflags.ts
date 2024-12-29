import {useFlags} from "flagsmith/react";

export const useFeatureFlags = () => {
  const flags = useFlags(['profiles_page']);
  return {
    isProfilePageEnabled: flags.profiles_page.enabled,
  }
}
