// src/features/customer/components/settings/SecuritySettingsTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Loader2 } from "lucide-react";
import { useCustomerSettings } from "@/features/customer/hooks/useCustomerSettings";

export function SecuritySettingsTab() {
  const { passwordForm, isPasswordSubmitting, onChangePassword } =
    useCustomerSettings();

  return (
    <Card>
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Thay đổi mật khẩu đăng nhập của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPasswordSubmitting}>
              {isPasswordSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Đổi mật khẩu
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
