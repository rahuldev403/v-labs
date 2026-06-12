import { useState } from "react";
import {
  useSignInEmailPassword,
  useSignUpEmailPassword,
  useAuthenticationStatus,
} from "@nhost/react";
import { Navigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    signIn,
    isLoading: isSignInLoading,
    error: signInError,
  } = useSignInEmailPassword();
  const {
    signUp,
    isLoading: isSignUpLoading,
    error: signUpError,
  } = useSignUpEmailPassword();
  const { isAuthenticated } = useAuthenticationStatus();

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await signIn({ email, password });
    } else {
      await signUp({ email, password });
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isSignInLoading || isSignUpLoading}>
          {isLogin ? "Login" : "Create Account"}
        </button>
      </form>
      <p
        style={{ cursor: "pointer", color: "blue", marginTop: "1rem" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Log in"}
      </p>
      {(signInError || signUpError) && (
        <p style={{ color: "red" }}>
          {signInError?.message || signUpError?.message}
        </p>
      )}
    </div>
  );
}
