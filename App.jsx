/**
 * ============================================================
 *  dClonter dev — App.jsx
 *  Developer  : devnsepele
 *  Version    : 1.0.0
 *  Tagline    : "Clone Space Tanpa Deteksi, Full Root Access"
 * ============================================================
 *
 *  SINGLE-FILE React Native + Expo app.
 *  UI fully functional. Native bridging points marked:
 *    // [NATIVE MODULE REQUIRED] — lihat CATATAN TEKNIS di bawah file.
 *
 *  Deps yang dibutuhkan (semua sudah ada di Expo SDK 50+):
 *    expo-blur, @expo/vector-icons, react-native-reanimated,
 *    expo-haptics, expo-constants
 *
 *  npx create-expo-app dclonter --template blank
 *  cd dclonter && cp App.jsx . && npx expo start
 * ============================================================
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Try importing Expo extras (gracefully degrade if not installed) ──────────
let BlurView = View;
try { BlurView = require('expo-blur').BlurView; } catch (_) {}

let Ionicons = null;
try { Ionicons = require('@expo/vector-icons').Ionicons; } catch (_) {}

// Simple icon fallback when @expo/vector-icons not available
const Icon = ({ name, size = 22, color = '#fff', style }) => {
  const MAP = {
    'home':            '⌂', 'home-outline':         '⌂',
    'copy':            '⧉', 'copy-outline':         '⧉',
    'settings':        '⚙', 'settings-outline':     '⚙',
    'information-circle': 'ℹ', 'information-circle-outline': 'ℹ',
    'add-circle':      '⊕', 'add-circle-outline':   '⊕',
    'trash':           '🗑', 'trash-outline':        '🗑',
    'create':          '✎', 'create-outline':       '✎',
    'shield-checkmark':'🛡', 'shield-checkmark-outline': '🛡',
    'phone-portrait':  '📱', 'phone-portrait-outline':'📱',
    'layers':          '⧫', 'layers-outline':       '⧫',
    'star':            '★', 'star-outline':         '☆',
    'chevron-forward': '›', 'chevron-back':         '‹',
    'close-circle':    '✕', 'checkmark-circle':     '✓',
    'flash':           '⚡','flash-outline':        '⚡',
    'terminal':        '>_', 'color-palette':       '🎨',
    'moon':            '☽', 'sunny':                '☀',
    'lock-closed':     '🔒', 'share-social':        '↑',
    'open-outline':    '⤢',
  };
  const label = MAP[name] || '•';
  if (Ionicons) {
    return <Ionicons name={name} size={size} color={color} style={style} />;
  }
  return (
    <Text style={[{ fontSize: size * 0.85, color, lineHeight: size * 1.1 }, style]}>
      {label}
    </Text>
  );
};

// ─── SCREEN WIDTH ─────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get('window');

// ─── THEMES ───────────────────────────────────────────────────────────────────
/**
 * Empat tema:
 *   black  — hitam pekat, accent iOS blue
 *   white  — putih bersih, accent abu elegan
 *   natal  — hitam + merah & hijau natal + gold
 *   old    — sepia vintage, font serif feel
 */
