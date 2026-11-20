# Proposal

## Why

Quiero estimar cómo puede evolucionar mi rendimiento académico a partir de un estado actual y de probabilidades de transición. No tengo una herramienta simple para ver esos números ni para comparar escenarios. Una página estática con cadenas de Markov me deja probar la idea sin instalar nada.

## What Changes

- Agregar una página web estática con tres estados: Alto, Medio y Bajo.
- Permitir elegir el estado inicial y editar la matriz de transición 3x3.
- Validar la matriz: cada fila debe sumar 1 con tolerancia de 0.001 y no puede tener valores negativos. Si algo falla, mostrar un error y no calcular.
- Calcular las probabilidades a 1, 3, 5 y 10 pasos, multiplicando el vector inicial por la matriz elevada a n.
- Calcular y mostrar la distribución estacionaria.
- Mostrar los resultados en una tabla y en dos gráficas SVG hechas a mano: barras agrupadas por paso y líneas de 0 a 10 pasos.
- Adaptar la vista a celular y a computadora.
- Agregar pruebas con `node:test` para la lógica de cálculo y validación.
- Documentar el problema, el modelo, cómo abrir la app y cómo correr las pruebas en un README.

## Capabilities

### New Capabilities

- `academic-performance-prediction`: entrada del modelo de Markov, validación de la matriz, cálculo de probabilidades por paso y de la distribución estacionaria, y presentación de resultados en tabla y gráficas SVG adaptables.

### Modified Capabilities

<!-- No hay capabilities existentes. -->

## Impact

- Archivos nuevos en la raíz del proyecto: `index.html`, `markov.js`, `app.js`, `markov.test.js` y `README.md`.
- Sin frameworks, sin dependencias y sin `npm install`.
- Node solo se usa para ejecutar las pruebas con `node --test`.
