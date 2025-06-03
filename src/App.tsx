import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import Login from './Login';
import Rules from './Rules';

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
            <Route path="/" element={user ? <Rules /> : <Navigate to="/login" />} />
            {/* Aquí puedes añadir más rutas protegidas */}
        </Routes>
    );
}
