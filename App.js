// ============================================================
//  dClonter dev
//  Developer : devnsepele
//  Version   : 1.0.0
//  Entry     : App.js
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { THEMES, DEFAULT_THEME } from './src/theme';
import {
  isNativeAvailable,
  listInstalledApps,
  launchClone,
  createClone,
  removeClone,
  getClonedList,
} from './src/native';
import {
  AppCard,
  ThemePicker,
  TabButton,
  SectionTitle,
  StatBox,
} from './src/components';

export default function App() {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME);
  const [tab, setTab] = useState('home');
  const [apps, setApps] = useState([]);
  const [cloned, setCloned] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [antiVM, setAntiVM] = useState(true);
  const [rootBypass, setRootBypass] = useState(true);
  const [nativeReady, setNativeReady] = useState(false);

  const theme = THEMES[themeKey];

  // ---------- load data awal ----------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const native = await isNativeAvailable();
      setNativeReady(native);

      const list = await listInstalledApps();
      setApps(list || []);

      const clones = await getClonedList();
      const map = {};
      (clones || []).forEach((c) => {
        map[c.packageName] = c;
      });
      setCloned(map);
    } catch (e) {
      Alert.alert('Load Error', String(e && e.message ? e.message : e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ---------- aksi clone ----------
  const handleToggleClone = async (app) => {
    const existing = cloned[app.packageName];

    if (existing) {
      try {
        await removeClone(existing.cloneId);
        const next = { ...cloned };
        delete next[app.packageName];
        setCloned(next);
      } catch (e) {
        Alert.alert('Remove Failed', String(e.message || e));
      }
      return;
    }

    try {
      const result = await createClone({
        packageName: app.packageName,
        label: app.label + ' Clone',
        antiVM,
        rootBypass,
      });

      if (result && result.cloneId) {
        setCloned((prev) => ({
          ...prev,
          [app.packageName]: result,
        }));
      } else {
        Alert.alert('Clone Failed', 'Native module belum tersedia atau gagal membuat clone.');
      }
    } catch (e) {
      Alert.alert('Clone Failed', String(e.message || e));
    }
  };

  const handleLaunchClone = async (app) => {
    const existing = cloned[app.packageName];
    if (!existing) return;
    try {
      await launchClone(existing.cloneId);
    } catch (e) {
      Alert.alert('Launch Failed', String(e.message || e));
    }
  };

  // ---------- screens ----------
  const renderHome = () => (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
      }
    >
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.headerSmall, { color: theme.subText }]}>Welcome</Text>
        <Text style={[styles.headerTitle, { color: theme.text }]}>dClonter dev</Text>
        <Text style={[styles.headerSub, { color: theme.subText }]}>
          by devnsepele | v1.0.0
        </Text>
        <Text
          style={[
            styles.badge,
            {
              color: nativeReady ? theme.accent : '#FF6B6B',
              borderColor: nativeReady ? theme.accent : '#FF6B6B',
            },
          ]}
        >
          {nativeReady ? 'NATIVE MODULE READY' : 'NATIVE MODULE MISSING'}
        </Text>
      </View>

      <SectionTitle theme={theme} text="Status Proteksi" />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Anti-Detect VM</Text>
          <Text style={[styles.cardSub, { color: theme.subText }]}>
            Sembunyikan status virtual machine dari app yang di-clone
          </Text>
        </View>
        <Switch value={antiVM} onValueChange={setAntiVM} trackColor={{ true: theme.accent }} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Root Bypass</Text>
          <Text style={[styles.cardSub, { color: theme.subText }]}>
            Dukung app yang butuh akses root (contoh: Gordian)
          </Text>
        </View>
        <Switch value={rootBypass} onValueChange={setRootBypass} trackColor={{ true: theme.accent }} />
      </View>

      <SectionTitle theme={theme} text="Ringkasan" />

      <View style={styles.row}>
        <StatBox theme={theme} value={Object.keys(cloned).length} label="Cloned" />
        <StatBox theme={theme} value={apps.length} label="Installed" />
        <StatBox
          theme={theme}
          value={antiVM && rootBypass ? 'ON' : 'OFF'}
          label="Shield"
        />
      </View>
    </ScrollView>
  );

  const renderClone = () => (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
      }
    >
      <SectionTitle theme={theme} text="Installed Apps" top={0} />
      <Text style={[styles.hint, { color: theme.subText }]}>
        Pilih aplikasi untuk di-clone ke virtual space
      </Text>

      {loading && <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />}

      {!loading && apps.length === 0 && (
        <View style={[styles.emptyBox, { borderColor: theme.border }]}>
          <Text style={{ color: theme.subText, textAlign: 'center' }}>
            Tidak ada aplikasi terinstall yang terbaca.
            {'\n'}Pastikan native module PackageManager sudah terhubung.
          </Text>
        </View>
      )}

      {apps.map((app) => (
        <AppCard
          key={app.packageName}
          app={app}
          theme={theme}
          cloned={!!cloned[app.packageName]}
          onToggle={() => handleToggleClone(app)}
          onLaunch={() => handleLaunchClone(app)}
        />
      ))}
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SectionTitle theme={theme} text="Tema" top={0} />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 4 }]}>
          Pilih Tema Aplikasi
        </Text>
        <ThemePicker current={themeKey} onPick={setThemeKey} theme={theme} />
      </View>

      <SectionTitle theme={theme} text="Virtual Space" />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>Isolasi package</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>Spoof device fingerprint</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>Bypass SafetyNet / Play Integrity</Text>
      </View>

      <SectionTitle theme={theme} text="Catatan Teknis" />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={{ color: theme.subText, fontSize: 12, lineHeight: 18 }}>
          Fitur clone, anti-detect VM, dan root virtual memerlukan native module
          Android (VirtualApp / Frida / Magisk Zygisk). Kode di folder src/native.js
          berisi bridge ke native. Jika belum tersedia, app tetap bisa dibuka dan
          UI berjalan normal.
        </Text>
      </View>
    </ScrollView>
  );

  const renderAbout = () => (
    <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]}>
      <View style={[styles.logoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ fontSize: 42, color: theme.accent, fontWeight: '700' }}>dC</Text>
      </View>

      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '700', marginTop: 16 }}>
        dClonter dev
      </Text>
      <Text style={{ color: theme.subText, fontSize: 13, marginTop: 4 }}>Version 1.0.0</Text>
      <Text style={{ color: theme.accent, fontSize: 13, marginTop: 12 }}>
        Developer: devnsepele
      </Text>

      <Text style={styles.aboutText}>
        Aplikasi dual space modern dengan dukungan root virtual, anti-detect VM,
        dan tema iOS-style. Dikembangkan oleh devnsepele.
      </Text>
    </ScrollView>
  );

  const renderScreen = () => {
    if (tab === 'home') return renderHome();
    if (tab === 'clone') return renderClone();
    if (tab === 'settings') return renderSettings();
    return renderAbout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={themeKey === 'white' ? 'dark-content' : 'light-content'} />

      <View style={{ flex: 1 }}>{renderScreen()}</View>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.tabBg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 6,
        }}
      >
        <TabButton id="home" label="Home" theme={theme} active={tab} onPress={setTab} />
        <TabButton id="clone" label="Clone" theme={theme} active={tab} onPress={setTab} />
        <TabButton id="settings" label="Settings" theme={theme} active={tab} onPress={setTab} />
        <TabButton id="about" label="About" theme={theme} active={tab} onPress={setTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  headerCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  headerSmall: { fontSize: 13 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  headerSub: { fontSize: 12, marginTop: 2 },
  badge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardBody: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', gap: 10 },
  hint: { fontSize: 12, marginBottom: 12 },
  emptyBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  aboutText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
    marginTop: 24,
    color: '#888',
  },
});