const THEMES = {
  black: {
    id: 'black',
    label: 'Black',
    emoji: '🖤',
    bg:          '#000000',
    card:        '#111111',
    cardBorder:  '#1e1e1e',
    surface:     '#0a0a0a',
    text:        '#ffffff',
    textSub:     '#8e8e93',
    accent:      '#0a84ff',
    accentSoft:  '#0a84ff22',
    tabBg:       '#111111ee',
    tabBorder:   '#2c2c2e',
    danger:      '#ff453a',
    success:     '#30d158',
    inputBg:     '#1c1c1e',
    statusBar:   'light-content',
    shadowColor: '#000',
  },
  white: {
    id: 'white',
    label: 'White',
    emoji: '🤍',
    bg:          '#f2f2f7',
    card:        '#ffffff',
    cardBorder:  '#e5e5ea',
    surface:     '#ffffff',
    text:        '#1c1c1e',
    textSub:     '#6d6d72',
    accent:      '#636366',
    accentSoft:  '#63636622',
    tabBg:       '#ffffffee',
    tabBorder:   '#d1d1d6',
    danger:      '#ff3b30',
    success:     '#34c759',
    inputBg:     '#f2f2f7',
    statusBar:   'dark-content',
    shadowColor: '#00000022',
  },
  natal: {
    id: 'natal',
    label: 'Natal Black',
    emoji: '🎄',
    bg:          '#0a0a0a',
    card:        '#141a14',
    cardBorder:  '#1e2e1e',
    surface:     '#0f160f',
    text:        '#e8e8e8',
    textSub:     '#8ba88b',
    accent:      '#c9a84c',       // gold
    accentSoft:  '#c9a84c22',
    accentRed:   '#cc2936',
    accentGreen: '#2e8b57',
    tabBg:       '#141a14ee',
    tabBorder:   '#2e4a2e',
    danger:      '#cc2936',
    success:     '#2e8b57',
    inputBg:     '#1a231a',
    statusBar:   'light-content',
    shadowColor: '#000',
  },
  old: {
    id: 'old',
    label: 'Old',
    emoji: '📜',
    bg:          '#2c1f0f',
    card:        '#3d2b16',
    cardBorder:  '#5a3e25',
    surface:     '#2c1f0f',
    text:        '#f5deb3',       // wheat
    textSub:     '#c8a97a',
    accent:      '#cd853f',       // peru
    accentSoft:  '#cd853f33',
    tabBg:       '#3d2b16ee',
    tabBorder:   '#5a3e25',
    danger:      '#8b1a1a',
    success:     '#556b2f',
    inputBg:     '#4a3520',
    statusBar:   'light-content',
    shadowColor: '#000',
  },
};

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ theme: THEMES.black, setThemeId: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ─── DUMMY DATA — Simulated installed apps ────────────────────────────────────
/**
 * [NATIVE MODULE REQUIRED]
 * Di perangkat nyata, list ini didapat dari:
 *   Android: PackageManager.getInstalledApplications() via RN NativeModule
 *   Bridge:  packages/native/PackageListModule.java
 * Untuk sekarang, digunakan data dummy berikut.
 */
const DUMMY_APPS = [
  { id: '1',  name: 'Free Fire',     pkg: 'com.dts.freefireth',          emoji: '🔫', cloned: false, category: 'Game'  },
  { id: '2',  name: 'Mobile Legends',pkg: 'com.mobile.legends',          emoji: '⚔️', cloned: true,  category: 'Game'  },
  { id: '3',  name: 'WhatsApp',      pkg: 'com.whatsapp',                emoji: '💬', cloned: false, category: 'Social'},
  { id: '4',  name: 'Instagram',     pkg: 'com.instagram.android',       emoji: '📸', cloned: false, category: 'Social'},
  { id: '5',  name: 'TikTok',        pkg: 'com.zhiliaoapp.musically',    emoji: '🎵', cloned: true,  category: 'Social'},
  { id: '6',  name: 'Gordian',       pkg: 'com.gordian.app',             emoji: '🔐', cloned: false, category: 'Tool'  },
  { id: '7',  name: 'PUBG Mobile',   pkg: 'com.tencent.ig',              emoji: '🪖', cloned: false, category: 'Game'  },
  { id: '8',  name: 'Genshin Impact',pkg: 'com.miHoYo.GenshinImpact',   emoji: '🌸', cloned: false, category: 'Game'  },
  { id: '9',  name: 'Telegram',      pkg: 'org.telegram.messenger',      emoji: '✈️', cloned: false, category: 'Social'},
  { id: '10', name: 'YouTube',       pkg: 'com.google.android.youtube',  emoji: '▶️', cloned: false, category: 'Media' },
  { id: '11', name: 'Spotify',       pkg: 'com.spotify.music',           emoji: '🎧', cloned: false, category: 'Media' },
  { id: '12', name: 'Root Checker',  pkg: 'com.joeykrim.rootcheck',      emoji: '🔑', cloned: false, category: 'Tool'  },
];

// ─── STATS DATA ───────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Cloned Apps',     value: '2',   icon: 'copy-outline'           },
  { label: 'Root Virtual',    value: 'ON',  icon: 'flash-outline'          },
  { label: 'Anti-Detect',     value: 'ON',  icon: 'shield-checkmark-outline'},
  { label: 'Active Sessions', value: '1',   icon: 'layers-outline'         },
];

// ─── SPOOF PROFILES (dummy) ───────────────────────────────────────────────────
const SPOOF_DEFAULT = {
  imei:      '352345108765432',
  androidId: 'a4b8c2d1e3f09012',
  mac:       'AC:37:43:9E:12:FF',
  serial:    'RF8N803XYZZ',
  model:     'SM-G991B',
  brand:     'samsung',
};

