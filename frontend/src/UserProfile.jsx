import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthUser } from "./api/auth";
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
  Stack,
  Typography,
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function UserProfile() {
    const [tab, setTab] = useState(0);

    // // temp user until authenticaion + backend connected
    // const user = {
    //     username: "User1",
    //     joined: "05/29/2026",
    // };
    const user = getAuthUser();
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(): null;; // actual join date from backend, or null case (which happens sometimes?)

    return (
      <Container maxWidth="sm" className="profile-container">
        <Paper elevation={3} className="profile-box">

          <Box className="profile-header">
            <Avatar className= "profile-pic">
                <AccountCircleIcon/>
            </Avatar>

            <Box className ="profile-info">
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
                        <Box component="form" className="settings-form">
                            <TextField label = "Current Password" type ="password" variant="outlined" fullWidth />
                            <TextField label = "New Password" type ="password" variant="outlined" fullWidth />
                            <TextField label = "Confirm New Password" type ="password" variant="outlined" fullWidth />
                            <Button type="submit" variant="contained" fullWidth>
                             Update
                            </Button>
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box  className="posts">
                            <Typography variant="body1" color="text.secondary">
                                No posts yet!
                            </Typography>
                        </Box>
                    )}

                </Box>
            </Box>

        </Paper>
      </Container>

    
  )
}




export default UserProfile;
