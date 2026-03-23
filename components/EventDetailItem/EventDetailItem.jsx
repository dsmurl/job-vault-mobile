import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Pencil, Trash2, Eye } from "lucide-react-native";
import { format } from "date-fns";
import { parseEventTime } from "../../utils/time";
import { styles } from "./EventDetailItem.styles";

export const EVENT_TYPES = [
  { value: "applied", label: "Applied", color: "#f59e0b" },
  { value: "phone_screen", label: "Phone Screen", color: "#7c3aed" },
  { value: "technical_screen", label: "Technical Screen", color: "#2563eb" },
  { value: "interview", label: "Interview", color: "#0891b2" },
  { value: "offer", label: "Offer", color: "#16a34a" },
  { value: "rejection", label: "Rejection", color: "#dc2626" },
  { value: "other", label: "Other", color: "#6b7280" },
];

export const EMOJI_OPTIONS = [
  { label: "happy", emoji: "😊", color: "#16a34a" },
  { label: "sad", emoji: "😢", color: "#dc2626" },
  { label: "check mark", emoji: "✅", color: "#22c55e" },
  { label: "eyes", emoji: "👀", color: "#3b82f6" },
  { label: "skull", emoji: "💀", color: "#4b5563" },
  { label: "star", emoji: "⭐", color: "#eab308" },
  { label: "flag", emoji: "🚩", color: "#ef4444" },
];

export const eventTypeColor = (type, isArchived = false) => {
  const baseColor =
    EVENT_TYPES.find((t) => t.value === type)?.color || "#6b7280";
  return isArchived ? `${baseColor}80` : baseColor;
};
export const eventTypeLabel = (type) =>
  EVENT_TYPES.find((t) => t.value === type)?.label || type;

export function EventDetailItem({ event, onEdit, onDelete, onView }) {
  const d = parseEventTime(event.start_time);
  const isArchived = event.company?.archived;
  return (
    <View style={[styles.eventItem, isArchived && styles.archivedItem]}>
      <View
        style={[
          styles.eventDot,
          { backgroundColor: eventTypeColor(event.event_type, isArchived) },
        ]}
      />
      <View style={styles.eventDetails}>
        <View style={styles.eventTitleRow}>
          <Text style={[styles.eventTitle, isArchived && styles.archivedText]}>
            {event.title}
          </Text>
          {!!event.selected_emoji && (
            <Text style={styles.eventEmoji}>
              {
                EMOJI_OPTIONS.find((e) => e.label === event.selected_emoji)
                  ?.emoji
              }
            </Text>
          )}
        </View>
        <Text style={styles.eventMeta}>
          {format(d, "h:mm a")}
          {event.end_time
            ? ` – ${format(parseEventTime(event.end_time), "h:mm a")}`
            : ""}
          {" · "}
          {eventTypeLabel(event.event_type)}
          {event.company ? ` · ${event.company.name}` : ""}
        </Text>
        {!!event.description && (
          <Text style={styles.eventDesc} numberOfLines={1}>
            {event.description}
          </Text>
        )}
      </View>
      <View style={styles.eventActions}>
        {onView && (
          <TouchableOpacity
            onPress={() => onView(event)}
            style={styles.iconBtn}
          >
            <Eye size={15} color="#6b7280" />
          </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(event)}
            style={styles.iconBtn}
          >
            <Pencil size={15} color="#6b7280" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(event.id)}
            style={styles.iconBtn}
          >
            <Trash2 size={15} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
