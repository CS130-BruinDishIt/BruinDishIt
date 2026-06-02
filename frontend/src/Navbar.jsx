import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import forkKnifeIcon from "./assets/fork-and-knife.svg";
import profileIcon from "./assets/user.png";
import "./styles/Navbar.css";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Menu,
  Toolbar,
  Typography,
} from "@mui/material";

const Navbar = () => {

  // Identify if page has been scrolled yet to adapt navbar height
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 0); };
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll); };
  }, []);


  return (
    <AppBar position="fixed" elevation={scrolled ? 4 : 0}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Container maxWidth={false} disableGutters>
        <Toolbar className="toolbar" disableGutters >
          <Box className="toolbar-content">
            <Box component={Link} to="/" className="home-button">
              <Box component="img" src={forkKnifeIcon} alt="Home" className="home-icon" />
            </Box>
            <Typography variant="h3" className="title" component={Link} to="/"
            >BruinDishIt</Typography>

            <Button component={Link} to="/signin" className="profile-button"
            > SIGN IN
              <Avatar src={profileIcon} alt="Profile" className="profile-icon" />
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};


export default Navbar;