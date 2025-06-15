import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './shared/services/supabase-client.service';
import LoginView from './modules/login/login.view';
import RulesComponent from './shared/components/rules.component';
import ResetPasswordView from './modules/login/reset-password.view';
import UpdatePasswordView from './modules/login/update-password.view';
import CalendarReservationsView from './modules/calendar-reservations/calendar-reservations.view';
import AdminUserPanelComponent from './modules/admin/components/admin-users';
import AdminHomeView from './modules/admin/admin-home.view';
import RegisterView from './modules/register/register.view';

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
        <Routes>
            <Route path="/login" element={!user ? <LoginView /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterView /> : <Navigate to="/" />} />
            <Route path="/reset-password" element={<ResetPasswordView />} />
            <Route path="/update-password" element={<UpdatePasswordView />} />
            <Route path="/" element={user ? <RulesComponent /> : <Navigate to="/login" />} />
            <Route path="/calendario" element={user ? <CalendarReservationsView /> : <Navigate to="/login" />} />
            <Route
                path="/admin/*"
                element={
                    user && user.email === 'javier.lopera.94@gmail.com' ? (
                        <Routes>
                            <Route path="" element={<AdminHomeView />} />
                            <Route path="usuarios" element={<AdminUserPanelComponent />} />
                            {/* <Route path="invitaciones" element={<InvitationsPanel />} /> */}
                            {/* <Route path="reservas" element={<ReservasAdminPanel />} /> */}
                        </Routes>
                    ) : (
                        <Navigate to="/" />
                    )
                }
            />

            {/* Aquí puedes añadir más rutas protegidas */}
        </Routes>
    );
}
