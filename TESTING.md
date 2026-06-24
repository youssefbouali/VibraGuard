# Testing Guide - VibraGuard Project

## Overview

This document provides comprehensive guidance on running and writing tests for the VibraGuard project, which includes components in Java, TypeScript/React, Solidity, and Python.

## Quick Start

### Backend (Java/Spring Boot)

```bash
cd vibraguard/backend
mvn test
```

Run specific test:
```bash
mvn test -Dtest=ApiGatewayApplicationTests
```

Generate coverage report (with JaCoCo):
```bash
# Run tests with coverage profile
mvn test -Pcoverage

# View individual reports: <service>/target/site/jacoco/index.html
# View aggregated report: target/site/jacoco/index.html
```

Run coverage check (enforces 80% line, 70% branch):
```bash
mvn verify -Pcoverage
```

### Frontend (React/Vitest)

```bash
cd vibraguard/frontend
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

Generate coverage report:
```bash
pnpm test:coverage
```

### Blockchain (Hardhat)

```bash
cd vibraguard/blockchain-net
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Python ML Model

```bash
cd vibraguard/ia_model
pytest tests/ -v
```

Generate coverage report:
```bash
pytest tests/ --cov=. --cov-report=html
```

## Test Structure

### Backend Tests
- **Location**: `vibraguard/backend/api-gateway/src/test/java/com/vibraguard/`
- **Framework**: JUnit 5, Spring Boot Test
- **Convention**: `*Test.java` or `*Tests.java`
- **Key Dependencies**:
  - spring-boot-starter-test
  - reactor-test
  - mockito-core

### Frontend Tests
- **Location**: `vibraguard/frontend/client/__tests__/`
- **Framework**: Vitest with React Testing Library
- **Convention**: `*.test.tsx` or `*.test.ts`
- **Key Files**:
  - vitest.config.ts - Vitest configuration

### Frontend (Optional Jest)
- **Location**: `vibraguard/frontend/client/__tests__/`
- **Framework**: Jest with `ts-jest`
- **Key Files**:
  - jest.config.cjs - Jest configuration
  - jest.setup.ts - Jest DOM setup
- **Run**:
  ```bash
  cd vibraguard/frontend
  pnpm test:jest
  ```

### Frontend E2E (Cypress)
- **Location**: `vibraguard/frontend/cypress/`
- **Framework**: Cypress end-to-end testing
- **Key Files**:
  - cypress.config.ts - Cypress configuration
  - cypress/e2e/app.cy.ts - sample smoke test
- **Run**:
  ```bash
  cd vibraguard/frontend
  pnpm cypress:run
  ```

### Load Testing (JMeter)
- **Location**: `vibraguard/backend/jmeter/api-gateway-load-test.jmx`
- **Purpose**: Simulate load against the API Gateway health endpoint
- **Run**: Open the `.jmx` file in JMeter or use:
  ```bash
  jmeter -n -t vibraguard/backend/jmeter/api-gateway-load-test.jmx -l vibraguard/backend/jmeter/results.jtl
  ```

### Blockchain Tests
- **Location**: `vibraguard/blockchain-net/test/`
- **Framework**: Hardhat with Chai assertions
- **Convention**: `*.test.js`
- **Key Files**:
  - hardhat.config.js - Hardhat configuration

### Python Tests
- **Location**: `vibraguard/ia_model/tests/`
- **Framework**: Pytest
- **Convention**: `test_*.py`
- **Key Files**:
  - pytest.ini - Pytest configuration

## Writing Tests

### Backend (Java)

```java
@SpringBootTest
public class MyServiceTests {
    
    @Autowired
    private MyService myService;
    
    @Test
    public void testServiceBehavior() {
        // Arrange
        String input = "test";
        
        // Act
        String result = myService.process(input);
        
        // Assert
        assertNotNull(result);
        assertEquals("EXPECTED", result);
    }
}
```

### Frontend (TypeScript/React)

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Blockchain (Solidity)

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
  it("should deploy successfully", async function () {
    const MyContract = await ethers.getContractFactory("MyContract");
    const contract = await MyContract.deploy();
    expect(contract.target).to.not.equal(ethers.ZeroAddress);
  });
});
```

### Python

```python
import pytest

def test_simple_function():
    # Arrange
    value = 5
    
    # Act
    result = value * 2
    
    # Assert
    assert result == 10
```

## GitHub Actions

The project includes automated testing via GitHub Actions:

- **backend-tests.yml** - Runs Java/Spring tests on Maven
- **frontend-tests.yml** - Runs React/TypeScript tests with Vitest
- **blockchain-tests.yml** - Runs Hardhat smart contract tests
- **python-tests.yml** - Runs Python tests with Pytest
- **ci-cd.yml** - Main CI/CD pipeline that coordinates all tests
- **build-deploy.yml** - Build and deployment pipeline

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

## Coverage Goals

- **Backend**: Aim for >80% code coverage
- **Frontend**: Aim for >70% code coverage
- **Blockchain**: Aim for >85% code coverage
- **Python ML**: Aim for >75% code coverage

## Best Practices

1. **Write tests as you code** - Don't leave testing until the end
2. **Use descriptive test names** - Test names should describe what they test
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Mock external dependencies** - Isolate the code under test
5. **Test edge cases** - Don't just test the happy path
6. **Keep tests focused** - One assertion per test when possible
7. **Use fixtures and factories** - Reduce test duplication
8. **Document complex tests** - Add comments for non-obvious logic

## Debugging Tests

### Backend
```bash
mvn test -Dtest=MyTest -DforkMode=never -DreuseForks=false
```

### Frontend
```bash
pnpm test:watch
```

### Blockchain
```bash
npx hardhat test --grep "test name pattern"
```

### Python
```bash
pytest tests/test_file.py -v -s
```

## Integration Tests

For integration tests involving multiple components, create separate test suites and mark them with appropriate markers:

```python
@pytest.mark.integration
def test_mqtt_to_kafka_flow():
    # Test end-to-end message flow
    pass
```

## Continuous Integration

The CI/CD pipeline will:
1. Run all tests on every push and PR
2. Generate coverage reports
3. Upload coverage to Codecov
4. Archive test results as artifacts
5. Fail the build if any tests fail

## Troubleshooting

### Java Tests Won't Run
- Ensure Java 17+ is installed
- Run `mvn clean install` to rebuild

### Frontend Tests Fail
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check Node version: `node -v` (should be 18+)

### Blockchain Tests Timeout
- Ensure sufficient disk space
- Try running with: `npx hardhat test --network hardhat`

### Python Tests Import Errors
- Install requirements: `pip install -r requirements.txt`
- Add ia_model to PYTHONPATH: `export PYTHONPATH=$PYTHONPATH:/path/to/ia_model`

## Additional Resources

- [JUnit 5 Documentation](https://junit.org/junit5/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test)
- [Pytest Documentation](https://pytest.org/)
