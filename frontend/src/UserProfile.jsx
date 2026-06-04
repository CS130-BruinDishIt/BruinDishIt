import { useState,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { getAuthUser, clearAuthSession, getUserPosts } from "./api/auth";
import { updatePW, editProfilePic } from "./api/auth";
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

const resolvePhotoSrc = (value) => {
  if (!value) return "";
  if (/^(https?:\/\/|data:)/i.test(value)) return value;
  return `/src/assets/${value}`;
};

function UserProfile() {
  const { id } = useParams(); //Grab the ID from the URL (e.g., /profile/:id)
  const [posts, setPosts] = useState([]); // State to hold the fetched reviews/posts
  const [newPicURL, setNewPicURL] = useState(""); //profile pic
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

  const handleUpdateProfilePic = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
  
    try { 
      const result = await editProfilePic(newPicURL);
      setSuccessMessage("Profile picture updated successfully!");
      setNewPicURL("");
    
      // 1. Grab the current string data out of localStorage using your "user" key
      const sessionData = localStorage.getItem("user"); 
      
      if (sessionData) {
        const updatedUserData = JSON.parse(sessionData);

        updatedUserData.profileImageURL = result.user.profileImageURL;
        
        // Save the updated object back down to localStorage as a string
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
    
      // Tell the browser to refresh the route cleanly so the avatar updates instantly on screen
      navigate(0); 
    
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile picture.");
    }
  };

  const isOwnProfile = user?.id === id;
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("profile-full-width");
    return () => root?.classList.remove("profile-full-width");
  }, []);

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
    <Container disableGutters maxWidth={false} className="profile-container">
      <Paper elevation={3} className="profile-box">

        <Box className="profile-header">
        <Avatar 
          className="profile-pic"
          // If the image exists, MUI will use this src attribute automatically
          src={user?.profileImageURL ? resolvePhotoSrc(user.profileImageURL) : undefined}
        >
          {/* Fallback content: If src fails or doesn't exist, render the icon */}
          {!user?.profileImageURL && <AccountCircleIcon />}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                {/* Form 1: Update Profile Picture */}
                <Box component="form" className="settings-form" onSubmit={handleUpdateProfilePic}>
                  <Typography variant="h6" sx={{ mb: -1 }}>Update Profile Picture</Typography>
                  <TextField 
                    label="Profile Image URL" 
                    type="text" 
                    fullWidth 
                    value={newPicURL} 
                    onChange={(e) => setNewPicURL(e.target.value)} 
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button type="submit" variant="contained" fullWidth>
                    Update Photo
                  </Button>
                </Box>

                <Divider />

                {/* Form 2: Update Password */}
                <Box component="form" className="settings-form" onSubmit={handleUpdatePassword}>
                  <Typography variant="h6" sx={{ mb: -1 }}>Change Password</Typography>
                  <TextField label="Current Password" type="password" fullWidth value={currentPassword} onChange={(e) => setCurrPassword(e.target.value)} />
                  <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <TextField label="Confirm New Password" type="password" fullWidth value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                  
                  {/* Alert display handles notifications for both actions */}
                  {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
                  {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}  
                  
                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Update Password
                  </Button>
                </Box>

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
                    <Paper key={post._id} variant="outlined" sx={{ p: 3 }}> {/* Increased padding from 2 to 3 to match larger text */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                        {/* Title scaled from subtitle1 to h6 */}
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                          {post.itemId?.name || post.hallId?.name || "Review"}
                        </Typography>
                        {/* Rating scaled from body2 to body1 */}
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                          Rating: {post.rating} / 5
                        </Typography>
                      </Box>
                      
                      {/* Main body text scaled from body2 to body1 with explicit larger font sizing */}
                      <Typography variant="body1" sx={{ fontSize: '1.2rem', mb: post.imageUrl ? 2.5 : 0, lineHeight: 1.6 }}>
                        {post.text}
                      </Typography>
                  
                      {/* Image render remains beautifully constrained but adjusted bottom margin */}
                      {post.imageUrl && (
                        <Box
                          component="img"
                          src={resolvePhotoSrc(post.imageUrl)}
                          alt={`Review attachment for ${post.itemId?.name || 'item'}`}
                          sx={{
                            width: '100%',
                            maxWidth: '500px',       // Slightly widened max-width to match larger layout
                            maxHeight: '350px',      // Slightly taller max-height
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: 'block',
                            mb: 1.5
                          }}
                        />
                      )}
                  
                      {/* Date caption scaled from caption to body2 */}
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.95rem' }}>
                        {new Date(post.date).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))
                )}
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
