# 🎬 Sistema de Recomendación con Producto Punto
## 📋 Descripción
Sistema de recomendación de películas basado en álgebra lineal y producto punto, que utiliza la similitud del coseno para encontrar usuarios con gustos similares y generar recomendaciones personalizadas.

## 🎯 Características
- Algoritmo basado en producto punto y similitud coseno
- Interfaz web moderna con visualización de vectores
- Base de datos PostgreSQL para almacenamiento de datos
- Arquitectura modular (frontend + backend + BD)
- Visualización matemática de cálculos vectoriales

## 🏗️ Arquitectura del Sistema
```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │    Backend       │    │   Base de Datos    │
│   (React)       │◄──►│   (Node.js)      │◄──►│   (PostgreSQL)     │
│                 │    │                  │    │                    │
│ - Interfaz UI   │    │ - API REST       │    │ - Usuarios         │
│ - Gráficas      │    │ - Lógica de      │    │ - Películas        │
│ - Visualización │    │   recomendación  │    │ - Calificaciones   │
└─────────────────┘    └──────────────────┘    └────────────────────┘
```

## 📊 Fundamentos Matemáticos

- Producto Punto
```
A · B = \sum_{i=1}^{n} A_i \times B_i
```

- Magnitud del Vector
```
||A|| = \sqrt{\sum_{i=1}^{n} A_i^2}
```
- Similitud del Coseno
```
\text{similitud}(A,B) = \frac{A · B}{||A|| \times ||B||}
```
- Rating Predicho
```
\text{rating} = \frac{\sum (\text{similitud} \times \text{rating})}{\sum |\text{similitud}|}
```

## 🚀 Requisitos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

## Ejecutar la Aplicación
- Backend (Terminal 1)
```
cd backend
npm run dev
```

- Frontend (Terminal 2)
```
cd frontend
npm start
```

🎮 Uso del Sistema
1. Seleccionar Usuario
- Elige un usuario de la lista desplegable
- El sistema calculará automáticamente las recomendaciones

2. Ver Recomendaciones
- Pestaña "Recomendaciones": Lista de películas sugeridas
- Rating Predicho: Calificación estimada (0-5 estrellas)


3. Analizar Vectores
- Pestaña "Vectores": Visualización de vectores de usuarios
- Tabla de dimensiones: Calificaciones por película
- Magnitudes: Longitud de cada vector

4. Examinar Cálculos
- Pestaña "Cálculos": Detalles matemáticos completos
- Productos punto: Cálculos de similitud entre usuarios
- Fórmulas: Explicación detallada de cada operación

