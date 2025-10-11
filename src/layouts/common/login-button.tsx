import Button from '@mui/material/Button';
import { Theme, SxProps } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useFeatureFlag } from 'src/hooks/use-feature-flag';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export default function LoginButton({ sx }: Props) {
  const enabled = useFeatureFlag('login');
  return (
    <Button
      component={RouterLink}
      href={enabled ? PATH_AFTER_LOGIN : '#'}
      disabled={!enabled}
      variant="outlined"
      sx={{ mr: 1, ...sx }}
    >
      Login
    </Button>
  );
}
