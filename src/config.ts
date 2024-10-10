export type ConfigProps = {
  Sidebar_drawer: boolean;
  Customizer_drawer: boolean;
  mini_sidebar: boolean;
  fontTheme: string;
  inputBg: boolean;
  patchSize: number;
  patchColumns: number;
  imageSize: number;
  appName: string;
};

const config: ConfigProps = {
  Sidebar_drawer: true,
  Customizer_drawer: false,
  mini_sidebar: false,
  fontTheme: 'Roboto',
  inputBg: false,
  patchSize: 128,
  patchColumns: 3,
  imageSize: 510,
  appName: 'RS Labeling Tool',
};

export default config;
