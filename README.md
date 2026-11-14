# Rendimiento académico con cadenas de Markov

## El problema

Quiero ver cómo puede cambiar mi rendimiento académico con el tiempo. Uso una cadena de Markov con tres estados. Si hoy estoy en un estado, la matriz me dice qué probabilidad tengo de pasar a cada estado en el siguiente paso.

## Los estados

- Alto
- Medio
- Bajo

El estado inicial lo elijo yo. El vector inicial tiene un 1 en ese estado y 0 en los demás.

## La matriz

Uso esta matriz por defecto. La inventé para probar la página; no son datos reales.

| Desde \ Hacia | Alto | Medio | Bajo |
| --- | ---: | ---: | ---: |
| Alto | 0.70 | 0.25 | 0.05 |
| Medio | 0.20 | 0.55 | 0.25 |
| Bajo | 0.05 | 0.35 | 0.60 |

Cada fila suma 1. Puedo cambiar los valores desde la página. Si una fila no suma 1 con una tolerancia de 0.001, o si hay un número negativo, la página muestra un error y no calcula nada.

## Qué calcula

- Las probabilidades de Alto, Medio y Bajo a 1, 3, 5 y 10 pasos.
- La distribución estacionaria.
- Una tabla con los resultados y dos gráficas SVG: barras agrupadas por paso y líneas de 0 a 10 pasos.

Los pasos se calculan multiplicando el vector inicial por la matriz elevada a n. La distribución estacionaria cumple π = π · P y suma 1.

## Cómo abrir la app

Abrí `index.html` con doble clic. No hace falta instalar nada. La página usa JavaScript clásico, así que también funciona con un servidor estático simple.

## Cómo correr las pruebas

```
node --test
```

Uso Node 18 o superior. No hay dependencias ni `npm install`.

Las pruebas cubren:

- Filas que suman 1.
- 0 pasos devuelve el vector inicial.
- Un ejemplo de dos estados calculado a mano.
- Resultados que suman 1.
- Pasos 1, 3, 5 y 10 iguales a multiplicar paso a paso.
- Rechazo de matrices inválidas.
- Distribución estacionaria que cumple π = π · P.

## Archivos

- `index.html`: la página y los estilos.
- `markov.js`: la lógica de Markov, sin tocar el DOM.
- `app.js`: el formulario, la tabla y las gráficas SVG.
- `markov.test.js`: las pruebas con `node:test`.
- `README.md`: este archivo.

## Cómo usé OpenSpec

Usé OpenSpec para planificar antes de programar. El cambio se llama `add-markov-academic-predictor`.

Primero escribí la propuesta. Después la spec con el comportamiento esperado, el diseño con las decisiones técnicas y las tareas. Al final implementé las tareas en orden y marqué cada una. El flujo fue: propuesta, spec, diseño, tareas e implementación.

La spec me sirvió para no olvidar la validación de la matriz, los pasos, la distribución estacionaria, las gráficas y las pruebas. Las tareas me sirvieron para avanzar sin saltarme partes.
