import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Alert,
} from 'react-native';
import {
  Store, Bell, RefreshCw, CheckCircle2, Circle, LogOut,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows, radius } from '../theme/shadows';
import { formatRelativeTime } from '../lib/formatDate';
import { useBusinessStore } from '../store';
import { supabase } from '../lib/supabase';
import { useSmsSync } from '../hooks/useSmsSync';
import ToggleRow from '../components/shared/ToggleRow';

const PAYMENT_TYPES = [
  { key: 'pochi', label: 'Pochi', color: colors.pochi, bg: colors.pochiBg, border: colors.pochiBorder },
  { key: 'p2p', label: 'P2P', color: colors.p2p, bg: colors.p2pBg, border: colors.p2pBorder },
  { key: 'till', label: 'Till', color: colors.till, bg: colors.tillBg, border: colors.tillBorder },
  { key: 'paybill', label: 'Paybill', color: colors.paybill, bg: colors.paybillBg, border: colors.paybillBorder },
];

export default function SettingsScreen({ navigation }) {
  const {
    businessName, ownerName, ownerPhone, enabledTypes, lastSyncAt,
    notificationsEnabled, pushToken, setNotificationsEnabled, setEnabledTypes,
    setPushToken, businessId, logout,
  } = useBusinessStore();
  const { sync } = useSmsSync(false);
  const [registeringNotifications, setRegisteringNotifications] = React.useState(false);

  React.useEffect(() => {
    if (!businessId) return;

    supabase
      .from('businesses')
      .select('notifications, push_token')
      .eq('id', businessId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load notification settings:', error);
          return;
        }

        setNotificationsEnabled(Boolean(data.notifications));
        setPushToken(data.push_token || null);
      });
  }, [businessId, setNotificationsEnabled, setPushToken]);

  const handleRegisterNotifications = async () => {
    if (!businessId || registeringNotifications) return;

    setRegisteringNotifications(true);
    try {
      const { registerForPushNotifications } = require('../lib/notifications');
      const token = await registerForPushNotifications(businessId);

      await supabase
        .from('businesses')
        .update({ notifications: true })
        .eq('id', businessId);

      setPushToken(token);
      setNotificationsEnabled(true);
      Alert.alert('Notifications ready', 'This phone is registered for daily summary notifications.');
    } catch (err) {
      Alert.alert(
        'Notification setup failed',
        err.message || 'Could not register this phone for push notifications.'
      );
    } finally {
      setRegisteringNotifications(false);
    }
  };

  const togglePaymentType = (key) => {
    const updated = enabledTypes.includes(key)
      ? enabledTypes.filter((k) => k !== key)
      : [...enabledTypes, key];

    setEnabledTypes(updated);

    // Save to Supabase
    if (businessId) {
      supabase
        .from('businesses')
        .update({ enabled_types: updated })
        .eq('id', businessId)
        .then(({ error }) => {
          if (error) console.error('Failed to save payment types:', error);
        });
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Business Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.92}>
          <View style={styles.profileIcon}>
            <Store size={20} color={colors.green} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{businessName || 'My Business'}</Text>
            <Text style={styles.profileSub}>{ownerName}</Text>
            <Text style={styles.profileSub}>{ownerPhone}</Text>
          </View>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <ToggleRow
            icon={<Bell size={20} color={colors.navy} />}
            title="Daily summary notification"
            description="Receive your income summary at 8PM"
            value={notificationsEnabled}
            onValueChange={async (val) => {
              if (val) {
                await handleRegisterNotifications();
                return;
              }

              setNotificationsEnabled(false);
              if (businessId) {
                supabase
                  .from('businesses')
                  .update({ notifications: false })
                  .eq('id', businessId);
              }
            }}
          />
          <TouchableOpacity
            style={styles.notificationRegisterRow}
            onPress={handleRegisterNotifications}
            disabled={registeringNotifications}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.notificationStatusDot,
                pushToken && styles.notificationStatusDotActive,
              ]}
            />
            <View style={styles.syncInfo}>
              <Text style={styles.syncTitle}>
                {pushToken ? 'Phone registered' : 'Phone not registered'}
              </Text>
              <Text style={styles.syncSub}>
                {pushToken
                  ? 'Daily summaries can be sent to this phone.'
                  : 'Register this phone so Vercel cron can send summaries.'}
              </Text>
            </View>
            <Text style={styles.syncAction}>
              {registeringNotifications ? 'Working...' : pushToken ? 'Refresh' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sync & Data Section */}
        <Text style={styles.sectionLabel}>SYNC & DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.syncRow} 
            onPress={async () => {
              try {
                const result = await sync({ fullHistory: true });
                if (result.success) {
                  const scope = result.fullHistory ? 'all SMS history' : 'new messages';
                  Alert.alert(
                    'Sync complete',
                    `Checked ${scope}. Read ${result.messagesRead} M-Pesa SMS and imported ${result.parsedCount} payments.`
                  );
                } else {
                  Alert.alert(
                    'Sync failed',
                    `${result.stage || 'unknown'}: ${result.errorMessage || 'Could not sync M-Pesa messages.'}`
                  );
                }
              } catch (err) {
                Alert.alert('Sync failed', err.message || 'Could not sync M-Pesa messages.');
              }
            }}
          >
            <RefreshCw size={20} color={colors.navy} />
            <View style={styles.syncInfo}>
              <Text style={styles.syncTitle}>SMS sync</Text>
              <Text style={styles.syncSub}>
                {lastSyncAt ? formatRelativeTime(new Date(lastSyncAt)) : 'Not synced yet'}
              </Text>
            </View>
            <Text style={styles.syncAction}>Sync now</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Types Section */}
        <Text style={styles.sectionLabel}>PAYMENT TYPES TRACKED</Text>
        <View style={styles.chipRow}>
          {PAYMENT_TYPES.map((type) => {
            const isActive = enabledTypes.includes(type.key);
            return (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.paymentChip,
                  isActive
                    ? { backgroundColor: type.bg, borderColor: type.border }
                    : { backgroundColor: '#F1F5F9', borderColor: colors.border },
                ]}
                onPress={() => togglePaymentType(type.key)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <CheckCircle2 size={16} color={type.color} />
                ) : (
                  <Circle size={16} color={colors.grayText} />
                )}
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isActive ? type.color : colors.grayText },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer links */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink} onPress={handleLogout}>
            <LogOut size={18} color={colors.red} />
            <Text style={[styles.footerText, { color: colors.red }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: 100,
  },
  pageTitle: {
    ...typography.heading1,
    color: colors.navy,
    marginBottom: spacing.xxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.xxl,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading3,
    color: colors.navy,
  },
  profileSub: {
    ...typography.bodyS,
    color: colors.grayText,
  },
  editIcon: {
    fontSize: 20,
    color: colors.grayText,
  },
  sectionLabel: {
    ...typography.badge,
    color: colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.md,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    ...typography.bodyM,
    fontWeight: '500',
    color: colors.navy,
  },
  syncSub: {
    ...typography.bodyS,
    color: colors.grayText,
  },
  syncAction: {
    ...typography.bodyS,
    color: colors.green,
    fontWeight: '600',
  },
  notificationRegisterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notificationStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.amber,
  },
  notificationStatusDotActive: {
    backgroundColor: colors.green,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipLabel: {
    ...typography.badge,
  },
  footer: {
    marginTop: spacing.xxxl,
    gap: spacing.lg,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footerText: {
    ...typography.bodyM,
    color: colors.grayText,
  },
});
