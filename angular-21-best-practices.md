# GripCo - Guía de Buenas Prácticas (Angular 21)

Este documento resume las correcciones y estándares implementados en el proyecto GripCo para cumplir con las mejores prácticas de la versión 21.

## 1. Arquitectura Zoneless
- **Configuración**: Se ha eliminado la dependencia de `zone.js` y se ha activado `provideZonelessChangeDetection()` en `app.config.ts`.
- **Beneficios**: Mejora el rendimiento eliminando la sobrecarga de intercepción de eventos globales y permite un control más fino del ciclo de vida de los componentes.

## 2. Signals y Reactividad
- **Uso obligatorio**: Todas las propiedades reactivas deben ser `signal` o `computed`.
- **Binding**: En los templates, usa el acceso por función `property()` para signals.
- **Formularios**: Usa `[ngModel]` vinculado a señales y maneja los cambios con `(ngModelChange)="signal.set($event)"` para mantener la reactividad pura.

## 3. Nuevo Control Flow (@if, @for, @defer)
- **Sintaxis**: No usar `*ngIf` ni `*ngFor`.
- **@if / @else**: Sintaxis más limpia y optimizada por el compilador.
- **@for**: Requiere `track` obligatorio para máxima eficiencia en el DOM.
- **@defer**: Usado en listas de pedidos y elementos no críticos para cargar solo cuando entran en el viewport, reduciendo el bundle inicial.

## 4. i18n y Traducciones
- **TranslationService**: Sistema basado en signals para evitar texto harcodeado.
- **Idiomas**: Soporte para Español (ES) e Inglés (EN) con cambio dinámico.
- **Acceso**: Usa `i18n.t()['key']` en templates para una carga síncrona y reactiva.

## 5. SSR e Hidratación
- **Hidratación**: Activado `provideClientHydration(withEventReplay())` para permitir que el servidor renderice el HTML inicial y el cliente lo tome sin parpadeos.
- **SEO**: Uso de los servicios `Title` y `Meta` de Angular para gestionar etiquetas dinámicas por página.

## 6. Prohibiciones
- **Hardcoding**: No escribir texto directamente en los HTML. Todo va al `TranslationService`.
- **NgIf/NgFor**: Quedan obsoletos frente a la nueva sintaxis de bloques.
