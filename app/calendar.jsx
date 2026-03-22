import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
  Keyboard,
  InteractionManager,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import {
  useFocusEffect,
  useNavigation,
  useLocalSearchParams,
} from "expo-router";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isFuture,
} from "date-fns";
import {
  parseEventTime,
  localInputToUTC,
  utcToLocalInput,
} from "../utils/time";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  CalendarDays,
} from "lucide-react-native";
import { companiesApi, calendarEventsApi } from "../utils/db";
import EventDetailItem, {
  eventTypeColor,
  eventTypeLabel,
  EVENT_TYPES,
  EMOJI_OPTIONS,
} from "../components/EventDetailItem";
import PickerBottomSheet from "../components/PickerBottomSheet";
import { useFilter } from "./_layout";

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySheetVisible, setDaySheetVisible] = useState(false);
  const [sheetModalMounted, setSheetModalMounted] = useState(false);
  const daySheetVisibleRef = useRef(daySheetVisible);
  useEffect(() => {
    daySheetVisibleRef.current = daySheetVisible;
  }, [daySheetVisible]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    event_type: "other",
    company_id: "",
    selected_emoji: "",
  });
  const [saving, setSaving] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [eventTypePickerVisible, setEventTypePickerVisible] = useState(false);
  const [companyPickerVisible, setCompanyPickerVisible] = useState(false);
  const [filterCompanyPickerVisible, setFilterCompanyPickerVisible] =
    useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const { selectedCompany, setSelectedCompany } = useFilter();
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.headerFilter}
            onPress={() => setFilterCompanyPickerVisible(true)}
          >
            <Text style={styles.headerFilterText}>
              {selectedCompany
                ? companies.find((c) => c.id.toString() === selectedCompany)
                    ?.name || "All Companies"
                : "All Companies"}
            </Text>
            <ChevronDown size={14} color="#6b7280" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAddForm}>
            <Plus size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, selectedCompany, companies, openAddForm]);

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

  const handleDayPress = (day) => {
    if (formDialogVisible || viewingEvent || saving) return;
    setSelectedDay(day);
    setEditingEvent(null);
    setSheetModalMounted(true);
    setDaySheetVisible(true);
    daySheetVisibleRef.current = true;
  };

  const [formDialogVisible, setFormDialogVisible] = useState(false);

  const sheetOverlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  const closeDaySheet = () => setDaySheetVisible(false);

  useEffect(() => {
    if (daySheetVisible) {
      Animated.parallel([
        Animated.timing(sheetOverlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (sheetModalMounted) {
      Animated.parallel([
        Animated.timing(sheetOverlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 600,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !daySheetVisibleRef.current) {
          setSheetModalMounted(false);
          sheetOverlayOpacity.setValue(0);
          sheetTranslateY.setValue(600);
        }
      });
    }
  }, [daySheetVisible]);

  const openAddForm = useCallback(() => {
    Keyboard.dismiss();
    setEditingEvent(null);
    setShowNewCompany(false);
    setNewCompanyName("");
    setFormErrors({});
    const baseDay = selectedDay || new Date();
    setForm({
      title: "",
      description: "",
      start_time: format(baseDay, "yyyy-MM-dd") + "T09:00",
      end_time: "",
      event_type: "other",
      company_id: selectedCompany || "",
      selected_emoji: "",
    });
    setDaySheetVisible(false);
    daySheetVisibleRef.current = false;
    setSheetModalMounted(false);
    setFormDialogVisible(true);
  }, [selectedDay, selectedCompany]);

  const openEditForm = (event) => {
    Keyboard.dismiss();
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
      selected_emoji: event.selected_emoji || "",
    });
    setDaySheetVisible(false);
    daySheetVisibleRef.current = false;
    setSheetModalMounted(false);
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
        await fetchAll();
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
      if (editingEvent) {
        await calendarEventsApi.update(editingEvent.id, payload);
      } else {
        await calendarEventsApi.create(payload);
      }
      setFormDialogVisible(false);
      setDaySheetVisible(false);
      daySheetVisibleRef.current = false;
      setSheetModalMounted(false);
      setEditingEvent(null);
      InteractionManager.runAfterInteractions(() => {
        fetchAll();
      });
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

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = start.getDay();
  const filteredEvents = selectedCompany
    ? events.filter((e) => e.company?.id === parseInt(selectedCompany))
    : events;
  const selectedDayEvents = selectedDay
    ? filteredEvents.filter((e) =>
        isSameDay(parseEventTime(e.start_time), selectedDay),
      )
    : [];

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  const today = new Date();
  const isCurrentMonth = isSameDay(
    startOfMonth(currentDate),
    startOfMonth(today),
  );

  return (
    <View style={styles.container}>
      {/* Month nav */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          onPress={() => setCurrentDate((d) => subMonths(d, 1))}
          style={styles.navBtn}
        >
          <ChevronLeft size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.monthCenter}>
          <Text style={styles.monthLabel}>
            {format(currentDate, "MMMM yyyy")}
          </Text>
          {!isCurrentMonth && (
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => setCurrentDate(new Date())}
            >
              <CalendarDays size={12} color="#2563eb" />
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setCurrentDate((d) => addMonths(d, 1))}
          style={styles.navBtn}
        >
          <ChevronRight size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
          <Text key={i} style={styles.dayHeaderText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView>
        <View style={styles.grid}>
          {Array(startPad)
            .fill(null)
            .map((_, i) => (
              <View key={`pad-${i}`} style={styles.dayCell} />
            ))}
          {days.map((day) => {
            const dayEvents = filteredEvents.filter((e) =>
              isSameDay(parseEventTime(e.start_time), day),
            );
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <TouchableOpacity
                key={day.toString()}
                style={[styles.dayCell, isSelected && styles.selectedCell]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dayNumWrapper,
                    isToday && styles.todayNumWrapper,
                    isSelected && styles.selectedNumWrapper,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      isWeekend && styles.weekendNum,
                      isToday && styles.todayNum,
                      isSelected && styles.selectedNum,
                    ]}
                  >
                    {format(day, "d")}
                  </Text>
                </View>
                <View style={styles.dotRow}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <View
                      key={e.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: eventTypeColor(
                            e.event_type,
                            e.company?.archived,
                          ),
                        },
                      ]}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <View
                      style={[styles.dot, { backgroundColor: "#9ca3af" }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Day Sheet (bottom sheet) */}
      {sheetModalMounted && (
        <View style={StyleSheet.absoluteFill} pointerEvents={daySheetVisible ? "auto" : "none"}>
          <Animated.View
            style={[styles.overlay, { opacity: sheetOverlayOpacity }]}
            pointerEvents={daySheetVisible ? "auto" : "none"}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closeDaySheet}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: sheetTranslateY }],
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            pointerEvents={daySheetVisible ? "auto" : "none"}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedDay ? format(selectedDay, "EEEE, MMMM d") : ""}
              </Text>
              <TouchableOpacity onPress={closeDaySheet}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {selectedDayEvents.length === 0 && (
                <Text style={styles.empty}>No events on this day</Text>
              )}
              {selectedDayEvents.map((e) => (
                <EventDetailItem
                  key={e.id}
                  event={e}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onView={setViewingEvent}
                />
              ))}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.sheetAddBtn}
                onPress={openAddForm}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* View Event Description Modal */}
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

      {/* Event Form Dialog */}
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
              <Text style={styles.dialogTitle}>
                {editingEvent ? "Edit Event" : "New Event"}
              </Text>
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

              <View style={styles.emojiPickerContainer}>
                {EMOJI_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.emojiBtn,
                      form.selected_emoji === opt.label && {
                        borderColor: opt.color,
                        backgroundColor: "#fff",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 1,
                        elevation: 1,
                      },
                    ]}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        selected_emoji:
                          f.selected_emoji === opt.label ? "" : opt.label,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.emojiText,
                        form.selected_emoji !== opt.label &&
                          styles.emojiTextInactive,
                      ]}
                    >
                      {opt.emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Event Type</Text>
              <TouchableOpacity
                style={styles.formDropdown}
                onPress={() => setEventTypePickerVisible(true)}
              >
                <Text style={styles.formDropdownText}>
                  {EVENT_TYPES.find((t) => t.value === form.event_type)
                    ?.label || "Select type"}
                </Text>
                <ChevronDown size={16} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.formLabel}>Company (optional)</Text>
              <TouchableOpacity
                style={styles.formDropdown}
                onPress={() => setCompanyPickerVisible(true)}
              >
                <Text style={styles.formDropdownText}>
                  {showNewCompany
                    ? "+ New Company"
                    : form.company_id
                      ? companies.find(
                          (c) => c.id.toString() === form.company_id,
                        )?.name || "Select company"
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
                  {saving ? "Saving..." : editingEvent ? "Update" : "Add Event"}
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

      {/* Filter Company Picker */}
      <PickerBottomSheet
        visible={filterCompanyPickerVisible}
        onClose={() => setFilterCompanyPickerVisible(false)}
        title="Filter by Company"
      >
        <TouchableOpacity
          style={[
            styles.pickerOption,
            !selectedCompany && styles.pickerOptionActive,
          ]}
          onPress={() => {
            setSelectedCompany("");
            setFilterCompanyPickerVisible(false);
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
              !!c.archived && styles.pickerOptionArchived,
            ]}
            onPress={() => {
              setSelectedCompany(c.id.toString());
              setFilterCompanyPickerVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                selectedCompany === c.id.toString() &&
                  styles.pickerOptionTextActive,
                !!c.archived && styles.pickerOptionTextArchived,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </PickerBottomSheet>

      {/* Company Picker */}
      <PickerBottomSheet
        visible={companyPickerVisible}
        onClose={() => setCompanyPickerVisible(false)}
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
            setCompanyPickerVisible(false);
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
            setCompanyPickerVisible(false);
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
              !!c.archived && styles.pickerOptionArchived,
            ]}
            onPress={() => {
              setForm((f) => ({ ...f, company_id: c.id.toString() }));
              setShowNewCompany(false);
              setNewCompanyName("");
              setCompanyPickerVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                form.company_id === c.id.toString() &&
                  !showNewCompany &&
                  styles.pickerOptionTextActive,
                !!c.archived && styles.pickerOptionTextArchived,
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  addBtn: {
    padding: 8,
    marginRight: 4,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthCenter: { alignItems: "center", gap: 4 },
  navBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },
  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
    letterSpacing: 0.3,
  },
  dayHeaders: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 6, paddingTop: 8 },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    padding: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  selectedCell: {},
  dayNumWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  todayNumWrapper: {
    backgroundColor: "#2563eb",
  },
  selectedNumWrapper: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  dayNum: { fontSize: 14, color: "#374151", fontWeight: "500" },
  weekendNum: { color: "#64748b" },
  todayNum: { color: "#fff", fontWeight: "800" },
  selectedNum: { color: "#1d4ed8", fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 2, marginTop: 1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sheetBody: { padding: 16, maxHeight: SCREEN_HEIGHT * 0.55 },
  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  sheetAddBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    alignSelf: "stretch",
  },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 20, fontSize: 14 },
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
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  emojiPickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emojiBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emojiText: {
    fontSize: 20,
  },
  emojiTextInactive: {
    opacity: 0.4,
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
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  formDropdownText: { fontSize: 14, color: "#374151" },
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
    paddingBottom: 24,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerOptionActive: { backgroundColor: "#eff6ff" },
  pickerOptionArchived: { opacity: 0.5 },
  pickerOptionText: { fontSize: 14, color: "#374151" },
  pickerOptionTextActive: { color: "#2563eb", fontWeight: "600" },
  pickerOptionTextArchived: { color: "#9ca3af" },
  formActions: { flexDirection: "row", gap: 8, marginTop: 4 },
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
});
