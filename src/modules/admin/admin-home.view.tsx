import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MobileLayout from '../../shared/components/mobile-layout';
import { User } from '@supabase/supabase-js';

export default function AdminHomeView({ user }: { user: User }) {
    return (
        <MobileLayout title="Panel de Administración" user={user}>
            <Box sx={{ pt: 1 }}>
                <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
                    Accede a las zonas de gestión de la comunidad
                </Typography>
                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        alignItems: 'center',
                        maxWidth: 420,
                        mx: 'auto',
                    }}
                >
                    <Card sx={{ width: '100%', boxShadow: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Usuarios
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Ver, borrar y consultar reservas de los vecinos registrados.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                component={RouterLink}
                                to="/admin/usuarios"
                                fullWidth
                                size="large"
                                sx={{ py: 1.5, fontSize: 18 }}
                            >
                                Gestionar usuarios
                            </Button>
                        </CardContent>
                    </Card>
                    <Card sx={{ width: '100%', boxShadow: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Invitaciones
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Añade, revisa y elimina invitaciones para nuevos vecinos.
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                component={RouterLink}
                                to="/admin/invitaciones"
                                fullWidth
                                size="large"
                                sx={{ py: 1.5, fontSize: 18 }}
                            >
                                Gestionar invitaciones
                            </Button>
                        </CardContent>
                    </Card>
                    <Card sx={{ width: '100%', boxShadow: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Reservas
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Consulta y administra todas las reservas de la pista.
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                component={RouterLink}
                                to="/admin/reservas"
                                fullWidth
                                size="large"
                                sx={{ py: 1.5, fontSize: 18 }}
                            >
                                Gestionar reservas
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </MobileLayout>
    );
}