import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { NoticeBanner } from '@/components/notice-banner';
import { ScreenShell } from '@/components/screen-shell';
import { getAttendanceOptions, recordAttendance } from '@/lib/api/attendance';
import { ApiError } from '@/lib/api/client';
import type { AttendanceOptionsResponse } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

const defaultStatus = 'Auto';

export default function AttendanceScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const itsInputRef = useRef<TextInput>(null);
  const { session, signOut } = useSession();
  const [data, setData] = useState<AttendanceOptionsResponse | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [itsId, setItsId] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [remark, setRemark] = useState('');
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEvent = data?.events.find((event) => event.id === selectedEventId) ?? null;

  useEffect(() => {
    if (session?.canTakeAttendance) {
      loadAttendanceOptions();
    } else {
      setIsLoading(false);
    }
  }, [session?.canTakeAttendance]);

  function scrollFormIntoView() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  }

  async function loadAttendanceOptions(refresh = false) {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await getAttendanceOptions();
      const nextEventId = response.events[0]?.id || 0;

      setData(response);
      setSelectedEventId((currentValue) => currentValue || nextEventId);
      setShowEventPicker(false);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load attendance options.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function handleClearForm() {
    setItsId('');
    setRemark('');
    setStatus(defaultStatus);
    setShowAdvanced(false);
    setErrorMessage('');
    setSuccessMessage('');
    itsInputRef.current?.focus();
    scrollFormIntoView();
  }

  async function handleRecordAttendance() {
    if (isSubmitting || !selectedEventId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await recordAttendance({
        eventId: selectedEventId,
        itsId: itsId.trim(),
        status,
        remark: remark.trim(),
      });

      setSuccessMessage(`${response.message} ${response.memberName} was recorded for ${response.eventName}.`);
      setItsId('');
      setRemark('');
      setStatus(defaultStatus);
      setShowAdvanced(false);
      requestAnimationFrame(() => {
        itsInputRef.current?.focus();
        scrollFormIntoView();
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to record attendance.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!session?.canTakeAttendance) {
    return (
      <ScreenShell
        eyebrow="ATTENDANCE"
        title="Attendance access is not enabled"
        subtitle="This tab is only available for roles that can take attendance in the current system.">
        <Pressable onPress={() => router.replace('/(tabs)/dashboard')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </Pressable>
        <NoticeBanner
          title="No attendance permission"
          body="Sign in with Super Admin, Idara Admin, Mohalla Admin, or Idara Attendance Admin access to use this screen."
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      scrollViewRef={scrollViewRef}
      eyebrow="ATTENDANCE"
      title="Record Attendance"
      subtitle="Choose the event first, then enter the ITS ID just like the web screen."
      refreshing={isRefreshing}
      onRefresh={() => loadAttendanceOptions(true)}>
      <Pressable onPress={() => router.replace('/(tabs)/dashboard')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </Pressable>

      {errorMessage ? <NoticeBanner tone="error" title="Attendance failed" body={errorMessage} /> : null}
      {successMessage ? (
        <NoticeBanner tone="success" title="Attendance recorded" body={successMessage} />
      ) : null}
      {!errorMessage && isLoading ? (
        <NoticeBanner title="Loading events" body="Fetching events available for your role and scope." />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Attendance Form</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Event</Text>

          <Pressable
            onPress={() => setShowEventPicker((currentValue) => !currentValue)}
            style={[styles.selectorButton, showEventPicker && styles.selectorButtonOpen]}>
            {selectedEvent ? (
              <View style={styles.selectorTextWrap}>
                <Text style={styles.selectorValue}>{selectedEvent.eventName}</Text>
                <Text style={styles.selectorMeta}>
                  {selectedEvent.eventDate} at {selectedEvent.reportingTime}
                </Text>
                <Text style={styles.selectorMeta}>
                  {selectedEvent.idara} / {selectedEvent.mohalla}
                </Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Select an event</Text>
            )}
            <Text style={styles.selectorAction}>{showEventPicker ? 'Hide' : 'Change'}</Text>
          </Pressable>

          {showEventPicker ? (
            <View style={styles.optionList}>
              {data?.events.length ? (
                data.events.map((event) => {
                  const selected = event.id === selectedEventId;

                  return (
                    <Pressable
                      key={event.id}
                      onPress={() => {
                        setSelectedEventId(event.id);
                        setShowEventPicker(false);
                        requestAnimationFrame(() => {
                          itsInputRef.current?.focus();
                          scrollFormIntoView();
                        });
                      }}
                      style={[styles.optionButton, selected && styles.optionButtonSelected]}>
                      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                        {event.eventName}
                      </Text>
                      <Text style={[styles.optionMeta, selected && styles.optionMetaSelected]}>
                        {event.eventDate} at {event.reportingTime}
                      </Text>
                      <Text style={[styles.optionMeta, selected && styles.optionMetaSelected]}>
                        {event.idara} / {event.mohalla}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <NoticeBanner
                  title="No events available"
                  body="Create events in the main system for this scope and they will show up here."
                />
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ITS ID</Text>
          <TextInput
            ref={itsInputRef}
            value={itsId}
            onChangeText={setItsId}
            onFocus={scrollFormIntoView}
            keyboardType="number-pad"
            placeholder="Enter 8-digit ITS ID"
            placeholderTextColor={palette.muted}
            maxLength={8}
            returnKeyType="done"
            style={styles.input}
          />
        </View>

        <View style={styles.advancedCard}>
          <Pressable onPress={() => setShowAdvanced((currentValue) => !currentValue)} style={styles.advancedToggle}>
            <View style={styles.advancedTextWrap}>
              <Text style={styles.advancedTitle}>Advanced Options</Text>
              <Text style={styles.advancedSubtitle}>
                Status: {status === defaultStatus ? 'Auto (Default)' : status}
                {remark ? ' • Remark added' : ''}
              </Text>
            </View>
            <Text style={styles.advancedAction}>{showAdvanced ? 'Hide' : 'Show'}</Text>
          </Pressable>

          {showAdvanced ? (
            <View style={styles.advancedBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusRow}>
                  {[defaultStatus, ...(data?.allowedStatuses ?? [])].map((option) => {
                    const selected = option === status;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setStatus(option)}
                        style={[styles.statusChip, selected && styles.statusChipSelected]}>
                        <Text style={[styles.statusChipText, selected && styles.statusChipTextSelected]}>
                          {option === defaultStatus ? 'Auto' : option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Remark</Text>
                <TextInput
                  value={remark}
                  onChangeText={setRemark}
                  onFocus={scrollFormIntoView}
                  placeholder="Optional note"
                  placeholderTextColor={palette.muted}
                  multiline
                  style={[styles.input, styles.textArea]}
                />
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handleRecordAttendance}
            style={[styles.submitButton, (!selectedEventId || isSubmitting) && styles.submitButtonDisabled]}
            disabled={!selectedEventId || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={palette.surface} />
            ) : (
              <Text style={styles.submitText}>Record Attendance</Text>
            )}
          </Pressable>

          <Pressable onPress={handleClearForm} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.mist,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#FBFCFB',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectorButtonOpen: {
    borderColor: palette.pine,
  },
  selectorTextWrap: {
    flex: 1,
    gap: 2,
  },
  selectorValue: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  selectorMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  selectorPlaceholder: {
    color: palette.muted,
    fontSize: 15,
  },
  selectorAction: {
    color: palette.pine,
    fontSize: 13,
    fontWeight: '800',
  },
  optionList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#FBFCFB',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#EEF6F2',
    borderColor: palette.pine,
  },
  optionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  optionTitleSelected: {
    color: palette.pine,
  },
  optionMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  optionMetaSelected: {
    color: palette.pine,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#FBFCFB',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: palette.ink,
    fontSize: 16,
  },
  advancedCard: {
    borderRadius: radius.lg,
    backgroundColor: palette.mist,
    padding: spacing.md,
    gap: spacing.sm,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  advancedTextWrap: {
    flex: 1,
    gap: 2,
  },
  advancedTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  advancedSubtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  advancedAction: {
    color: palette.pine,
    fontSize: 13,
    fontWeight: '800',
  },
  advancedBody: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    backgroundColor: palette.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusChipSelected: {
    backgroundColor: palette.gold,
  },
  statusChipText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  statusChipTextSelected: {
    color: palette.ink,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: palette.pine,
    borderRadius: radius.lg,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: '900',
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  clearText: {
    color: palette.pine,
    fontSize: 16,
    fontWeight: '800',
  },
});
