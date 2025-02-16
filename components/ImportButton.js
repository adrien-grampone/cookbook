import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService } from '../utils/storage';
import { useRecipes } from '../context/RecipeContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../styles/theme';

const ImportButton = () => {
    const [visible, setVisible] = useState(false);
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [showTiktokInput, setShowTiktokInput] = useState(false);
    const { refreshRecipes } = useRecipes();
    const scaleAnim = new Animated.Value(0.8);

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

    return (
        <View>
            <TouchableOpacity style={styles.importButton} onPress={showModal}>
                <Icon name="file-download" size={28} color="#fff" />
            </TouchableOpacity>

            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                    <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
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
                                <Button mode="contained" onPress={handleImportTikTok} style={styles.modalButton} icon="check">
                                    Confirmer l'importation
                                </Button>
                            </>
                        )}
                    </Animated.View>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    importButton: {
        position: 'absolute',
        bottom: SPACING.lg,
        left: SPACING.lg,
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    modalContainer: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        ...SHADOWS.large,
    },
    modalContent: {
        alignItems: 'center',
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    modalButton: {
        ...TYPOGRAPHY.body,
        marginTop: SPACING.md,
        width: '100%',
        backgroundColor: COLORS.primary,
    },
    buttonText:{
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
