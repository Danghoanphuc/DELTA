"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ Định nghĩa schema
const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  category: z.string().min(1, "Danh mục không được để trống"),
  specifications: z.object({
    material: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
  }),
  pricing: z
    .array(
      z.object({
        minQuantity: z.number().min(1, "Số lượng tối thiểu phải lớn hơn 0"),
        pricePerUnit: z.number().min(0, "Giá phải không âm"),
      })
    )
    .min(1, "Cần ít nhất một mức giá"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      specifications: {
        material: "",
        size: "",
        color: "",
      },
      pricing: [{ minQuantity: 1, pricePerUnit: 0 }],
      description: "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    console.log("Form data:", data);
    // TODO: gọi API tạo sản phẩm ở đây
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên sản phẩm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Sticker, Sổ tay..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông số kỹ thuật */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="specifications.material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chất liệu</FormLabel>
                <FormControl>
                  <Input placeholder="Giấy, nhựa..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specifications.size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kích thước</FormLabel>
                <FormControl>
                  <Input placeholder="A4, A5..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specifications.color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu sắc</FormLabel>
                <FormControl>
                  <Input placeholder="Đen, Trắng..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Lưu sản phẩm
        </Button>
      </form>
    </Form>
  );
}
