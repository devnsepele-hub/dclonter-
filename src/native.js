// ============================================================
//  NATIVE BRIDGE — dClonter dev
//  Menghubungkan JS ke native module Android (VirtualApp/Frida)
//  Jika native belum terpasang, semua fungsi fallback aman.
// ============================================================

import { NativeModules, Platform } from 'react-native';

const { DClonterNative } = NativeModules;

// ---------- Cek apakah native module tersedia ----------
export async function isNativeAvailable() {
  return Platform.OS === 'android' && !!DClonterNative;
}

// ---------- Ambil daftar app terinstall dari PackageManager ----------
export async function listInstalledApps() {
  if (!(await isNativeAvailable())) {
    // Fallback: coba pakai Linking kalau ada
    return [];
  }
  try {
    const raw = await DClonterNative.listInstalledApps();
    // raw diharapkan array: [{ packageName, label, iconBase64 }]
    return raw || [];
  } catch (e) {
    console.warn('[native] listInstalledApps error', e);
    return [];
  }
}

// ---------- Ambil daftar clone yang sudah dibuat ----------
export async function getClonedList() {
  if (!(await isNativeAvailable())) return [];
  try {
    const raw = await DClonterNative.getClonedList();
    return raw || [];
  } catch (e) {
    console.warn('[native] getClonedList error', e);
    return [];
  }
}

// ---------- Buat clone baru ----------
export async function createClone({ packageName, label, antiVM, rootBypass }) {
  if (!(await isNativeAvailable())) {
    throw new Error('Native module DClonterNative belum terpasang.');
  }
  return await DClonterNative.createClone({
    packageName,
    label,
    antiVM: !!antiVM,
    rootBypass: !!rootBypass,
  });
}

// ---------- Hapus clone ----------
export async function removeClone(cloneId) {
  if (!(await isNativeAvailable())) {
    throw new Error('Native module DClonterNative belum terpasang.');
  }
  return await DClonterNative.removeClone(cloneId);
}

// ---------- Jalankan clone ----------
export async function launchClone(cloneId) {
  if (!(await isNativeAvailable())) {
    throw new Error('Native module DClonterNative belum terpasang.');
  }
  return await DClonterNative.launchClone(cloneId);
}
