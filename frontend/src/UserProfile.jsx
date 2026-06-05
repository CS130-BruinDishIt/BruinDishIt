import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { getAuthUser, clearAuthSession, getUserPosts, uploadImage } from "./api/auth";
import { updatePW, editProfilePic } from "./api/auth";
import "./styles/UserProfile.css";
import {
  Box,
  Avatar,
  Tab,
  IconButton,
  Tabs,
  TextField,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

function UserProfile() {
  const { id } = useParams(); 
  const [posts, setPosts] = useState([]); 
  const [tab, setTab] = useState(0);
  const user = getAuthUser();
  const navigate = useNavigate();
  const [currentPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const [formImageData, setFormImageData] = useState("");
  const [formImageName, setFormImageName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const resolvePhotoSrc = (value) => {
    if (!value) return "";
    if (/^(https?:\/\/|data:)/i.test(value)) return value;
    return `/src/assets/${value}`;
  };
  
  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setFormImageName(file.name); 
    setIsUploading(true);
    setErrorMessage("");
  
    try {
      const url = await uploadImage(file); 
      setFormImageData(url);
    } catch (err) {
      console.error("Image upload failed", err);
      setErrorMessage("Failed to process image file upload.");
    } finally {
      setIsUploading(false);
    }
  
    event.target.value = "";
  };
  
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;

  function handleSignOutClick() {
    clearAuthSession();
    navigate("/signin");
  }

  const handleUpdateProfilePic = async (e) => {
    e.preventDefault();
    if (!formImageData) {
      setErrorMessage("Please pick an image file first before updating.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
  
    try { 
      // Changed from newPicURL to use the actual R2 cloud link string from image selector
      const result = await editProfilePic(formImageData);
      setSuccessMessage("Profile picture updated successfully!");
      setFormImageData("");
      setFormImageName("");
    
      const sessionData = localStorage.getItem("user"); 
      
      if (sessionData) {
        const updatedUserData = JSON.parse(sessionData);
        updatedUserData.profileImageURL = result.user.profileImageURL;
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
    
      navigate(0); 
    
    } catch (err) {
      setErrorMessage(err.message || "Failed to save profile picture changes.");
    }
  };

  const isOwnProfile = user?.id === id;
  
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("profile-full-width");
    return () => root?.classList.remove("profile-full-width");
  }, []);

  useEffect(() => {  
    async function fetchUserPosts() {
      if (!id) return; 
      try {
        const data = await getUserPosts(id);
        setPosts(data.reviews || []); 
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    }
    fetchUserPosts();
  }, [id]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
  
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    try { 
      const result = await updatePW({ currentPassword, newPassword });
      setSuccessMessage("Password updated successfully!");
      setCurrPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(err.message);
      setErrorMessage(err.message || "Failed to update password.");
    }
  };

  return (
    <Container disableGutters maxWidth={false} className="profile-container">
      <Paper elevation={3} className="profile-box">

        <Box className="profile-header">
          <Avatar 
            className="profile-pic"
            src={user?.profileImageURL ? resolvePhotoSrc(user.profileImageURL) : undefined}
          >
            {!user?.profileImageURL && <AccountCircleIcon />}
          </Avatar>

          <Box className="profile-info">
            <Typography variant="h4" component="h1" className="profile-username">
              {user?.username || "User"}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="joined">
              Joined {joinDate}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box className="profile-tabs-box">
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} className="profile-tabs" >
            {isOwnProfile && <Tab label="Settings" />}
            <Tab label="Posts" />
          </Tabs>

          <Box className="profile-tab-content">
            {tab === (isOwnProfile ? 0 : -1) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                {/* Form 1: Update Profile Picture Layout Wrapper */}
                <Box component="form" className="settings-form" onSubmit={handleUpdateProfilePic}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Update Profile Picture</Typography>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageSelect}
                  />
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Processing..." : "Choose Image"}
                    </Button>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      {formImageName || "No file selected"}
                    </Typography>
                  </Box>

                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    disabled={!formImageData || isUploading}
                  >
                    Save New Profile Picture
                  </Button>
                </Box>

                <Divider />

                {/* Form 2: Update Password */}
                <Box component="form" className="settings-form" onSubmit={handleUpdatePassword}>
                  <Typography variant="h6" sx={{ mb: -1 }}>Change Password</Typography>
                  <TextField label="Current Password" type="password" fullWidth value={currentPassword} onChange={(e) => setCurrPassword(e.target.value)} />
                  <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <TextField label="Confirm New Password" type="password" fullWidth value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                  
                  {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
                  {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}  
                  
                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Update Password
                  </Button>
                </Box>

              </Box>
            )}

            {tab === (isOwnProfile ? 1 : 0) && (
              <Box className="posts" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posts.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    No posts yet!
                  </Typography>
                ) : (
                  posts.map((post) => (
                    <Paper key={post._id} variant="outlined" sx={{ p: 3 }}> 
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                          {post.itemId?.name || post.hallId?.name || "Review"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                          Rating: {post.rating} / 5
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ fontSize: '1.2rem', mb: post.imageUrl ? 2.5 : 0, lineHeight: 1.6 }}>
                        {post.text}
                      </Typography>
                  
                      {post.imageUrl && (
                        <Box
                          component="img"
                          src={resolvePhotoSrc(post.imageUrl)}
                          alt={`Review attachment for ${post.itemId?.name || 'item'}`}
                          sx={{
                            width: '100%',
                            maxWidth: '500px',       
                            maxHeight: '350px',      
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: 'block',
                            mb: 1.5
                          }}
                        />
                      )}
                  
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
  );
}

export default UserProfile;