import "./styles/SignUp.css";
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

function SignUp() {
    return (
        <Container maxWidth="sm" className="signup-container" >
            <Paper elevation={3} className="signup-paper" >
                <Typography variant="h4" component="h1" className="form-title"
                >Create An Account</Typography>

                <Box component="form" className="signup-form" >

                    {/* TODO backend auth */}

                    <TextField type="text" label="UID" variant="outlined" fullWidth />
                    <TextField type="text" label="Username" variant="outlined" fullWidth />
                    <TextField type="password" label="Password" variant="outlined" fullWidth />
                    <TextField type="password" label="Confirm Password" variant="outlined" fullWidth />

                    <Button type="submit" variant="contained" size="large" className="create-button"
                    >Create Account</Button>
                    
                </Box>
            </Paper>
        </Container>
    );
}

export default SignUp;