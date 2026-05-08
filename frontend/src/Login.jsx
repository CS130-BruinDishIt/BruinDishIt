import "./Login.css";

function Login() {
  return (
    <main className="login-page">
      <h1>Login</h1>
      <form className="login-form">
        {/*TODO backend auth */}
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Log in</button>
      </form>
    </main>
  );
}

export default Login;