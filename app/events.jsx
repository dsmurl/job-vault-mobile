import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import {
  useFocusEffect,
  useNavigation,
  useLocalSearchParams,
} from "expo-router";
import { format, isSameDay, isFuture, isToday } from "date-fns";
import {
  parseEventTime,
  localInputToUTC,
  utcToLocalInput,
} from "../utils/time";
import { X, ChevronDown } from "lucide-react-native";
import { companiesApi, calendarEventsApi } from "../utils/db";
import {
  EventDetailItem,
  eventTypeLabel,
  EVENT_TYPES,
} from "../components/EventDetailItem/EventDetailItem";
import { PickerBottomSheet } from "../components/PickerBottomSheet/PickerBottomSheet";
import { useFilter } from "./_layout";

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCompany, setSelectedCompany } = useFilter();
  const [companyPickerVisible, setCompanyPickerVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    event_type: "other",
    company_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const navigation = useNavigation();
  const { company_id } = useLocalSearchParams();

  useEffect(() => {
    if (company_id) {
      setSelectedCompany(company_id.toString());
    }
  }, [company_id, setSelectedCompany]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerFilter}
          onPress={() => setCompanyPickerVisible(true)}
        >
          <Text style={styles.headerFilterText}>
            {selectedCompany
              ? companies.find((c) => c.id.toString() === selectedCompany)
                  ?.name || "All Companies"
              : "All Companies"}
          </Text>
          <ChevronDown size={14} color="#6b7280" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCompany, companies]);

  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [eventTypePickerVisible, setEventTypePickerVisible] = useState(false);
  const [formCompanyPickerVisible, setFormCompanyPickerVisible] =
    useState(false);

  const fetchAll = async () => {
    try {
      const [eventsData, companiesData] = await Promise.all([
        calendarEventsApi.getAll(),
        companiesApi.getAll(),
      ]);
      setEvents(eventsData);
      setCompanies(companiesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, []),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("jobVaultRefresh", fetchAll);
    return () => sub.remove();
  }, []);

  const openEditForm = (event) => {
    setEditingEvent(event);
    setShowNewCompany(false);
    setNewCompanyName("");
    setFormErrors({});
    setForm({
      title: event.title,
      description: event.description || "",
      start_time: utcToLocalInput(event.start_time),
      end_time: utcToLocalInput(event.end_time),
      event_type: event.event_type,
      company_id: event.company?.id?.toString() || "",
    });
    setFormDialogVisible(true);
  };

  const handleSave = async () => {
    const errors = {};
    if (!form.title.trim()) errors.title = true;
    if (showNewCompany && !newCompanyName.trim()) errors.newCompanyName = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    let companyId = form.company_id || null;
    if (showNewCompany && newCompanyName.trim()) {
      try {
        const res = await companiesApi.create({ name: newCompanyName.trim() });
        companyId = res.id.toString();
      } catch (e) {
        console.error(e);
        setSaving(false);
        return;
      }
    }
    const payload = {
      ...form,
      company_id: companyId,
      start_time: localInputToUTC(form.start_time),
      end_time: localInputToUTC(form.end_time),
    };
    try {
      await calendarEventsApi.update(editingEvent.id, payload);
      setFormDialogVisible(false);
      setEditingEvent(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await calendarEventsApi.delete(id);
            await fetchAll();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const futureEvents = events
    .filter(
      (e) =>
        isFuture(parseEventTime(e.start_time)) ||
        isSameDay(parseEventTime(e.start_time), new Date()),
    )
    .filter(
      (e) => !selectedCompany || e.company?.id === parseInt(selectedCompany),
    )
    .sort(
      (a, b) => parseEventTime(a.start_time) - parseEventTime(b.start_time),
    );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  return (
    <View style={styles.container}>
      <PickerBottomSheet
        visible={companyPickerVisible}
        onClose={() => setCompanyPickerVisible(false)}
        title="Filter by Company"
      >
        <TouchableOpacity
          style={[
            styles.pickerOption,
            !selectedCompany && styles.pickerOptionActive,
          ]}
          onPress={() => {
            setSelectedCompany("");
            setCompanyPickerVisible(false);
          }}
        >
          <Text
            style={[
              styles.pickerOptionText,
              !selectedCompany && styles.pickerOptionTextActive,
            ]}
          >
            All Companies
          </Text>
        </TouchableOpacity>
        {companies.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.pickerOption,
              selectedCompany === c.id.toString() && styles.pickerOptionActive,
            ]}
            onPress={() => {
              setSelectedCompany(c.id.toString());
              setCompanyPickerVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                selectedCompany === c.id.toString() &&
                  styles.pickerOptionTextActive,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </PickerBottomSheet>

      {(() => {
        // Build flat list of items (separators + cards) and track sticky indices
        let lastDateKey = null;
        let childIndex = 0;
        const stickyIndices = [];
        const children = futureEvents.flatMap((e) => {
          const d = parseEventTime(e.start_time);
          const dateKey = format(d, "yyyy-MM-dd");
          const showSeparator = dateKey !== lastDateKey;
          lastDateKey = dateKey;
          const todayDate = isToday(d);
          const label = todayDate ? "Today" : format(d, "EEEE, MMMM d");
          const items = [];
          if (showSeparator) {
            stickyIndices.push(childIndex);
            childIndex++;
            items.push(
              <View key={`sep-${dateKey}`} style={styles.dateSeparator}>
                <Text style={styles.dateSeparatorText}>{label}</Text>
              </View>,
            );
          }
          childIndex++;
          items.push(
            <EventDetailItem
              key={e.id}
              event={e}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onView={setViewingEvent}
            />,
          );
          return items;
        });
        return (
          <ScrollView style={styles.list} stickyHeaderIndices={stickyIndices}>
            {futureEvents.length === 0 && (
              <Text style={styles.empty}>No upcoming events</Text>
            )}
            {children}
          </ScrollView>
        );
      })()}

      {/* Edit Event Dialog */}
      <Modal
        visible={!!viewingEvent}
        animationType="fade"
        transparent
        onRequestClose={() => setViewingEvent(null)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>{viewingEvent?.title}</Text>
              <TouchableOpacity onPress={() => setViewingEvent(null)}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dialogBody}>
              <Text style={styles.eventViewMeta}>
                {viewingEvent &&
                  format(
                    parseEventTime(viewingEvent.start_time),
                    "EEEE, MMMM d, yyyy",
                  )}
                {"\n"}
                {viewingEvent &&
                  format(parseEventTime(viewingEvent.start_time), "h:mm a")}
                {viewingEvent?.end_time &&
                  ` – ${format(parseEventTime(viewingEvent.end_time), "h:mm a")}`}
                {"\n"}
                {viewingEvent && eventTypeLabel(viewingEvent.event_type)}
                {viewingEvent?.company && ` · ${viewingEvent.company.name}`}
              </Text>
              <Text style={styles.eventViewDesc}>
                {viewingEvent?.description || "No description provided."}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={formDialogVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setFormDialogVisible(false);
          setEditingEvent(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.dialogOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Edit Event</Text>
              <TouchableOpacity
                onPress={() => {
                  setFormDialogVisible(false);
                  setEditingEvent(null);
                }}
              >
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.dialogBody}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={[styles.input, formErrors.title && styles.inputError]}
                placeholder="Title *"
                value={form.title}
                onChangeText={(t) => {
                  setForm((f) => ({ ...f, title: t }));
                  if (formErrors.title)
                    setFormErrors((e) => ({ ...e, title: false }));
                }}
              />

              <Text style={styles.formLabel}>Event Type</Text>
              <TouchableOpacity
                style={styles.formDropdown}
                onPress={() => setEventTypePickerVisible(true)}
              >
                <View
                  style={[
                    styles.formDropdownDot,
                    {
                      backgroundColor:
                        EVENT_TYPES.find((t) => t.value === form.event_type)
                          ?.color || "#6b7280",
                    },
                  ]}
                />
                <Text style={styles.formDropdownText}>
                  {EVENT_TYPES.find((t) => t.value === form.event_type)
                    ?.label || "Select type"}
                </Text>
                <ChevronDown size={16} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.formLabel}>Company (optional)</Text>
              <TouchableOpacity
                style={[styles.formDropdown, { marginBottom: 6 }]}
                onPress={() => setFormCompanyPickerVisible(true)}
              >
                <Text style={styles.formDropdownText}>
                  {showNewCompany
                    ? "+ New Company"
                    : form.company_id
                      ? companies.find(
                          (c) => c.id.toString() === form.company_id,
                        )?.name || "None"
                      : "None"}
                </Text>
                <ChevronDown size={16} color="#6b7280" />
              </TouchableOpacity>
              {showNewCompany && (
                <TextInput
                  style={[
                    styles.input,
                    { marginBottom: 10 },
                    formErrors.newCompanyName && styles.inputError,
                  ]}
                  placeholder="New company name *"
                  value={newCompanyName}
                  onChangeText={(t) => {
                    setNewCompanyName(t);
                    if (formErrors.newCompanyName)
                      setFormErrors((e) => ({ ...e, newCompanyName: false }));
                  }}
                />
              )}

              <Text style={styles.formLabel}>Start time</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DDTHH:MM"
                value={form.start_time}
                onChangeText={(t) => setForm((f) => ({ ...f, start_time: t }))}
              />
              <Text style={styles.formLabel}>End time (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DDTHH:MM"
                value={form.end_time}
                onChangeText={(t) => setForm((f) => ({ ...f, end_time: t }))}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={form.description}
                onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
                multiline
                numberOfLines={2}
              />
            </ScrollView>
            <View style={styles.dialogFooter}>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => {
                  setFormDialogVisible(false);
                  setEditingEvent(null);
                }}
              >
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.primaryBtnText}>
                  {saving ? "Saving..." : "Update"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Event Type Picker */}
      <PickerBottomSheet
        visible={eventTypePickerVisible}
        onClose={() => setEventTypePickerVisible(false)}
        title="Select Event Type"
      >
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.pickerOption,
              form.event_type === t.value && styles.pickerOptionActive,
            ]}
            onPress={() => {
              setForm((f) => ({ ...f, event_type: t.value }));
              setEventTypePickerVisible(false);
            }}
          >
            <View style={[styles.pickerDot, { backgroundColor: t.color }]} />
            <Text
              style={[
                styles.pickerOptionText,
                form.event_type === t.value && styles.pickerOptionTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </PickerBottomSheet>

      {/* Form Company Picker */}
      <PickerBottomSheet
        visible={formCompanyPickerVisible}
        onClose={() => setFormCompanyPickerVisible(false)}
        title="Select Company"
      >
        <TouchableOpacity
          style={[
            styles.pickerOption,
            showNewCompany && styles.pickerOptionActive,
          ]}
          onPress={() => {
            setShowNewCompany(true);
            setForm((f) => ({ ...f, company_id: "" }));
            setNewCompanyName("");
            setFormCompanyPickerVisible(false);
          }}
        >
          <Text
            style={[
              styles.pickerOptionText,
              { fontWeight: "bold" },
              showNewCompany && styles.pickerOptionTextActive,
            ]}
          >
            + New Company
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pickerOption,
            !form.company_id && !showNewCompany && styles.pickerOptionActive,
          ]}
          onPress={() => {
            setForm((f) => ({ ...f, company_id: "" }));
            setShowNewCompany(false);
            setNewCompanyName("");
            setFormCompanyPickerVisible(false);
          }}
        >
          <Text
            style={[
              styles.pickerOptionText,
              !form.company_id &&
                !showNewCompany &&
                styles.pickerOptionTextActive,
            ]}
          >
            None
          </Text>
        </TouchableOpacity>
        {companies.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.pickerOption,
              form.company_id === c.id.toString() &&
                !showNewCompany &&
                styles.pickerOptionActive,
            ]}
            onPress={() => {
              setForm((f) => ({ ...f, company_id: c.id.toString() }));
              setShowNewCompany(false);
              setNewCompanyName("");
              setFormCompanyPickerVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                form.company_id === c.id.toString() &&
                  !showNewCompany &&
                  styles.pickerOptionTextActive,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </PickerBottomSheet>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
  headerFilter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fff",
    marginRight: 12,
  },
  headerFilterText: { fontSize: 13, color: "#374151" },
  headerFilterChevron: { fontSize: 14, color: "#6b7280", marginLeft: 4 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.5,
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginRight: 12,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerOptionActive: { backgroundColor: "#eff6ff" },
  pickerOptionText: { fontSize: 15, color: "#374151" },
  pickerOptionTextActive: { color: "#2563eb", fontWeight: "600" },
  list: { flex: 1, paddingHorizontal: 12 },
  dateSeparator: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 4,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
    letterSpacing: 0.3,
  },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 40, fontSize: 14 },
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dialogTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 12,
  },
  dialogBody: { padding: 16, maxHeight: SCREEN_HEIGHT * 0.55 },
  dialogFooter: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  formLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: { height: 60, textAlignVertical: "top" },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 6,
    backgroundColor: "#fff",
  },
  typeChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  typeChipText: { fontSize: 13, color: "#374151" },
  formDropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  formDropdownDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  formDropdownText: { fontSize: 14, color: "#374151", flex: 1 },
  pickerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    flexShrink: 0,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  eventViewMeta: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  eventViewDesc: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    lineHeight: 24,
  },
  ghostBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  ghostBtnText: { color: "#374151", fontWeight: "600", fontSize: 14 },
});
