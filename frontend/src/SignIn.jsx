import { Link } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
  return (
    <main className="sign-in-page">
      <h1>Sign In to your BruinDishIt Account</h1>
      <form className="sign-in-form">
        {/*TODO backend auth */}
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign in</button>
        <p className="new-user-text">
          New User? <Link to="/signup">Create Account</Link>
        </p>
      </form>
    </main>
  );
}

export default SignIn;