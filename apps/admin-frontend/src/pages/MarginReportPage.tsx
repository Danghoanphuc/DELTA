import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface ProductMargin {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

interface CustomerMargin {
  organizationId: string;
  organizationName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

interface MarginReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    averageMarginPercentage: number;
    orderCount: number;
  };
  byProduct: ProductMargin[];
  byCustomer: CustomerMargin[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function MarginReportPage() {
  const [report, setReport] = useState<MarginReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/costs/margin-report", {
        params: { startDate, endDate },
      });
      setReport(response.data.data.report);
      toast({
        title: "Success",
        description: "Margin report loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load margin report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading margin report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Margin Report</h1>
          <p className="text-muted-foreground">
            Analyze profitability by product and customer
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchReport} disabled={isLoading}>
              <Calendar className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(report.summary.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(report.summary.totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(report.summary.totalMargin)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Margin %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                report.summary.averageMarginPercentage < 20
                  ? "text-red-500"
                  : report.summary.averageMarginPercentage >= 30
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {report.summary.averageMarginPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.summary.orderCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Product and Customer Views */}
      <Tabs defaultValue="product" className="space-y-4">
        <TabsList>
          <TabsTrigger value="product">By Product</TabsTrigger>
          <TabsTrigger value="customer">By Customer</TabsTrigger>
        </TabsList>

        {/* By Product Tab */}
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Margin by Product</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportToCSV(report.byProduct, "margin-by-product")
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byProduct
                    .sort((a, b) => b.margin - a.margin)
                    .map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">
                          {product.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.orderCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.cost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(product.margin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              product.marginPercentage < 20
                                ? "text-red-500"
                                : product.marginPercentage >= 30
                                ? "text-green-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {product.marginPercentage.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Customer Tab */}
        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Margin by Customer</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportToCSV(report.byCustomer, "margin-by-customer")
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byCustomer
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((customer) => (
                      <TableRow key={customer.organizationId}>
                        <TableCell className="font-medium">
                          {customer.organizationName}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.orderCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.cost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(customer.margin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              customer.marginPercentage < 20
                                ? "text-red-500"
                                : customer.marginPercentage >= 30
                                ? "text-green-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {customer.marginPercentage.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
