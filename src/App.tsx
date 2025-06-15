import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './shared/services/supabase-client.service';

import LoginView from './modules/login/login.view';
import RegisterView from './modules/register/register.view';
import ResetPasswordView from './modules/login/reset-password.view';
import UpdatePasswordView from './modules/login/update-password.view';
import CalendarReservationsView from './modules/calendar-reservations/calendar-reservations.view';
import RulesComponent from './shared/components/rules.component';
import AdminHomeView from './modules/admin/admin-home.view';
import AdminUserPanelComponent from './modules/admin/components/admin-users';

// Opcional: crea un pequeño view wrapper para las reglas, así tienes título/header
import MobileLayout from './shared/components/mobile-layout';
import PrivateRoute from './shared/router/private-router';
import AdminRoute from './shared/router/admin-route';
import AdminInvitationsPanelComponent from './modules/admin/components/admin-invitations';
import { Box } from '@mui/material';

function RulesView({ user }: { user: User }) {
    return (
        <MobileLayout title="Reglas de la pista" user={user}>
            <RulesComponent user={user} />
        </MobileLayout>
    );
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Inicialización del usuario
        void (async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        })();

        // Listener de cambios de sesión/auth
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => {
            subscription.subscription.unsubscribe();
        };
    }, []);

    if (loading) return <div>Cargando...</div>;

    return (
        <Box sx={{ px: 3, width: '100%', boxSizing: 'border-box' }}>
            <Routes>
                {/* Auth */}
                <Route path="/login" element={!user ? <LoginView /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <RegisterView /> : <Navigate to="/" />} />
                <Route path="/reset-password" element={<ResetPasswordView />} />
                <Route path="/update-password" element={<UpdatePasswordView />} />

                {/* Público sólo si está logueado */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute user={user}>
                            <RulesView user={user!} />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/calendario"
                    element={
                        <PrivateRoute user={user}>
                            <CalendarReservationsView user={user!} />
                        </PrivateRoute>
                    }
                />

                {/* Admin */}
                <Route
                    path="/admin/*"
                    element={
                        <AdminRoute user={user}>
                            <Routes>
                                <Route path="" element={<AdminHomeView user={user!} />} />
                                <Route path="usuarios" element={<AdminUserPanelComponent user={user!} />} />
                                <Route path="invitaciones" element={<AdminInvitationsPanelComponent user={user!} />} />

                                {/* <Route path="reservas" element={<ReservasAdminPanel user={user!} />} /> */}
                            </Routes>
                        </AdminRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
            </Routes>
        </Box>
    );
}
