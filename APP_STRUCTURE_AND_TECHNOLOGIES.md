# Documentación de la Aplicación

Este documento proporciona una visión general de la aplicación frontend, su arquitectura, las tecnologías utilizadas y cómo facilita la interacción con las APIs del backend.

## Tecnologías Utilizadas

La aplicación está construida utilizando:

- **React Native:** Un framework de JavaScript para escribir aplicaciones móviles reales que se renderizan de forma nativa para iOS y Android.
- **Expo:** Un framework y una plataforma para aplicaciones React universales. Proporciona un conjunto de herramientas y servicios construidos alrededor de React Native y las plataformas nativas que ayudan a desarrollar, construir, desplegar e iterar rápidamente en aplicaciones iOS, Android y web desde la misma base de código JavaScript/TypeScript.

## Estructura de la Aplicación

La aplicación está estructurada para proporcionar una interfaz de usuario para gestionar diversas entidades de datos. Esto se logra a través de una serie de rutas definidas, donde cada ruta típicamente corresponde a una entidad de datos específica y renderiza una interfaz CRUD (Crear, Leer, Actualizar, Eliminar).

### Características Clave:

- **Navegación Basada en Rutas:** La aplicación utiliza un sistema de enrutamiento (`expo-router`) para navegar entre diferentes pantallas. Cada entidad de datos principal (por ejemplo, Personas, Facultades, Investigaciones) tiene su propio conjunto de pantallas.
- **Operaciones CRUD:** Para cada entidad de datos, la aplicación proporciona vistas y componentes para:
  - **Crear:** Formularios para ingresar datos para nuevos registros.
  - **Leer:** Listas o vistas detalladas para mostrar registros existentes.
  - **Actualizar:** Formularios, a menudo prellenados con datos existentes, para modificar registros.
  - **Eliminar:** Funcionalidad para eliminar registros.
- **Estructura de Directorios:** Cada servicio/entidad (por ejemplo, `personas`, `facultades`) tiene su propio directorio dentro de la carpeta `app/` (por ejemplo, `app/personas/`, `app/facultades/`). Cada uno de estos directorios típicamente contiene:
  - `index.tsx`: Un archivo que muestra la lista de ítems para esa entidad (la parte de "Leer" del CRUD).
  - `form.tsx`: Un archivo que maneja la creación y actualización de ítems para esa entidad (las partes de "Crear" y "Actualizar" del CRUD).

## Interacción con las APIs

La aplicación frontend interactúa con una API backend (documentada por separado en `API_DOCUMENTATION.md`) para realizar operaciones CRUD.

- **URL Base de la API:** `http://localhost:8000`
- **Endpoints de Servicio:** Cada entidad de datos en el frontend corresponde a un endpoint de servicio en la API (por ejemplo, `/personas`, `/facultades`).
- **Flujo de Datos:**
  1. El usuario interactúa con la interfaz de usuario (por ejemplo, llena un formulario para crear una nueva "Persona").
  2. La aplicación realiza una solicitud HTTP (POST, GET, PUT, DELETE) al endpoint de la API correspondiente (por ejemplo, `POST http://localhost:8000/personas`).
  3. La API procesa la solicitud y envía una respuesta.
  4. La aplicación frontend actualiza su estado y la interfaz de usuario basándose en la respuesta de la API.

Esta estructura permite una clara separación de responsabilidades entre la lógica de presentación del frontend y la gestión de datos del backend.
