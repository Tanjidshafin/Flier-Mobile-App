declare module 'react-native-config' {
  export interface NativeConfig {
    FLIER_API_BASE_URL?: string;
    FLIER_SOCKET_URL?: string;
    FLIER_STRIPE_PUBLISHABLE_KEY?: string;
  }

  const Config: NativeConfig;
  export default Config;
}
