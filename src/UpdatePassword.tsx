import { useState, FormEvent } from "react";
import { supabase } from "./supabaseClient";
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

export default function UpdatePassword() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleUpdate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");
        const { error } = await supabase.auth.updateUser({
            password,
        });
        if (error) {
            setError(error.message);
        } else {
            setSuccess("¡Contraseña actualizada correctamente!");
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
                            Cambiar contraseña
                        </Typography>
                    }
                />
                <CardContent>
                    <form onSubmit={handleUpdate}>
                        <TextField
                            label="Nueva contraseña"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="new-password"
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
                            Guardar contraseña nueva
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
