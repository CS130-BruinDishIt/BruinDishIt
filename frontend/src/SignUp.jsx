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

function SignUp() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");

        if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
        }

        setIsSubmitting(true);

        try {
        await signupUser({ username, password });

        navigate("/signin", {
            state: {
            successMessage: "Account created successfully. Please sign in.",
            },
        });
        } catch (error) {
        setErrorMessage(error.message || "Could not create account.");
        } finally {
        setIsSubmitting(false);
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