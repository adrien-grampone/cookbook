import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useRecipes } from '../context/RecipeContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../styles/theme';
import { generateRecipe } from "../utils/openai";
import axios from "axios";
import {StorageService} from "../utils/storage";
import CookingLoader from "./CookingLoader";
import * as FileSystem from 'expo-file-system';

const ImportButton = () => {
    const [visible, setVisible] = useState(false);
    const [showTiktokInput, setShowTiktokInput] = useState(false);
    const [tiktokUrl, setTiktokUrl] = useState('');
    const { handleSaveRecipe, loading, setLoading } = useRecipes();
    const [progress, setProgress] = useState(0);

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

    const downloadImage = async (url) => {
        try {
            const fileUri = `${FileSystem.cacheDirectory}preview.jpg`; // Chemin local de stockage

            // Télécharger l'image en utilisant fetch
            const response = await fetch(url);

            // Vérifier si la requête a réussi
            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement de l\'image');
            }

            // Lire l'image sous forme de base64
            const imageData = await response.blob();
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extraire la partie base64
                reader.onerror = reject;
                reader.readAsDataURL(imageData);
            });

            // Sauvegarder l'image en local
            await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

            return fileUri; // Retourne le chemin local de l'image
        } catch (error) {
            console.error("Erreur lors du téléchargement de l'image :", error);
            return null;
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
                                setLoading(true);
                                setProgress(0);
                                let finalUrl = tiktokUrl;

                                // Vérifier si c'est une URL raccourcie
                                if (tiktokUrl.includes("vm.tiktok.com") || tiktokUrl.includes("vt.tiktok.com")) {
                                    finalUrl = await resolveShortUrl(tiktokUrl);
                                    if (!finalUrl) {
                                        alert("Impossible de récupérer l'URL complète.");
                                        setLoading(false);
                                        return;
                                    }
                                }

                                let videoId = extractTikTokVideoId(finalUrl);
                                if (!videoId) {
                                    alert("Impossible d'extraire l'ID de la vidéo. Vérifiez l'URL.");
                                    setLoading(false);
                                    return;
                                }

                                console.log('videoId:', videoId);

                                const response = await axios.get('https://tiktok-api23.p.rapidapi.com/api/post/detail', {
                                    params: { videoId },
                                    headers: {
                                        'x-rapidapi-key': process.env.EXPO_PUBLIC_API_RAPIDAPI_KEY,
                                        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
                                    }
                                });

                                const preview = response.data.itemInfo?.itemStruct?.video?.cover;
                                const description = response.data.itemInfo?.itemStruct?.desc || "";
                                const recipe = await generateRecipe(description, setProgress);
                                if (preview) {
                                    const localImageUri = await downloadImage(preview);
                                    if (localImageUri) {
                                        recipe.image = localImageUri;
                                    }
                                }
                                handleSaveRecipe(recipe, false);
                            } catch (error) {
                                console.error(error);
                            } finally {
                                setLoading(false); // Stop loading
                                hideModal();
                            }
                        }
                    }
                ]
            );
        }
    };

// Fonction pour suivre la redirection de l'URL raccourcie
    const resolveShortUrl = async (shortUrl) => {
        try {
            const response = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
            return response.url; // Retourne l'URL complète après redirection
        } catch (error) {
            console.error("Erreur lors de la résolution de l'URL courte:", error);
            return null;
        }
    };

// Fonction pour extraire l'ID de la vidéo TikTok
    const extractTikTokVideoId = (url) => {
        try {
            // Supprimer les paramètres après "?"
            url = url.split("?")[0];

            // Vérifier si l'URL contient "/video/"
            let match = url.match(/\/video\/(\d+)/);
            if (match) return match[1];

            return null;
        } catch (error) {
            console.error("Erreur lors de l'extraction de l'ID TikTok:", error);
            return null;
        }
    };



    const handleExport = async () => {
        const success = await StorageService.exportRecipes();
        if (success) {
            alert('Exportation réussie !');
        } else {
            alert("Une erreur s'est produite.");
        }
    };

    return (
        <>
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

                        <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
                            <Icon name="file-download" size={24} color={COLORS.text} />
                            <Text style={styles.actionText}>Exporter toutes les recettes</Text>
                        </TouchableOpacity>

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

                    <CookingLoader visible={loading} progress={progress}/>
                </View>
            )}

        </>
    );
};

const styles = StyleSheet.create({
    importButton: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        backgroundColor: COLORS.accent,
        width: 56,
        height: 56,
        borderRadius: RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 5,
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
