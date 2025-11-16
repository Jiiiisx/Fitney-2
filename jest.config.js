const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// createJestConfig diekspor dengan cara ini untuk memastikan bahwa next/jest dapat memuat konfigurasi Next.js yang bersifat async
module.exports = createJestConfig(customJestConfig)
