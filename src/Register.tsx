import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Typography,
    Alert,
    Box,
} from '@mui/material';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    async function handleRegister(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Comprobar si el email está invitado y no usado
        const { data: invited, error: errorInvited } = await supabase
            .from('invited_emails')
            .select('*')
            .eq('email', email)
            .eq('used', false)
            .single();

        if (errorInvited || !invited) {
            setError('Este email no está autorizado o ya fue usado.');
            return;
        }

        // 2. Crear usuario en Supabase Auth
        const { data: signupData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError || !signupData.user) {
            setError(signUpError?.message || 'No se pudo crear el usuario.');
            return;
        }

        // 3. Crear perfil de usuario (tabla profiles)
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: signupData.user.id,
                    email: signupData.user.email,
                    address: address,
                },
            ]);

        if (profileError) {
            setError('Usuario creado, pero no se guardó la dirección.');
            // Continúa, pero sería bueno notificarte a ti como admin si esto falla.
        }

        // 4. Marcar email como usado
        await supabase
            .from('invited_emails')
            .update({ used: true })
            .eq('email', email);

        setSuccess('Registro correcto. Revisa tu email para confirmar la cuenta.');
        setTimeout(() => navigate('/login'), 2000);
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
                            Registro vecinos
                        </Typography>
                    }
                />
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            required
                        />
                        <TextField
                            label="Dirección"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                        />
                        {error && (
                            <Alert severity="error" sx={{ my: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ my: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            <Link to="/login">Ir al login</Link>
                        </Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Registrarse
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
