import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  eventItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  eventDetails: { flex: 1 },
  eventTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventEmoji: { fontSize: 16 },
  eventTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  eventMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  eventDesc: { fontSize: 13, color: "#374151", marginTop: 3 },
  eventActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 4 },
  archivedItem: {
    opacity: 0.7,
    backgroundColor: "#fdfdfd",
    borderColor: "#eee",
    borderWidth: 1,
  },
  archivedText: {
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
});
