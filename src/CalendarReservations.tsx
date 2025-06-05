import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Typography } from '@mui/material';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { startOfWeek, endOfWeek, formatISO, addDays, isAfter, parseISO } from 'date-fns';

type Booking = {
    id: string;
    user_email?: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: string;
};

type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    user_id?: string;
};

export default function CalendarReservations() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refresh, setRefresh] = useState(0);

    // Para borrar reserva
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        // Obtener el ID del usuario logueado
        void (async () => {
            const { data: userData } = await supabase.auth.getUser();
            setCurrentUserId(userData?.user?.id ?? null);
        })();
    }, []);

    useEffect(() => {
        void (async () => {
            const { data, error } = await supabase.from('bookings').select('*').eq('status', 'active');
            if (!error && data) {
                setEvents(
                    data.map((booking: Booking) => ({
                        id: booking.id,
                        title: booking.user_email ?? 'Reservado',
                        start: booking.start_time,
                        end: booking.end_time,
                        backgroundColor: booking.user_id === currentUserId ? '#43a047' : '#1976d2', // Verde para tus reservas
                        borderColor: booking.user_id === currentUserId ? '#43a047' : '#1976d2',
                        user_id: booking.user_id,
                    })),
                );
            }
        })();
    }, [refresh]);

    const handleSelect = (arg: DateSelectArg) => {
        setSelectedSlot({
            start: arg.startStr,
            end: arg.endStr,
        });
        setOpen(true);
        setError('');
        setSuccess('');
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSlot(null);
        setError('');
        setSuccess('');
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Obtener usuario logueado
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
            setError('Debes iniciar sesión.');
            setLoading(false);
            return;
        }

        // Verifica que haya una fecha de inicio válida
        const reservaInicio = selectedSlot?.start ? parseISO(selectedSlot.start) : null;
        if (!reservaInicio) {
            setError('Fecha de inicio de reserva no válida.');
            setLoading(false);
            return;
        }

        // No permitir reservas a más de 7 días vista
        const now = new Date();
        const maxFutureDate = addDays(now, 7);
        if (isAfter(reservaInicio, maxFutureDate)) {
            setError('Solo puedes reservar dentro de los próximos 7 días.');
            setLoading(false);
            return;
        }

        // --- Cambia aquí ---
        // Limitar a máximo 3 reservas activas en la semana de la FECHA DE LA RESERVA
        const weekStart = startOfWeek(reservaInicio, { weekStartsOn: 1 }); // Lunes de la semana de la reserva
        const weekEnd = endOfWeek(reservaInicio, { weekStartsOn: 1 }); // Domingo de la semana de la reserva

        const { data: myBookings, error: myBookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('start_time', weekStart.toISOString())
            .lte('start_time', weekEnd.toISOString());

        if (myBookingsError) {
            setError('Error comprobando tus reservas.');
            setLoading(false);
            return;
        }

        if (myBookings && myBookings.length >= 3) {
            setError('No puedes hacer más de 3 reservas en esa semana.');
            setLoading(false);
            return;
        }

        // Comprobar solapamientos antes de reservar
        const { data: overlapping } = await supabase
            .from('bookings')
            .select('*')
            .eq('status', 'active')
            .or(`and(start_time,lt.${selectedSlot?.end},end_time,gt.${selectedSlot?.start})`);

        if (overlapping && overlapping.length > 0) {
            setError('Ya existe una reserva en este horario.');
            setLoading(false);
            return;
        }

        // Insertar reserva
        const userEmail = user.email;
        const { error: insertError } = await supabase.from('bookings').insert([
            {
                user_id: user.id,
                user_email: userEmail,
                start_time: selectedSlot?.start,
                end_time: selectedSlot?.end,
                status: 'active',
            },
        ]);
        if (insertError) {
            setError('No se pudo crear la reserva.');
        } else {
            setSuccess('¡Reserva creada!');
            setOpen(false);
            setRefresh((r) => r + 1);
        }
        setLoading(false);
    }

    // Nuevo: handler para hacer click en una reserva del calendario
    const handleEventClick = (clickInfo: EventClickArg) => {
        // Buscar el evento por id y guardar su info
        const event = events.find((e) => e.id === clickInfo.event.id);
        setSelectedEvent(event ?? null);
    };

    // Nuevo: borrar reserva si es del usuario actual
    async function handleDeleteReservation() {
        if (!selectedEvent || !currentUserId) return;
        if (selectedEvent.user_id !== currentUserId) return;
        const { error } = await supabase.from('bookings').delete().eq('id', selectedEvent.id).eq('user_id', currentUserId);
        if (!error) {
            setRefresh((r) => r + 1);
            setSelectedEvent(null);
        }
    }

    return (
        <div
            style={{ maxWidth: 900, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 6px 32px #0001', padding: 16 }}
        >
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                validRange={{
                    start: formatISO(new Date(), { representation: 'date' }),
                    end: formatISO(addDays(new Date(), 7), { representation: 'date' }),
                }}
                locale={esLocale}
                slotMinTime="08:00:00"
                slotMaxTime="23:00:00"
                selectable
                selectMirror
                select={handleSelect}
                events={events}
                eventClick={handleEventClick}
                height="auto"
            />

            {/* Modal para crear nueva reserva */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Nueva reserva</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Inicio"
                            value={selectedSlot?.start ?? ''}
                            margin="normal"
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <TextField label="Fin" value={selectedSlot?.end ?? ''} margin="normal" fullWidth InputProps={{ readOnly: true }} />
                        {error && (
                            <Alert severity="error" sx={{ my: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ my: 2 }}>
                                {success}
                            </Alert>
                        )}
                        <DialogActions>
                            <Button onClick={handleClose} color="secondary" disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                Reservar
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para ver/cancelar una reserva existente */}
            <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
                <DialogTitle>Reserva</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>Inicio:</strong> {selectedEvent?.start}
                        <br />
                        <strong>Fin:</strong> {selectedEvent?.end}
                        <br />
                        <strong>Reservado por:</strong> {selectedEvent?.title}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedEvent(null)} color="secondary">
                        Cerrar
                    </Button>
                    {selectedEvent && currentUserId && selectedEvent.user_id === currentUserId && (
                        <Button color="error" variant="contained" onClick={handleDeleteReservation}>
                            Cancelar mi reserva
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}
