import { useEffect, useState, FormEvent } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    IconButton,
    Alert,
    Stack,
    Box,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/services/supabase-client.service';
import MobileLayout from '../../../shared/components/mobile-layout';
import type { User } from '@supabase/supabase-js';

type Invitation = {
    id: number;
    email: string;
    used: boolean;
};

export default function AdminInvitationsPanelComponent({ user }: { user: User }) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refresh, setRefresh] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        void (async () => {
            const { data, error } = await supabase
                .from('invited_emails')
                .select('*')
                .order('id', { ascending: false });
            if (!error && data) setInvitations(data as Invitation[]);
            else setError('No se pudieron cargar las invitaciones');
        })();
    }, [refresh]);

    async function handleCreateInvitation(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) return setError('Introduce un email válido');

        // --- CORREGIDO ---
        // Usar maybeSingle() para evitar el error de no rows
        const { data: exists } = await supabase
            .from('invited_emails')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (exists) {
            setError('Este email ya está invitado.');
            return;
        }
        const { error } = await supabase.from('invited_emails').insert([{ email, used: false }]);
        if (error) setError('No se pudo crear la invitación.');
        else {
            setSuccess('Invitación creada');
            setEmail('');
            setRefresh(r => r + 1);
        }
    }

    async function handleDeleteInvitation(id: number) {
        setError('');
        const { error } = await supabase.from('invited_emails').delete().eq('id', id);
        if (error) setError('No se pudo borrar la invitación.');
        else setRefresh(r => r + 1);
    }

    return (
        <MobileLayout title="Invitaciones" user={user}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <IconButton edge="start" color="primary" aria-label="volver" onClick={() => navigate('/admin')}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Gestión de invitaciones
                </Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleCreateInvitation} sx={{ mb: 2 }}>
                <TextField
                    label="Email de invitación"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    required
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Crear invitación
                </Button>
            </Box>
            <Stack spacing={2}>
                {invitations.map(inv => (
                    <Card key={inv.id} sx={{ bgcolor: inv.used ? '#e0e0e0' : '#fff', width: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                            <Box>
                                <Typography fontWeight={600}>{inv.email}</Typography>
                                <Typography variant="body2" color={inv.used ? 'error' : 'success.main'}>
                                    {inv.used ? 'Usada' : 'Disponible'}
                                </Typography>
                            </Box>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteInvitation(inv.id)}
                                disabled={inv.used}
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