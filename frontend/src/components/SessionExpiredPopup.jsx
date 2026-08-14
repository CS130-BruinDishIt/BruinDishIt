import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SessionExpiredPopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the custom event emitted by authFetch
    const handleSessionExpired = () => {
      setOpen(true);
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  const handleClose = (event, reason) => {
    // Prevent closing if the user clicks outside (clickaway)
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleLogin = () => {
    setOpen(false);
    navigate("/signin");
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      // Disabled autoHideDuration so the user isn't rushed and has time to act
      sx={{ mb: 2, mr: 2 }} 
    >
      <Alert
        severity="info"
        variant="filled"
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: "420px",
          alignItems: "center",
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={handleLogin}
              sx={{
                fontWeight: "bold",
                borderColor: "rgba(255, 255, 255, 0.7)",
                color: "#fff",
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              Log In
            </Button>
            <IconButton
              size="small"
              aria-label="close popup"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: "bold", mb: 0.5 }}>
          Session Expired
        </AlertTitle>
        Please log back in.
      </Alert>
    </Snackbar>
  );
}