import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Tabs } from "expo-router";
import { Calendar, List, Briefcase } from "lucide-react-native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { initDatabase } from "../utils/db";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export default function Layout() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [appIsReady, setAppIsReady] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Start spinning animation
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start();

        // Initialize SQLite database
        await initDatabase();

        // Pre-load fonts, make any API calls you need to do here
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.iconContainer}>
          <View style={styles.diamondFrame}>
            <Briefcase size={120} color="#2563eb" />
          </View>
          <Animated.View
            style={[styles.customSpinner, { transform: [{ rotate: spin }] }]}
          />
        </View>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FilterContext.Provider value={{ selectedCompany, setSelectedCompany }}>
        <PaperProvider>
          <Tabs screenOptions={{ tabBarActiveTintColor: "#2563eb" }}>
            <Tabs.Screen
              name="index"
              options={{
                title: "Companies",
                tabBarIcon: ({ color, size }) => (
                  <View
                    style={{
                      padding: 8,
                      justifyContent: "center",
                      transform: [{ rotate: "45deg" }],
                      alignItems: "center",
                    }}
                  >
                    <Briefcase color={color} size={size} />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="calendar"
              options={{
                title: "Calendar",
                tabBarIcon: ({ color, size }) => (
                  <Calendar color={color} size={size} />
                ),
              }}
            />
            <Tabs.Screen
              name="events"
              options={{
                title: "Events",
                tabBarIcon: ({ color, size }) => (
                  <List color={color} size={size} />
                ),
              }}
            />
            <Tabs.Screen
              name="chat"
              options={{
                href: null,
              }}
            />
          </Tabs>
        </PaperProvider>
      </FilterContext.Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  iconContainer: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  diamondFrame: {
    padding: 40,
    transform: [{ rotate: "45deg" }],
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  customSpinner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: "transparent",
    borderTopColor: "#2563eb",
    borderRightColor: "#2563eb",
    position: "absolute",
  },
});
