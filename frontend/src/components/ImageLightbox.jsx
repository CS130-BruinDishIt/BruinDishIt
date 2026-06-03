import { Dialog, Box } from "@mui/material";

export default function ImageLightbox({
  open,
  image,
  onClose,
}) {
  if (!image) return null;

  const src = image.path || image.url || image;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
          overflow: "hidden",
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
          backgroundColor: "rgba(0,0,0,0.9)",
          cursor: "zoom-out",
        }}
      >
        <Box
          component="img"
          src={src}
          sx={{
            maxWidth: "92vw",
            maxHeight: "92vh",
            objectFit: "contain",
            borderRadius: 2,
          }}
        />
      </Box>
    </Dialog>
  );
}