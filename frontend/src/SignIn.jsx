import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser, saveAuthSession } from "./api/auth";
import { useForm } from "./hooks/useForm";
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
// react helpers from hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    values, setVals, successMessage, errorMessage, setSuccessMessage, setErrorMessage, isSubmitting, handleSubmit 
  } = useForm({ username: "", password: ""},
    location.state?.successMessage || "" // success message from SignUp if redirected
    );

  const onSubmit = handleSubmit(async ({ username, password }) => {
    const data = await loginUser({ username, password});
    saveAuthSession({ token: data.token, user: data.user });
    navigate(location.state?.from || `/user/${data.user.id}`); // redirect to profile page if login success or whererever they sign in from
  },
  "Could not sign in. Please check your username and password and try again."
);
 
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
        <Box component="form" className="signin-form" onSubmit={onSubmit}>
                                                                                    {/*save into username and password state vars */}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}   {/*display backend error message */}
          <TextField type="username" label="Username" variant="outlined" fullWidth value={values.username} onChange={(event) => setVals({...values, username: event.target.value})}/>
          <TextField type="password" label="Password" variant="outlined" fullWidth value={values.password} onChange={(event) => setVals({...values, password: event.target.value})}/>
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