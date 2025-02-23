// context/RecipeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { ImageService } from '../utils/imageService';
import { showMessage } from 'react-native-flash-message';
import {ALERT_TYPE, Toast} from 'react-native-alert-notification';
import { COLORS } from '../styles/theme';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null); // Ajouter un état pour la recette sélectionnée
    const [error, setError] = useState(null);

    const loadRecipes = async () => {
        try {
            setLoading(true);
            const savedRecipes = await StorageService.getAllRecipes();
            setRecipes(savedRecipes);
        } catch (err) {
            setError('Erreur lors du chargement des recettes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipes();
    }, []);

    const handleSaveRecipe = async (formData, navigation) => {
        try {
            const recipeData = {
                ...formData,
                id: selectedRecipe?.id || new Date().toISOString(),
                createdAt: selectedRecipe?.createdAt || new Date(),
                updatedAt: new Date(),
            };

            const success = await StorageService.saveRecipe(recipeData);

            if (success) {
                await loadRecipes(); // Recharger toutes les recettes
                setSelectedRecipe(recipeData);
                if (navigation) {
                    navigation.goBack();
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'C\'est fait !',
                        textBody: 'La recette a bien été modifié',
                    });
                } else{
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Super !',
                        textBody: 'La recette a bien été ajoutée',
                    });
                }
                return true;
            }
            if(navigation) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Mince !',
                    textBody: 'La recette n\'a pas pu être modifié',
                });
            } else{
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Mince !',
                    textBody: 'La recette n\'a pas pu être sauvegardée',
                });
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la recette', error);
            return false;
        }
    };


    const handleDuplicateRecipe = async (recipe) => {
        try {
            const newRecipe = {
                ...recipe,
                id: new Date().toISOString(), // Generate a new unique ID
                name: `${recipe.name} (Copie)`, // Optionally, append "Copy" to the name
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const success = await StorageService.saveRecipe(newRecipe);
            if (success) {
                loadRecipes(); // Recharger toutes les recettes
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'C\'est fait !',
                    textBody: 'La recette a bien été dupliquée',
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Mince !',
                    textBody: 'La recette n\'a pas pu être dupliquée',
                });
            }
        } catch (error) {
            console.error('Error duplicating recipe:', error);
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Mince !',
                textBody: 'La recette n\'a pas pu être dupliquée',
            });
        }
    };

    const updateRecipe = async () => {
        try {
            // Utilise selectedRecipe pour la mise à jour
            const updatedRecipe = { ...selectedRecipe, id: selectedRecipe.id };
            console.log('updatedRecipe',updatedRecipe);

            // Sauvegarde la recette mise à jour
            await StorageService.saveRecipe(updatedRecipe);

            // Recharge les recettes pour mettre à jour la liste
            await loadRecipes();

            // Mettre à jour la recette sélectionnée après la modification
            setSelectedRecipe(updatedRecipe);

            return true;
        } catch (err) {
            setError('Erreur lors de la mise à jour de la recette');
            console.error(err);
            return false;
        }
    };


    const deleteRecipe = async (recipeId) => {
        try {
            const success = await StorageService.deleteRecipe(recipeId);
            if (success) {
                loadRecipes(); // Recharger toutes les recettes
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'C\'est fait !',
                    textBody: 'La recette a bien été supprimée',
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Mince !',
                    textBody: 'La recette n\'a pas pu être supprimée',
                });
            }
            await loadRecipes();
            setSelectedRecipe(null); // Réinitialiser la recette sélectionnée après la suppression
            return true;
        } catch (err) {
            setError('Erreur lors de la suppression de la recette');
            console.error(err);
            return false;
        }
    };

    const searchRecipes = async (query, categories) => {
        try {
            const results = await StorageService.searchRecipes(query, categories);
            return results;
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
            return [];
        }
    };

    return (
        <RecipeContext.Provider
            value={{
                recipes,
                loading,
                error,
                updateRecipe,
                deleteRecipe,
                searchRecipes,
                handleSaveRecipe,
                selectedRecipe,
                setSelectedRecipe,
                handleDuplicateRecipe,
                refreshRecipes: loadRecipes,
            }}
        >
            {children}
        </RecipeContext.Provider>
    );
};

export const useRecipes = () => {
    const context = useContext(RecipeContext);
    if (!context) {
        throw new Error('useRecipes doit être utilisé dans un RecipeProvider');
    }
    return context;
};