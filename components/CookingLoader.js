import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import {COLORS} from "../styles/theme";

const CookingLoader = ({ visible, progress }) => {
    const animatedProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 300, // Animation fluide
            easing: Easing.linear,
            useNativeDriver: false
        }).start();
    }, [progress]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <LottieView source={require('../assets/cooking.json')} autoPlay loop style={styles.animation} />
                <Text style={styles.text}>Importation en cours...</Text>

                {/* Barre de chargement dynamique */}
                <View style={styles.progressBar}>
                    <Animated.View style={[styles.progressFill, { width: animatedProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                        }) }]} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    animation: {
        width: 200,
        height: 200
    },
    text: {
        marginTop: 20,
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    },
    progressBar: {
        width: 200,
        height: 10,
        backgroundColor: COLORS.accent,
        borderRadius: 5,
        marginTop: 20,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary
    }
});

export default CookingLoader;