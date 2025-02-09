// screens/AddOrEditRecipeScreen.js
import React, {useState, useLayoutEffect, useRef} from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, CATEGORIES, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, UNITS} from '../styles/theme';
import {StorageService} from '../utils/storage';
import {CategoryChip} from "../components/CategoryChip";
import {useRecipes} from '../context/RecipeContext'; // Importer le contexte
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';


const AddOrEditRecipeScreen = ({navigation, route}) => {
    const {handleSaveRecipe} = useRecipes(); // Utilisation du contexte pour ajouter une recette
    const scrollViewRef = useRef(null);
    const {selectedRecipe} = useRecipes(); // Utiliser le contexte pour récupérer la recette actuelle
    const [editingRecipe] = React.useState(selectedRecipe);
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
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null);


    useLayoutEffect(() => {
        if (editingRecipe) {
            navigation.setOptions({
                title: `Modifier ${editingRecipe.name}`,
                headerBackTitle: editingRecipe.name,
            });
        } else {
            navigation.setOptions({
                title: 'Ajouter une nouvelle recette',
                headerBackTitle: ' ',
            });
        }
    }, [navigation, editingRecipe]);  // Re-render lorsque 'navigation' ou 'editingRecipe' changent

    const requestMediaLibraryPermission = async () => {
        const {status} = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            return true;
        } else {
            return false;
        }
    };

    const selectImage = async () => {
        const permissionGranted = await requestMediaLibraryPermission();

        if (permissionGranted) {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Seulement des images
                allowsEditing: true, // Permet l'édition de l'image (facultatif)
                quality: 1, // Qualité de l'image (1 étant la plus haute qualité)
            });

            if (!result.canceled && result.assets?.[0]) {

                setFormData(prev => ({
                    ...prev,
                    image: result.assets[0].uri
                }));

                Animated.spring(imageAnimation, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();
            } else {
            }
        } else {
        }
    };

    const [imageAnimation] = useState(new Animated.Value(0));

    /*const selectImage = async () => {
        requestMediaLibraryPermission();
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
    };*/

    const openUnitPicker = (index) => {
        setSelectedIngredientIndex(index);
        setModalVisible(true);
    };

    const selectUnit = (unit) => {
        if (selectedIngredientIndex !== null) {
            updateIngredient(selectedIngredientIndex, 'unit', unit.id);
        }
        setModalVisible(false);
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
            <TouchableOpacity
                style={styles.unitPicker}
                onPress={() => openUnitPicker(index)}
            >
                <Text style={styles.unitPickerText}>
                    {ingredient.unit || 'Unité'}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

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

    // Dans le même composant, modifiez la fonction onPress du bouton de soumission :
    const onSubmit = async () => {
        const success = await handleSaveRecipe(formData, navigation);
        if (success) {
            // La navigation est maintenant gérée dans handleSaveRecipe
            console.log('Recette sauvegardée avec succès');
        } else {
            console.error('Erreur lors de la sauvegarde de la recette');
        }
    };

    /*const handleSaveRecipe = async () => {
        try {
            const recipeData = {
                ...formData,
                id: editingRecipe?.id || Date.now().toString(), // Si c'est une nouvelle recette, générer un ID unique
                createdAt: editingRecipe?.createdAt || new Date(), // Si c'est une nouvelle recette, ajouter une date de création
                updatedAt: new Date(), // Mettre à jour la date à chaque modification
            };

            console.log(recipeData, 'recipeData');

            const success = await StorageService.saveRecipe(recipeData);

            if (success) {
                addRecipe(recipeData); // Ajouter la recette au contexte
                navigation.goBack(); // Retourner à l'écran précédent
            } else {
                console.error('Erreur lors de l\'ajout de la recette');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la recette', error);
        }
    };*/


    /* const renderIngredientInput = (ingredient, index) => (
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
     );*/

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding" // ou 'height' selon ton besoin
            keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 0} // Ajuste selon ton design
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
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
                                <View key={index} style={styles.stepContainer}>
                                    <TextInput
                                        style={[styles.input, styles.multiline]}
                                        placeholder={`Étape ${index + 1}`}
                                        multiline
                                        value={step.description}
                                        onChangeText={(value) => updateStep(index, value)}
                                        blurOnSubmit={false}
                                        returnKeyType="next"
                                        onFocus={() => {
                                            // Petit délai pour laisser le temps au clavier de s'afficher
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({animated: true});
                                            }, 100);
                                        }}
                                    />
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addButton} onPress={addStep}>
                                <Icon name="add" size={24} color={COLORS.primary}/>
                                <Text style={styles.addButtonText}>Ajouter une étape</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Informations nutritionnelles</Text>
                            <View style={styles.macrosContainer}>
                                <View style={styles.macroRow}>
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
                                    <Text style={styles.unitText}>kcal</Text>
                                </View>
                                <View style={styles.macroRow}>
                                    <TextInput
                                        style={styles.macroInput}
                                        placeholder="Protéines"
                                        keyboardType="numeric"
                                        value={formData.macros.protein}
                                        onChangeText={(value) => setFormData(prev => ({
                                            ...prev,
                                            macros: {...prev.macros, protein: value}
                                        }))}
                                    />
                                    <Text style={styles.unitText}>prot</Text>
                                </View>
                                <View style={styles.macroRow}>
                                    <TextInput
                                        style={styles.macroInput}
                                        placeholder="Glucides"
                                        keyboardType="numeric"
                                        value={formData.macros.carbs}
                                        onChangeText={(value) => setFormData(prev => ({
                                            ...prev,
                                            macros: {...prev.macros, carbs: value}
                                        }))}
                                    />
                                    <Text style={styles.unitText}>gluc</Text>
                                </View>
                                <View style={styles.macroRow}>
                                    <TextInput
                                        style={styles.macroInput}
                                        placeholder="Lipides"
                                        keyboardType="numeric"
                                        value={formData.macros.fat}
                                        onChangeText={(value) => setFormData(prev => ({
                                            ...prev,
                                            macros: {...prev.macros, fat: value}
                                        }))}
                                    />
                                    <Text style={styles.unitText}>lipi</Text>
                                </View>
                            </View>
                        </View>


                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={onSubmit}
                        >
                            <Text style={styles.submitButtonText}>
                                {editingRecipe ? 'Modifier la recette' : 'Créer la recette'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Choisir une unité</Text>
                                        <TouchableOpacity
                                            style={styles.modalCloseButton}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.modalCloseText}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={UNITS}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                style={styles.unitItem}
                                                onPress={() => selectUnit(item)}
                                            >
                                                <Text style={styles.unitItemText}>{item.label} {item.icon}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    form: {
        padding: SPACING.md,
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
    scrollContainer: {
        flexGrow: 1,
    },
    stepContainer: {
        marginBottom: SPACING.md,
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
        marginTop: SPACING.md,
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
    unitPicker: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
    },
    unitPickerText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
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
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
    },
    modalCloseButton: {
        padding: SPACING.sm,
    },
    modalCloseText: {
        fontSize: 24,
        color: COLORS.text,
    },
    unitItem: {
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    unitItemText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
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
        justifyContent: 'space-between',
    },
    macroRow: {
        position: 'relative',
        width: '50%',  // Deux éléments par ligne, ajustez en fonction du nombre de colonnes
    },
    macroInput: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        margin: SPACING.xs,
        paddingRight: 50, // Espace pour l'unité à droite
        fontSize: 16,
    },
    unitText: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: '-50%' }],
        fontSize: 16,
        color: '#555',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    submitButtonText: {
        ...TYPOGRAPHY.body,
        color: '#fff',
    },
});

export default AddOrEditRecipeScreen;