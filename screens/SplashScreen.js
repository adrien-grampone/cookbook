import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import {COLORS} from '../styles/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
    const navigation = useNavigation();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Animation zoom + fondu
        scale.value = withTiming(5, { duration: 1000 });
        opacity.value = withDelay(500, withTiming(0, { duration: 500 }));

        // Redirection après animation
        setTimeout(() => {
            navigation.replace('Home'); // Remplace 'Home' par ton écran principal
        }, 1500);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../assets/icon.png')} // Remplace par ton logo
                style={[styles.logo, animatedStyle]}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: width * 0.5,
        height: height * 0.2,
    },
});

export default SplashScreen;
