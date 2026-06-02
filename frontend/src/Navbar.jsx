import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import forkKnifeIcon from "./assets/fork-and-knife.svg";
import profileIcon from "./assets/user.png";  // maybe import these from MUI icons too?
import "./styles/Navbar.css";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { getAuthUser, clearAuthSession } from "./api/auth";

const Navbar = () => {
  // Identify if page has been scrolled yet to adapt navbar height
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 0); };
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll); };
  }, []);

  // User authorization
  const user = getAuthUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleProfileClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleSettingsClick() {
    handleMenuClose();
    navigate(`/user/${user.id}`);
  }

  function handleSignOutClick() {
    clearAuthSession();
    handleMenuClose();
    navigate("/signin");
  }

  return (
    <AppBar position="fixed" elevation={scrolled ? 4 : 0}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Container maxWidth={false} disableGutters>
        <Toolbar className="toolbar" disableGutters >
          <Box className="toolbar-content">
            <Box component={Link} to="/" className="home-button">
              <Box component="img" src={forkKnifeIcon} alt="Home" className="home-icon" />
            </Box>
            <Typography variant="h3" className="title" component={Link} to="/">
              BruinDishIt
            </Typography>

            {user ? (
              <>
                <IconButton onClick={handleProfileClick} className="profile-button" size="large">
                  <Avatar className="profile-icon"> <AccountCircleIcon /> </Avatar>
                </IconButton>

                <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} className="profile-menu"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}>

                  <Box className="profile-menu-header">
                    <Avatar className="profile-menu-avatar"> <AccountCircleIcon /> </Avatar>
                    <Box className="profile-menu-user">
                      <Typography className="profile-menu-username"> {user.username}</Typography>
                    </Box>
                  </Box>

                  <Divider className="profile-menu-divider" />

                  <MenuItem className="profile-menu-item" onClick={handleSettingsClick}>
                    <ListItemIcon> <SettingsIcon fontSize="small" /></ListItemIcon>
                    Settings
                  </MenuItem>

                  <Divider className="profile-menu-divider" />

                  <MenuItem className="profile-menu-item" onClick={handleSignOutClick}>
                    <ListItemIcon> <LogoutIcon fontSize="small" /></ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={Link} to="/signin" className="profile-button">
                SIGN IN
                <Avatar src={profileIcon} alt="Profile" className="profile-icon" />
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;