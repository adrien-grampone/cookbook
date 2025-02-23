import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_API_OPENAI_KEY
});

export const generateRecipe = async (description) => {

    const prompt = `
    Voici une description de recette :
    "${description}"
    
    Donne-moi un objet recette structuré pour le modèle Recipe.js suivant :
    {
        id: new Date().toISOString(), // "2025-02-16T14:30:45.123Z"
        name: "Nom de la recette",
        description: "Description de la recette",
        category: ["breakfast", "lunch", "dinner", "dessert", "snack", "drink", "vegetarian"],
        prepTime: "Temps de préparation en minutes",
        cookTime: "Temps de cuisson en minutes",
        servings: "Nombre de personnes servies",
        ingredients: [
            {
                name: "Nom de l'ingrédient",
                amount: "Quantité (nombre décimal)",
                unit: "Un des identifiants suivants : g, kg, ml, cl, l, cas, cac, pincee, unite, piece, tranche, tasse, verre"
            }
        ],        
        steps: [{step, description}],
        image: "URL de l'image",
        macros: {calories, protein, carbs, fat}
    }
    
    Fais attention à bien structurer les données comme dans l'exemple ci-dessus, et propose des valeurs réalistes lorsque des informations sont manquantes. Sauf pour l'image, laisse un champ vide. Et je ne veux que l'objet, aucun autre texte de ta part. La réponse doit être un JSON.
  `;

    try {

        const response = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini',
        });
        let recipeString = response.choices[0].message.content.trim();
        recipeString = recipeString.replace(/^```json/, "").replace(/```$/, "").trim();
        console.log('recipeString', recipeString);
        const recipeObject = JSON.parse(recipeString); // Conversion en objet JSON



        /*let recipeObject =  {
            id: Date.now().toString(),
            name: "Bowl Cake Pomme/Semoule avec Cœur Coulant Chocolat",
            description: "Un délicieux bowl cake version pomme/semoule avec un cœur coulant chocolat au milieu.",
            category: ["dessert", "snack"],
            prepTime: "3",
            cookTime: "3",
            servings: "1",
            ingredients: [
                {name: "semoule fine", amount: 30, unit: "g"},
                {name: "compote de pommes SSA", amount: 100, unit: "g"},
                {name: "lait", amount: 50, unit: "g"},
                {name: "levure chimique", amount: 1, unit: "soupçon"},
                {name: "œuf", amount: 1, unit: "unité"},
                {name: "pâte à tartiner (beurre de cacahuète au chocolat)", amount: 1, unit: "cuillère"}
            ],
            steps: [
                {step: 1, description: "Dans un bol, mélanger la semoule, la compote de pommes, le lait et la levure chimique."},
                {step: 2, description: "Ajouter l'œuf et bien mélanger."},
                {step: 3, description: "Incorporer la pâte à tartiner au centre du mélange."},
                {step: 4, description: "Cuire au micro-ondes pendant 3 minutes à 900 W."}
            ],
            image: "",
            macros: {calories: 250, protein: 7, carbs: 42, fat: 9}
        };*/

        console.log(recipeObject);

        return recipeObject;  // Convertir la réponse en objet JSON si ChatGPT fournit un format valide
    } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la génération de la recette.');
    }
};
