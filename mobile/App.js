import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'

const API_BASE = 'http://localhost:3001'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [db, setDb] = useState(null)
  const [email, setEmail] = useState('aisha@student.edu')
  const [password, setPassword] = useState('demo')
  const [role, setRole] = useState('Student')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/db`)
      .then((response) => response.json())
      .then((json) => setDb(json))
      .catch(() => setDb(null))
      .finally(() => setLoading(false))
  }, [])

  const signIn = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      const payload = await response.json()
      setUser(payload.user)
    } catch (error) {
      Alert.alert('Sign in failed', 'Use the demo password: demo')
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#1353c8" />
        <Text style={styles.loadingText}>Loading LabConnect...</Text>
      </View>
    )
  }

  if (!db) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Backend unavailable</Text>
        <Text style={styles.errorText}>Start the backend before opening the mobile app.</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.loginWrap}>
        <StatusBar barStyle="light-content" />
        <View style={styles.hero}>
          <Text style={styles.brand}>LabConnect</Text>
          <Text style={styles.heroTitle}>Mobile access for campus scheduling</Text>
          <Text style={styles.heroCopy}>Track allocations, notifications, and timetable data from a compact mobile view.</Text>
          <View style={styles.heroCard}>
            <Text style={styles.heroCardLabel}>Today</Text>
            <Text style={styles.heroCardValue}>{db.allocations.length} allocations</Text>
          </View>
        </View>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          <View style={styles.pillRow}>
            {['Admin', 'Scheduler', 'Lecturer', 'Student'].map((entry) => (
              <Pressable key={entry} style={[styles.pill, role === entry && styles.pillActive]} onPress={() => setRole(entry)}>
                <Text style={[styles.pillText, role === entry && styles.pillTextActive]}>{entry}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={signIn}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.appShell} contentContainerStyle={styles.appContent}>
      <View style={styles.header}>
        <Text style={styles.brandDark}>LabConnect</Text>
        <Text style={styles.headerSub}>{user.role}</Text>
      </View>
      <View style={styles.statGrid}>
        <View style={styles.statCard}><Text style={styles.statLabel}>Venues</Text><Text style={styles.statValue}>{db.venues.length}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Courses</Text><Text style={styles.statValue}>{db.courses.length}</Text></View>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming allocations</Text>
        {db.allocations.map((allocation) => {
          const course = db.courses.find((entry) => entry.id === allocation.courseId)
          const venue = db.venues.find((entry) => entry.id === allocation.venueId)
          return (
            <View key={allocation.id} style={styles.rowItem}>
              <View>
                <Text style={styles.rowTitle}>{course?.code}</Text>
                <Text style={styles.rowMeta}>{venue?.name}</Text>
              </View>
              <Text style={styles.rowTime}>{allocation.startTime} - {allocation.endTime}</Text>
            </View>
          )
        })}
      </View>
      <Pressable style={styles.secondaryButton} onPress={() => setUser(null)}>
        <Text style={styles.secondaryButtonText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f5fd',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#0e1a2b',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#be123c',
  },
  errorText: {
    marginTop: 8,
    color: '#5b6f88',
    textAlign: 'center',
  },
  loginWrap: {
    padding: 20,
    gap: 16,
    backgroundColor: '#0b2a5c',
    minHeight: '100%',
  },
  hero: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#0f3d7a',
    gap: 12,
  },
  brand: {
    color: '#ffffff',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  brandDark: {
    color: '#0e1a2b',
    fontSize: 18,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
  },
  heroCard: {
    marginTop: 4,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroCardLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroCardValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0e1a2b',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4dff0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f0f5fd',
    color: '#0e1a2b',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#d4dff0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f0f5fd',
  },
  pillActive: {
    backgroundColor: '#1353c8',
    borderColor: '#1353c8',
  },
  pillText: {
    color: '#5b6f88',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#1353c8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#f0f5fd',
  },
  appContent: {
    padding: 20,
    gap: 14,
  },
  header: {
    paddingTop: 8,
    gap: 4,
  },
  headerSub: {
    color: '#5b6f88',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  statLabel: {
    color: '#5b6f88',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    marginTop: 6,
    color: '#0b2a5c',
    fontSize: 26,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0e1a2b',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#d4dff0',
    paddingTop: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0e1a2b',
  },
  rowMeta: {
    color: '#5b6f88',
    marginTop: 2,
  },
  rowTime: {
    color: '#1353c8',
    fontWeight: '700',
  },
  secondaryButton: {
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4dff0',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#1353c8',
    fontWeight: '700',
  },
})
