const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@stream-io/react-native-webrtc") {
    return context.resolveRequest(
      context,
      "@stream-io/react-native-webrtc/src/index",
      platform
    );
  }
  if (moduleName === "@stream-io/video-react-native-sdk") {
    return context.resolveRequest(
      context,
      "@stream-io/video-react-native-sdk/src/index",
      platform
    );
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config);
