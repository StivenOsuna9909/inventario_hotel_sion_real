import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  adminOnly?: boolean;
  userOnly?: boolean;
}

interface TutorialGuiadoProps {
  isAdmin: boolean;
}

const ADMIN_STEPS: TutorialStep[] = [
  {
    id: 'welcome-admin',
    title: '¡Bienvenido, Administrador!',
    description: 'Este tutorial te guiará por todas las funciones disponibles para administradores. Puedes cerrarlo o saltarlo en cualquier momento.',
    position: 'center',
    adminOnly: true,
  },
  {
    id: 'stats',
    title: 'Estadísticas del Inventario',
    description: 'Aquí puedes ver un resumen completo: total de productos, valor del inventario, stock bajo y productos sin stock. Monitorea estos indicadores regularmente.',
    targetSelector: '[data-tutorial="stats"]',
    position: 'bottom',
    adminOnly: true,
  },
  {
    id: 'search-filters',
    title: 'Búsqueda y Filtros',
    description: 'Usa la barra de búsqueda para encontrar productos por nombre. Los filtros te permiten buscar por categoría o estado de stock (bajo, sin stock).',
    targetSelector: '[data-tutorial="search-filters"]',
    position: 'bottom',
  },
  {
    id: 'add-product',
    title: 'Agregar Producto',
    description: 'Como administrador, puedes agregar nuevos productos al inventario. Haz clic en "Agregar Producto" para abrir el formulario.',
    targetSelector: '[data-tutorial="add-product"]',
    position: 'left',
    adminOnly: true,
  },
  {
    id: 'product-card-admin',
    title: 'Tarjeta de Producto - Funciones de Admin',
    description: 'En cada producto puedes: Editar información, Eliminar producto, Establecer cantidad inicial del turno, Ver margen de ganancia (si tiene costo).',
    targetSelector: '[data-tutorial="product-card"]',
    position: 'top',
    adminOnly: true,
  },
  {
    id: 'finalize-shift',
    title: 'Finalizar Turno',
    description: 'Al final del día, usa esta opción para generar un resumen completo de todas las ventas del turno. Se guardará un reporte con todas las transacciones.',
    targetSelector: '[data-tutorial="finalize-shift"]',
    position: 'top',
  },
];

const USER_STEPS: TutorialStep[] = [
  {
    id: 'welcome-user',
    title: '¡Bienvenido!',
    description: 'Este tutorial te mostrará cómo usar el sistema de inventario. Puedes cerrarlo o saltarlo en cualquier momento.',
    position: 'center',
    userOnly: true,
  },
  {
    id: 'search-filters-user',
    title: 'Búsqueda y Filtros',
    description: 'Usa la barra de búsqueda para encontrar productos rápidamente. Los filtros te permiten buscar por categoría o estado de stock.',
    targetSelector: '[data-tutorial="search-filters"]',
    position: 'bottom',
  },
  {
    id: 'product-card-user',
    title: 'Tarjeta de Producto',
    description: 'Aquí verás toda la información del producto: precio, stock disponible, categoría. También puedes registrar ventas directamente desde aquí.',
    targetSelector: '[data-tutorial="product-card"]',
    position: 'top',
  },
  {
    id: 'record-sale',
    title: 'Registrar Venta',
    description: 'Haz clic en el botón de vender para registrar una venta. Puedes elegir si es al contado o a crédito. Esto actualizará el stock automáticamente.',
    targetSelector: '[data-tutorial="product-card"]',
    position: 'top',
  },
  {
    id: 'finalize-shift-user',
    title: 'Finalizar Turno',
    description: 'Al final de tu turno, haz clic aquí para generar un resumen de todas las ventas realizadas. El sistema guardará un reporte completo.',
    targetSelector: '[data-tutorial="finalize-shift"]',
    position: 'top',
  },
];

