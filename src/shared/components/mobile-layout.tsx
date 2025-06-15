import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from '../services/supabase-client.service';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

type MobileLayoutProps = {
    title: string;
    user?: User | null;
    children: ReactNode;
};

export default function MobileLayout({ title, user, children }: MobileLayoutProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6fa' }}>
            <AppBar position="fixed" color="primary" sx={{ top: 0, left: 0 }}>
                <Toolbar sx={{ minHeight: 56 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {title}
                    </Typography>
                    {user && (
                        <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
            {/* pt: padding top para dejar sitio al header, pb: para posible bottom nav */}
            <Box sx={{ pt: '72px', pb: 2, width: '100%' }}>
                {children}
            </Box>
        </Box>
    );
}
