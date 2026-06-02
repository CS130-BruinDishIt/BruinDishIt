import "./styles/SignUp.css";
import { useNavigate } from "react-router-dom";
import { useForm } from "./hooks/useForm";
import { signupUser } from "./api/auth";
import {
	Alert,
	Box,
	Button,
	Container,
	Paper,
	TextField,
	Typography,
} from "@mui/material";

// https://medium.com/@arpit.gupta_75189/seamless-user-redirection-in-react-after-authentication-326f663a9cc2
// https://www.joshwcomeau.com/react/data-binding/

function SignUp() {
// react helpers from hooks
  const navigate = useNavigate();
  const { 
    values, setVals, successMessage, errorMessage, setErrorMessage, isSubmitting, handleSubmit 
	} = useForm({ username: "", password: "", confirmPassword: "" });

  const onSubmit = handleSubmit(async ({ username, password, confirmPassword }) => {
    // pswd mismatch error handling before sending to backend
		if (password !== confirmPassword) {
		setErrorMessage("Passwords do not match.");  
		return;
		}
		await signupUser({ username, password });
    navigate(`/signin`, { // redirect to sign-in page if signup success
      state: {successMessage: "Account created successfully. Please sign in."},  // pass success message to SignIn.jsx to show alert
		});
	});

	return (
		<Container maxWidth="sm" className="signup-container" >
			<Paper elevation={3} className="signup-paper" >
				<Typography variant="h4" component="h1" className="form-title"> Create An Account </Typography>

				<Box component="form" className="signup-form" onSubmit={onSubmit} >

					{errorMessage && <Alert severity="error">{errorMessage}</Alert>}
					<TextField type="text" label="Username" variant="outlined" fullWidth value={values.username} onChange={(event) => setVals({...values, username: event.target.value})} />
					<TextField type="password" label="Password" variant="outlined" fullWidth value={values.password} onChange={(event) => setVals({...values, password: event.target.value})} />
					<TextField type="password" label="Confirm Password" variant="outlined" fullWidth value={values.confirmPassword} onChange={(event) => setVals({...values, confirmPassword: event.target.value})} />

					<Button type="submit" variant="contained" size="large" className="create-button" disabled={isSubmitting}>
						{isSubmitting ? "Creating Account..." : "Create Account"}
					</Button>

				</Box>
			</Paper>
		</Container>
	);
}

export default SignUp;