import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { colors } from '../../utils/theme';

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 10, color: focused ? colors.accentPurple : colors.textMuted, fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
      {focused && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accentPurple }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopWidth: 0.5,
          borderTopColor: colors.borderPink,
          height: 72,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Sort" icon="⟷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Tags" icon="🏷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" icon="🌸" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
