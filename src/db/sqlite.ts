// SQLite database for persisting saved locations
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface SavedLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1: string | null;
    created_at: string;
}

const MAX_SAVED_LOCATIONS = 5;

// Fallback for web platform (expo-sqlite not supported)
let db: SQLite.SQLiteDatabase | null = null;
let isWebPlatform = Platform.OS === 'web';
let webFallbackStorage: SavedLocation[] = [];

/**
 * Initialize the database and create tables
 */
export async function initDatabase(): Promise<void> {
    if (isWebPlatform) {
        console.warn('SQLite not supported on web. Using in-memory fallback.');
        return;
    }

    try {
        db = await SQLite.openDatabaseAsync('weather.db');

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS saved_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        country TEXT NOT NULL,
        admin1 TEXT,
        created_at TEXT NOT NULL
      );
    `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

/**
 * Get all saved locations
 */
export async function getSavedLocations(): Promise<SavedLocation[]> {
    if (isWebPlatform) {
        return webFallbackStorage;
    }

    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        const result = await db.getAllAsync<SavedLocation>(
            'SELECT * FROM saved_locations ORDER BY created_at DESC'
        );
        return result;
    } catch (error) {
        console.error('Error getting saved locations:', error);
        throw error;
    }
}

/**
 * Add a new saved location
 */
export async function addSavedLocation(
    name: string,
    latitude: number,
    longitude: number,
    country: string,
    admin1?: string
): Promise<{ success: boolean; message: string }> {
    // Check if we've reached the limit
    const currentLocations = await getSavedLocations();

    if (currentLocations.length >= MAX_SAVED_LOCATIONS) {
        return {
            success: false,
            message: `Maximum of ${MAX_SAVED_LOCATIONS} locations reached. Please remove one first.`,
        };
    }

    // Check for duplicates
    const duplicate = currentLocations.find(loc => loc.name === name);
    if (duplicate) {
        return {
            success: false,
            message: 'This location is already saved.',
        };
    }

    if (isWebPlatform) {
        webFallbackStorage.push({
            id: Date.now(),
            name,
            latitude,
            longitude,
            country,
            admin1: admin1 || null,
            created_at: new Date().toISOString(),
        });
        return { success: true, message: 'Location saved successfully!' };
    }

    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        await db.runAsync(
            'INSERT INTO saved_locations (name, latitude, longitude, country, admin1, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, latitude, longitude, country, admin1 || null, new Date().toISOString()]
        );

        return { success: true, message: 'Location saved successfully!' };
    } catch (error: any) {
        console.error('Error adding saved location:', error);

        if (error.message?.includes('UNIQUE constraint')) {
            return { success: false, message: 'This location is already saved.' };
        }

        throw error;
    }
}

/**
 * Remove a saved location by ID
 */
export async function removeSavedLocation(id: number): Promise<void> {
    if (isWebPlatform) {
        webFallbackStorage = webFallbackStorage.filter(loc => loc.id !== id);
        return;
    }

    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        await db.runAsync('DELETE FROM saved_locations WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error removing saved location:', error);
        throw error;
    }
}

/**
 * Get count of saved locations
 */
export async function getSavedLocationsCount(): Promise<number> {
    const locations = await getSavedLocations();
    return locations.length;
}
