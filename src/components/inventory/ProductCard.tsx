import { useState, useEffect } from 'react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Package, Play, ShoppingCart, DollarSign, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onSetInitialQuantity?: (id: string, quantity: number) => void;
  onRecordSale?: (id: string, quantity: number, saleType: 'cash' | 'credit') => void;
}

export function ProductCard({ 
  product, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onUpdateQuantity,
  onSetInitialQuantity,
  onRecordSale
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [initialQuantityDialogOpen, setInitialQuantityDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [initialQuantityInput, setInitialQuantityInput] = useState((product.initialQuantity ?? 0).toString());
  const [saleQuantityInput, setSaleQuantityInput] = useState('0');
  const [saleType, setSaleType] = useState<'cash' | 'credit'>('cash');
  const [roomNumberInput, setRoomNumberInput] = useState('');

  // Get shift data from localStorage
  const getShiftData = () => {
    const key = `shift_${product.id}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Migrar estructura antigua a nueva si es necesario
        if (!parsed.creditSales) {
          parsed.creditSales = [];
        }
        // Calcular soldCredit desde creditSales si hay ventas a crédito detalladas
        if (parsed.creditSales && Array.isArray(parsed.creditSales) && parsed.creditSales.length > 0) {
          parsed.soldCredit = parsed.creditSales.reduce((sum: number, sale: { quantity: number }) => sum + (sale.quantity || 0), 0);
        } else {
          // Mantener soldCredit existente si no hay creditSales (estructura antigua)
          parsed.soldCredit = parsed.soldCredit || 0;
        }
        return parsed;
      } catch {
        return { initialQuantity: product.quantity, soldCash: 0, soldCredit: 0, creditSales: [] };
      }
    }
    return { initialQuantity: product.quantity, soldCash: 0, soldCredit: 0, creditSales: [] };
  };

  const [shiftData, setShiftData] = useState(getShiftData());

  // Sync shift data when product changes
  useEffect(() => {
    const data = getShiftData();
    setShiftData(data);
  }, [product.quantity, product.id]);

  const availableQuantity = Math.max(0, shiftData.initialQuantity - shiftData.soldCash - shiftData.soldCredit);
  const isLowStock = availableQuantity <= product.minStock && availableQuantity > 0;
  const isOutOfStock = availableQuantity === 0;

  const handleSetInitialQuantity = () => {
    const qty = parseInt(initialQuantityInput) || 0;
    if (qty >= 0) {
      // Save to localStorage
      const key = `shift_${product.id}`;
      const newData = { initialQuantity: qty, soldCash: 0, soldCredit: 0, creditSales: [] };
      localStorage.setItem(key, JSON.stringify(newData));
      setShiftData(newData);
      
      // Update in database
      if (onSetInitialQuantity) {
        onSetInitialQuantity(product.id, qty);
      }
      setInitialQuantityDialogOpen(false);
    }
  };

  const handleRecordSale = () => {
    const qty = parseInt(saleQuantityInput) || 0;
    if (qty > 0 && qty <= availableQuantity) {
      // Validar número de habitación si es crédito
      if (saleType === 'credit' && !roomNumberInput.trim()) {
        return; // No permitir venta a crédito sin número de habitación
      }

      // Update localStorage
      const key = `shift_${product.id}`;
      const newData = { ...shiftData };
      
      // Asegurar que creditSales existe
      if (!newData.creditSales) {
        newData.creditSales = [];
      }
      
      if (saleType === 'cash') {
        newData.soldCash = (newData.soldCash || 0) + qty;
      } else {
        // Agregar venta a crédito con número de habitación
        newData.creditSales = [...(newData.creditSales || []), {
          quantity: qty,
          roomNumber: roomNumberInput.trim()
        }];
        // Calcular total de crédito
        newData.soldCredit = newData.creditSales.reduce((sum: number, sale: { quantity: number }) => sum + (sale.quantity || 0), 0);
      }
      
      localStorage.setItem(key, JSON.stringify(newData));
      setShiftData(newData);
      
      // Update in database
      if (onRecordSale) {
        onRecordSale(product.id, qty, saleType);
      }
      setSaleQuantityInput('0');
      setSaleType('cash');
      setRoomNumberInput('');
      setSaleDialogOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden animate-slide-up transition-all duration-300 hover:shadow-xl group",
      isOutOfStock && "opacity-75"
    )}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock && (
            <Badge variant="destructive" className="bg-alert text-alert-foreground font-semibold">
              Sin Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-warning text-warning-foreground font-semibold">
              Stock Bajo
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-medium">
            {product.category}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
        </div>

        {/* Profit Margin (Admin Only) */}
        {isAdmin && product.cost !== undefined && product.cost > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-900 dark:text-green-100 mb-2 font-medium">Margen de Ganancia</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-700 dark:text-green-300">Costo:</span>
                <span className="font-semibold text-green-900 dark:text-green-100">{formatPrice(product.cost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700 dark:text-green-300">Ganancia:</span>
                <span className="font-bold text-green-900 dark:text-green-100">
                  {formatPrice(product.price - product.cost)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-green-200 dark:border-green-800 pt-1 mt-1">
                <span className="text-green-700 dark:text-green-300">Margen:</span>
                <span className="font-bold text-green-900 dark:text-green-100">
                  {((product.price - product.cost) / product.price * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Information */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inicial:</span>
            <span className="font-semibold">{shiftData.initialQuantity ?? 0}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vendido:</span>
              <span className="font-semibold text-orange-600">{(shiftData.soldCash || 0) + (shiftData.soldCredit || 0)}</span>
            </div>
            <div className="flex justify-between text-xs pl-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Contado:
              </span>
              <span className="font-medium">{shiftData.soldCash || 0}</span>
            </div>
            <div className="flex justify-between text-xs pl-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Crédito:
              </span>
              <span className="font-medium">{shiftData.soldCredit || 0}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">Disponible:</span>
            <span className={cn(
              "font-bold",
              isOutOfStock && "text-destructive",
              isLowStock && !isOutOfStock && "text-warning"
            )}>
              {availableQuantity}
            </span>
          </div>
        </div>

        {/* Shift Actions */}
        <div className="flex gap-2">
          {onSetInitialQuantity && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInitialQuantityInput(product.initialQuantity?.toString() || '0');
                setInitialQuantityDialogOpen(true);
              }}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Inicio Turno
            </Button>
          )}
          {onRecordSale && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSaleQuantityInput('0');
                setSaleType('cash');
                setRoomNumberInput('');
                setSaleDialogOpen(true);
              }}
              disabled={availableQuantity <= 0}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Registrar Venta
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex-1"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Set Initial Quantity Dialog */}
      <Dialog open={initialQuantityDialogOpen} onOpenChange={setInitialQuantityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Establecer Cantidad Inicial</DialogTitle>
            <DialogDescription>
              Ingresa la cantidad inicial de {product.name} al comenzar el turno.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={initialQuantityInput}
              onChange={(e) => setInitialQuantityInput(e.target.value)}
              placeholder="Cantidad inicial"
              min={0}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInitialQuantityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSetInitialQuantity}>
              Establecer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Sale Dialog */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>
              Ingresa la cantidad vendida de {product.name}. Disponible: {availableQuantity} unidades.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saleQuantity">Cantidad vendida</Label>
              <Input
                id="saleQuantity"
                type="number"
                value={saleQuantityInput}
                onChange={(e) => setSaleQuantityInput(e.target.value)}
                placeholder="Cantidad vendida"
                min={1}
                max={availableQuantity}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de pago</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={saleType === 'cash' ? 'default' : 'outline'}
                  onClick={() => setSaleType('cash')}
                  className="flex-1"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Contado
                </Button>
                <Button
                  type="button"
                  variant={saleType === 'credit' ? 'default' : 'outline'}
                  onClick={() => setSaleType('credit')}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Crédito
                </Button>
              </div>
            </div>
            {saleType === 'credit' && (
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Número de habitación</Label>
                <Input
                  id="roomNumber"
                  type="text"
                  value={roomNumberInput}
                  onChange={(e) => setRoomNumberInput(e.target.value)}
                  placeholder="Ej: 101, 205, etc."
                  className="w-full"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRecordSale}
              disabled={
                !saleQuantityInput || 
                parseInt(saleQuantityInput) <= 0 || 
                parseInt(saleQuantityInput) > availableQuantity ||
                (saleType === 'credit' && !roomNumberInput.trim())
              }
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
