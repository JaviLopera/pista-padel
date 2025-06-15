import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

export default function PrivateRoute({
    user,
    children,
}: {
    user: User | null;
    children: ReactNode;
}) {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
}