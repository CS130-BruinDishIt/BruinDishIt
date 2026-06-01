import { Link } from "react-router-dom";
import forkKnifeIcon from "./assets/fork-and-knife.svg";
import profileIcon from "./assets/user.png";  // maybe import these from MUI icons too?
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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { getAuthUser } from "./api/auth";

const Navbar = () => {
  const user = getAuthUser();
  return (
    <AppBar position="static" elevation={0} className="navbar">
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters className="toolbar" >
          <Box component={Link} to="/" className="home-button">
            <Box component="img" src={forkKnifeIcon} alt="Home" className="home-icon"/>
          </Box>
          <Typography variant="h4" className="title"
          >BruinDishIt</Typography>

          {user ? (
            <Box component={Link} to={`/user/${user.id}`} className="profile-button">
              <Avatar className="profile-icon"> <AccountCircleIcon /> </Avatar>
            </Box>
          ) : (
            <Button component={Link} to="/signin" className="profile-button"> 
              SIGN IN
            <Avatar src={profileIcon} alt="Profile" className="profile-icon"/>
          </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};


export default Navbar;