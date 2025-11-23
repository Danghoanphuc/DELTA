import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export const SpecsForm = ({ config, specs, onChange }: any) => {
  if (!config) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Kích thước</Label>
        <Select value={specs.size} onValueChange={(v) => onChange("size", v)}>
          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {config.sizes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Chất liệu</Label>
        <Select value={specs.material} onValueChange={(v) => onChange("material", v)}>
          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {config.materials.map((m: string) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Số lượng ({config.unit})</Label>
        <Select value={String(specs.quantity)} onValueChange={(v) => onChange("quantity", Number(v))}>
          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {config.quantities.map((q: number) => <SelectItem key={q} value={String(q)}>{q}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Ghi chú</Label>
        <Input 
          className="bg-white" 
          placeholder="VD: Bo góc..." 
          value={specs.note}
          onChange={(e) => onChange("note", e.target.value)}
        />
      </div>
    </div>
  );
};