// apps/admin-frontend/src/components/suppliers/SupplierCard.tsx
// ✅ SOLID: Single Responsibility - UI rendering only

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Star,
} from "lucide-react";
import { Supplier } from "@/services/catalog.service";

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  getTypeLabel: (type: string) => string;
}

export function SupplierCard({
  supplier,
  onEdit,
  onDelete,
  getTypeLabel,
}: SupplierCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              {supplier.name}
              {supplier.isPreferred && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </h3>
            <p className="text-sm text-gray-500">{supplier.code}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            supplier.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {supplier.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Loại:</span>{" "}
          {getTypeLabel(supplier.type)}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Mail className="w-4 h-4" />
          {supplier.contactInfo.email}
        </p>
        {supplier.contactInfo.phone && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {supplier.contactInfo.phone}
          </p>
        )}
        {supplier.contactInfo.city && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {supplier.contactInfo.city}
          </p>
        )}
      </div>

      {supplier.capabilities?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {supplier.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
            >
              {cap}
            </span>
          ))}
          {supplier.capabilities.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              +{supplier.capabilities.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() =>
            (window.location.href = `/catalog/suppliers/${supplier._id}`)
          }
          className="flex-1 px-3 py-2 text-sm border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50"
        >
          Chi tiết
        </button>
        <button
          onClick={() => onEdit(supplier)}
          className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <Edit2 className="w-4 h-4 inline mr-1" />
          Sửa
        </button>
        <button
          onClick={() => onDelete(supplier._id)}
          className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
