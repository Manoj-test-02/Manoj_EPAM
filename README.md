# E2E Testing with Playwright & Cucumber

This project demonstrates end-to-end testing using Playwright with Cucumber for BDD-style test automation.

## 🚀 Features

- BDD-style test scenarios using Cucumber
- Page Object Model implementation
- Parallel test execution
- HTML report generation
- TypeScript support
- Automated login and inventory management tests
- Sort and filter functionality testing
- Shopping cart validation
- Checkout process verification

## 🛠️ Tech Stack

- Playwright
- Cucumber
- TypeScript
- Node.js
- HTML Reporter

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running Tests

### Run all tests:
```bash
npm test
```

### Run specific features:
```bash
npm test -- --tags @inventory
```

### Run with HTML report generation:
```bash
npm run test:report
```

## 📁 Project Structure

```
├── e2e/
│   ├── features/          # Cucumber feature files
│   ├── fixtures/          # Test data
│   ├── models/           # Page object models
│   ├── step-definitions/ # Step definitions
│   └── support/          # Support files and hooks
├── reports/              # Test reports
└── templates/           # Report templates
```

## 🔍 Test Scenarios

The project includes various test scenarios:
- Login functionality
- Product sorting and filtering
- Shopping cart operations
- Checkout process
- Price validation
- Multiple product handling

## 📊 Reports

HTML reports are generated after test execution in the `reports/html-report` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.