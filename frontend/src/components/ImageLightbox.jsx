import { Dialog, Box, Typography } from "@mui/material";

export default function ImageLightbox({ open, image, onClose }) {
  if (!image) return null;

  const src = image.path || image.url || image;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      scroll="paper"
      sx={{
        "& .MuiDialog-container": {
          overflow: "hidden",
        },
        "& .MuiDialog-paper": {
          backgroundColor: "transparent",
          boxShadow: "none",
          margin: 0,
          overflow: "hidden",
        },
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.75)",
        },
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Hint text */}
        <Typography
          sx={{
            position: "absolute",
            bottom: 24,
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            letterSpacing: "0.3px",
            pointerEvents: "none", // ensures it doesn't interfere with clicks
            textAlign: "center",
          }}
        >
          Click anywhere outside image to close
        </Typography>

        <Box
          component="img"
          src={src}
          onClick={(e) => e.stopPropagation()}
          sx={{
            maxWidth: "92vw",
            maxHeight: "92vh",
            objectFit: "contain",
            display: "block",
            borderRadius: 2,
          }}
        />
      </Box>
    </Dialog>
  );
}