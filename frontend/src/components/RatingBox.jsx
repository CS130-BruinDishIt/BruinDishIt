import { Box, Stack, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const getRatingBoxStyle = (rating) => {
  const num = Number(rating);
  if (!num || num <= 0) return { bgcolor: 'grey.100', color: 'text.primary', borderColor: 'grey.300' };
  if (num < 2.0) return { bgcolor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' };
  if (num < 3.0) return { bgcolor: '#ed6c02', color: '#fff', borderColor: '#ed6c02' };
  if (num < 4.0) return { bgcolor: '#fbc02d', color: '#000', borderColor: '#fbc02d' };
  if (num < 4.6) return { bgcolor: '#4caf50', color: '#fff', borderColor: '#4caf50' };
  return { bgcolor: '#2e7d32', color: '#fff', borderColor: '#2e7d32' };
};

const RatingBox = ({ rating, size = "small", sx = {}, }) => {
  const large = size === "large";
  return (
    <Box
      sx={{
        px: large ? 1.5 : 0.75,
        py: large ? 0.5 : 0.75,
        borderRadius: large ? 2 : 1,
        border: large ? "2px solid" : "1px solid",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        height: "fit-content",
        ...getRatingBoxStyle(rating),
        ...sx,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={large ? 0.5 : 0.25}
        sx={{ color: "inherit" }}
      >
        <Typography
          variant={large ? "h5" : "body2"}
          sx={{
            color: "inherit",
            fontWeight: 600,
            lineHeight: 1,
            fontSize: large ? "1.875rem" : undefined,
          }}
        >
          {rating > 0 ? Number(rating).toFixed(1) : "--"}
        </Typography>
        <StarIcon sx={{fontSize: large ? "1.875rem" : "0.875rem", color: "inherit"}}/>
      </Stack>
    </Box>
  );
};

export default RatingBox;