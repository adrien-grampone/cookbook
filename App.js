import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import EditRecipeScreen from './screens/EditRecipeScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FF6B6B',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Mes Recettes',
                    headerLargeTitle: true,
                }}
            />
            <Stack.Screen
                name="AddRecipe"
                component={AddRecipeScreen}
                options={{
                    title: 'Nouvelle Recette',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="RecipeDetail"
                component={RecipeDetailScreen}
                options={({ route }) => ({
                    title: route.params?.recipe?.name || 'Détails',
                    headerTransparent: true,
                    headerTintColor: COLORS.card,
                })}
            />
            <Stack.Screen
                name="EditRecipe"
                component={EditRecipeScreen}
                options={{
                    title: 'Modifier la Recette',
                }}
            />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default App;