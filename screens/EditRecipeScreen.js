// screens/EditRecipeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRecipes } from '../context/RecipeContext';
import { COLORS, SPACING } from '../styles/theme';
import { ImageService } from '../utils/imageService';
import { Recipe } from '../models/Recipe';
import { Toast } from '../components/Feedback';
import RecipeForm from '../components/RecipeForm';

const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params;
    const { updateRecipe, deleteRecipe } = useRecipes();
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);

            let imageUri = formData.image;
            if (formData.newImage) {
                imageUri = await ImageService.pickImage();
            }

            const updatedRecipe = new Recipe({
                ...formData,
                id: recipe.id,
                image: imageUri || recipe.image,
                updatedAt: new Date(),
            });

            const success = await updateRecipe(recipe.id, updatedRecipe);

            if (success) {
                setToastMessage('Recette mise à jour avec succès');
                setShowToast(true);
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            setToastMessage('Erreur lors de la mise à jour de la recette');
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Supprimer la recette',
            'Êtes-vous sûr de vouloir supprimer cette recette ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: handleDelete,
                },
            ]
        );
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const success = await deleteRecipe(recipe.id);

            if (success) {
                setToastMessage('Recette supprimée avec succès');
                setShowToast(true);
                setTimeout(() => {
                    navigation.navigate('Home');
                }, 1500);
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            setToastMessage('Erreur lors de la suppression de la recette');
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={confirmDelete}
                >
                    <Icon name="delete" size={24} color={COLORS.error} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                <RecipeForm
                    initialValues={recipe}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    submitButtonText="Mettre à jour la recette"
                />
            </ScrollView>

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastMessage.includes('succès') ? 'success' : 'error'}
                    onHide={() => setShowToast(false)}
                />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    deleteButton: {
        padding: SPACING.md,
    },
});

export default EditRecipeScreen;