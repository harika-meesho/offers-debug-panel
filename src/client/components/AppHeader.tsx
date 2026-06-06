import { AppBar, Toolbar, Typography, Box, IconButton, Divider } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  onBack?: () => void; // when provided, shows a back arrow
}

/**
 * Shared top navigation bar used across all pages.
 * Pass `onBack` to show a back arrow (e.g. on detail pages).
 */
export default function AppHeader({ onBack }: Props) {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        <BugReportIcon sx={{ mr: 1.5, fontSize: 26, color: 'primary.main' }} />

        <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ letterSpacing: 0.3 }}>
          meesho
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 2, my: 1.5 }} />

        <Typography variant="body1" fontWeight={500} color="text.secondary">
          Offer Debug Panel
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" color="text.secondary">
          internal tool
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