// ─── HELPER: Animated Press ───────────────────────────────────────────────────
const PressScale = ({ onPress, children, style, disabled = false }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress} disabled={disabled}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ─── COMPONENT: AppCard ───────────────────────────────────────────────────────
const AppCard = ({ app, onClone, onDelete, onLaunch }) => {
  const { theme: t } = useTheme();
  const s = cardStyles(t);
  return (
    <PressScale onPress={() => onLaunch(app)} style={s.card}>
      {/* App Icon */}
      <View style={s.iconWrap}>
        <Text style={s.iconEmoji}>{app.emoji}</Text>
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{app.name}</Text>
        <Text style={s.pkg}  numberOfLines={1}>{app.pkg}</Text>
        <View style={s.tagRow}>
          <View style={[s.tag, { backgroundColor: t.accentSoft }]}>
            <Text style={[s.tagText, { color: t.accent }]}>{app.category}</Text>
          </View>
          {app.cloned && (
            <View style={[s.tag, { backgroundColor: t.success + '22', marginLeft: 6 }]}>
              <Text style={[s.tagText, { color: t.success }]}>Cloned ✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        {!app.cloned ? (
          <PressScale onPress={() => onClone(app)} style={[s.btn, { backgroundColor: t.accent }]}>
            <Icon name="copy-outline" size={14} color="#fff" />
          </PressScale>
        ) : (
          <PressScale onPress={() => onDelete(app)} style={[s.btn, { backgroundColor: t.danger }]}>
            <Icon name="trash-outline" size={14} color="#fff" />
          </PressScale>
        )}
      </View>
    </PressScale>
  );
};

const cardStyles = (t) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.cardBorder,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  iconEmoji: { fontSize: 26 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: t.text },
  pkg:  { fontSize: 11, color: t.textSub, marginTop: 2 },
  tagRow: { flexDirection: 'row', marginTop: 5 },
  tag: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  actions: { marginLeft: 8 },
  btn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── COMPONENT: StatCard ──────────────────────────────────────────────────────
const StatCard = ({ item }) => {
  const { theme: t } = useTheme();
  return (
    <View style={{
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: 14,
      width: (W - 48) / 2,
      margin: 4,
      alignItems: 'center',
    }}>
      <Icon name={item.icon} size={22} color={t.accent} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: t.text, marginTop: 6 }}>
        {item.value}
      </Text>
      <Text style={{ fontSize: 11, color: t.textSub, marginTop: 2, textAlign: 'center' }}>
        {item.label}
      </Text>
    </View>
  );
};

// ─── SCREEN: HOME ─────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { theme: t } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim }}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner */}
      <View style={{
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: t.card,
        borderWidth: 1,
        borderColor: t.cardBorder,
        padding: 24,
      }}>
        <Text style={{ fontSize: 11, color: t.accent, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 }}>
          VIRTUAL SPACE ENGINE
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: t.text, lineHeight: 32 }}>
          Clone Space{'\n'}Tanpa Deteksi
        </Text>
        <Text style={{ fontSize: 13, color: t.textSub, marginTop: 8, lineHeight: 20 }}>
          Anti-VM · Root Virtual · Fingerprint Spoof · SafetyNet Bypass
        </Text>
        <View style={{
          marginTop: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.success + '18',
          borderRadius: 10,
          padding: 10,
        }}>
          <Icon name="shield-checkmark-outline" size={16} color={t.success} />
          <Text style={{ color: t.success, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
            Virtual Space: AKTIF — Semua bypass ON
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginBottom: 8, marginTop: 4 }}>
        STATUS SISTEM
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginHorizontal: 12 }}>
        {STATS.map(s => <StatCard key={s.label} item={s} />)}
      </View>

      {/* Quick Actions */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 20, marginBottom: 10 }}>
        AKSI CEPAT
      </Text>
      <View style={{ flexDirection: 'row', marginHorizontal: 16, gap: 10 }}>
        {[
          { icon: 'copy-outline',           label: 'Tambah Clone', color: t.accent  },
          { icon: 'shield-checkmark-outline',label: 'Anti-Detect',  color: '#30d158' },
          { icon: 'terminal',               label: 'Root Shell',   color: '#ff9f0a' },
        ].map(q => (
          <PressScale key={q.label} style={{
            flex: 1,
            backgroundColor: t.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: t.cardBorder,
            padding: 14,
            alignItems: 'center',
          }}>
            <Icon name={q.icon} size={22} color={q.color} />
            <Text style={{ color: t.text, fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>
              {q.label}
            </Text>
          </PressScale>
        ))}
      </View>

      {/* Active Clone Session */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 20, marginBottom: 10 }}>
        SESI AKTIF
      </Text>
      {DUMMY_APPS.filter(a => a.cloned).map(app => (
        <View key={app.id} style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: t.cardBorder,
          margin: 6,
          marginHorizontal: 16,
          padding: 14,
        }}>
          <Text style={{ fontSize: 28 }}>{app.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>{app.name}</Text>
            <Text style={{ color: t.textSub, fontSize: 11 }}>Running in Virtual Space</Text>
          </View>
          <View style={{
            backgroundColor: t.success + '22',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}>
            <Text style={{ color: t.success, fontSize: 12, fontWeight: '700' }}>● LIVE</Text>
          </View>
        </View>
      ))}
    </Animated.ScrollView>
  );
};

