import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService } from '../utils/storage';
import { useRecipes } from '../context/RecipeContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../styles/theme';
import axios from "axios";
import { generateRecipe } from "../utils/openai";
import ActionModal from "./ActionModal";

const ImportButton = () => {
    const [visible, setVisible] = useState(false);
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [showTiktokInput, setShowTiktokInput] = useState(false);
    const { refreshRecipes, handleSaveRecipe } = useRecipes();
    const backgroundAnim = useRef(new Animated.Value(0)).current;
    const modalAnim = useRef(new Animated.Value(300)).current;

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

    const showModal = () => {
        setVisible(true);
        setShowTiktokInput(false);
    };

    const hideModal = () => setVisible(false);

    const handleImportFile = async () => {
        hideModal();
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
        if (result.type === 'success') {
            const success = await StorageService.importRecipesFromFile(result.uri);
            success ? alert('Importation réussie !') : alert("Erreur lors de l'importation.");
            refreshRecipes();
        }
    };

    const handleImportTikTok = () => {
        if (!showTiktokInput) {
            setShowTiktokInput(true);
        } else if (!tiktokUrl.trim()) {
            alert('Veuillez entrer une URL TikTok valide.');
        } else {
            hideModal();
            alert(`Importation depuis TikTok : ${tiktokUrl}`);
            setTiktokUrl('');
        }
    };

    const fetchTikTokDescription = async () => {
        const url = tiktokUrl;
        const videoId = url.split('/').pop();

        const options = {
            method: 'GET',
            url: 'https://tiktok-api23.p.rapidapi.com/api/post/detail',
            params: { videoId: videoId },
            headers: {
                'x-rapidapi-key': '888b40bdafmsh5edb1371b01fc2dp17158djsn11b523888675',
                'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            const desc = response.data.itemInfo.itemStruct.desc;
            const recipe = await generateRecipe(desc);
            handleSaveRecipe(recipe, false);
        } catch (error) {
            console.error(error);
        }
    };

    const endLongPressAnimation = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 2
        }).start();
    };

    return (
        <View>
            <TouchableOpacity style={styles.importButton} onPress={showModal}>
                <Icon name="compare-arrows" size={28} color="#fff" />
            </TouchableOpacity>

            <ActionModal
                visible={visible}
                onClose={hideModal}
                title="Importer une recette"
                actions={[
                    { label: 'Depuis un fichier', icon: 'file-upload', onPress: handleImportFile },
                    { label: 'Importer depuis TikTok', icon: 'file-upload', onPress: handleImportTikTok },
                ]}
            />

            {/* <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={hideModal}>
                        <Animated.View style={[styles.modalOverlay, { opacity: backgroundAnim }]}>
                            <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalAnim }] }]}>
                                <Text style={styles.modalTitle}>Importer une recette</Text>
                                {!showTiktokInput ? (
                                    <Button mode="contained" onPress={handleImportFile} style={styles.modalButton} icon="file-upload" labelStyle={styles.buttonText}>
                                        Depuis un fichier
                                    </Button>
                                ) : null}
                                {!showTiktokInput ? (
                                    <Button mode="contained" onPress={handleImportTikTok} style={styles.modalButton} icon="video" labelStyle={styles.buttonText}>
                                        Importer depuis TikTok
                                    </Button>
                                ) : (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Entrer l'URL TikTok"
                                            placeholderTextColor={COLORS.textLight}
                                            value={tiktokUrl}
                                            onChangeText={setTiktokUrl}
                                        />
                                        <Button mode="contained" onPress={fetchTikTokDescription} style={styles.modalButton} icon="check">
                                            Confirmer l'importation
                                        </Button>
                                    </>
                                )}
                            </Animated.View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Modal>
            </Portal>*/}
        </View>
    );
};

const styles = StyleSheet.create({
    importButton: {
        position: 'absolute',
        bottom: SPACING.lg,
        left: SPACING.lg,
        backgroundColor: COLORS.accent,
        width: 56,
        height: 56,
        borderRadius: RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
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
    buttonText: {
        ...TYPOGRAPHY.body,
    },
    input: {
        width: '100%',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        marginTop: SPACING.md,
    },
});

export default ImportButton;