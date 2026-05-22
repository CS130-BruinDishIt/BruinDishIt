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
  return (
    <AppBar position="static" elevation={0} className="navbar">
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters className="toolbar" >
          <Box component={Link} to="/" className="home-button">
            <Box component="img" src={forkKnifeIcon} alt="Home" className="home-icon"/>
          </Box>
          <Typography variant="h4" className="title"
          >BruinDishIt</Typography>

          <Button component={Link} to="/signin" className="profile-button"
          > SIGN IN
            <Avatar src={profileIcon} alt="Profile" className="profile-icon"/>
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};


export default Navbar;