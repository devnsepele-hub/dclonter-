// ============================================================
//  COMPONENTS — dClonter dev
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEMES } from './theme';

// ---------- App Card ----------
export function AppCard({ app, theme, cloned, onToggle, onLaunch }) {
  const initial = (app.label || app.packageName || '?').charAt(0).toUpperCase();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.appIcon, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <Text style={{ fontSize: 22, color: theme.accent, fontWeight: '700' }}>{initial}</Text>
      </View>

      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>
          {app.label || app.packageName}
        </Text>
        <Text style={[styles.appPkg, { color: theme.subText }]} numberOfLines={1}>
          {app.packageName}
        </Text>
      </View>

      {cloned && (
        <TouchableOpacity
          onPress={onLaunch}
          style={[
            styles.iconBtn,
            { borderColor: theme.border, backgroundColor: theme.bg, marginRight: 6 },
          ]}
        >
          <Text style={{ color: theme.accent, fontSize: 11, fontWeight: '700' }}>OPEN</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.cloneBtn,
          {
            backgroundColor: cloned ? theme.accent : 'transparent',
            borderColor: theme.accent,
          },
        ]}
      >
        <Text
          style={{
            color: cloned ? '#FFFFFF' : theme.accent,
            fontWeight: '700',
            fontSize: 11,
          }}
        >
          {cloned ? 'CLONED' : 'CLONE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Theme Picker ----------
export function ThemePicker({ current, onPick, theme }) {
  return (
    <View style={styles.themeRow}>
      {Object.keys(THEMES).map((key) => {
        const active = current === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onPick(key)}
            style={[
              styles.themeChip,
              {
                backgroundColor: active ? theme.accent : theme.bg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: active ? '#FFFFFF' : theme.text,
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              {THEMES[key].name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------- Tab Button ----------
export function TabButton({ id, label, theme, active, onPress }) {
  const isActive = active === id;
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      style={styles.tabBtn}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.tabDot,
          { backgroundColor: isActive ? theme.accent : 'transparent' },
        ]}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: isActive ? '700' : '500',
          color: isActive ? theme.accent : theme.subText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------- Section Title ----------
export function SectionTitle({ theme, text, top = 20 }) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: top }]}>
      {text}
    </Text>
  );
}

// ---------- Stat Box ----------
export function StatBox({ theme, value, label }) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: theme.accent }}>
        {value}
      </Text>
      <Text style={{ color: theme.subText, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: { flex: 1, marginLeft: 12, paddingRight: 8 },
  appName: { fontSize: 15, fontWeight: '600' },
  appPkg: { fontSize: 11, marginTop: 2 },
  cloneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 70,
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  themeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
});
