import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PickerBottomSheet({ visible, onClose, title, children }) {
  const [mounted, setMounted] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 500, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        overlayOpacity.setValue(0);
        translateY.setValue(500);
      });
    }
  }, [visible]);

  return (
    <Modal visible={mounted} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="auto">
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.5,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
});
