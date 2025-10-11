import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

import { LabelColor, LabelVariant } from './types';

// ----------------------------------------------------------------------

export const StyledLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'labelcolor' && prop !== 'labelvariant',
})<{
  labelcolor: LabelColor;
  labelvariant: LabelVariant;
}>(({ theme, labelcolor, labelvariant }) => {
  const lightMode = theme.palette.mode === 'light';

  const filledVariant = labelvariant === 'filled';

  const outlinedVariant = labelvariant === 'outlined';

  const softVariant = labelvariant === 'soft';

  const defaultStyle = {
    ...(labelcolor === 'default' && {
      // FILLED
      ...(filledVariant && {
        color: lightMode ? theme.palette.common.white : theme.palette.grey[800],
        backgroundColor: theme.palette.text.primary,
      }),
      // OUTLINED
      ...(outlinedVariant && {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        border: `2px solid ${theme.palette.text.primary}`,
      }),
      // SOFT
      ...(softVariant && {
        color: theme.palette.text.secondary,
        backgroundColor: alpha(theme.palette.grey[500], 0.16),
      }),
    }),
  };

  const colorStyle = {
    ...(labelcolor !== 'default' && {
      // FILLED
      ...(filledVariant && {
        color: theme.palette[labelcolor].contrastText,
        backgroundColor: theme.palette[labelcolor].main,
      }),
      // OUTLINED
      ...(outlinedVariant && {
        backgroundColor: 'transparent',
        color: theme.palette[labelcolor].main,
        border: `2px solid ${theme.palette[labelcolor].main}`,
      }),
      // SOFT
      ...(softVariant && {
        color: theme.palette[labelcolor][lightMode ? 'dark' : 'light'],
        backgroundColor: alpha(theme.palette[labelcolor].main, 0.16),
      }),
    }),
  };

  return {
    height: 24,
    minWidth: 24,
    lineHeight: 0,
    borderRadius: 6,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    textTransform: 'capitalize',
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightBold,
    transition: theme.transitions.create('all', {
      duration: theme.transitions.duration.shorter,
    }),
    ...defaultStyle,
    ...colorStyle,
  };
});
