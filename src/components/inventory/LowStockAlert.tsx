import { Product } from '@/types/inventory';
import { AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  
  if (lowStockProducts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <Package className="h-5 w-5 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">Stock Saludable</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Todos los productos tienen stock suficiente.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 border-l-4 border-l-warning animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Alertas de Stock</h3>
          <p className="text-sm text-muted-foreground">
            {lowStockProducts.length} producto(s) requieren atención
          </p>
        </div>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-3">
          {lowStockProducts.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-medium text-sm text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {product.minStock} unidades
                  </p>
                </div>
              </div>
              <Badge
                variant={product.quantity === 0 ? 'destructive' : 'secondary'}
                className={product.quantity === 0 ? 'bg-alert' : 'bg-warning text-warning-foreground'}
              >
                {product.quantity} uds
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
