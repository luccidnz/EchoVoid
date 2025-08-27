module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
  // 'expo-router/babel' was deprecated in SDK 50 - removed per upgrade guidance
  'react-native-reanimated/plugin', // MUST be last
    ],
  };
};
