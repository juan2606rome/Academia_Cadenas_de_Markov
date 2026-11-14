# Design

## Context

El proyecto está vacío: no hay código, dependencias ni configuración de build. La app debe funcionar abriendo un archivo y las pruebas deben correr con Node sin instalar nada. Ver `proposal.md` para la motivación.

Restricciones que mandan:

- Solo HTML, CSS y JavaScript.
- Sin frameworks, sin librerías y sin `npm install`.
- La lógica matemática va en `markov.js` y no toca el DOM.
- Las gráficas son SVG hechas a mano.
- Los archivos pedidos son `index.html`, `markov.js`, `app.js`, `markov.test.js` y `README.md`.

## Goals / Non-Goals

**Goals:**

- Tener una lógica de Markov genérica para matrices cuadradas de cualquier tamaño.
- Poder cargar `markov.js` desde el navegador y desde `node:test` sin build.
- Calcular probabilidades por paso y distribución estacionaria con resultados verificables.
- Dibujar las dos gráficas sin dependencias y adaptarlas al ancho disponible.
- Mantener la interfaz en un solo HTML con su CSS incluido.

**Non-Goals:**

- Guardar la matriz o el estado entre visitas.
- Persistir datos en un servidor o en `localStorage`.
- Exportar resultados a archivos.
- Usar datos reales: la matriz por defecto es inventada, como dice el README.
- Añadir un `package.json` o un paso de build.

## Decisions

### Un solo archivo de lógica con exportación compatible con navegador y Node

`markov.js` se carga como script clásico y expone su API en `globalThis.Markov`. Al final detecta `module.exports` y también exporta para `require()`.

- **Por qué:** sin `package.json`, Node trata los `.js` como CommonJS. Con `type="module"` haría falta un servidor local en algunos navegadores y un `package.json` para las pruebas. La exportación doble evita ambos problemas y permite abrir `index.html` con doble clic.
- **Alternativa descartada:** módulos ES. Obligan a servir la página por HTTP y a cambiar la extensión o agregar configuración para que `node --test` los cargue.

### Matriz como arreglo de arreglos y estados en orden fijo

La UI usa el orden `[Alto, Medio, Bajo]`. Las funciones reciben y devuelven arreglos, sin nombres de estado dentro del cálculo.

- **Por qué:** así la lógica sirve para el ejemplo de dos estados de las pruebas y no mezcla presentación con matemática.
- **Alternativa descartada:** objetos con claves por estado. Agregan conversiones y hacen más difícil comparar matrices en las pruebas.

### Cálculo por multiplicación de matrices

`matrixPower(P, n)` eleva la matriz con multiplicación repetida y `distributionAfter` multiplica el vector inicial por esa potencia. Con `n = 0` la potencia es la identidad y el resultado es el vector inicial.

- **Por qué:** el número de pasos es chico (máximo 10) y la multiplicación repetida es fácil de leer y de probar contra el cálculo paso a paso.
- **Alternativa descartada:** exponenciación por cuadrados. Es más rápida para n grande, pero aquí no hace falta y complica la lectura.

### Distribución estacionaria resolviendo el sistema lineal

Se plantea `π(P - I) = 0` con la condición `sum(π) = 1`. Se reemplaza la última ecuación por la normalización y se resuelve con eliminación gaussiana con pivoteo parcial. Al final se normaliza el vector.

- **Por qué:** da un resultado determinista y cumple `π = π · P` sin depender de que la iteración converja.
- **Alternativa descartada:** iteración de potencias. Falla o tarda en cadenas periódicas o con convergencia lenta.

### Estado inicial como vector unitario

Elegir Alto, Medio o Bajo arma un vector con 1 en esa posición y 0 en las demás.

- **Por qué:** es la interpretación directa de "empiezo en este estado" y coincide con las pruebas de 0 pasos.

### Validación antes de calcular

`validateMatrix` revisa que cada valor sea un número finito, que no sea negativo y que cada fila sume 1 con tolerancia de 0.001. Devuelve la lista de errores. La UI muestra esos mensajes y oculta tabla y gráficas si hay alguno.

- **Por qué:** el usuario pidió rechazar la matriz completa si una fila falla. Revisar números finitos evita que un campo vacío se convierta en `NaN` y rompa las cuentas.
- **Supuesto:** un campo vacío o no numérico se trata como error de validación, no como cero.

### Gráficas SVG construidas con `createElementNS`

`app.js` genera las gráficas con elementos SVG: barras agrupadas para 1, 3, 5 y 10, y líneas para 0 a 10. Usa `viewBox` y `width: 100%` para que escalen. La leyenda y los ejes se dibujan con texto y líneas.

- **Por qué:** cumple el requisito de hacerlas a mano y se adaptan al contenedor sin cálculos de tamaño en JavaScript.
- **Alternativa descartada:** canvas. No es SVG y no escala igual sin ajustar el tamaño en píxeles.

### CSS dentro de `index.html` y tabla apilada en pantallas angostas

La hoja de estilos va en un `<style>` porque no se pidió un archivo CSS aparte. En escritorio la tabla muestra columnas normales. En pantallas de hasta 600 px, cada fila se muestra como una tarjeta con etiquetas por celda, sin desplazamiento horizontal.

- **Por qué:** la lista de archivos es cerrada y una tabla de seis columnas no entra cómoda en 360 px.
- **Alternativa descartada:** contenedor con scroll horizontal. El requisito pide que todo quepa sin desplazamiento lateral.

### Pruebas con `node:test` y `require`

`markov.test.js` importa `markov.js` con `require` y usa `node:test` y `node:assert/strict`. Cubre los casos pedidos, incluido un ejemplo de dos estados calculado a mano.

- **Por qué:** funciona con `node --test` sin dependencias y sin DOM.
- **Supuesto:** se usa Node 18 o superior, donde `node:test` ya viene incluido.

## Risks / Trade-offs

- **La eliminación gaussiana puede ser inestable con matrices casi singulares** → se usa pivoteo parcial y tolerancia numérica al comparar; para el tamaño de esta app alcanza.
- **Una cadena con más de una distribución estacionaria no tiene una única respuesta** → el sistema devuelve una distribución válida; no se promete unicidad.
- **Los valores se muestran con cuatro decimales y pueden no sumar exactamente 1 a simple vista** → las pruebas y la validación usan tolerancias, y el README aclara que el redondeo es visual.
- **La matriz por defecto es inventada** → el README lo dice de forma explícita para no confundirla con datos reales.
- **Abrir `index.html` con doble clic funciona, pero algunos navegadores restringen archivos locales** → el README también explica cómo servir la carpeta con un servidor simple si hiciera falta.

## Migration Plan

No hay sistema anterior que migrar. La entrega consiste en abrir `index.html` en el navegador y ejecutar `node --test` para las pruebas. No hay despliegue ni rollback.
