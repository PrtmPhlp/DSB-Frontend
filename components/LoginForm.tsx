import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";
import React, { useCallback, useMemo, useState } from 'react';

interface LoginFormProps {
    onLogin: (username: string, password: string) => Promise<void>;
    error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const isFormValid = useMemo(() =>
        username.trim() !== '' && password.trim() !== '',
        [username, password]
    );

    const handleLogin = useCallback(async () => {
        if (isFormValid) {
            setIsLoggingIn(true);
            await onLogin(username, password);
        }
    }, [isFormValid, onLogin, username, password]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isFormValid) {
            handleLogin();
        }
    }, [isFormValid, handleLogin]);

    if (isLoggingIn) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-10 bg-accent rounded animate-pulse" />
                        <div className="h-10 bg-accent rounded animate-pulse" />
                        <div className="h-10 bg-accent rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyPress}
                            id="username"
                            autoComplete="username"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyPress}
                            id="password"
                            autoComplete="current-password"
                        />
                        <Button onClick={handleLogin} disabled={!isFormValid}>Login</Button>
                    </div>
                </CardContent>
            </Card>
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </>
    );
}; 