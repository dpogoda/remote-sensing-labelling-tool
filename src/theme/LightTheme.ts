import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const PurpleTheme: ThemeTypes = {
  name: 'PurpleTheme',
  dark: false,
  variables: {
    'border-color': '#1e88e5',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#1e88e5',
    secondary: '#5e35b1',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#fff8e1',
    lightsecondary: '#ede7f6',
    lightsuccess: '#b9f6ca',
    lighterror: '#f9d8d8',
    lightwarning: '#fff8e1',
    darkText: '#212121',
    lightText: '#616161',
    darkprimary: '#1565c0',
    darksecondary: '#4527a0',
    borderLight: '#d0d0d0',
    inputBorder: '#787878',
    containerBg: '#eef2f6',
    surface: 'rgb(246,248,250)',
    'on-surface-variant': '#eef2f6',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#eef2f6',
    primary200: '#90caf9',
    secondary200: '#b39ddb'
  }
};

const DarkPurpleTheme: ThemeTypes = {
  name: 'DarkPurpleTheme',
  dark: true,
  variables: {
    'border-color': '#1e88e5',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#1e88e5',
    secondary: '#5e35b1',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#1c1c1e',
    lightsecondary: '#2c2c2e',
    lightsuccess: '#4caf50',
    lighterror: '#cf6679',
    lightwarning: '#ffb74d',
    darkText: '#e0e0e0',
    lightText: '#b0b0b0',
    darkprimary: '#0d47a1',
    darksecondary: '#311b92',
    borderLight: '#4527a0',
    inputBorder: '#616161',
    containerBg: '#121212',
    surface: '#1e1e1e',
    'on-surface-variant': '#333',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#121212',
    primary200: '#1565c0',
    secondary200: '#4527a0'
  }
};

export { PurpleTheme, DarkPurpleTheme };
