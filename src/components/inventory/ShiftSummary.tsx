import { Product } from '@/types/inventory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, CreditCard, Package, TrendingUp, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShiftSummaryProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  products: Product[];
}

export function ShiftSummary({ open, onClose, onConfirm, products }: ShiftSummaryProps) {
  // Calcular resumen del turno desde localStorage
  const getShiftSummary = () => {
    let totalInitial = 0;
    let totalSoldCash = 0;
    let totalSoldCredit = 0;
    let totalAvailable = 0;
    let productsWithSales = 0;
    const productsDetail: Array<{
      name: string;
      initial: number;
      soldCash: number;
      soldCredit: number;
      available: number;
    }> = [];

    products.forEach((product) => {
      const key = `shift_${product.id}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const shiftData = JSON.parse(data);
          const initial = shiftData.initialQuantity || 0;
          const soldCash = shiftData.soldCash || 0;
          const soldCredit = shiftData.soldCredit || 0;
          const available = initial - soldCash - soldCredit;

          totalInitial += initial;
          totalSoldCash += soldCash;
          totalSoldCredit += soldCredit;
          totalAvailable += available;

          if (soldCash > 0 || soldCredit > 0) {
            productsWithSales++;
            productsDetail.push({
              name: product.name,
              initial,
              soldCash,
              soldCredit,
              available,
            });
          }
        } catch (e) {
          // Ignore invalid data
        }
      }
    });

    return {
      totalInitial,
      totalSoldCash,
      totalSoldCredit,
      totalSold: totalSoldCash + totalSoldCredit,
      totalAvailable,
      productsWithSales,
      productsDetail: productsDetail.sort((a, b) => {
        const totalA = a.soldCash + a.soldCredit;
        const totalB = b.soldCash + b.soldCredit;
        return totalB - totalA; // Sort by total sold descending
      }),
      date: new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const summary = getShiftSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateTotalValue = (quantity: number) => {
    return products.reduce((sum, p) => {
      const price = p.price || 0;
      return sum + price * quantity;
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Resumen del Turno
          </DialogTitle>
          <DialogDescription>
            Resumen de ventas y movimientos del turno actual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fecha y Hora */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Fecha del Turno</div>
            <div className="text-lg font-semibold capitalize">{summary.date}</div>
            <div className="text-sm text-muted-foreground mt-1">Hora de cierre: {summary.time}</div>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Cantidad Inicial</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.totalInitial}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">unidades</div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Total Vendido</span>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.totalSold}</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">unidades</div>
            </div>
          </div>

          {/* Desglose de Ventas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Desglose de Ventas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Ventas al Contado</span>
                </div>
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{summary.totalSoldCash}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">unidades</div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Ventas a Crédito</span>
                </div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{summary.totalSoldCredit}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">unidades</div>
              </div>
            </div>
          </div>

          {/* Cantidad Disponible */}
          <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cantidad Disponible al Finalizar</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {summary.totalAvailable} unidades
              </Badge>
            </div>
          </div>

          {/* Detalle de Productos con Ventas */}
          {summary.productsDetail && summary.productsDetail.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalle por Producto ({summary.productsDetail.length})
              </h3>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {summary.productsDetail.map((product, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="font-semibold text-sm mb-2">{product.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Inicial: </span>
                          <span className="font-medium">{product.initial}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Disponible: </span>
                          <span className="font-medium">{product.available}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contado: </span>
                          <span className="font-medium text-orange-600">{product.soldCash}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Crédito: </span>
                          <span className="font-medium text-purple-600">{product.soldCredit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto gradient-primary text-primary-foreground">
            Finalizar Turno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

