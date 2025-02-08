// components/Feedback.js
import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../styles/theme';

export const Toast = ({ message, type = 'info', duration = 3000, onHide }) => {
    const opacity = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide?.();
        });
    }, []);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return COLORS.success;
            case 'error':
                return COLORS.error;
            case 'warning':
                return COLORS.warning;
            default:
                return COLORS.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity,
                    backgroundColor: getBackgroundColor(),
                },
            ]}
        >
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

export const LoadingView = ({ message = 'Chargement...' }) => (
    <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: SPACING.md,
        right: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        ...TYPOGRAPHY.body,
        color: COLORS.card,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
    },
});