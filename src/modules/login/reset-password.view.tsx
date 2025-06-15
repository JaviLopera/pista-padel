import { useState, FormEvent } from "react";
import { supabase } from "../../shared/services/supabase-client.service";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Typography,
    Alert,
    Box,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function ResetPasswordView() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleReset(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // eslint-disable-next-line no-undef
            redirectTo: window.location.origin + "/update-password",
        });
        if (error) {
            setError(error.message);
        } else {
            setSuccess("Te hemos enviado un email con instrucciones para restablecer la contraseña.");
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f4f6fa",
            }}
        >
            <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 3 }}>
                <CardHeader
                    title={
                        <Typography variant="h5" align="center">
                            Restablecer contraseña
                        </Typography>
                    }
                />
                <CardContent>
                    <form onSubmit={handleReset}>
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
                            Enviar email de restablecimiento
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
