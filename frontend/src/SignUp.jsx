import "./styles/SignUp.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

    // react helpers for redirecting after account creation success, and form state vars/funcs 
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault(); // no refresh on submit
        setErrorMessage(""); // clear error message on new submit

        // pswd mismatch error handling before sending to backend
        if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");  
        return;
        }

        setIsSubmitting(true); // form is actively submitting -> button changes state

        try {
        await signupUser({ username, password }); // creds to backend
        navigate("/signin", {
            state: {
            successMessage: "Account created successfully. Please sign in.", // pass success message to SignIn.jsx to show alert
            },
        });

        } catch (error) {
        setErrorMessage(error.message || "Could not create account.");
        } finally {
        setIsSubmitting(false); // normal state for button
        }
    }
    
    return (
        <Container maxWidth="sm" className="signup-container" >
            <Paper elevation={3} className="signup-paper" >
                <Typography variant="h4" component="h1" className="form-title"> Create An Account </Typography>

                <Box component="form" className="signup-form" onSubmit={handleSubmit} >

                    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                    <TextField type="text" label="Username" variant="outlined" fullWidth value={username} onChange={(event) => setUsername(event.target.value)}/>
                    <TextField type="password" label="Password" variant="outlined" fullWidth value={password} onChange={(event) => setPassword(event.target.value)}/>
                    <TextField type="password" label="Confirm Password" variant="outlined" fullWidth value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/>

                    <Button type="submit" variant="contained" size="large" className="create-button" disabled={isSubmitting}>
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                    
                </Box>
            </Paper>
        </Container>
    );
}

export default SignUp;