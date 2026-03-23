import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import {
  Pencil,
  Trash2,
  Eye,
  Smile,
  Frown,
  Check,
  Skull,
  Star as StarIcon,
  Flag,
  Glasses,
} from "lucide-react-native";
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

export const MARKER_OPTIONS = [
  { label: "happy", color: "#16a34a", icon: Smile },
  { label: "sad", color: "#dc2626", icon: Frown },
  { label: "check mark", color: "#22c55e", icon: Check },
  { label: "eyes", color: "#3b82f6", icon: Glasses },
  { label: "skull", color: "#4b5563", icon: Skull },
  { label: "star", color: "#eab308", icon: StarIcon },
  { label: "flag", color: "#ef4444", icon: Flag },
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
            <View style={styles.eventEmoji}>
              {(() => {
                const option = MARKER_OPTIONS.find(
                  (e) => e.label === event.selected_emoji,
                );
                if (!option) return null;
                const IconComp = option.icon;
                return <IconComp size={16} color={option.color || "#6b7280"} />;
              })()}
            </View>
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
