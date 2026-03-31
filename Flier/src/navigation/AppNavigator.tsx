import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppIcon from '../components/AppIcon';
import { navigationRef } from './navigationRef';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { AllHotelsScreen } from '../screens/AllHotelsScreen';
import { BookingCheckoutScreen } from '../screens/BookingCheckoutScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HotelDetailsScreen } from '../screens/HotelDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { AdminAccessDeniedScreen } from '../screens/admin/AdminAccessDeniedScreen';
import { AdminChatConversationScreen } from '../screens/admin/AdminChatConversationScreen';
import { AdminChatInboxScreen } from '../screens/admin/AdminChatInboxScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminHotelEditorScreen } from '../screens/admin/AdminHotelEditorScreen';
import { AdminHotelsScreen } from '../screens/admin/AdminHotelsScreen';
import { AdminNotificationsScreen } from '../screens/admin/AdminNotificationsScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  AdminStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
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
      <Tabs.Screen name="Search" component={AllHotelsScreen} />
      <Tabs.Screen name="Wishlist" component={WishlistScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AdminPanelNavigator({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AdminPanel'>) {
  const session = useAuthStore(state => state.session);

  if (session?.user.role !== 'admin') {
    return (
      <AdminAccessDeniedScreen
        onReturn={() =>
          navigation.replace('MainTabs', {
            screen: 'Profile',
          })
        }
      />
    );
  }

  return (
    <AdminStack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.surfaceMuted },
        headerShown: false,
      }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminHotels" component={AdminHotelsScreen} />
      <AdminStack.Screen name="AdminHotelEditor" component={AdminHotelEditorScreen} />
      <AdminStack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <AdminStack.Screen name="AdminChatInbox" component={AdminChatInboxScreen} />
      <AdminStack.Screen
        name="AdminChatConversation"
        component={AdminChatConversationScreen}
      />
      <AdminStack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
      />
    </AdminStack.Navigator>
  );
}

export function AppNavigator() {
  const session = useAuthStore(state => state.session);
  const previousWasAdminRef = React.useRef(session?.user.role === 'admin');

  React.useEffect(() => {
    if (session) {
      useWishlistStore.getState().syncGuestWishlist();
      return;
    }

    useWishlistStore.setState({ remoteItems: [] });
  }, [session]);

  React.useEffect(() => {
    const isAdmin = session?.user.role === 'admin';

    if (previousWasAdminRef.current && !isAdmin && navigationRef.isReady()) {
      const activeRouteName = navigationRef.getCurrentRoute()?.name;

      if (activeRouteName?.startsWith('Admin')) {
        navigationRef.resetRoot({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              params: {
                screen: 'Profile',
              },
            },
          ],
        });
      }
    }

    previousWasAdminRef.current = isAdmin;
  }, [session?.user.role]);

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
        <Stack.Screen name="AdminPanel" component={AdminPanelNavigator} />
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
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </View>
  );
}
