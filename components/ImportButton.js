import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useRecipes } from '../context/RecipeContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../styles/theme';
import { generateRecipe } from "../utils/openai";
import axios from "axios";

const ImportButton = () => {
    const [visible, setVisible] = useState(false);
    const [showTiktokInput, setShowTiktokInput] = useState(false);
    const [tiktokUrl, setTiktokUrl] = useState('');
    const { handleSaveRecipe, setLoading } = useRecipes();

    const showModal = () => {
        setVisible(true);
        setShowTiktokInput(false);
    };

    const hideModal = () => {
        setVisible(false);
        setTiktokUrl('');
    };

    const handleImportFile = async () => {
        hideModal();
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
        if (result.type === 'success') {
            await StorageService.importRecipesFromFile(result.uri);
        }
    };

    const handleImportTikTok = async () => {
        if (!showTiktokInput) {
            setShowTiktokInput(true);
        } else if (!tiktokUrl.trim()) {
            alert('Veuillez entrer une URL TikTok valide.');
        } else {
            Alert.alert(
                'Attention',
                "La recette importée depuis TikTok peut comporter des erreurs ou des données inventées si des informations sont manquantes. Veuillez vérifier la recette après son import.",
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'OK',
                        onPress: async () => {
                            try {
                                setLoading(true);  // Start loading
                                const videoId = tiktokUrl.split('/').filter(Boolean).pop();
                                const response = await axios.get('https://tiktok-api23.p.rapidapi.com/api/post/detail', {
                                    params: { videoId },
                                    headers: {
                                        'x-rapidapi-key': '888b40bdafmsh5edb1371b01fc2dp17158djsn11b523888675',
                                        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
                                    }
                                });

                                const description = response.data.itemInfo.itemStruct.desc;
                                const recipe = await generateRecipe(description);
                                handleSaveRecipe(recipe, false);
                            } catch (error) {
                                console.error(error);
                            } finally {
                                setLoading(false);  // Stop loading
                                hideModal();
                            }
                        }
                    }
                ]
            );
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.importButton} onPress={showModal}>
                <Icon name="compare-arrows" size={28} color="#fff" />
            </TouchableOpacity>

            {visible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Importer une recette</Text>
                            <TouchableOpacity onPress={hideModal} style={styles.modalCloseButton}>
                                <Icon name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.actionButton} onPress={handleImportFile}>
                            <Icon name="file-upload" size={24} color={COLORS.text} />
                            <Text style={styles.actionText}>Depuis un fichier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleImportTikTok}>
                            <Icon name="file-upload" size={24} color={COLORS.text} />
                            <Text style={styles.actionText}>Importer depuis TikTok</Text>
                        </TouchableOpacity>

                        {showTiktokInput && (
                            <TextInput
                                style={styles.input}
                                placeholder="Entrez l'URL TikTok"
                                placeholderTextColor={COLORS.textSecondary}
                                value={tiktokUrl}
                                onChangeText={setTiktokUrl}
                            />
                        )}
                    </View>
                </View>
            )}

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
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    modalContent: {
        paddingTop: SPACING.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
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
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 12,
    },
    actionText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    input: {
        marginTop: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
    },
});

export default ImportButton;
