import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HealthStatus = {
  storageOk: boolean;
  lastError: string | null;
  lastErrorAt: string | null;
  appDataVersion: number;
  lastMigrationAt: string | null;
};

const DEFAULT_HEALTH: HealthStatus = {
  storageOk: true,
  lastError: null,
  lastErrorAt: null,
  appDataVersion: 1,
  lastMigrationAt: null,
};

const HEALTH_KEY = 'app:health';
const ERROR_KEY = 'app:last-error';
const VERSION_KEY = 'app:data-version';

export function useAppHealth() {
  const [health, setHealth] = useState<HealthStatus>(DEFAULT_HEALTH);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [healthRaw, errorRaw, versionRaw] = await AsyncStorage.multiGet([
        HEALTH_KEY,
        ERROR_KEY,
        VERSION_KEY,
      ]);
      const healthValue = healthRaw?.[1] ? JSON.parse(healthRaw[1]) : DEFAULT_HEALTH;
      const errorValue = errorRaw?.[1] ? JSON.parse(errorRaw[1]) : { message: null, at: null };
      const versionValue = versionRaw?.[1] ? Number(versionRaw[1]) : 1;
      setHealth({
        storageOk: true,
        lastError: errorValue.message ?? null,
        lastErrorAt: errorValue.at ?? null,
        appDataVersion: Number.isFinite(versionValue) ? versionValue : 1,
        lastMigrationAt: healthValue.lastMigrationAt ?? null,
      });
    } catch {
      setHealth((prev) => ({ ...prev, storageOk: false }));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      health,
      loaded,
      refresh,
    }),
    [health, loaded, refresh]
  );

  return value;
}

export async function recordLastError(message: string) {
  try {
    await AsyncStorage.setItem(
      ERROR_KEY,
      JSON.stringify({
        message,
        at: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage errors.
  }
}

export async function setMigrationTimestamp() {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem(
      HEALTH_KEY,
      JSON.stringify({
        ...existing,
        lastMigrationAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage errors.
  }
}

export async function getStoredVersion() {
  try {
    const stored = await AsyncStorage.getItem(VERSION_KEY);
    return stored ? Number(stored) : 1;
  } catch {
    return 1;
  }
}

export async function setStoredVersion(version: number) {
  try {
    await AsyncStorage.setItem(VERSION_KEY, String(version));
  } catch {
    // Ignore storage errors.
  }
}
