import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "./api/auth";
import "./styles/SignIn.css";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function SignIn() {

  // react helpers for reading messages passed to this page and redirecting after login
  const location = useLocation(); // current page/route
  const navigate = useNavigate(); // redirect user
  const successMessage = location.state?.successMessage; // success message passed from previous page ( successful account creation from SignUp.jsx)
  // SignIn form state vars/funcs for inputs and submit status
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();  // stops page refresh on app
    setIsSubmitting(true); // form is actively submitting -> button changes state

    try {
      const data = await loginUser({ username, password }); // send creds to backend and wait till response
      navigate(`/user/${data.user.id}`); //redirect to user profile page after login

    } catch (error) {
      setErrorMessage(error.message || "Could not sign in.");
    } finally {
      setIsSubmitting(false);  // goes back to normal button state
    }
  }

  return (
    <Container maxWidth="sm" className="signin-container">
      {/* severity --> success --> green check mark */}
      {successMessage && (
        <Alert severity="success" className="signin-alert">
          {successMessage}
        </Alert>      
      )}
      <Paper elevation={3} className="signin-paper">
        <Typography variant="h4" component="h1" className="form-title">Sign In to your BruinDishIt Account</Typography>
        <Box component="form" className="signin-form" onSubmit={handleSubmit}>
                                                                                    {/*save into username and password state vars */}
          <TextField type="username" label="Username" variant="outlined" fullWidth value={username} onChange={(event) => setUsername(event.target.value)}/>
          <TextField type="password" label="Password" variant="outlined" fullWidth value={password} onChange={(event) => setPassword(event.target.value)}/>
          <Button type="submit" variant="contained" size="large" className="signin-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}  {/*change button when actively submitting*/}
          </Button>

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