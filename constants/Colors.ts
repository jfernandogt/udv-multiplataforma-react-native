/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    error: "#FF0000",
    card: "#F0F4F8",
    border: "#E1E4E8",
    textMuted: "#687076",
    placeholder: "#A0A4A7",
    disabled: "#A0A4A7",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    error: "#FF0000",
    card: "#1C1F22",
    border: "#2C2F33",
    textMuted: "#9BA1A6",
    placeholder: "#9BA1A6",
    disabled: "#9BA1A6",
  },
};
