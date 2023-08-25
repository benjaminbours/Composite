module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/fileTransformer.js",
    "\\.(css|sass|scss)$": "<rootDir>/test/fileTransformer.js",
  },
  setupFiles: [
    "jest-canvas-mock",
    "<rootDir>/test/setupFile.js",
  ],
};
