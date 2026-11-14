# Tasks

## 1. Lógica de Markov en `markov.js`

- [x] 1.1 Crear `markov.js` con los estados, la matriz por defecto, `initialVector` y las multiplicaciones de vector por matriz y de matriz por matriz. Verificar con `node -e "console.log(require('./markov.js'))"` que la API se exporta sin DOM.
- [x] 1.2 Implementar `validateMatrix` con rechazo de valores negativos, valores no numéricos y filas que no suman 1 con tolerancia de 0.001. Verificar con pruebas de fila válida, fila fuera de tolerancia, fila con diferencia de 0.0005 y valor negativo.
- [x] 1.3 Implementar `matrixPower` y `distributionAfter`, con 0 pasos igual al vector inicial. Verificar con pruebas de 0 pasos, 1 paso, el ejemplo de dos estados calculado a mano y la suma 1 de cada distribución.
- [x] 1.4 Implementar `stationaryDistribution` resolviendo el sistema lineal con eliminación gaussiana y pivoteo parcial. Verificar con una prueba que compruebe π = π · P y que la suma sea 1 dentro de la tolerancia.
- [x] 1.5 Agregar las pruebas de los pasos 1, 3, 5 y 10 comparando cada resultado con la multiplicación paso a paso. Verificar con `node --test` que pasan todas.

## 2. Interfaz y gráficas

- [x] 2.1 Crear `index.html` con el selector de estado inicial, la matriz editable de 3x3, la zona de error, la tabla de resultados y los contenedores de las gráficas; incluir el CSS en un `<style>`. Verificar que la página abre y muestra los controles.
- [x] 2.2 Crear `app.js` para leer el formulario, validar, calcular con `markov.js` y llenar la tabla con cuatro decimales y la distribución estacionaria. Verificar que al cambiar el estado o la matriz se recalculan los resultados.
- [x] 2.3 Mostrar el error y ocultar tabla y gráficas cuando la matriz no es válida. Verificar con una fila que suma 0.99 y con un valor negativo.
- [x] 2.4 Dibujar la gráfica SVG de barras agrupadas por paso (1, 3, 5 y 10) con una barra por estado y leyenda. Verificar que se ve en el navegador y que no usa librerías externas.
- [x] 2.5 Dibujar la gráfica SVG de líneas de 0 a 10 pasos con una serie por estado y leyenda. Verificar que los puntos coinciden con las distribuciones calculadas.
- [x] 2.6 Ajustar el CSS para celular y computadora, con tabla apilada en pantallas angostas. Verificar a 360 px y a 1280 px que no hay desplazamiento horizontal.

## 3. README y verificación final

- [x] 3.1 Escribir `README.md` en primera persona, con frases cortas y español natural: problema, estados, matriz por defecto (aclarando que es inventada), cómo abrir la app, cómo correr `node --test` y una sección corta de cómo se usó OpenSpec. Verificar que los comandos del README funcionan tal como están escritos.
- [x] 3.2 Hacer la verificación final: ejecutar `node --test`, abrir `index.html`, probar la matriz por defecto y una matriz inválida, y revisar que no haya datos inventados fuera de la matriz declarada ni commits.

## Workflow follow-up

- Archivar el cambio cuando la revisión esté completa.
