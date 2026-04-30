import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, radius } from '../utils/theme';

const { width } = Dimensions.get('window');

interface ToastProps {
  message: string | null;
  onHide: () => void;
}

export default function Toast({ message, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!message) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 6 }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -10, duration: 400, useNativeDriver: true }),
        ]).start(() => {
          onHide();
          translateY.setValue(20);
        });
      }, 2800);
    });
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', top: 100, alignSelf: 'center',
    backgroundColor: colors.bgSecondary, borderRadius: radius.full,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 0.5, borderColor: colors.borderPink,
    elevation: 10, zIndex: 100,
    shadowColor: '#c090b0', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 8,
    maxWidth: width - 48,
  },
  text: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, textAlign: 'center' },
});
