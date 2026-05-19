module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "expo/internal/babel-preset",
        {
          // Transforma import.meta.env (sintaxis Vite) a globalThis.__ExpoImportMetaRegistry
          // Necesario porque zustand/devtools usa import.meta.env.MODE
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
