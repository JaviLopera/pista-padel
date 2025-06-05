import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Stack,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

type UserProfile = {
    id: string;
    email: string;
    nombre?: string;
    apellidos?: string;
    address?: string;
};

type Booking = {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
};

export default function AdminPanel() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [showBookings, setShowBookings] = useState(false);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);

    const navigate = useNavigate();

    // Cargar usuarios
    useEffect(() => {
        void (async () => {
            const { data, error } = await supabase.from('profiles').select('*');
            if (!error && data) setUsers(data as UserProfile[]);
            else setError('No se pudieron cargar los usuarios');
        })();
    }, [refresh]);

    // Ver reservas de usuario
    async function handleShowBookings(user: UserProfile) {
        setSelectedUser(user);
        setShowBookings(true);
        setError('');
        const { data, error } = await supabase.from('bookings').select('id, start_time, end_time, status').eq('user_id', user.id);
        if (!error && data) setUserBookings(data as Booking[]);
        else setError('No se pudieron cargar las reservas.');
    }

    // Borrar usuario COMPLETAMENTE (perfil, reservas, y liberar invitación)
    async function handleDeleteUser(user: UserProfile) {
        setError('');
        // 1. Borrar reservas
        await supabase.from('bookings').delete().eq('user_id', user.id);
        // 2. Borrar perfil
        await supabase.from('profiles').delete().eq('id', user.id);
        // 3. Marcar invitación como libre (si existe)
        await supabase.from('invited_emails').update({ used: false }).eq('email', user.email);
        setRefresh((r) => r + 1);
    }

    return (
        <Box sx={{ p: 2, maxWidth: 420, mx: 'auto' }}>
            {/* Flecha de volver */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton edge="start" color="primary" aria-label="volver" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Gestión de usuarios
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack spacing={2}>
                {users.map((user) => (
                    <Card key={user.id} sx={{ width: '100%', borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography fontWeight={600}>
                                {user.nombre} {user.apellidos}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                {user.email}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Dirección: {user.address ?? ''}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" size="small" onClick={() => handleShowBookings(user)} sx={{ flex: 1 }}>
                                    Ver reservas
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteUser(user)}
                                    sx={{ flex: 1 }}
                                >
                                    Borrar usuario
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            {/* Diálogo para ver reservas */}
            <Dialog open={showBookings} onClose={() => setShowBookings(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Reservas de {selectedUser?.nombre} {selectedUser?.apellidos}
                </DialogTitle>
                <DialogContent>
                    {userBookings.length === 0 ? (
                        <Typography>No tiene reservas.</Typography>
                    ) : (
                        userBookings.map((booking) => (
                            <Box key={booking.id} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                <Typography>
                                    {booking.start_time} - {booking.end_time} ({booking.status})
                                </Typography>
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBookings(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
