// apps/admin-frontend/src/pages/LoginPage.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    isAuthenticated,
    handleLogin,
  } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      isLoading={isLoading}
      onSubmit={handleLogin}
    />
  );
};

export default LoginPage;
