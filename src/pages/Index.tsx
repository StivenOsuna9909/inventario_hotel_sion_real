import { useState, useEffect, useRef } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/inventory';
import { StatsCard } from '@/components/inventory/StatsCard';
import { ProductCard } from '@/components/inventory/ProductCard';
import { ProductForm } from '@/components/inventory/ProductForm';
import { SearchFilters } from '@/components/inventory/SearchFilters';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { TutorialGuiado } from '@/components/inventory/TutorialGuiado';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, Boxes, DollarSign, AlertTriangle, Plus, LogOut, User, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ShiftSummary } from '@/components/inventory/ShiftSummary';

const Index = () => {
  const {
    products,
    allProducts,
    stats,
    categories,
    isAdmin,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    addProduct,
    updateProduct,
    updateQuantity,
    setInitialQuantity,
    recordSale,
    deleteProduct,
  } = useInventory();

  const { user, role, signOut } = useAuth();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Producto actualizado",
          description: `${productData.name} se ha actualizado correctamente.`,
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Producto agregado",
          description: `${productData.name} se ha agregado al inventario.`,
        });
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMessage = error?.message || error?.error_description || 'Error desconocido';
      toast({
        title: "Error",
        description: error?.code === '42501' || error?.message?.includes('permission') || error?.message?.includes('permissions')
          ? "No tienes permisos para realizar esta acción. Verifica que tengas rol de administrador."
          : `Error: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const product = allProducts.find(p => p.id === productToDelete);
      try {
        await deleteProduct(productToDelete);
        toast({
          title: "Producto eliminado",
          description: `${product?.name} se ha eliminado del inventario.`,
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No tienes permisos para eliminar productos.",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleQuantityUpdate = async (id: string, quantity: number) => {
    try {
      await updateQuantity(id, quantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la cantidad.",
        variant: "destructive",
      });
    }
  };

  const handleSetInitialQuantity = async (id: string, quantity: number) => {
    try {
      await setInitialQuantity(id, quantity);
      toast({
        title: "Cantidad inicial establecida",
        description: "La cantidad inicial del turno se ha establecido correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al establecer la cantidad inicial.",
        variant: "destructive",
      });
    }
  };

  const handleRecordSale = async (id: string, quantity: number, saleType: 'cash' | 'credit') => {
    try {
      await recordSale(id, quantity, saleType);
      const product = allProducts.find(p => p.id === id);
      const saleTypeText = saleType === 'cash' ? 'contado' : 'crédito';
      toast({
        title: "Venta registrada",
        description: `Se registraron ${quantity} unidades vendidas de ${product?.name} al ${saleTypeText}.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage.includes('Error al registrar') 
          ? errorMessage 
          : `Error al registrar la venta: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const handleFinalizeShift = () => {
    // Verificar si hay datos de turno
    const hasShiftData = allProducts.some((product) => {
      const key = `shift_${product.id}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const shiftData = JSON.parse(data);
          return (shiftData.soldCash || 0) > 0 || (shiftData.soldCredit || 0) > 0;
        } catch {
          return false;
        }
      }
      return false;
    });

    if (!hasShiftData) {
      toast({
        title: "Sin datos de turno",
        description: "No hay ventas registradas en este turno.",
        variant: "destructive",
      });
      return;
    }

    setShiftSummaryOpen(true);
  };

  const handleConfirmFinalizeShift = () => {
    // Guardar resumen del turno ANTES de limpiar
    const shiftSummary = {
      date: new Date().toISOString(),
      products: allProducts.map((product) => {
        const key = `shift_${product.id}`;
        const data = localStorage.getItem(key);
        let shiftData = { initialQuantity: 0, soldCash: 0, soldCredit: 0 };
        if (data) {
          try {
            shiftData = JSON.parse(data);
          } catch {}
        }
        return {
          productId: product.id,
          productName: product.name,
          ...shiftData,
        };
      }),
    };

    // Guardar en historial (para futuras referencias)
    const historyKey = `shift_history_${Date.now()}`;
    localStorage.setItem(historyKey, JSON.stringify(shiftSummary));

    // Limpiar datos de turno actual del localStorage
    allProducts.forEach((product) => {
      const key = `shift_${product.id}`;
      localStorage.removeItem(key);
    });

    setShiftSummaryOpen(false);
    toast({
      title: "Turno finalizado",
      description: "El resumen del turno ha sido guardado correctamente.",
    });

    // Recargar productos para actualizar la UI
    window.location.reload();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <Boxes className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
                <p className="text-sm text-muted-foreground">Gestión de productos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate max-w-[150px]">{user?.email}</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? 'Admin' : 'Usuario'}
                </Badge>
              </div>
              <Button 
                onClick={handleFinalizeShift} 
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                data-tutorial="finalize-shift"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Turno
              </Button>
              {isAdmin && (
                <Button 
                  onClick={handleAddProduct} 
                  className="gradient-primary text-primary-foreground"
                  data-tutorial="add-product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tutorial="stats">
          <StatsCard
            title="Total Productos"
            value={stats.totalProducts}
            icon={<Package className="h-6 w-6" />}
          />
          <StatsCard
            title="Cantidad total en inventario"
            value={`${stats.totalStock} uds`}
            icon={<Boxes className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            title="Valor Inventario"
            value={formatCurrency(stats.totalValue)}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatsCard
            title="Stock Bajo"
            value={stats.lowStockProducts}
            icon={<AlertTriangle className="h-6 w-6" />}
            variant={stats.lowStockProducts > 0 ? 'warning' : 'success'}
            subtitle={stats.lowStockProducts > 0 ? 'Requieren atención' : 'Todo en orden'}
          />
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert products={allProducts} />

        {/* Search and Filters */}
        <div data-tutorial="search-filters">
          <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          categories={categories}
        />
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Productos ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay productos
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'No se encontraron productos con los filtros aplicados.'
                  : 'Comienza agregando tu primer producto al inventario.'}
              </p>
              {isAdmin && !searchTerm && categoryFilter === 'all' && stockFilter === 'all' && (
                <Button onClick={handleAddProduct} className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product.id} data-tutorial={index === 0 ? "product-card" : undefined}>
                  <ProductCard
                    product={product}
                    isAdmin={isAdmin}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteClick}
                    onUpdateQuantity={handleQuantityUpdate}
                    onSetInitialQuantity={handleSetInitialQuantity}
                    onRecordSale={handleRecordSale}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        categories={categories}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shift Summary Dialog */}
      <ShiftSummary
        open={shiftSummaryOpen}
        onClose={() => setShiftSummaryOpen(false)}
        onConfirm={handleConfirmFinalizeShift}
        products={allProducts}
      />

      {/* Tutorial Guiado */}
      <TutorialGuiado isAdmin={isAdmin} />
    </div>
  );
};

export default Index;
