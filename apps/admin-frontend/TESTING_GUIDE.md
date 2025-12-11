# Admin Frontend - Testing Guide

## 🎯 Overview

This guide covers testing strategy for the refactored admin-frontend following SOLID principles.

---

## 📦 Test Infrastructure

### Setup Complete ✅

1. **Jest Configuration** - `jest.config.js`
2. **Test Setup** - `src/setupTests.ts`
3. **Test Files** - `src/**/__tests__/*.test.ts(x)`

### Dependencies Required

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
```

### Installation

```bash
cd apps/admin-frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest
```

---

## 🧪 Test Structure

### Hooks Tests (`hooks/__tests__/`)

**Pattern**: Test state management and business logic

```typescript
// hooks/__tests__/use{Feature}.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { use{Feature} } from "../use{Feature}";
import { {feature}Service } from "@/services/{feature}Service";

jest.mock("@/services/{feature}Service");

describe("use{Feature}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data on mount", async () => {
    // Test implementation
  });

  it("should handle errors", async () => {
    // Test error handling
  });

  it("should create item successfully", async () => {
    // Test create operation
  });
});
```

### Component Tests (`components/__tests__/`)

**Pattern**: Test UI rendering and user interactions

```typescript
// components/__tests__/{Feature}Card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { {Feature}Card } from "../{feature}/{Feature}Card";

