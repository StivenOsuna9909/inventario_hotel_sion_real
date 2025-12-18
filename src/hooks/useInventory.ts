import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product, InventoryStats, AppRole } from '@/types/inventory';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const { isAdmin, role } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(
        data.map((p) => {
          // Simple approach: use quantity as available
          // Track initial and sold in component state (localStorage)
          const qty = p.quantity ?? 0;
          
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            cost: p.cost ? Number(p.cost) : undefined,
            quantity: qty,
            initialQuantity: qty, // Will be set when user clicks "Inicio Turno"
            soldQuantity: 0, // Tracked in component
            soldQuantityCash: 0, // Tracked in component
            soldQuantityCredit: 0, // Tracked in component
            imageUrl: p.image_url || '',
            category: p.category,
            minStock: p.low_stock_threshold,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          };
        })
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const qty = product.quantity ?? 0;
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost ?? null,
        quantity: qty,
        category: product.category,
        image_url: product.imageUrl,
        low_stock_threshold: product.minStock,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    await fetchProducts();
    return data;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.cost !== undefined) updateData.cost = updates.cost ?? null;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.initialQuantity !== undefined) updateData.initial_quantity = updates.initialQuantity;
    if (updates.soldQuantity !== undefined) updateData.sold_quantity = updates.soldQuantity;
    if (updates.soldQuantityCash !== undefined) updateData.sold_quantity_cash = updates.soldQuantityCash;
    if (updates.soldQuantityCredit !== undefined) updateData.sold_quantity_credit = updates.soldQuantityCredit;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.minStock !== undefined) updateData.low_stock_threshold = updates.minStock;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    await fetchProducts();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const { error } = await supabase
      .from('products')
      .update({ quantity: Math.max(0, quantity) })
      .eq('id', id);

    if (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }

    await fetchProducts();
  };

  const setInitialQuantity = async (id: string, initialQuantity: number) => {
    // Simple: just update quantity (this always works)
    const qty = Math.max(0, initialQuantity);
    
    const { error } = await supabase
      .from('products')
      .update({ quantity: qty })
      .eq('id', id);

    if (error) {
      console.error('Error setting initial quantity:', error);
      throw error;
    }

    await fetchProducts();
  };

  const recordSale = async (id: string, soldQuantity: number, saleType: 'cash' | 'credit') => {
    // Get current product
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');

    // Simple: subtract from current quantity
    const currentQty = product.quantity ?? 0;
    const newQty = Math.max(0, currentQty - soldQuantity);

    // Update quantity directly (this always works, no schema cache issues)
    const { error } = await supabase
      .from('products')
      .update({ quantity: newQty })
      .eq('id', id);

    if (error) {
      console.error('Error recording sale:', error);
      throw new Error(`Error al registrar la venta: ${error.message || 'Error desconocido'}`);
    }

    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    await fetchProducts();
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && p.quantity > 0 && p.quantity <= p.minStock) ||
        (stockFilter === 'out' && p.quantity === 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const stats: InventoryStats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.quantity, 0),
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      lowStockProducts: products.filter((p) => p.quantity <= p.minStock).length,
    };
  }, [products]);

  return {
    products: filteredProducts,
    allProducts: products,
    stats,
    categories,
    currentRole: role,
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
    refetch: fetchProducts,
  };
}
