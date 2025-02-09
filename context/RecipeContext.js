// context/RecipeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { ImageService } from '../utils/imageService';

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
                id: selectedRecipe?.id || Date.now().toString(),
                createdAt: selectedRecipe?.createdAt || new Date(),
                updatedAt: new Date(),
            };

            const success = await StorageService.saveRecipe(recipeData);

            if (success) {
                await loadRecipes(); // Recharger toutes les recettes
                setSelectedRecipe(recipeData);
                if (navigation) {
                    navigation.goBack();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la recette', error);
            return false;
        }
    };

    const addRecipe = async (recipeData) => {
        try {
            if (recipeData.image) {
                const imageUri = await ImageService.pickImage();
                if (imageUri) {
                    recipeData.image = imageUri;
                }
            }

            await StorageService.saveRecipe(recipeData);
            await loadRecipes();
            return true;
        } catch (err) {
            setError('Erreur lors de l\'ajout de la recette');
            console.error(err);
            return false;
        }
    };

    /*const updateRecipe = async (recipeId, recipeData) => {
        try {
            const updatedRecipe = { ...recipeData, id: recipeId };
            await StorageService.saveRecipe(updatedRecipe);
            await loadRecipes();
            setSelectedRecipe(updatedRecipe); // Mettre à jour la recette sélectionnée après la modification
            return true;
        } catch (err) {
            setError('Erreur lors de la mise à jour de la recette');
            console.error(err);
            return false;
        }
    };*/

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
            await StorageService.deleteRecipe(recipeId);
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

    const selectRecipe = (recipe) => {
        //const recipe = recipes.find((rec) => rec.id === recipeId);
        setSelectedRecipe(recipe);
    };

    return (
        <RecipeContext.Provider
            value={{
                recipes,
                loading,
                error,
                addRecipe,
                updateRecipe,
                deleteRecipe,
                searchRecipes,
                selectRecipe,
                handleSaveRecipe,
                selectedRecipe,
                setSelectedRecipe,
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