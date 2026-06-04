import { useState,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { getAuthUser, clearAuthSession, getUserPosts } from "./api/auth";
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
  const { id } = useParams(); //Grab the ID from the URL (e.g., /profile/:id)
  const [posts, setPosts] = useState([]); // State to hold the fetched reviews/posts
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

  const isOwnProfile = user?.id === id;
  useEffect(() => {  //fetch posts when profile ID changes
    async function fetchUserPosts() {
      if (!id) return; // Guard clause if no ID is present
      try {
        const data = await getUserPosts(id);
        // Assumes your backend responds with { success: true, reviews: [...] }
        setPosts(data.reviews || []); 
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    }

    fetchUserPosts();
  }, [id]);

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
    <Container maxWidth={false} disableGutters className="profile-container">
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
            {/* Show Settings tab only if it's their own profile */}
            {isOwnProfile && <Tab label="Settings" />}
            <Tab label="Posts" />
          </Tabs>

          <Box className="profile-tab-content">
            {/* Render Settings only if tab index matches and it's their profile */}
            {tab === (isOwnProfile ? 0 : -1) && (
              <Box component="form" className="settings-form" onSubmit={handleUpdatePassword}>
                <TextField label="Current Password" type="password" fullWidth value={currentPassword} onChange={(e) => setCurrPassword(e.target.value)} />
                <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <TextField label="Confirm New Password" type="password" fullWidth value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
                {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}  
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                  Update
                </Button>
              </Box>
            )}

            {/* Adjusting tab matching logic dynamically based on whether Settings is visible */}
            {tab === (isOwnProfile ? 1 : 0) && (
              <Box className="posts" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posts.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    No posts yet!
                  </Typography>
                ) : (
                  // 4. Map through the posts array and display them
                  posts.map((post) => (
                    <Paper key={post._id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {/* Display dining hall name or item name depending on what was reviewed */}
                          {post.itemId?.name || post.hallId?.name || "Review"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rating: {post.rating} / 5
                        </Typography>
                      </Box>
                      <Typography variant="body2">{post.text}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {new Date(post.date).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        {isOwnProfile && (
          <Button type="button" variant="contained" className="profile-signout-button" onClick={handleSignOutClick} sx={{ mt: 2 }}>
            Sign Out
          </Button>
        )}

      </Paper>
    </Container>
  )
}




export default UserProfile;
