import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, isLoading, signInWithGoogle, signOut } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>
          Test component to verify Google OAuth integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>

        {isAuthenticated && user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User ID:</span>
              <span className="text-sm font-mono">{user.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            {user.full_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm">{user.full_name}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!isAuthenticated ? (
            <Button onClick={signInWithGoogle} className="flex-1">
              Sign In with Google
            </Button>
          ) : (
            <Button onClick={signOut} variant="outline" className="flex-1">
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthTest;
