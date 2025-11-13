// src/modules/orders/order.controller.js
import { OrderService } from "./order.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req, res, next) => {
    try {
      const order = await this.orderService.createOrder(req.user, req.body);
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ order }, "Đặt hàng thành công!"));
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req, res, next) => {
    try {
      const orders = await this.orderService.getMyOrders(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ orders }));
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req, res, next) => {
    try {
      const order = await this.orderService.getOrderById(
        req.user._id,
        req.params.orderId
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ order }));
    } catch (error) {
      next(error);
    }
  };

  getPrinterOrders = async (req, res, next) => {
    try {
      const orders = await this.orderService.getPrinterOrders(
        req.user._id,
        req.query
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ orders }));
    } catch (error) {
      next(error);
    }
  };

  getPrinterOrderById = async (req, res, next) => {
    try {
      const order = await this.orderService.getPrinterOrderById(
        req.user._id,
        req.params.orderId
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ order }));
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatusByPrinter = async (req, res, next) => {
    try {
      const order = await this.orderService.updateOrderStatusByPrinter(
        req.user._id,
        req.params.orderId,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ order }, "Cập nhật trạng thái thành công!")
        );
    } catch (error) {
      next(error);
    }
  };
}
