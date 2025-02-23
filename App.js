import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddOrEditRecipeScreen from './screens/AddOrEditRecipeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import {RecipeProvider} from "./context/RecipeContext";
import {COLORS} from "./styles/theme";
import {PaperProvider} from 'react-native-paper';
import SplashScreen from './screens/SplashScreen';
import {AlertNotificationRoot} from 'react-native-alert-notification';

const Stack = createStackNavigator();

const App = () => {
    return (
        <AlertNotificationRoot>
            <PaperProvider>
                <RecipeProvider>
                    <NavigationContainer>
                        <Stack.Navigator
                            screenOptions={{
                                headerStyle: {
                                    backgroundColor: COLORS.primary,
                                },
                                headerTintColor: '#fff',
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                },
                            }}
                        >
                            <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}}/>
                            <Stack.Screen
                                name="Home"
                                component={HomeScreen}
                                options={{
                                    title: 'CookBook',
                                    headerLargeTitle: true,
                                    headerShown: false
                                }}
                            />
                            <Stack.Screen
                                name="AddOrEditRecipe"
                                component={AddOrEditRecipeScreen}
                                options={{
                                    title: 'Nouvelle Recette',
                                    presentation: 'modal',
                                }}
                            />
                            <Stack.Screen
                                name="RecipeDetail"
                                component={RecipeDetailScreen}
                                options={({route}) => ({
                                    title: route.params?.recipe?.name || 'Détails',
                                    headerTransparent: true,
                                    headerTintColor: COLORS.card,
                                })}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </RecipeProvider>
            </PaperProvider>
        </AlertNotificationRoot>
    );
};

export default App;