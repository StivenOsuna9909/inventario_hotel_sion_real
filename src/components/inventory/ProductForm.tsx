import { useState, useEffect } from 'react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, X } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: Product | null;
  categories: string[];
  isAdmin?: boolean;
}

export function ProductForm({ open, onClose, onSubmit, product, categories, isAdmin = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    quantity: 0,
    imageUrl: '',
    category: '',
    minStock: 5,
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost ?? 0,
        quantity: product.initialQuantity ?? product.quantity,
        imageUrl: product.imageUrl,
        category: product.category,
        minStock: product.minStock,
      });
      setImageError(false);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        quantity: 0,
        imageUrl: '',
        category: categories[0] || '',
        minStock: 5,
      });
      setImageError(false);
    }
  }, [product, categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // When creating/editing, set initialQuantity to the quantity entered
    // and soldQuantity to 0 (or keep existing if editing)
    const productData = {
      ...formData,
      cost: formData.cost > 0 ? formData.cost : undefined,
      initialQuantity: formData.quantity,
      soldQuantity: product?.soldQuantity ?? 0,
      soldQuantityCash: product?.soldQuantityCash ?? 0,
      soldQuantityCredit: product?.soldQuantityCredit ?? 0,
    };
    onSubmit(productData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Coca-Cola 600ml"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el producto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                min={0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                min={0}
                required
              />
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="cost">Costo (COP)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                min={0}
                placeholder="Costo del producto para calcular margen de ganancia"
              />
              {formData.cost > 0 && formData.price > 0 && (
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Margen de ganancia:</span>
                    <span className="font-semibold text-primary">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(formData.price - formData.cost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen porcentual:</span>
                    <span className="font-semibold text-primary">
                      {((formData.price - formData.cost) / formData.price * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Bebidas"
                list="categories"
                required
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de imagen</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                setImageError(false);
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            
            {formData.imageUrl && (
              <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                {!imageError ? (
                  <img
                    src={formData.imageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground">
              {product ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
