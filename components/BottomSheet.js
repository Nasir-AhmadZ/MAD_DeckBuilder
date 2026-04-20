import React, { useEffect, useRef } from 'react';
import {
  View, Modal, Animated, PanResponder, Dimensions,
  TouchableOpacity, StyleSheet,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BottomSheet({ visible, onDismiss, children }) {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const resetAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const dismissAnim = Animated.timing(panY, {
    toValue: SCREEN_HEIGHT,
    duration: 500,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        if (gs.vy > 2 || gs.dy > 100) {
          dismissAnim.start(onDismiss);
        } else {
          resetAnim.start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(SCREEN_HEIGHT);
      resetAnim.start();
    }
  }, [visible]);

  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  function handleDismiss() {
    dismissAnim.start(onDismiss);
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={handleDismiss} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.dragHandle} {...panResponder.panHandlers} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#2a2a4a',
    padding: 24,
    paddingTop: 12,
    maxHeight: '60%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a4a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
