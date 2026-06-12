import { Text } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/colors";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.dim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: () => <TabIcon emoji="⚡" />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Anuncios",
          tabBarIcon: () => <TabIcon emoji="📢" />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: "Membresía",
          tabBarIcon: () => <TabIcon emoji="🏛" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
    </Tabs>
  );
}