// ─── SCREEN: CLONE ────────────────────────────────────────────────────────────
const CloneScreen = () => {
  const { theme: t } = useTheme();
  const [apps, setApps]     = useState(DUMMY_APPS);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null); // app being cloned
  const [toast, setToast]   = useState('');

  const filtered = apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.pkg.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleClone = (app) => {
    /**
     * [NATIVE MODULE REQUIRED]
     * Actual cloning requires:
     *  1. VirtualApp / DroidPlugin bridge
     *  2. Copy APK ke private directory virtual space
     *  3. Spoof package name: com.clone.{randomHex}.{original}
     *  4. Inject Frida gadget / LSPosed module untuk anti-detect
     *
     * NativeModules.VirtualSpaceModule.cloneApp(app.pkg)
     *   .then(() => markCloned())
     *   .catch(err => console.error(err));
     */
    setModal(app);
  };

  const confirmClone = () => {
    if (!modal) return;
    setApps(prev => prev.map(a => a.id === modal.id ? { ...a, cloned: true } : a));
    showToast(`✓ ${modal.name} berhasil di-clone ke Virtual Space`);
    setModal(null);
  };

  const handleDelete = (app) => {
    /**
     * [NATIVE MODULE REQUIRED]
     * NativeModules.VirtualSpaceModule.removeClone(app.pkg)
     */
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, cloned: false } : a));
    showToast(`🗑 Clone ${app.name} dihapus`);
  };

  const handleLaunch = (app) => {
    if (!app.cloned) {
      showToast(`ℹ️ Clone ${app.name} dulu sebelum dijalankan`);
      return;
    }
    /**
     * [NATIVE MODULE REQUIRED]
     * NativeModules.VirtualSpaceModule.launchApp(app.pkg)
     */
    showToast(`🚀 Meluncurkan ${app.name} di Virtual Space...`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.inputBg,
        borderRadius: 14,
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: t.cardBorder,
      }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari app..."
          placeholderTextColor={t.textSub}
          style={{ flex: 1, color: t.text, fontSize: 14 }}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={{ color: t.textSub, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Count */}
      <Text style={{ color: t.textSub, fontSize: 12, marginLeft: 20, marginBottom: 6 }}>
        {filtered.length} app ditemukan · {apps.filter(a => a.cloned).length} di-clone
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <AppCard
            app={item}
            onClone={handleClone}
            onDelete={handleDelete}
            onLaunch={handleLaunch}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Clone Confirm Modal */}
      <Modal visible={!!modal} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: '#00000088',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: t.card,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            borderWidth: 1,
            borderColor: t.cardBorder,
          }}>
            <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>
              {modal?.emoji}
            </Text>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
              Clone {modal?.name}?
            </Text>
            <Text style={{ color: t.textSub, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              App akan di-clone ke Virtual Space dengan fingerprint unik.
              Anti-detection & root bypass akan aktif otomatis.
            </Text>

            {/* Spoof info */}
            <View style={{
              backgroundColor: t.accentSoft,
              borderRadius: 12,
              padding: 12,
              marginTop: 16,
            }}>
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                SPOOF PROFILE YANG AKAN DIGUNAKAN
              </Text>
              {Object.entries(SPOOF_DEFAULT).slice(0, 4).map(([k, v]) => (
                <Text key={k} style={{ color: t.textSub, fontSize: 11, marginTop: 2 }}>
                  {k.toUpperCase()}: <Text style={{ color: t.text }}>{v}</Text>
                </Text>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable
                onPress={() => setModal(null)}
                style={{
                  flex: 1, padding: 14, borderRadius: 14,
                  backgroundColor: t.inputBg, alignItems: 'center',
                  borderWidth: 1, borderColor: t.cardBorder,
                }}
              >
                <Text style={{ color: t.textSub, fontWeight: '600' }}>Batal</Text>
              </Pressable>
              <Pressable
                onPress={confirmClone}
                style={{
                  flex: 1, padding: 14, borderRadius: 14,
                  backgroundColor: t.accent, alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Clone Sekarang</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: 24,
          right: 24,
          backgroundColor: t.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: t.cardBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 10,
        }}>
          <Text style={{ color: t.text, fontSize: 13, textAlign: 'center' }}>{toast}</Text>
        </View>
      )}
    </View>
  );
};

// ─── SCREEN: SETTINGS ─────────────────────────────────────────────────────────
const ThemePicker = ({ onClose }) => {
  const { theme: t, setThemeId } = useTheme();
  return (
    <Modal visible transparent animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{
          backgroundColor: t.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 40,
          borderWidth: 1,
          borderColor: t.cardBorder,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.textSub + '55' }} />
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '700', marginTop: 14 }}>
              Pilih Tema
            </Text>
          </View>
          {Object.values(THEMES).map(th => (
            <PressScale
              key={th.id}
              onPress={() => { setThemeId(th.id); onClose(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: th.bg,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: t.id === th.id ? t.accent : th.cardBorder,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 14 }}>{th.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: th.text, fontWeight: '700', fontSize: 15 }}>{th.label}</Text>
                <View style={{ flexDirection: 'row', marginTop: 6, gap: 6 }}>
                  {[th.bg, th.card, th.accent, th.text].map((c, i) => (
                    <View key={i} style={{
                      width: 16, height: 16, borderRadius: 8,
                      backgroundColor: c,
                      borderWidth: 1,
                      borderColor: '#ffffff33',
                    }} />
                  ))}
                </View>
              </View>
              {t.id === th.id && (
                <Icon name="checkmark-circle" size={22} color={t.accent} />
              )}
            </PressScale>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const SettingsRow = ({ icon, label, right, onPress, danger = false }) => {
  const { theme: t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.card,
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: t.cardBorder,
      }}
    >
      <Icon name={icon} size={20} color={danger ? t.danger : t.accent} />
      <Text style={{
        flex: 1, marginLeft: 12,
        color: danger ? t.danger : t.text,
        fontSize: 15,
        fontWeight: '500',
      }}>
        {label}
      </Text>
      {right}
    </Pressable>
  );
};

const SettingsScreen = () => {
  const { theme: t } = useTheme();
  const [themePicker, setThemePicker] = useState(false);
  const [spoof, setSpoof]   = useState(SPOOF_DEFAULT);
  const [antiDetect, setAntiDetect] = useState(true);
  const [rootVirtual, setRootVirtual] = useState(true);
  const [safetynet, setSafetynet]   = useState(true);
  const [frida, setFrida]           = useState(false);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Appearance */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginBottom: 8 }}>TAMPILAN</Text>
      <SettingsRow
        icon="color-palette"
        label="Tema Aplikasi"
        onPress={() => setThemePicker(true)}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: t.textSub, fontSize: 13 }}>{THEMES[t.id].label}</Text>
            <Icon name="chevron-forward" size={16} color={t.textSub} />
          </View>
        }
      />

      {/* Anti-Detection */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 16, marginBottom: 8 }}>
        ANTI-DETECTION ENGINE
      </Text>
      {/**
       * [NATIVE MODULE REQUIRED]
       * Toggle di bawah mengatur:
       *  - NativeModules.AntiDetectModule.setAntiVM(bool)
       *  - NativeModules.AntiDetectModule.setRootBypass(bool)
       *  - NativeModules.AntiDetectModule.setSafetyNetSpoof(bool)
       *  - NativeModules.FridaModule.setGadgetActive(bool)
       */}
      <SettingsRow
        icon="shield-checkmark-outline"
        label="Anti-VM Detection"
        right={<Switch value={antiDetect} onValueChange={setAntiDetect}
                 trackColor={{ false: t.cardBorder, true: t.accent }}
                 thumbColor="#fff" />}
      />
      <SettingsRow
        icon="flash-outline"
        label="Root Virtual (Fake su)"
        right={<Switch value={rootVirtual} onValueChange={setRootVirtual}
                 trackColor={{ false: t.cardBorder, true: t.accent }}
                 thumbColor="#fff" />}
      />
      <SettingsRow
        icon="lock-closed"
        label="SafetyNet / Play Integrity Spoof"
        right={<Switch value={safetynet} onValueChange={setSafetynet}
                 trackColor={{ false: t.cardBorder, true: t.accent }}
                 thumbColor="#fff" />}
      />
      <SettingsRow
        icon="terminal"
        label="Frida Gadget (Advanced)"
        right={<Switch value={frida} onValueChange={setFrida}
                 trackColor={{ false: t.cardBorder, true: '#ff9f0a' }}
                 thumbColor="#fff" />}
      />

      {/* Fingerprint Spoof */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 16, marginBottom: 8 }}>
        FINGERPRINT SPOOF
      </Text>
      {/**
       * [NATIVE MODULE REQUIRED]
       * Field spoof dikirim ke:
       *   NativeModules.FingerprintModule.setProfile(spoofObj)
       * Module akan hook Build.SERIAL, TelephonyManager, dll.
       */}
      {Object.entries(spoof).map(([key, val]) => (
        <View key={key} style={{
          backgroundColor: t.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: t.cardBorder,
          padding: 14,
          marginHorizontal: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{ color: t.textSub, fontSize: 12, width: 72,
                         fontWeight: '600', textTransform: 'uppercase' }}>
            {key}
          </Text>
          <TextInput
            style={{
              flex: 1,
              color: t.text,
              fontSize: 13,
              borderBottomWidth: 1,
              borderColor: t.cardBorder,
              paddingBottom: 2,
            }}
            value={val}
            onChangeText={(v) => setSpoof(prev => ({ ...prev, [key]: v }))}
            placeholderTextColor={t.textSub}
          />
        </View>
      ))}

      <PressScale style={{
        margin: 16,
        backgroundColor: t.accent,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
      }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          Randomize Semua Fingerprint
        </Text>
      </PressScale>

      {/* Danger Zone */}
      <Text style={{ color: t.danger, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 16, marginBottom: 8 }}>
        DANGER ZONE
      </Text>
      <SettingsRow icon="trash-outline" label="Hapus Semua Clone"   danger />
      <SettingsRow icon="close-circle" label="Reset Virtual Space"  danger />

      {themePicker && <ThemePicker onClose={() => setThemePicker(false)} />}
    </ScrollView>
  );
};

