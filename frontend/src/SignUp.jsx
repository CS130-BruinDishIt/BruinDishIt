import "./SignUp.css";

function SignUp() {
    return (
        <main className="sign-up-page">
            <h1>Create An Account</h1>
            <form className="sign-up-form">
                {/*TODO backend auth */}
            <input type="text" placeholder="UID" />
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <button type="submit">Create Account</button>
            </form>
        </main>
    );
}

export default SignUp;