export function TutorialGuiado({ isAdmin }: TutorialGuiadoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = isAdmin ? ADMIN_STEPS : USER_STEPS;
  const filteredSteps = steps.filter(step => {
    if (step.adminOnly && !isAdmin) return false;
    if (step.userOnly && isAdmin) return false;
    return true;
  });
  const currentStepData = filteredSteps[currentStep];

  // Verificar si ya completó el tutorial
  useEffect(() => {
    const tutorialKey = isAdmin ? 'tutorial_completed_admin' : 'tutorial_completed_user';
    const completed = localStorage.getItem(tutorialKey);
    setHasCompletedTutorial(completed === 'true');
  }, [isAdmin]);

  // Abrir tutorial automáticamente la primera vez
  useEffect(() => {
    if (!hasCompletedTutorial && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial, isOpen]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const handleComplete = () => {
    const tutorialKey = isAdmin ? 'tutorial_completed_admin' : 'tutorial_completed_user';
    localStorage.setItem(tutorialKey, 'true');
    setHasCompletedTutorial(true);
    setIsOpen(false);
  };

  const handleRestart = () => {
    const tutorialKey = isAdmin ? 'tutorial_completed_admin' : 'tutorial_completed_user';
    localStorage.removeItem(tutorialKey);
    setHasCompletedTutorial(false);
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Posicionar tooltip
  useEffect(() => {
    if (!isOpen || !currentStepData || !tooltipRef.current) return;
    
    // Para pasos centrados, no necesitamos posicionar
    if (currentStepData.position === 'center') {
      return;
    }

    // Si no hay targetSelector, posicionar en el centro
    if (!currentStepData.targetSelector) {
      tooltipRef.current.style.top = '50%';
      tooltipRef.current.style.left = '50%';
      tooltipRef.current.style.transform = 'translate(-50%, -50%)';
      return;
    }

    // Buscar el elemento objetivo
    const targetElement = document.querySelector(currentStepData.targetSelector);
    if (!targetElement) {
      // Si no se encuentra, posicionar en el centro
      tooltipRef.current.style.top = '50%';
      tooltipRef.current.style.left = '50%';
      tooltipRef.current.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (currentStepData.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 20;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + 20;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + 20;
        break;
    }

    // Asegurar que esté dentro del viewport
    const padding = 20;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;
    tooltipRef.current.style.transform = '';
  }, [isOpen, currentStep, currentStepData]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="lg"
          className="shadow-lg bg-background/80 backdrop-blur-sm"
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          {hasCompletedTutorial ? 'Ver Tutorial' : 'Iniciar Tutorial'}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay con agujero para el elemento objetivo */}
      {currentStepData?.targetSelector && currentStepData.position !== 'center' && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/60 z-[9998] pointer-events-none"
          style={{ pointerEvents: 'auto' }}
        >
          {(() => {
            const targetElement = document.querySelector(currentStepData.targetSelector!);
            if (!targetElement) return null;

            const rect = targetElement.getBoundingClientRect();
            return (
              <div
                className="absolute rounded-lg border-4 border-blue-500 shadow-2xl bg-white/10"
                style={{
                  top: `${rect.top - 8}px`,
                  left: `${rect.left - 8}px`,
                  width: `${rect.width + 16}px`,
                  height: `${rect.height + 16}px`,
                  pointerEvents: 'none',
                }}
              />
            );
          })()}
        </div>
      )}

      {/* Overlay completo para pasos centrados */}
      {currentStepData?.position === 'center' && (
        <div className="fixed inset-0 bg-black/60 z-[9998]" />
      )}

      {/* Tooltip del tutorial */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[9999] w-96 transition-all duration-300",
          currentStepData?.position === 'center' && "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <Card className="shadow-2xl border-2 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Paso {currentStep + 1} de {filteredSteps.length}
                  </Badge>
                  {isAdmin && <Badge variant="default" className="text-xs">Admin</Badge>}
                </div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base leading-relaxed">
              {currentStepData.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Saltar
              </Button>
              {currentStep < filteredSteps.length - 1 ? (
                <Button onClick={handleNext}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Finalizar
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