// ─── SCREEN: ABOUT ────────────────────────────────────────────────────────────
const AboutScreen = () => {
  const { theme: t } = useTheme();

  const TECH_NOTES = [
    {
      title: 'Virtual Space Engine',
      detail: 'Butuh VirtualApp atau DroidPlugin. Ini framework Android native (Java/Kotlin) yang menjalankan APK di dalam "sandbox" tanpa install ke sistem. Bridge via ReactNative NativeModule.',
    },
    {
      title: 'Anti-VM / Anti-Root Detection',
      detail: 'Hook dilakukan via Frida (dynamic instrumentation) atau LSPosed module. JS tidak bisa langsung hook native library — butuh agen C/Java yang di-inject via ptrace atau Zygote.',
    },
    {
      title: 'SafetyNet / Play Integrity Bypass',
      detail: 'Membutuhkan MagiskHide / Shamiko, atau custom Play Integrity hook (seperti PlayIntegrityFix module untuk Magisk). Tidak bisa dilakukan murni dari JS.',
    },
    {
      title: 'Fingerprint Spoof (IMEI, MAC, Android ID)',
      detail: 'Memerlukan hook ke TelephonyManager, Settings.Secure, NetworkInterface via Xposed/LSPosed framework, atau setprop via root shell yang dijembatani ke RN via NativeModule.',
    },
    {
      title: 'Root Virtual (Fake su)',
      detail: 'VirtualApp support fake-root via virtual su binary yang di-drop ke /data/local/tmp dalam konteks virtual. App dalam clone akan "lihat" su tapi tidak punya akses root nyata ke sistem.',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* App Identity Card */}
      <View style={{
        margin: 16,
        backgroundColor: t.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: t.cardBorder,
        padding: 24,
        alignItems: 'center',
      }}>
        <View style={{
          width: 72, height: 72,
          borderRadius: 20,
          backgroundColor: t.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Text style={{ fontSize: 36 }}>⧉</Text>
        </View>
        <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>dClonter dev</Text>
        <Text style={{ color: t.textSub, fontSize: 13, marginTop: 4 }}>
          "Clone Space Tanpa Deteksi, Full Root Access"
        </Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
          {[
            { label: 'Versi',  val: '1.0.0'      },
            { label: 'Dev',    val: 'devnsepele'  },
            { label: 'Build',  val: 'DEBUG'       },
          ].map(i => (
            <View key={i.label} style={{ alignItems: 'center' }}>
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 14 }}>{i.val}</Text>
              <Text style={{ color: t.textSub, fontSize: 11 }}>{i.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Technical Notes */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginBottom: 8 }}>
        CATATAN TEKNIS — NATIVE MODULE
      </Text>
      {TECH_NOTES.map((n, i) => (
        <View key={i} style={{
          backgroundColor: t.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: t.cardBorder,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              backgroundColor: t.accent + '22',
              borderRadius: 8,
              width: 28, height: 28,
              alignItems: 'center', justifyContent: 'center',
              marginRight: 10,
            }}>
              <Text style={{ color: t.accent, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 14, flex: 1 }}>
              {n.title}
            </Text>
          </View>
          <Text style={{ color: t.textSub, fontSize: 12, lineHeight: 18 }}>
            {n.detail}
          </Text>
        </View>
      ))}

      {/* Folder Structure */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: '600',
                     marginLeft: 20, marginTop: 12, marginBottom: 8 }}>
        STRUKTUR FOLDER (PENGEMBANGAN LANJUT)
      </Text>
      <View style={{
        backgroundColor: t.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.cardBorder,
        padding: 16,
        marginHorizontal: 16,
      }}>
        <Text style={{
          color: t.text,
          fontSize: 11,
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          lineHeight: 20,
        }}>
{`dclonter/
├── App.jsx                  ← UI utama (file ini)
├── android/
│   ├── app/src/main/
│   │   ├── java/com/devnsepele/
│   │   │   ├── VirtualSpaceModule.java
│   │   │   ├── AntiDetectModule.java
│   │   │   ├── FingerprintModule.java
│   │   │   └── PackageListModule.java
│   │   └── jniLibs/
│   │       └── frida-gadget.so
│   └── libs/
│       └── VirtualApp.aar
├── ios/
│   └── (not applicable, VirtualApp = Android only)
└── src/
    ├── components/
    │   ├── AppCard.jsx
    │   ├── StatCard.jsx
    │   └── TabBar.jsx
    ├── screens/
    │   ├── HomeScreen.jsx
    │   ├── CloneScreen.jsx
    │   ├── SettingsScreen.jsx
    │   └── AboutScreen.jsx
    ├── themes/
    │   └── themes.js
    └── context/
        └── ThemeContext.js`}
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── COMPONENT: Tab Bar ───────────────────────────────────────────────────────
const TABS = [
  { key: 'home',     label: 'Home',     icon: 'home-outline'        },
  { key: 'clone',    label: 'Clone',    icon: 'copy-outline'        },
  { key: 'settings', label: 'Settings', icon: 'settings-outline'    },
  { key: 'about',    label: 'About',    icon: 'information-circle-outline' },
];

const TabBar = ({ active, onChange }) => {
  const { theme: t } = useTheme();
  return (
    <View style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      backgroundColor: t.tabBg,
      borderTopWidth: 1,
      borderColor: t.tabBorder,
      flexDirection: 'row',
      paddingBottom: Platform.OS === 'ios' ? 24 : 10,
      paddingTop: 10,
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <Animated.View style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: isActive ? t.accentSoft : 'transparent',
              alignItems: 'center',
              minWidth: 48,
            }}>
              <Icon
                name={tab.icon}
                size={22}
                color={isActive ? t.accent : t.textSub}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: isActive ? '700' : '400',
                color: isActive ? t.accent : t.textSub,
                marginTop: 3,
              }}>
                {tab.label}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

// ─── COMPONENT: Header ────────────────────────────────────────────────────────
const Header = ({ activeTab }) => {
  const { theme: t } = useTheme();
  const titles = {
    home:     'dClonter',
    clone:    'Clone Manager',
    settings: 'Pengaturan',
    about:    'Tentang',
  };
  return (
    <View style={{
      backgroundColor: t.bg,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderColor: t.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View>
        <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>
          {titles[activeTab]}
        </Text>
        <Text style={{ color: t.textSub, fontSize: 11, marginTop: 1 }}>
          devnsepele · v1.0.0
        </Text>
      </View>
      <View style={{
        backgroundColor: t.accentSoft,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}>
        <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
          🔒 SECURE
        </Text>
      </View>
    </View>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [themeId, setThemeId] = useState('black');
  const [activeTab, setActiveTab] = useState('home');
  const theme = THEMES[themeId];

  const renderScreen = useCallback(() => {
    switch (activeTab) {
      case 'home':     return <HomeScreen />;
      case 'clone':    return <CloneScreen />;
      case 'settings': return <SettingsScreen />;
      case 'about':    return <AboutScreen />;
      default:         return <HomeScreen />;
    }
  }, [activeTab]);

  return (
    <ThemeCtx.Provider value={{ theme, setThemeId }}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.bg}
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header activeTab={activeTab} />
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          {renderScreen()}
        </View>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </ThemeCtx.Provider>
  );
}

// ─── CATATAN TEKNIS (untuk developer) ─────────────────────────────────────────
/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║              NATIVE MODULE YANG DIBUTUHKAN                      ║
  ╠══════════════════════════════════════════════════════════════════╣
  ║                                                                  ║
  ║  1. VIRTUAL SPACE ENGINE                                         ║
  ║     Library : VirtualApp (github.com/asLody/VirtualApp)          ║
  ║               atau io.github.virtualapp.multi                   ║
  ║     Bridge  : VirtualSpaceModule.java                            ║
  ║     Method  : .cloneApp(pkg), .launchApp(pkg), .removeClone(pkg) ║
  ║                                                                  ║
  ║  2. PACKAGE LIST                                                  ║
  ║     Bridge  : PackageListModule.java                             ║
  ║     Method  : PackageManager.getInstalledApplications()          ║
  ║     Return  : Promise<Array<{name, pkg, icon, category}>>        ║
  ║                                                                  ║
  ║  3. ANTI-DETECT / VM HIDE                                         ║
  ║     Tool    : LSPosed + custom Xposed module                     ║
  ║               atau Frida (gadget inject ke proses clone)         ║
  ║     Hook    : VMRuntime, Debug, SystemProperties                 ║
  ║     Bridge  : AntiDetectModule.java → frida-gadget.so            ║
  ║                                                                  ║
  ║  4. SAFETYNET / PLAY INTEGRITY                                    ║
  ║     Tool    : PlayIntegrityFix (Magisk module)                   ║
  ║               atau custom HTTPS MITM ke Google APIs              ║
  ║     Bridge  : JS cukup toggle ON/OFF → native yang kerja         ║
  ║                                                                  ║
  ║  5. FINGERPRINT SPOOF                                             ║
  ║     Tool    : LSPosed + XPrivacyLua, atau hook manual            ║
  ║     Target  : TelephonyManager.getImei()                         ║
  ║               Settings.Secure.ANDROID_ID                        ║
  ║               NetworkInterface.getHardwareAddress()              ║
  ║               Build.SERIAL, Build.FINGERPRINT                   ║
  ║     Bridge  : FingerprintModule.java                             ║
  ║                                                                  ║
  ║  6. ROOT VIRTUAL                                                  ║
  ║     Cara    : VirtualApp drop fake `su` binary di virtual FS     ║
  ║               App clone kirim `su` request → virtual dispatcher  ║
  ║               Dispatcher approve semua tanpa root asli           ║
  ║     Note    : Tidak expose root ke sistem HP sebenarnya          ║
  ║                                                                  ║
  ╚══════════════════════════════════════════════════════════════════╝

  HOW TO RUN:
    npx create-expo-app dclonter --template blank
    cd dclonter
    cp /path/to/App.jsx .
    npx expo start

  ANDROID NATIVE BUILD (untuk native module):
    npx expo prebuild --platform android
    # Tambahkan VirtualApp.aar ke android/app/libs/
    # Buat NativeModule di android/app/src/main/java/
    # Register di MainApplication.java
    npx expo run:android
*/
