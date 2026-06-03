import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { getAuthUser, clearAuthSession } from "./api/auth";
import { updatePW } from "./api/auth";
import "./styles/UserProfile.css";
import {
  Box,
  Avatar,
  Tab,
  Tabs,
  TextField,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function UserProfile() {
  const [tab, setTab] = useState(0);
  const user = getAuthUser();
  const navigate = useNavigate();
  const [currentPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Good practice to show errors too!

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;; // actual join date from backend, or null case (which happens sometimes?)

  function handleSignOutClick() {
    clearAuthSession();
    navigate("/signin");
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    // Clear any existing messages on a new submission
    setSuccessMessage("");
    setErrorMessage("");
  
    // Frontend validation check
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
      try { 
      const result = await updatePW({ currentPassword, newPassword });
  
      console.log("Password updated:", result);
      
      // Set your success message
      setSuccessMessage("Password updated successfully!");
      
      // Reset form fields
      setCurrPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(err.message);
      // Set error message if the backend rejects it (e.g., wrong current password)
      setErrorMessage(err.message || "Failed to update password.");
    }
  };

  return (
    <Container maxWidth="sm" className="profile-container">
      <Paper elevation={3} className="profile-box">

        <Box className="profile-header">
          <Avatar className="profile-pic">
            <AccountCircleIcon />
          </Avatar>

          <Box className="profile-info">
            <Typography variant="h4" component="h1" className="profile-username">
              {user?.username || "User"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Joined {joinDate}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box className="profile-tabs-box">
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} className="profile-tabs" >
            <Tab label="Settings" />
            <Tab label="Posts" />
          </Tabs>

          <Box className="profile-tab-content">
            {tab === 0 && (
              <Box component="form" className="settings-form" onSubmit={handleUpdatePassword}>
                <TextField label="Current Password" type="password" fullWidth value={currentPassword} onChange={(e) => setCurrPassword(e.target.value)} />
                <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <TextField label="Confirm New Password" type="password" fullWidth value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
                {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}  
                <Button type="submit" variant="contained" fullWidth>
                  Update
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box className="posts">
                <Typography variant="body1" color="text.secondary">
                  No posts yet!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Button type="button" variant="contained" className="profile-signout-button" onClick={handleSignOutClick}>
            Sign Out
          </Button>

      </Paper>
    </Container>


  )
}




export default UserProfile;
