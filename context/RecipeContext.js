// context/RecipeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { ImageService } from '../utils/imageService';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const updateRecipe = async (recipeId, recipeData) => {
        try {
            const updatedRecipe = { ...recipeData, id: recipeId };
            await StorageService.saveRecipe(updatedRecipe);
            await loadRecipes();
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
                addRecipe,
                updateRecipe,
                deleteRecipe,
                searchRecipes,
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