import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import Login from './Login';
import Rules from './Rules';
import Register from './Register';
import ResetPassword from './ResetPassword';
import UpdatePassword from './UpdatePassword';
import CalendarReservations from './CalendarReservations';
import AdminPanel from './admin/components/AdminUsers';
import AdminHome from './admin/AdminHome';

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
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/" element={user ? <Rules /> : <Navigate to="/login" />} />
            <Route path="/calendario" element={user ? <CalendarReservations /> : <Navigate to="/login" />} />
            <Route
                path="/admin/*"
                element={
                    user && user.email === 'javier.lopera.94@gmail.com' ? (
                        <Routes>
                            <Route path="" element={<AdminHome />} />
                            <Route path="usuarios" element={<AdminPanel />} />
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
