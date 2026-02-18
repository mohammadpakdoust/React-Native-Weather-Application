// Root layout for expo-router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '@/db/sqlite';

export default function RootLayout() {
    useEffect(() => {
        // Initialize database on app start
        initDatabase().catch((error) => {
            console.error('Failed to initialize database:', error);
        });
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}
