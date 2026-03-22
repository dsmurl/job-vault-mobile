import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import {
  useFocusEffect,
  useNavigation,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  Star,
  Trash2,
  Plus,
  X,
  Pencil,
  Archive,
  ArchiveRestore,
  CalendarDays,
  List,
} from "lucide-react-native";
import { companiesApi } from "../utils/db";
import { useFilter } from "./_layout";

const EVENT_TYPE_COLOR = "#2563eb";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    contact_name: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const { setSelectedCompany } = useFilter();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Plus size={16} color="#2563eb" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchCompanies = async () => {
    try {
      const data = await companiesApi.getAll();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompanies();
    }, []),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "jobVaultRefresh",
      fetchCompanies,
    );
    return () => sub.remove();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, form);
      } else {
        await companiesApi.create(form);
      }
      setForm({ name: "", url: "", contact_name: "", notes: "" });
      setEditingCompany(null);
      setShowForm(false);
      await fetchCompanies();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEditStart = (company) => {
    setEditingCompany(company);
    setForm({
      name: company.name || "",
      url: company.url || "",
      contact_name: company.contact_name || "",
      notes: company.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Company", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await companiesApi.delete(id);
            await fetchCompanies();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleStarChange = async (company, rating) => {
    if (company.archived) return;
    const newRating = company.star_rating === rating ? rating - 1 : rating;
    try {
      await companiesApi.update(company.id, { star_rating: newRating });
      await fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchiveToggle = async (company) => {
    try {
      await companiesApi.update(company.id, { archived: !company.archived });
      await fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {companies.length === 0 && (
          <Text style={styles.empty}>
            No companies yet. Add one to get started.
          </Text>
        )}
        {companies.map((c) => (
          <View
            key={c.id}
            style={[styles.companyCard, c.archived && styles.archivedCard]}
          >
            <View style={styles.companyFilterActions}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCompany(c.id.toString());
                  router.push({ pathname: "/calendar" });
                }}
                style={styles.editBtn}
              >
                <CalendarDays size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCompany(c.id.toString());
                  router.push({ pathname: "/events" });
                }}
                style={styles.editBtn}
              >
                <List size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.companyMain}>
              <Text
                style={[styles.companyName, c.archived && styles.archivedText]}
              >
                {c.name}
              </Text>
              {!!c.url && <Text style={styles.companyMeta}>{c.url}</Text>}
              {!!c.contact_name && (
                <Text style={styles.companyMeta}>
                  Contact: {c.contact_name}
                </Text>
              )}
              {!!c.notes && <Text style={styles.companyNotes}>{c.notes}</Text>}
            </View>
            <View style={styles.companyActions}>
              <StarRating
                value={c.star_rating}
                onChange={(r) => handleStarChange(c, r)}
                disabled={c.archived}
              />
              <View style={styles.iconActions}>
                <TouchableOpacity
                  onPress={() => handleArchiveToggle(c)}
                  style={styles.editBtn}
                >
                  {c.archived ? (
                    <ArchiveRestore size={16} color="#6b7280" />
                  ) : (
                    <Archive size={16} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEditStart(c)}
                  style={styles.editBtn}
                >
                  <Pencil size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(c.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleMedium">
              {editingCompany ? "Edit Company" : "Add Company"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowForm(false);
                setEditingCompany(null);
                setForm({ name: "", url: "", contact_name: "", notes: "" });
              }}
            >
              <X size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.input}
              placeholder="Company name *"
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={form.url}
              onChangeText={(t) => setForm((f) => ({ ...f, url: t }))}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contact name"
              value={form.contact_name}
              onChangeText={(t) => setForm((f) => ({ ...f, contact_name: t }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              value={form.notes}
              onChangeText={(t) => setForm((f) => ({ ...f, notes: t }))}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCreate}
              disabled={saving}
            >
              <Text style={styles.primaryBtnText}>
                {saving
                  ? "Saving..."
                  : editingCompany
                    ? "Update Company"
                    : "Save Company"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const StarRating = ({ value, onChange, disabled = false }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
      <TouchableOpacity
        key={n}
        onPress={() => !disabled && onChange(n)}
        disabled={disabled}
      >
        <Star
          size={18}
          fill={n <= value ? (disabled ? "#9ca3af" : "#f59e0b") : "none"}
          color={n <= value ? (disabled ? "#9ca3af" : "#f59e0b") : "#d1d5db"}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginRight: 12,
  },
  addBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  list: { flex: 1, padding: 12 },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 40, fontSize: 14 },
  companyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  companyFilterActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 1,
  },
  archivedCard: {
    opacity: 0.6,
    backgroundColor: "#f9fafb",
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },
  archivedText: {
    color: "#6b7280",
  },
  companyMain: { marginBottom: 10 },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    paddingRight: 60,
  },
  companyMeta: { fontSize: 13, color: "#6b7280", marginTop: 1 },
  companyNotes: {
    fontSize: 13,
    color: "#374151",
    fontStyle: "italic",
    marginTop: 4,
  },
  companyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalBody: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  primaryBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
