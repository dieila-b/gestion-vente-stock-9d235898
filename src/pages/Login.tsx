
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { TestingModeToggle } from "@/components/auth/login/TestingModeToggle";
import { AuthStatusMessage } from "@/components/auth/login/AuthStatusMessage";
import { DemoCredentials } from "@/components/auth/login/DemoCredentials";
import { useLoginForm } from "@/components/auth/login/hooks/useLoginForm";
import { useUserDatabaseCheck } from "@/components/auth/login/hooks/useUserDatabaseCheck";
import { useAuthCheck } from "@/components/auth/login/hooks/useAuthCheck";
import { useTestingModeActivation } from "@/components/auth/login/hooks/useTestingModeActivation";

export default function Login() {
  const { isAuthenticated, loading, isDevelopmentMode, testingMode, enableTestingMode, disableTestingMode } = useAuth();
  const { email, setEmail, password, setPassword, isSubmitting, loginError, handleSubmit } = useLoginForm();
  const { showTestingControls, handleTitleClick } = useTestingModeActivation();
  
  // Check database for user existence
  useUserDatabaseCheck(email, isDevelopmentMode, testingMode);
  
  // Check if already authenticated
  useAuthCheck(isAuthenticated, loading);

  // If still loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold cursor-pointer" onClick={handleTitleClick}>Connexion</CardTitle>
          <AuthStatusMessage 
            isDevelopmentMode={isDevelopmentMode} 
            testingMode={testingMode} 
          />
          <DemoCredentials 
            isDevelopmentMode={isDevelopmentMode}
            testingMode={testingMode}
          />
          
          {showTestingControls && !isDevelopmentMode && (
            <TestingModeToggle 
              testingMode={testingMode}
              enableTestingMode={enableTestingMode}
              disableTestingMode={disableTestingMode}
              isDevelopmentMode={isDevelopmentMode}
            />
          )}
        </CardHeader>
        
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          loginError={loginError}
          isDevelopmentMode={isDevelopmentMode}
          testingMode={testingMode}
        />
      </Card>
    </div>
  );
}
