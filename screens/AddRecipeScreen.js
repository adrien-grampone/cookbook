// screens/AddRecipeScreen.js
import React, {useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, CATEGORIES, SPACING, RADIUS, TYPOGRAPHY, SHADOWS} from '../styles/theme';
import {StorageService} from '../utils/storage';
import {CategoryChip} from "../components/CategoryChip";

const AddRecipeScreen = ({navigation, route}) => {
    const editingRecipe = route.params?.recipe;
    const [formData, setFormData] = useState({
        name: editingRecipe?.name || '',
        description: editingRecipe?.description || '',
        category: editingRecipe?.category || '',
        prepTime: editingRecipe?.prepTime?.toString() || '',
        cookTime: editingRecipe?.cookTime?.toString() || '',
        servings: editingRecipe?.servings?.toString() || '',
        ingredients: editingRecipe?.ingredients || [{name: '', amount: '', unit: ''}],
        steps: editingRecipe?.steps || [{description: ''}],
        image: editingRecipe?.image || null,
        macros: editingRecipe?.macros || {
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
        },
    });

    const [imageAnimation] = useState(new Animated.Value(0));

    const selectImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (!result.didCancel && result.assets?.[0]) {
            setFormData(prev => ({...prev, image: result.assets[0].uri}));
            Animated.spring(imageAnimation, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, {name: '', amount: '', unit: ''}],
        }));
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, {description: ''}],
        }));
    };

    const updateIngredient = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData(prev => ({...prev, ingredients: newIngredients}));
    };

    const updateStep = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index].description = value;
        setFormData(prev => ({...prev, steps: newSteps}));
    };

    const handleSaveRecipe = async () => {
        try {
            console.log('formdata', formData)
            const recipeData = {
                ...formData,
                id: editingRecipe?.id || Date.now().toString(), // Si c'est une nouvelle recette, générer un ID unique
                createdAt: editingRecipe?.createdAt || new Date(), // Si c'est une nouvelle recette, ajouter une date de création
                updatedAt: new Date(), // Mettre à jour la date à chaque modification
            };

            const success = await StorageService.saveRecipe(recipeData);

            if (success) {
                navigation.goBack(); // Retourner à l'écran précédent
            } else {
                console.error('Erreur lors de l\'ajout de la recette');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la recette', error);
        }
    };


    const renderIngredientInput = (ingredient, index) => (
        <Animated.View
            key={index}
            style={[styles.ingredientContainer, {
                opacity: 1,
            }]}
        >
            <TextInput
                style={styles.ingredientName}
                placeholder="Ingrédient"
                value={ingredient.name}
                onChangeText={(value) => updateIngredient(index, 'name', value)}
            />
            <TextInput
                style={styles.ingredientAmount}
                placeholder="Quantité"
                keyboardType="numeric"
                value={ingredient.amount}
                onChangeText={(value) => updateIngredient(index, 'amount', value)}
            />
            <TextInput
                style={styles.ingredientUnit}
                placeholder="Unité"
                value={ingredient.unit}
                onChangeText={(value) => updateIngredient(index, 'unit', value)}
            />
        </Animated.View>
    );

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                {formData.image ? (
                    <Image source={{uri: formData.image}} style={styles.image}/>
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Icon name="add-a-photo" size={40} color={COLORS.textLight}/>
                        <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Nom de la recette"
                    value={formData.name}
                    onChangeText={(value) => setFormData(prev => ({...prev, name: value}))}
                />

                <TextInput
                    style={[styles.input, styles.multiline]}
                    placeholder="Description"
                    multiline
                    value={formData.description}
                    onChangeText={(value) => setFormData(prev => ({...prev, description: value}))}
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Temps de préparation</Text>
                    <View style={styles.timeInputs}>
                        <TextInput
                            style={styles.timeInput}
                            placeholder="Préparation (min)"
                            keyboardType="numeric"
                            value={formData.prepTime}
                            onChangeText={(value) => setFormData(prev => ({...prev, prepTime: value}))}
                        />
                        <TextInput
                            style={styles.timeInput}
                            placeholder="Cuisson (min)"
                            keyboardType="numeric"
                            value={formData.cookTime}
                            onChangeText={(value) => setFormData(prev => ({...prev, cookTime: value}))}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Catégorie(s)</Text>
                    <View style={styles.sectionCategories}>
                        {CATEGORIES.map(category => (
                            <CategoryChip
                                key={category.id}
                                category={category}
                                isSelected={formData.category.includes(category.id)}
                                onPress={() => {
                                    // Si la catégorie est déjà sélectionnée, on la désélectionne
                                    if (formData.category.includes(category.id)) {
                                        setFormData(prev => ({
                                            ...prev,
                                            category: prev.category.filter(id => id !== category.id)
                                        }));
                                    } else {
                                        // Sinon, on l'ajoute aux catégories sélectionnées
                                        setFormData(prev => ({
                                            ...prev,
                                            category: [...prev.category, category.id]
                                        }));
                                    }
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingrédients</Text>
                    {formData.ingredients.map(renderIngredientInput)}
                    <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                        <Icon name="add" size={24} color={COLORS.primary}/>
                        <Text style={styles.addButtonText}>Ajouter un ingrédient</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Étapes</Text>
                    {formData.steps.map((step, index) => (
                        <TextInput
                            key={index}
                            style={[styles.input, styles.multiline]}
                            placeholder={`Étape ${index + 1}`}
                            multiline
                            value={step.description}
                            onChangeText={(value) => updateStep(index, value)}
                        />
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={addStep}>
                        <Icon name="add" size={24} color={COLORS.primary}/>
                        <Text style={styles.addButtonText}>Ajouter une étape</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations nutritionnelles</Text>
                    <View style={styles.macrosContainer}>
                        <TextInput
                            style={styles.macroInput}
                            placeholder="Calories"
                            keyboardType="numeric"
                            value={formData.macros.calories}
                            onChangeText={(value) => setFormData(prev => ({
                                ...prev,
                                macros: {...prev.macros, calories: value}
                            }))}
                        />
                        <TextInput
                            style={styles.macroInput}
                            placeholder="Protéines (g)"
                            keyboardType="numeric"
                            value={formData.macros.protein}
                            onChangeText={(value) => setFormData(prev => ({
                                ...prev,
                                macros: {...prev.macros, protein: value}
                            }))}
                        />
                        <TextInput
                            style={styles.macroInput}
                            placeholder="Glucides (g)"
                            keyboardType="numeric"
                            value={formData.macros.carbs}
                            onChangeText={(value) => setFormData(prev => ({
                                ...prev,
                                macros: {...prev.macros, carbs: value}
                            }))}
                        />
                        <TextInput
                            style={styles.macroInput}
                            placeholder="Lipides (g)"
                            keyboardType="numeric"
                            value={formData.macros.fat}
                            onChangeText={(value) => setFormData(prev => ({
                                ...prev,
                                macros: {...prev.macros, fat: value}
                            }))}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSaveRecipe}
                >
                    <Text style={styles.submitButtonText}>
                        {editingRecipe ? 'Modifier la recette' : 'Créer la recette'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    imageContainer: {
        height: 200,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
    form: {
        padding: SPACING.md,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        ...TYPOGRAPHY.body,
        ...SHADOWS.small,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionCategories: {
        marginTop:SPACING.md,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "10",
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.sm,
        color: COLORS.text,
    },
    ingredientContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    ingredientName: {
        flex: 2,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginRight: SPACING.sm,
    },
    ingredientAmount: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginRight: SPACING.sm,
    },
    ingredientUnit: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
    },
    timeInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeInput: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginRight: SPACING.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        marginTop: SPACING.sm,
    },
    addButtonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    macrosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
    },
    macroInput: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        margin: SPACING.xs,
    },
});

export default AddRecipeScreen;