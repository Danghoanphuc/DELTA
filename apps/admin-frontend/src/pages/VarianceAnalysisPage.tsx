import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface OrderVariance {
  orderId: string;
  orderNumber: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  reasons: string[];
}

interface VarianceAnalysis {
  summary: {
    totalEstimated: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
    orderCount: number;
  };
  byOrder: OrderVariance[];
  reasons: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function VarianceAnalysisPage() {
  const [analysis, setAnalysis] = useState<VarianceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/costs/variance", {
        params: { startDate, endDate },
      });
      setAnalysis(response.data.data.analysis);
      toast({
        title: "Success",
        description: "Variance analysis loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load variance analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getVarianceBadge = (variancePercentage: number) => {
    if (Math.abs(variancePercentage) < 5) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          On Target
        </Badge>
      );
    } else if (variancePercentage > 0) {
      return (
        <Badge variant="destructive">
          <TrendingUp className="mr-1 h-3 w-3" />
          Overrun {Math.abs(variancePercentage).toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <TrendingDown className="mr-1 h-3 w-3" />
          Savings {Math.abs(variancePercentage).toFixed(1)}%
        </Badge>
      );
    }
  };

  const exportToCSV = () => {
    if (!analysis || analysis.byOrder.length === 0) return;

    const headers = [
      "Order Number",
      "Estimated Cost",
      "Actual Cost",
      "Variance",
      "Variance %",
      "Status",
    ];
    const rows = analysis.byOrder.map((order) => [
      order.orderNumber,
      order.estimatedCost,
      order.actualCost,
      order.variance,
      order.variancePercentage.toFixed(2),
      Math.abs(order.variancePercentage) < 5
        ? "On Target"
        : order.variancePercentage > 0
        ? "Overrun"
        : "Savings",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `variance-analysis-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading variance analysis...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overrunOrders = analysis.byOrder.filter(
    (o) => o.variancePercentage > 5
  );
  const savingsOrders = analysis.byOrder.filter(
    (o) => o.variancePercentage < -5
  );
  const onTargetOrders = analysis.byOrder.filter(
    (o) => Math.abs(o.variancePercentage) <= 5
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost Variance Analysis</h1>
          <p className="text-muted-foreground">
            Compare estimated vs actual costs to identify trends
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
            <Button onClick={fetchAnalysis} disabled={isLoading}>
              <Calendar className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Generate Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysis.summary.totalEstimated)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysis.summary.totalActual)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                analysis.summary.totalVariance > 0
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {analysis.summary.totalVariance > 0 ? "+" : ""}
              {formatCurrency(analysis.summary.totalVariance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                analysis.summary.variancePercentage > 0
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {analysis.summary.variancePercentage > 0 ? "+" : ""}
              {analysis.summary.variancePercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.summary.orderCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Cost Overruns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {overrunOrders.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {(
                (overrunOrders.length / analysis.summary.orderCount) *
                100
              ).toFixed(1)}
              % of orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              On Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {onTargetOrders.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {(
                (onTargetOrders.length / analysis.summary.orderCount) *
                100
              ).toFixed(1)}
              % of orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {savingsOrders.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {(
                (savingsOrders.length / analysis.summary.orderCount) *
                100
              ).toFixed(1)}
              % of orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variance Details Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Variance by Order</CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead>Reasons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.byOrder
                .sort(
                  (a, b) =>
                    Math.abs(b.variancePercentage) -
                    Math.abs(a.variancePercentage)
                )
                .map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.estimatedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.actualCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          order.variance > 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {order.variance > 0 ? "+" : ""}
                        {formatCurrency(order.variance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {getVarianceBadge(order.variancePercentage)}
                    </TableCell>
                    <TableCell>
                      {order.reasons.length > 0 ? (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="reasons" className="border-0">
                            <AccordionTrigger className="py-0 hover:no-underline">
                              <span className="text-sm text-blue-600">
                                View {order.reasons.length} reason(s)
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {order.reasons.map((reason, idx) => (
                                  <li
                                    key={idx}
                                    className="text-muted-foreground"
                                  >
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No reasons
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {overrunOrders.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li>
                • {overrunOrders.length} orders exceeded estimated costs. Review
                supplier pricing and production processes.
              </li>
              {analysis.summary.variancePercentage > 10 && (
                <li>
                  • Overall variance is{" "}
                  {analysis.summary.variancePercentage.toFixed(1)}%. Consider
                  updating cost estimation models.
                </li>
              )}
              <li>
                • Analyze common variance reasons to identify systematic issues
                in cost estimation.
              </li>
              <li>
                • Consider negotiating better rates with suppliers for
                frequently overrun items.
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
