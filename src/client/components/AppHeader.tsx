import { AppBar, Toolbar, Typography, Box, IconButton, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  onBack?: () => void;
}

export default function AppHeader({ onBack }: Props) {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ minHeight: 56 }}>
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 1, color: 'primary.main' }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Meesho logo mark — "m" in brand gradient pill */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #9C27B0 0%, #CE3AB7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.25,
            flexShrink: 0,
          }}
        >
          <Typography
            fontWeight={900}
            color="white"
            sx={{ fontSize: '1.15rem', lineHeight: 1, letterSpacing: -0.5 }}
          >
            m
          </Typography>
        </Box>

        {/* Wordmark */}
        <Typography
          variant="h6"
          sx={{
            color: '#9C27B0',
            fontFamily: '"Nunito", sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
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
