import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, CreditCard, Package, Users, TrendingUp, FileText, X, Pencil, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  total_initial_quantity: number;
  total_sold_cash: number;
  total_sold_credit: number;
  total_sold: number;
  total_available: number;
  total_sold_value_cash?: number;
  total_sold_value_credit?: number;
  total_sold_value?: number;
  products_data: Array<{
    productId: string;
    productName: string;
    productPrice?: number;
    initialQuantity: number;
    soldCash: number;
    soldCredit: number;
    soldValueCash?: number;
    soldValueCredit?: number;
  }>;
  created_at: string;
  user_email?: string;
  user_email_original?: string; // Email original sin personalización
}

interface AdminShiftViewerProps {
  open: boolean;
  onClose: () => void;
}

export function AdminShiftViewer({ open, onClose }: AdminShiftViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});

  // Cargar nombres personalizados desde localStorage
  useEffect(() => {
    const savedNames = localStorage.getItem('admin_user_display_names');
    if (savedNames) {
      try {
        setDisplayNames(JSON.parse(savedNames));
      } catch (e) {
        console.error('Error loading display names:', e);
      }
    }
  }, []);

  // Cargar usuarios desde la tabla profiles
  useEffect(() => {
    const fetchUsers = async () => {
      // Primero obtener los user_ids únicos de los turnos
      const { data: shiftsData, error: shiftsError } = await (supabase as any)
        .from('shifts')
        .select('user_id')
        .order('shift_date', { ascending: false });

      if (shiftsError) {
        console.error('Error fetching shifts:', shiftsError);
        return;
      }

      const uniqueUserIds = [...new Set((shiftsData || []).map((s: any) => s.user_id))];
      
      if (uniqueUserIds.length === 0) {
        setUsers([]);
        return;
      }

      // Obtener emails desde la tabla profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', uniqueUserIds as string[]);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Fallback: usar solo IDs
        setUsers(uniqueUserIds.map((uid: string) => ({ id: uid, email: uid.substring(0, 8) + '...' })));
        return;
      }

      // Crear mapa de usuarios
      const userMap = new Map((profilesData || []).map((p: any) => [p.id, p.email || 'Usuario sin email']));
      
      const userList = uniqueUserIds.map((uid: string) => ({
        id: uid,
        email: userMap.get(uid) || `Usuario ${uid.substring(0, 8)}...`
      }));

      setUsers(userList);
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Cargar turnos
  useEffect(() => {
    if (!open) return;

    const fetchShifts = async () => {
      setLoading(true);
      try {
        let query = (supabase as any)
          .from('shifts')
          .select('*')
          .order('shift_date', { ascending: false })
          .limit(100);

        if (selectedUserId !== 'all') {
          query = query.eq('user_id', selectedUserId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching shifts:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los turnos. Asegúrate de que la tabla "shifts" existe en la base de datos.',
            variant: 'destructive',
          });
          return;
        }

        // Enriquecer con emails de usuarios (mantener email original)
        const enrichedShifts = (data || []).map((shift: any) => {
          const userData = users.find(u => u.id === shift.user_id);
          const defaultEmail = userData?.email || 'Usuario desconocido';
          return {
            ...shift,
            user_email: defaultEmail,
            user_email_original: defaultEmail,
          } as Shift;
        });

        setShifts(enrichedShifts);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Error al cargar los turnos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [open, selectedUserId, users, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener nombre de visualización (personalizado o email por defecto)
  const getDisplayName = (userId: string, defaultEmail: string): string => {
    return displayNames[userId] || defaultEmail;
  };

  // Guardar nombre personalizado
  const saveDisplayName = (userId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return; // No guardar nombres vacíos

    const newDisplayNames = { ...displayNames, [userId]: trimmedName };
    setDisplayNames(newDisplayNames);
    localStorage.setItem('admin_user_display_names', JSON.stringify(newDisplayNames));
  };

  // Iniciar edición
  const startEditing = (userId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se abra el diálogo de detalles
    setEditingUserId(userId);
    setEditingName(currentName);
  };

  // Guardar edición
  const saveEdit = (userId: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (editingName.trim()) {
      saveDisplayName(userId, editingName.trim());
    }
    setEditingUserId(null);
    setEditingName('');
  };

  // Cancelar edición
  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingUserId(null);
    setEditingName('');
  };

  // Manejar tecla Enter para guardar
  const handleKeyDown = (userId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit(userId, e);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Resúmenes de Turnos - Administrador
            </DialogTitle>
            <DialogDescription>
              Visualiza los resúmenes de turno de todos los usuarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtro por usuario */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filtrar por usuario:</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {getDisplayName(u.id, u.email)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de turnos */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando turnos...
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay turnos registrados
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 cursor-pointer transition-colors"
                      onClick={() => setSelectedShift(shift)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 group">
                              {editingUserId === shift.user_id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(shift.user_id, e)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-7 w-32 text-xs"
                                    autoFocus
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => saveEdit(shift.user_id, e)}
                                  >
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => cancelEdit(e)}
                                  >
                                    <X className="h-3.5 w-3.5 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Badge variant="outline" className="cursor-default">
                                    {getDisplayName(shift.user_id, shift.user_email_original || shift.user_email || 'Usuario desconocido')}
                                  </Badge>
                                  <button
                                    onClick={(e) => startEditing(shift.user_id, getDisplayName(shift.user_id, shift.user_email_original || shift.user_email || 'Usuario desconocido'), e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                                    title="Editar nombre"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                  </button>
                                </>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(shift.shift_date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-muted-foreground">Inicial: </span>
                              <span className="font-semibold">{shift.total_initial_quantity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Vendido: </span>
                              <span className="font-semibold text-green-600">{shift.total_sold}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contado: </span>
                              <span className="font-semibold text-orange-600">{shift.total_sold_cash}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Crédito: </span>
                              <span className="font-semibold text-purple-600">{shift.total_sold_credit}</span>
                            </div>
                          </div>
                          {shift.total_sold_value && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-muted-foreground">Total Vendido: </span>
                                <span className="font-bold text-green-600">{formatCurrency(shift.total_sold_value)}</span>
                              </div>
                              {shift.total_sold_value_cash !== undefined && shift.total_sold_value_cash > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Contado: </span>
                                  <span className="font-semibold text-orange-600">{formatCurrency(shift.total_sold_value_cash)}</span>
                                </div>
                              )}
                              {shift.total_sold_value_credit !== undefined && shift.total_sold_value_credit > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Crédito: </span>
                                  <span className="font-semibold text-purple-600">{formatCurrency(shift.total_sold_value_credit)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShift(shift);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalles del turno */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalle del Turno
              </DialogTitle>
              <DialogDescription>
                {getDisplayName(selectedShift.user_id, selectedShift.user_email_original || selectedShift.user_email || 'Usuario desconocido')} - {formatDate(selectedShift.shift_date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Estadísticas de Cantidades */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">CANTIDADES</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Cantidad Inicial</div>
                    <div className="text-2xl font-bold">{selectedShift.total_initial_quantity}</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Vendido</div>
                    <div className="text-2xl font-bold text-green-600">{selectedShift.total_sold}</div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Contado</div>
                    <div className="text-2xl font-bold text-orange-600">{selectedShift.total_sold_cash}</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Crédito</div>
                    <div className="text-2xl font-bold text-purple-600">{selectedShift.total_sold_credit}</div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Dinero */}
              {selectedShift.total_sold_value !== undefined && selectedShift.total_sold_value > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    DINERO VENDIDO
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-500">
                      <div className="text-sm text-muted-foreground mb-1">Total Vendido</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedShift.total_sold_value)}</div>
                    </div>
                    {selectedShift.total_sold_value_cash !== undefined && selectedShift.total_sold_value_cash > 0 && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-500">
                        <div className="text-sm text-muted-foreground mb-1">Contado</div>
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(selectedShift.total_sold_value_cash)}</div>
                      </div>
                    )}
                    {selectedShift.total_sold_value_credit !== undefined && selectedShift.total_sold_value_credit > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-500">
                        <div className="text-sm text-muted-foreground mb-1">Crédito</div>
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(selectedShift.total_sold_value_credit)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detalle de productos */}
              {selectedShift.products_data && selectedShift.products_data.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Detalle por Producto</h3>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {selectedShift.products_data.map((product, index) => {
                        const totalSold = (product.soldCash || 0) + (product.soldCredit || 0);
                        if (totalSold === 0) return null;
                        
                        return (
                          <div
                            key={index}
                            className="p-3 bg-muted/50 rounded-lg border"
                          >
                            <div className="font-semibold mb-2 flex items-center justify-between">
                              <span>{product.productName}</span>
                              {product.productPrice && (
                                <span className="text-xs text-muted-foreground">Precio: {formatCurrency(product.productPrice)}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Inicial: </span>
                                <span className="font-medium">{product.initialQuantity || 0}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Contado: </span>
                                <span className="font-medium text-orange-600">{product.soldCash || 0}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Crédito: </span>
                                <span className="font-medium text-purple-600">{product.soldCredit || 0}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-medium text-green-600">{totalSold}</span>
                              </div>
                            </div>
                            {(product.soldValueCash !== undefined || product.soldValueCredit !== undefined) && (
                              <div className="flex items-center gap-4 text-sm pt-2 border-t border-border/50">
                                {product.soldValueCash !== undefined && product.soldValueCash > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Contado: </span>
                                    <span className="font-semibold text-orange-600">{formatCurrency(product.soldValueCash)}</span>
                                  </div>
                                )}
                                {product.soldValueCredit !== undefined && product.soldValueCredit > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Crédito: </span>
                                    <span className="font-semibold text-purple-600">{formatCurrency(product.soldValueCredit)}</span>
                                  </div>
                                )}
                                {(product.soldValueCash || 0) + (product.soldValueCredit || 0) > 0 && (
                                  <div className="flex items-center gap-1 ml-auto">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-muted-foreground">Total: </span>
                                    <span className="font-bold text-green-600">{formatCurrency((product.soldValueCash || 0) + (product.soldValueCredit || 0))}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedShift(null)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

