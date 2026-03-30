import { TextStyle } from 'react-native';

type TypographyStyle = TextStyle & { fontFamily: string };

export const typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extrabold: 'Poppins-ExtraBold',
  },
  heading: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.6,
  } satisfies TypographyStyle,
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  } satisfies TypographyStyle,
  body: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 22,
  } satisfies TypographyStyle,
  button: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  } satisfies TypographyStyle,
  caption: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    lineHeight: 18,
  } satisfies TypographyStyle,
} as const;
