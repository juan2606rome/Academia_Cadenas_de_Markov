# academic-performance-prediction Specification

## Purpose

Permite estimar la evolución del rendimiento académico con una cadena de Markov de tres estados, validar el modelo y ver las probabilidades por paso junto con la distribución estacionaria.

## Requirements

### Requirement: Configuración del modelo

El sistema DEBE ofrecer los estados Alto, Medio y Bajo. El usuario DEBE poder elegir el estado inicial y editar los nueve valores de la matriz de transición. La matriz inicia con los valores por defecto del README.

#### Scenario: Elegir el estado inicial

- **WHEN** el usuario selecciona el estado Alto
- **THEN** el vector inicial es (1, 0, 0) para Alto, Medio y Bajo

#### Scenario: Editar la matriz

- **WHEN** el usuario cambia una celda de la matriz y los valores siguen siendo válidos
- **THEN** los resultados se recalculan con el nuevo valor

#### Scenario: Matriz por defecto

- **WHEN** el usuario abre la página por primera vez
- **THEN** la matriz muestra los valores por defecto y los resultados ya están calculados

### Requirement: Validación de la matriz

El sistema DEBE rechazar la matriz si algún valor es negativo o si alguna fila no suma 1 con una tolerancia de 0.001. Con una matriz inválida, DEBE mostrar un mensaje de error y no DEBE mostrar resultados calculados.

#### Scenario: Fila que no suma 1

- **WHEN** una fila suma 0.99
- **THEN** el sistema muestra un error y no muestra tabla ni gráficas

#### Scenario: Valor negativo

- **WHEN** una celda contiene un número negativo
- **THEN** el sistema muestra un error y no calcula nada

#### Scenario: Diferencia dentro de la tolerancia

- **WHEN** una fila suma 1.0005
- **THEN** el sistema acepta la matriz y calcula los resultados

#### Scenario: Matriz válida

- **WHEN** todas las filas suman 1 y no hay valores negativos
- **THEN** el sistema oculta el error y muestra los resultados

### Requirement: Probabilidades a pasos seleccionados

El sistema DEBE calcular la distribución para 1, 3, 5 y 10 pasos multiplicando el vector inicial por la matriz elevada a n. Con 0 pasos DEBE devolver el vector inicial. Cada distribución DEBE sumar 1 con una tolerancia de 0.001.

#### Scenario: Cero pasos

- **WHEN** se calcula la distribución con 0 pasos
- **THEN** el resultado es igual al vector inicial

#### Scenario: Pasos 1, 3, 5 y 10

- **WHEN** se calcula la distribución para n pasos
- **THEN** coincide con multiplicar el vector inicial por la matriz n veces, paso a paso

#### Scenario: Suma de cada distribución

- **WHEN** se calculan las distribuciones de 1, 3, 5 y 10 pasos
- **THEN** cada una suma 1 dentro de la tolerancia de 0.001

### Requirement: Distribución estacionaria

El sistema DEBE calcular y mostrar una distribución estacionaria que cumpla π = π · P y sume 1 con una tolerancia de 0.001.

#### Scenario: Distribución estacionaria válida

- **WHEN** la matriz es válida y se calculan los resultados
- **THEN** la distribución estacionaria mostrada cumple π = π · P y suma 1 dentro de la tolerancia

### Requirement: Tabla de resultados

El sistema DEBE mostrar una tabla con las probabilidades de Alto, Medio y Bajo para los pasos 1, 3, 5 y 10, y la distribución estacionaria. Cada valor DEBE mostrarse con cuatro decimales.

#### Scenario: Contenido de la tabla

- **WHEN** los resultados están disponibles
- **THEN** la tabla muestra los tres estados, los cuatro pasos y la distribución estacionaria con cuatro decimales

### Requirement: Gráficas SVG

El sistema DEBE mostrar dos gráficas SVG generadas con código propio, sin librerías: una de barras agrupadas por paso (1, 3, 5 y 10) y una de líneas de 0 a 10 pasos. Cada gráfica DEBE incluir una leyenda de los estados.

#### Scenario: Barras agrupadas

- **WHEN** los resultados están disponibles
- **THEN** la gráfica de barras agrupa las probabilidades de Alto, Medio y Bajo para cada paso

#### Scenario: Líneas de 0 a 10 pasos

- **WHEN** los resultados están disponibles
- **THEN** la gráfica de líneas muestra una serie por estado con los pasos 0 a 10

#### Scenario: Sin librerías externas

- **WHEN** se carga la página
- **THEN** las gráficas funcionan sin descargar ninguna librería de gráficas

### Requirement: Vista adaptable

La página DEBE verse bien en celular y en computadora. La tabla y las gráficas DEBEN ajustarse al ancho disponible sin desbordar la pantalla.

#### Scenario: Pantalla de celular

- **WHEN** la página se abre en una pantalla de 360 px de ancho
- **THEN** los controles, la tabla y las gráficas caben sin desplazamiento horizontal

#### Scenario: Pantalla de computadora

- **WHEN** la página se abre en una pantalla de 1280 px de ancho
- **THEN** los controles, la tabla y las gráficas se ven distribuidos y legibles

### Requirement: Pruebas automatizadas de la lógica

El proyecto DEBE incluir pruebas con `node:test` que se ejecutan con `node --test` y cubren filas que suman 1, 0 pasos, un ejemplo de dos estados calculado a mano, la suma de cada resultado, la equivalencia de los pasos 1, 3, 5 y 10 con la multiplicación paso a paso, el rechazo de matrices inválidas y la propiedad π = π · P.

#### Scenario: Ejecutar las pruebas

- **WHEN** se ejecuta `node --test`
- **THEN** todas las pruebas terminan sin fallos

#### Scenario: Lógica separada del DOM

- **WHEN** se ejecutan las pruebas
- **THEN** cargan la lógica de cálculo sin necesitar un navegador ni el DOM
