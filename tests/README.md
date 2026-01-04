# Pixelar Backend Test Suite

## Overview

This test suite provides comprehensive coverage for the Pixelar backend services, matching the test plan documented in Chapter 3 Part 2 of the project documentation.

## Test Structure

```
tests/
├── setup.ts                          # Test configuration and mock data
├── README.md                         # This file
├── unit/
│   ├── generation.service.test.ts    # 27 unit tests for generation
│   ├── user.service.test.ts          # 17 unit tests for user management
│   ├── project.service.test.ts       # 23 unit tests for project CRUD
│   └── asset.service.test.ts         # 23 unit tests for asset management
└── integration/
    └── api.routes.test.ts            # 13 integration tests for API endpoints
```

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run in watch mode (development)
npm run test:watch
```

## Test Results Summary

```
Test Suites: 5 passed, 5 total
Tests:       103 passed, 103 total
Snapshots:   0 total
Time:        ~10s
```
