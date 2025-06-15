import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/services/supabase-client.service';
import { Button, Card, CardContent, CardHeader, TextField, Typography, Alert, Box } from '@mui/material';

export default function LoginView() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f4f6fa',
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
                <CardHeader
                    title={
                        <Typography variant="h5" align="center">
                            Acceso vecinos
                        </Typography>
                    }
                />
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                            required
                        />
                        <TextField
                            label="Contraseña"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                        {error && (
                            <Alert severity="error" sx={{ my: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
                        </Typography>
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
