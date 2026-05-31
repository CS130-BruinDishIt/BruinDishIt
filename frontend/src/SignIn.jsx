import { Link } from "react-router-dom";
import "./styles/SignIn.css";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function SignIn() {
  return (
    <Container maxWidth="sm" className="signin-container">
      <Paper elevation={3} className="signin-paper">
        <Typography variant="h4" component="h1" className="form-title"
        >Sign In to your BruinDishIt Account</Typography>

        <Box component="form" className="signin-form">

          {/* TODO backend auth */}

          <TextField type="username" label="Username" variant="outlined" fullWidth />
          <TextField type="password" label="Password" variant="outlined" fullWidth />
          <Button type="submit" variant="contained" size="large" className="signin-button"
          >Sign In</Button>

          <Typography variant="body2" className="new-user"
          >New User?{" "}
            <Box component={Link} to="/signup" className="create-acc"
            >Create Account</Box>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignIn;