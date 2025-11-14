const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Sediakan path ke aplikasi Next.js Anda untuk memuat next.config.js dan file .env di lingkungan tes Anda
  dir: './',
})

// Tambahkan konfigurasi kustom yang akan diteruskan ke Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    // Menangani alias path '@/' yang ada di tsconfig.json
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// createJestConfig diekspor dengan cara ini untuk memastikan bahwa next/jest dapat memuat konfigurasi Next.js yang bersifat async
module.exports = createJestConfig(customJestConfig)
