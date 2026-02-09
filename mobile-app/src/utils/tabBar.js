import { Dimensions } from "react-native";

export const getTabBarStyle = (theme) => {
  const { height } = Dimensions.get("window");
  const isCompact = height < 720;
  return {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 0,
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: isCompact ? 8 : 12,
    height: isCompact ? 64 : 72,
    position: "absolute",
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOpacity: theme.shadow.soft.shadowOpacity,
    shadowOffset: theme.shadow.soft.shadowOffset,
    shadowRadius: theme.shadow.soft.shadowRadius,
    elevation: theme.shadow.soft.elevation,
    alignSelf: "center",
    width: "90%",
    paddingVertical: isCompact ? 4 : 0,
  };
};