describe("{Feature}Card", () => {
  const mockProps = {
    data: { /* mock data */ },
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it("should render data correctly", () => {
    render(<{Feature}Card {...mockProps} />);
    expect(screen.getByText(mockProps.data.name)).toBeInTheDocument();
  });

  it("should call onEdit when edit button clicked", () => {
    render(<{Feature}Card {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(mockProps.onEdit).toHaveBeenCalled();
  });
});
```

---

## 📋 Test Coverage by Feature

### ✅ Completed (5 test files)

1. **useAuth.test.ts** (6 tests)

   - Initialize with empty credentials
   - Update email and password
   - Show error when credentials empty
   - Call signIn with correct credentials
   - Handle login error
   - Return isAuthenticated when token exists

2. **LoginForm.test.tsx** (8 tests)

   - Render login form
   - Focus email input on mount
   - Call setEmail when input changes
   - Call setPassword when input changes
   - Call onSubmit when form submitted
   - Display error message
   - Disable inputs when loading
   - Show correct button text

3. **useSuppliers.test.ts** (6 tests)

   - Fetch suppliers on mount
   - Handle fetch error
   - Create supplier successfully
   - Update supplier successfully
   - Delete supplier successfully
   - Filter suppliers by search term

4. **useSwagOrders.test.ts** (4 tests)

   - Fetch orders on mount
   - Filter orders by status
   - Create order successfully
   - Cancel order successfully

5. **useProducts.test.ts** (4 tests)
   - Fetch products on mount
   - Filter products by category
   - Search products by name
   - Create product successfully

**Total**: 28 test cases ✅

### ⏳ Remaining (7 hooks to test)

6. **useCategories.test.ts** (Estimated: 6 tests)
7. **useSwagOperations.test.ts** (Estimated: 5 tests)
8. **useFulfillmentQueue.test.ts** (Estimated: 6 tests)
9. **useOrderDetail.test.ts** (Estimated: 7 tests)
10. **useInventory.test.ts** (Estimated: 5 tests)
11. **useAnalytics.test.ts** (Estimated: 4 tests)
12. **usePrinterVetting.test.ts** (Estimated: 5 tests)
13. **useUsers.test.ts** (Estimated: 5 tests)

**Estimated Total**: 71 test cases

---

## 🚀 Running Tests

### Run All Tests

```bash
cd apps/admin-frontend
npm test
```

### Run Specific Test File

```bash
npm test -- useAuth.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Coverage Thresholds

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

---

## 📊 Test Patterns

### Pattern 1: Hook Testing

```typescript
describe("useFeature", () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test initial state
  it("should initialize correctly", () => {
    const { result } = renderHook(() => useFeature());
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  // Test async operations
  it("should fetch data", async () => {
    const mockData = [{ id: 1, name: "Test" }];
    (service.getData as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useFeature());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  // Test state updates
  it("should update state", () => {
    const { result } = renderHook(() => useFeature());

    act(() => {
      result.current.setFilter("test");
    });

    expect(result.current.filter).toBe("test");
  });

  // Test error handling
  it("should handle errors", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    (service.getData as jest.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useFeature());

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    consoleError.mockRestore();
  });
});
```

### Pattern 2: Component Testing

```typescript
describe("FeatureCard", () => {
  const mockProps = {
    data: { id: 1, name: "Test" },
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  // Test rendering
  it("should render correctly", () => {
    render(<FeatureCard {...mockProps} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  // Test user interactions
  it("should handle click events", () => {
    render(<FeatureCard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockProps.data);
  });

  // Test conditional rendering
  it("should show loading state", () => {
    render(<FeatureCard {...mockProps} isLoading={true} />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  // Test error states
  it("should display error message", () => {
    const error = "Something went wrong";
    render(<FeatureCard {...mockProps} error={error} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });
});
```

### Pattern 3: Integration Testing

```typescript
describe("FeaturePage Integration", () => {
  it("should load and display data", async () => {
    const mockData = [{ id: 1, name: "Test" }];
    (service.getData as jest.Mock).mockResolvedValue(mockData);

    render(<FeaturePage />);

    // Check loading state
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    // Check loading state is gone
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  it("should handle create flow", async () => {
    render(<FeaturePage />);

    // Click create button
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "New Item" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Testing Checklist

### Before Writing Tests

- [ ] Understand component/hook responsibility
- [ ] Identify all possible states
- [ ] List all user interactions
- [ ] Consider edge cases
- [ ] Plan test structure

### While Writing Tests

- [ ] Test one thing per test case
- [ ] Use descriptive test names
- [ ] Mock external dependencies
- [ ] Clean up after each test
- [ ] Use proper assertions

### After Writing Tests

- [ ] Run tests and verify they pass
- [ ] Check code coverage
- [ ] Review test readability
- [ ] Ensure tests are maintainable
- [ ] Document complex test logic

---

## 📈 Coverage Goals

### Current Coverage (5 files)

- **Hooks**: 5/12 (42%)
- **Components**: 1/21 (5%)
- **Total Test Cases**: 28

### Target Coverage (End of Week 1)

- **Hooks**: 12/12 (100%)
- **Components**: 10/21 (48%)
- **Total Test Cases**: 100+

### Final Coverage (End of Month)

- **Hooks**: 12/12 (100%)
- **Components**: 21/21 (100%)
- **Total Test Cases**: 150+
- **Code Coverage**: 80%+

---

## 🐛 Common Issues & Solutions

### Issue 1: Mock Not Working

```typescript
// ❌ Wrong
import { service } from "@/services/service";
jest.mock("@/services/service");

// ✅ Correct
jest.mock("@/services/service");
import { service } from "@/services/service";
```

### Issue 2: Async Test Timeout

```typescript
// ❌ Wrong
it("should fetch data", async () => {
  const { result } = renderHook(() => useFeature());
  expect(result.current.data).toEqual(mockData); // Fails - data not loaded yet
});

// ✅ Correct
it("should fetch data", async () => {
  const { result } = renderHook(() => useFeature());
  await waitFor(() => {
    expect(result.current.data).toEqual(mockData);
  });
});
```

### Issue 3: State Update Warning

```typescript
// ❌ Wrong
it("should update state", () => {
  const { result } = renderHook(() => useFeature());
  result.current.setState("new value"); // Warning: not wrapped in act()
});

// ✅ Correct
it("should update state", () => {
  const { result } = renderHook(() => useFeature());
  act(() => {
    result.current.setState("new value");
  });
});
```

---

## 📚 Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

### Best Practices

- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Hooks](https://react-hooks-testing-library.com/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🎉 Summary

**Testing Infrastructure**: ✅ Complete  
**Test Files Created**: 5  
**Test Cases Written**: 28  
**Coverage**: 42% hooks, 5% components  
**Next Steps**: Write remaining 7 hook tests + 20 component tests

**Estimated Time to 100% Coverage**: 2-3 days

---

**Last Updated**: 2024-12-07  
**Version**: 1.0  
**Status**: 🚀 Ready for Testing
