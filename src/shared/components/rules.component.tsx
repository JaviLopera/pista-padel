// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const console: Console;

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase-client.service';
import MobileLayout from './mobile-layout';
import { User } from '@supabase/supabase-js';

type Rule = {
    id: number;
    rule_text: string;
};

export default function RulesComponent({ user }: { user: User }) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRules() {
            setLoading(true);
            const { data, error } = await supabase.from('rules').select('*').order('id');
            if (error) {
                console.error(error);
                setRules([]);
            } else if (data) {
                setRules(data as Rule[]);
            }
            setLoading(false);
        }
        fetchRules();
    }, []);

    return (
        <MobileLayout title="Reglas de la pista" user={user}>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <ul>
                    {rules.map((rule) => (
                        <li key={rule.id}>{rule.rule_text}</li>
                    ))}
                </ul>
            )}
        </MobileLayout>
    );
}
