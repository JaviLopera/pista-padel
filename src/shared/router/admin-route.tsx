import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'javier.lopera.94@gmail.com';

export default function AdminRoute({
    user,
    children,
}: {
    user: User | null;
    children: ReactNode;
}) {
    if (!user) return <Navigate to="/login" />;
    if (user.email !== ADMIN_EMAIL) return <Navigate to="/" />;
    return <>{children}</>;
}
