export const typography = {
  fontFamily: {
    poppins: {
      regular: "Poppins-Regular",
      medium: "Poppins-Medium",
      semibold: "Poppins-SemiBold",
      bold: "Poppins-Bold",
    },
  },
  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 16,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 13,
    caption: 11,
  },
  lineHeight: {
    h1: 1.2,
    h2: 1.3,
    h3: 1.3,
    h4: 1.4,
    bodyLarge: 1.6,
    bodyMedium: 1.6,
    bodySmall: 1.6,
    caption: 1.4,
  },
  weights: {
    regular: "normal",
    medium: "500",
    semibold: "600",
    bold: "bold",
  },
} as const;

export type Typography = typeof typography;
