import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppIcon from '../components/AppIcon';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { BookingCheckoutScreen } from '../screens/BookingCheckoutScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HotelDetailsScreen } from '../screens/HotelDetailsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surfaceMuted },
        tabBarActiveTintColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabel: ({ color }) => (
          <Text style={[typography.caption, { color, fontSize: 11 }]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderMuted,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof MainTabParamList, string> = {
            Home: 'home-outline',
            Profile: 'account-outline',
            Search: 'magnify',
            Wishlist: 'heart-outline',
          };

          return (
            <AppIcon
              color={color}
              name={iconMap[route.name] as React.ComponentProps<typeof AppIcon>['name']}
              size={size}
            />
          );
        },
      })}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Search" component={SearchScreen} />
      <Tabs.Screen name="Wishlist" component={WishlistScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const session = useAuthStore(state => state.session);

  React.useEffect(() => {
    if (session) {
      useWishlistStore.getState().syncGuestWishlist();
      return;
    }

    useWishlistStore.setState({ remoteItems: [] });
  }, [session]);

  return (
    <View className="flex-1 bg-brand-surfaceMuted">
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.surfaceMuted },
          headerShown: false,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
        <Stack.Screen
          name="BookingCheckout"
          component={BookingCheckoutScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="BookingSuccess"
          component={BookingSuccessScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </View>
  );
}
