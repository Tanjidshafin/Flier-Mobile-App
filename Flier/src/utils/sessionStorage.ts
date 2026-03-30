import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map<string, string>();

function isMissingNativeStorage(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('Native module is null') ||
    error.message.includes('cannot access legacy storage')
  );
}

export async function getStoredItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    if (isMissingNativeStorage(error)) {
      return memoryStorage.get(key) ?? null;
    }

    throw error;
  }
}

export async function setStoredItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch (error) {
    if (isMissingNativeStorage(error)) {
      memoryStorage.set(key, value);
      return;
    }

    throw error;
  }
}

export async function removeStoredItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
    return;
  } catch (error) {
    if (isMissingNativeStorage(error)) {
      memoryStorage.delete(key);
      return;
    }

    throw error;
  }
}
