import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredVersion, setMigrationTimestamp, setStoredVersion } from './app-health';

const CURRENT_VERSION = 1;

export async function runDataMigrations() {
  const storedVersion = await getStoredVersion();
  if (storedVersion >= CURRENT_VERSION) {
    return;
  }

  // Placeholder for future migrations.
  // Example: if (storedVersion < 2) { ... }

  await setStoredVersion(CURRENT_VERSION);
  await setMigrationTimestamp();
}
