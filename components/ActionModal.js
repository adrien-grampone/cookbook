import React, {useEffect, useRef} from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../styles/theme';

const ActionModal = ({ visible, onClose, title, actions }) => {
    const backgroundAnim = useRef(new Animated.Value(0)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(backgroundAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            Animated.spring(modalAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
            }).start();
        } else {
            Animated.timing(backgroundAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            Animated.spring(modalAnim, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.modalOverlay, { opacity: backgroundAnim }]}>
                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [300, 0]
                            }) }] }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={onClose}
                            >
                                <Icon name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            {actions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.actionButton}
                                    onPress={action.onPress}
                                >
                                    <Icon name={action.icon} size={22} color={action.color || "#000"} />
                                    <Text style={styles.actionText}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        maxHeight: '70%',
        paddingBottom: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    modalCloseButton: {
        padding: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        color: COLORS.text,
        gap: 12,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    actionText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
});

export default ActionModal;