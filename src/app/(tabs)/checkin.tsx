import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LocationMap } from '@/components/location-map';
import { NoticeBanner } from '@/components/notice-banner';
import { ScreenShell } from '@/components/screen-shell';
import { getCheckinOptions, haversineDistance, submitCheckin } from '@/lib/api/checkin';
import { ApiError } from '@/lib/api/client';
import type { EventPreview } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';
import { palette, radius, spacing } from '@/lib/theme';

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ready'; lat: number; lng: number };

export default function CheckinScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { session, signOut } = useSession();
  const [events, setEvents] = useState<EventPreview[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [locationState, setLocationState] = useState<LocationState>({ status: 'idle' });
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successIsRemote, setSuccessIsRemote] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  useEffect(() => {
    loadCheckinOptions();
    requestLocation();
  }, []);

  async function loadCheckinOptions(refresh = false) {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getCheckinOptions();
      setEvents(res.events);
      setSelectedEventId((current) => current || res.events[0]?.id || 0);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load events.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function requestLocation() {
    setLocationState({ status: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationState({ status: 'denied' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocationState({ status: 'ready', lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      setLocationState({ status: 'denied' });
    }
  }

  function getDistanceToEvent(event: EventPreview): number | null {
    if (
      locationState.status !== 'ready' ||
      event.latitude == null ||
      event.longitude == null
    ) {
      return null;
    }
    return haversineDistance(locationState.lat, locationState.lng, event.latitude, event.longitude);
  }

  function formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  }

  async function handleCheckin() {
    if (isSubmitting || !selectedEventId) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload =
      locationState.status === 'ready'
        ? { eventId: selectedEventId, lat: locationState.lat, lng: locationState.lng }
        : { eventId: selectedEventId };

    try {
      const res = await submitCheckin(payload);
      setSuccessMessage(
        `${res.isRemote ? 'Remote check-in saved.' : 'Checked in!'} Status: ${res.recordedStatus}.`
      );
      setSuccessIsRemote(res.isRemote);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEventId ? { ...e, userStatus: res.recordedStatus } : e
        )
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Check-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const distanceToSelected = selectedEvent ? getDistanceToEvent(selectedEvent) : null;
  const isOutsideGeofence =
    distanceToSelected !== null &&
    selectedEvent?.radiusMeters != null &&
    distanceToSelected > selectedEvent.radiusMeters;
  const alreadyCheckedIn = !!selectedEvent?.userStatus;

  return (
    <ScreenShell
      scrollViewRef={scrollViewRef}
      eyebrow="CHECK IN"
      title="Member Self Check-In"
      subtitle="Select an event and check in with your current location."
      refreshing={isRefreshing}
      onRefresh={() => loadCheckinOptions(true)}>
      <Pressable onPress={() => router.replace('/(tabs)/dashboard')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </Pressable>

      {errorMessage ? <NoticeBanner tone="error" title="Check-in failed" body={errorMessage} /> : null}
      {successMessage ? (
        <NoticeBanner
          tone={successIsRemote ? 'info' : 'success'}
          title={successIsRemote ? 'Checked in — Remote' : 'Checked in'}
          body={successMessage}
        />
      ) : null}

      <View style={styles.locationCard}>
        <Text style={styles.locationLabel}>YOUR LOCATION</Text>
        {locationState.status === 'idle' || locationState.status === 'loading' ? (
          <View style={styles.locationRow}>
            <ActivityIndicator size="small" color={palette.pine} />
            <Text style={styles.locationText}>Getting GPS location…</Text>
          </View>
        ) : locationState.status === 'denied' ? (
          <View style={styles.locationRow}>
            <Text style={styles.locationWarning}>Location permission denied.</Text>
            <Pressable onPress={requestLocation} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>
              {locationState.lat.toFixed(5)}, {locationState.lng.toFixed(5)}
            </Text>
            <Pressable onPress={requestLocation} style={styles.retryButton}>
              <Text style={styles.retryText}>Refresh</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Event</Text>

        <Pressable
          onPress={() => setShowEventPicker((v) => !v)}
          style={[styles.selectorButton, showEventPicker && styles.selectorButtonOpen]}>
          {selectedEvent ? (
            <View style={styles.selectorTextWrap}>
              <Text style={styles.selectorValue}>{selectedEvent.eventName}</Text>
              <Text style={styles.selectorMeta}>
                {selectedEvent.eventDate} at {selectedEvent.reportingTime}
              </Text>
              {distanceToSelected !== null ? (
                <Text style={[styles.distanceBadge, isOutsideGeofence && styles.distanceBadgeFar]}>
                  {isOutsideGeofence ? 'Outside geofence' : 'Within geofence'} —{' '}
                  {formatDistance(distanceToSelected)} away
                </Text>
              ) : selectedEvent.latitude != null ? (
                <Text style={styles.distanceBadgeNeutral}>
                  Geofenced event — location needed for distance
                </Text>
              ) : null}
              {alreadyCheckedIn ? (
                <Text style={styles.checkedInBadge}>Already checked in: {selectedEvent.userStatus}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Select an event</Text>
          )}
          <Text style={styles.selectorAction}>{showEventPicker ? 'Hide' : 'Change'}</Text>
        </Pressable>

        {showEventPicker ? (
          <View style={styles.optionList}>
            {isLoading ? (
              <NoticeBanner title="Loading events" body="Fetching events for your scope." />
            ) : events.length ? (
              events.map((event) => {
                const sel = event.id === selectedEventId;
                const dist = getDistanceToEvent(event);
                const outside =
                  dist !== null && event.radiusMeters != null && dist > event.radiusMeters;
                return (
                  <Pressable
                    key={event.id}
                    onPress={() => {
                      setSelectedEventId(event.id);
                      setShowEventPicker(false);
                    }}
                    style={[styles.optionButton, sel && styles.optionButtonSelected]}>
                    <Text style={[styles.optionTitle, sel && styles.optionTitleSelected]}>
                      {event.eventName}
                    </Text>
                    <Text style={[styles.optionMeta, sel && styles.optionMetaSelected]}>
                      {event.eventDate} at {event.reportingTime}
                    </Text>
                    {dist !== null ? (
                      <Text style={[styles.optionMeta, outside && styles.optionMetaFar, sel && !outside && styles.optionMetaSelected]}>
                        {outside ? 'Outside geofence' : 'Within geofence'} — {formatDistance(dist)}
                      </Text>
                    ) : null}
                    {event.userStatus ? (
                      <Text style={styles.optionChecked}>Checked in: {event.userStatus}</Text>
                    ) : null}
                  </Pressable>
                );
              })
            ) : (
              <NoticeBanner
                title="No events available"
                body="No upcoming events are set up for your scope yet."
              />
            )}
          </View>
        ) : null}

        {selectedEvent?.latitude != null && selectedEvent.longitude != null ? (
          <LocationMap
            eventLat={selectedEvent.latitude}
            eventLng={selectedEvent.longitude}
            eventRadius={selectedEvent.radiusMeters ?? 200}
            eventName={selectedEvent.eventName}
            userLat={locationState.status === 'ready' ? locationState.lat : undefined}
            userLng={locationState.status === 'ready' ? locationState.lng : undefined}
          />
        ) : null}

        {isOutsideGeofence ? (
          <View style={styles.remoteWarning}>
            <Text style={styles.remoteWarningTitle}>Outside Event Area</Text>
            <Text style={styles.remoteWarningBody}>
              You are {formatDistance(distanceToSelected!)} away from the event location. Check-in
              will be saved but flagged as remote for admin review.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleCheckin}
          disabled={!selectedEventId || isSubmitting || alreadyCheckedIn}
          style={[
            styles.checkinButton,
            (!selectedEventId || isSubmitting || alreadyCheckedIn) && styles.checkinButtonDisabled,
            isOutsideGeofence && styles.checkinButtonRemote,
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color={palette.surface} />
          ) : (
            <Text style={styles.checkinButtonText}>
              {alreadyCheckedIn
                ? `Already Checked In (${selectedEvent?.userStatus})`
                : isOutsideGeofence
                  ? 'Check In Remotely'
                  : 'Check In'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  locationCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  locationLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  locationText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  locationWarning: {
    color: palette.muted,
    fontSize: 13,
    flex: 1,
  },
  retryButton: {
    backgroundColor: palette.mist,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  retryText: {
    color: palette.pine,
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
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
    gap: 3,
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
  distanceBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2,
  },
  distanceBadgeFar: {
    color: '#dc2626',
  },
  distanceBadgeNeutral: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 2,
  },
  checkedInBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.pine,
    marginTop: 2,
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
  optionMetaFar: {
    color: '#dc2626',
    fontWeight: '700',
  },
  optionChecked: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.pine,
    marginTop: 2,
  },
  remoteWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4,
  },
  remoteWarningTitle: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 14,
  },
  remoteWarningBody: {
    color: '#78350F',
    fontSize: 13,
    lineHeight: 18,
  },
  checkinButton: {
    backgroundColor: palette.pine,
    borderRadius: radius.lg,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinButtonDisabled: {
    opacity: 0.45,
  },
  checkinButtonRemote: {
    backgroundColor: '#D97706',
  },
  checkinButtonText: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});
