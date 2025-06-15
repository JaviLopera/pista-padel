import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Alert,
    Stack,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/services/supabase-client.service';
import MobileLayout from '../../../shared/components/mobile-layout';
import type { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Reserva = {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    user_id: string;
    perfil?: Perfil | null;
};

type Perfil = {
    id: string;
    nombre?: string;
    apellidos?: string;
    email?: string;
    address?: string;
};

export default function AdminReservasPanelComponent({ user }: { user: User }) {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refresh, setRefresh] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        void (async () => {
            setError('');
            setSuccess('');
            // 1. Traer todas las reservas
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('id, start_time, end_time, status, user_id')
                .order('start_time', { ascending: false });
            if (bookingsError) {
                setError('No se pudieron cargar las reservas');
                return;
            }
            // 2. Traer todos los perfiles de esos user_id
            const userIds = Array.from(new Set(bookings.map(b => b.user_id)));
            if (!userIds.length) {
                setReservas([]);
                return;
            }
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, nombre, apellidos, email, address')
                .in('id', userIds);
            if (profilesError) {
                setError('No se pudieron cargar los perfiles');
                return;
            }
            const profileMap = new Map(profiles.map((p: Perfil) => [p.id, p]));
            setReservas(
                bookings.map((reserva: Reserva) => ({
                    ...reserva,
                    perfil: profileMap.get(reserva.user_id) || null,
                }))
            );
        })();
    }, [refresh]);

    async function handleDeleteReserva(id: string) {
        setError('');
        setSuccess('');
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) setError('No se pudo borrar la reserva.');
        else {
            setSuccess('Reserva eliminada');
            setRefresh(r => r + 1);
        }
    }

    return (
        <MobileLayout title="Reservas" user={user}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <IconButton edge="start" color="primary" aria-label="volver" onClick={() => navigate('/admin')}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Gestión de reservas
                </Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Stack spacing={2}>
                {reservas.map(reserva => (
                    <Card key={reserva.id} sx={{ width: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                            <Box>
                                <Typography fontWeight={600}>
                                    {reserva.perfil?.nombre} {reserva.perfil?.apellidos}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {reserva.perfil?.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dirección: {reserva.perfil?.address}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    {format(new Date(reserva.start_time), "EEEE, d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })} -{' '}
                                    {format(new Date(reserva.end_time), "HH:mm", { locale: es })}
                                </Typography>
                                <Typography variant="body2" color={reserva.status === 'active' ? 'success.main' : 'error'}>
                                    {reserva.status === 'active' ? 'Activa' : reserva.status}
                                </Typography>
                            </Box>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteReserva(reserva.id)}
                                aria-label="Eliminar"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </MobileLayout>
    );
}