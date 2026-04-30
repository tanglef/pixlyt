import React, { useRef } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions, PanResponder,
  Animated, TouchableOpacity
} from 'react-native';
import { colors, radius } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_VELOCITY = 0.3;

interface SwipeCardProps {
  uri: string;
  mediaType: 'photo' | 'video';
  filename: string;
  creationTime: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSkip: () => void;
}

export default function SwipeCard({
  uri, mediaType, filename, creationTime, onSwipeLeft, onSwipeRight, onSkip
}: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const deleteOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const keepOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD || gesture.vx > SWIPE_VELOCITY) {
        swipeOut('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -SWIPE_VELOCITY) {
        swipeOut('left');
      } else {
        resetPosition();
      }
    },
  })).current;

  const swipeOut = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      if (direction === 'right') onSwipeRight();
      else onSwipeLeft();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const dateStr = new Date(creationTime).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />

        {/* Delete hint overlay */}
        <Animated.View style={[styles.hintLeft, { opacity: deleteOpacity }]}>
          <Text style={styles.hintTextLeft}>DELETE</Text>
        </Animated.View>

        {/* Keep hint overlay */}
        <Animated.View style={[styles.hintRight, { opacity: keepOpacity }]}>
          <Text style={styles.hintTextRight}>KEEP</Text>
        </Animated.View>

        {/* Video badge */}
        {mediaType === 'video' && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>▶ Video</Text>
          </View>
        )}

        {/* Meta info bar */}
        <View style={styles.metaBar}>
          <Text style={styles.metaDate}>{dateStr}</Text>
          <Text style={styles.metaFile} numberOfLines={1}>{filename}</Text>
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => swipeOut('left')}>
          <Text style={styles.btnDeleteText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSkip]} onPress={onSkip}>
          <Text style={styles.btnSkipText}>—</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnKeep]} onPress={() => swipeOut('right')}>
          <Text style={styles.btnKeepText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  card: {
    width: SCREEN_WIDTH - 32,
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderPink,
    elevation: 3,
    shadowColor: '#c090b0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  image: { width: '100%', height: '100%' },
  hintLeft: {
    position: 'absolute', left: 16, top: '40%',
    backgroundColor: '#fce8e8', borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 2, borderColor: '#d46060',
    transform: [{ rotate: '-15deg' }],
  },
  hintTextLeft: { color: '#c04040', fontWeight: '800', fontSize: 18, letterSpacing: 2 },
  hintRight: {
    position: 'absolute', right: 16, top: '40%',
    backgroundColor: '#e8f5ec', borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 2, borderColor: '#60a070',
    transform: [{ rotate: '15deg' }],
  },
  hintTextRight: { color: '#408050', fontWeight: '800', fontSize: 18, letterSpacing: 2 },
  videoBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(80,60,100,0.8)',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  videoBadgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  metaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(253,246,249,0.92)',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: colors.borderPink,
  },
  metaDate: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  metaFile: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  actions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 20, paddingVertical: 16,
  },
  btn: {
    borderRadius: radius.full, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  btnDelete: { width: 56, height: 56, borderColor: '#e0a0a0' },
  btnDeleteText: { color: colors.accentRed, fontSize: 22, fontWeight: '500' },
  btnSkip: { width: 40, height: 40, borderColor: colors.borderPink },
  btnSkipText: { color: colors.textMuted, fontSize: 18 },
  btnKeep: { width: 56, height: 56, borderColor: '#a0d0b0' },
  btnKeepText: { color: colors.accentGreen, fontSize: 22, fontWeight: '500' },
});
