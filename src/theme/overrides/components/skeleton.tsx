import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function skeleton(theme: Theme) {
  return {
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.neutral,
        },
        rounded: {
          borderRadius: Number(theme.shape.borderRadius) * 2,
        },
      },
    },
  };
}
