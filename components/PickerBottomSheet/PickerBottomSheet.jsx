import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { styles } from "./PickerBottomSheet.styles";

export function PickerBottomSheet({ visible, onClose, title, children }) {
  const [mounted, setMounted] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
        overlayOpacity.setValue(0);
        translateY.setValue(500);
      });
    }
  }, [visible]);

  return (
    <Modal
      visible={mounted}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView>{children}</ScrollView>
      </Animated.View>
    </Modal>
  );
}
