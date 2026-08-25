import React, { useEffect } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  home: "home",
  learn: "book-open",
  "ai-teacher": "video",
  chat: "message-circle",
  profile: "user",
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const tabWidth = screenWidth / state.routes.length;
  const circleSize = 52;
  const xOffset = (tabWidth - circleSize) / 2;
  const circleTop = (72 - circleSize) / 2;

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth + xOffset, {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    });
  }, [state.index, tabWidth, xOffset, translateX]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      className="flex-row bg-neutral-background border-t border-neutral-border relative"
      style={{
        height: 72 + insets.bottom,
        paddingBottom: insets.bottom,
        shadowColor: "#0D132B",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Sliding Active Circle Background */}
      <Animated.View
        className="absolute bg-primary-purple rounded-full shadow-md"
        style={[
          {
            width: circleSize,
            height: circleSize,
            top: circleTop,
            shadowColor: "#6C4EF5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          },
          animatedCircleStyle,
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabBarItem
            key={route.key}
            label={label as string}
            iconName={iconMap[route.name] || "help-circle"}
            isFocused={isFocused}
            onPress={onPress}
            tabWidth={tabWidth}
          />
        );
      })}
    </View>
  );
}

interface TabBarItemProps {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  isFocused: boolean;
  onPress: () => void;
  tabWidth: number;
}

function TabBarItem({ label, iconName, isFocused, onPress, tabWidth }: TabBarItemProps) {
  const activeProgress = useSharedValue(0);

  useEffect(() => {
    activeProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 18,
      stiffness: 140,
    });
  }, [isFocused, activeProgress]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      activeProgress.value,
      [0, 1],
      ["#6B7280", "#FFFFFF"]
    );
    const translateY = (1 - activeProgress.value) * -6;

    return {
      color,
      transform: [{ translateY }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = 1 - activeProgress.value;
    const scale = 1 - activeProgress.value;
    const translateY = activeProgress.value * 12;

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ width: tabWidth }}
      className="h-full items-center justify-center relative"
    >
      <AnimatedFeather
        name={iconName}
        size={24}
        style={animatedIconStyle}
      />
      <Animated.Text
        className="text-caption font-poppins-semibold text-neutral-text-secondary absolute"
        style={[
          {
            bottom: 12,
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}
