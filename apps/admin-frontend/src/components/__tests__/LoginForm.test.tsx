// apps/admin-frontend/src/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "../auth/LoginForm";

describe("LoginForm", () => {
  const mockProps = {
    email: "",
    setEmail: jest.fn(),
    password: "",
    setPassword: jest.fn(),
    error: null,
    isLoading: false,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form", () => {
    render(<LoginForm {...mockProps} />);

    expect(screen.getByText("PrintZ Admin")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đăng nhập" })
    ).toBeInTheDocument();
  });

  it("should focus email input on mount", () => {
    render(<LoginForm {...mockProps} />);

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveFocus();
  });

  it("should call setEmail when email input changes", () => {
    render(<LoginForm {...mockProps} />);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(mockProps.setEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("should call setPassword when password input changes", () => {
    render(<LoginForm {...mockProps} />);

    const passwordInput = screen.getByLabelText("Mật khẩu");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(mockProps.setPassword).toHaveBeenCalledWith("password123");
  });

  it("should call onSubmit when form is submitted", () => {
    render(<LoginForm {...mockProps} />);

    const form = screen
      .getByRole("button", { name: "Đăng nhập" })
      .closest("form");
    fireEvent.submit(form!);

    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it("should display error message when error prop is provided", () => {
    const errorMessage = "Invalid credentials";
    render(<LoginForm {...mockProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should disable inputs and button when loading", () => {
    render(<LoginForm {...mockProps} isLoading={true} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");
    const submitButton = screen.getByRole("button");

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Đang xử lý...");
  });

  it("should show login button text when not loading", () => {
    render(<LoginForm {...mockProps} />);

    const submitButton = screen.getByRole("button");
    expect(submitButton).toHaveTextContent("Đăng nhập");
  });
});
