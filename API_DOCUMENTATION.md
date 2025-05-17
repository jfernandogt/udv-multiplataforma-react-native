# Documentación de la API

Este documento proporciona una lista completa de todos los servicios disponibles en la aplicación, sus métodos compatibles y ejemplos de respuestas.

## API Gateway

Todos los servicios en esta aplicación son accesibles a través de un API Gateway de Kong que se ejecuta en el puerto 8000. La URL base para todas las solicitudes de API es:

```
http://localhost:8000
```

Cada servicio tiene su propio prefijo de ruta de la siguiente manera:

| Servicio                | Ruta                     |
| ----------------------- | ------------------------ |
| Personas                | `/personas`              |
| Facultades              | `/facultades`            |
| Investigaciones         | `/investigaciones`       |
| Area Científica         | `/areacientifica`        |
| Carrera                 | `/carrera`               |
| Departamento            | `/departamento`          |
| Investigación Persona   | `/investigacionpersona`  |
| Municipio               | `/municipio`             |
| Persona Area Científica | `/personaareacientifica` |
| Persona Facultad        | `/personafacultad`       |
| Título                  | `/titulo`                |

Por ejemplo, para acceder al servicio de Personas, use: `http://localhost:8000/personas`

## Tabla de Contenidos

1. [Servicio de Personas](#servicio-de-personas)
2. [Servicio de Facultades](#servicio-de-facultades)
3. [Servicio de Investigaciones](#servicio-de-investigaciones)
4. [Servicio de Area Científica](#servicio-de-area-científica)
5. [Servicio de Carrera](#servicio-de-carrera)
6. [Servicio de Departamento](#servicio-de-departamento)
7. [Servicio de Investigación Persona](#servicio-de-investigación-persona)
8. [Servicio de Municipio](#servicio-de-municipio)
9. [Servicio de Persona Area Científica](#servicio-de-persona-area-científica)
10. [Servicio de Persona Facultad](#servicio-de-persona-facultad)
11. [Servicio de Título](#servicio-de-título)

---

## Servicio de Personas

**Endpoint:** `/personas`

### Métodos

#### GET /

Recupera todas las personas con la información de su municipio y departamento asociados.

**Ejemplo de Respuesta:**

```json
[
  {
    "personaid": 1,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "telefono": "22334455",
    "celular": "55667788",
    "correo": "juan.perez@example.com",
    "direccion": "Zona 10, Ciudad de Guatemala",
    "municipioidnacimiento": 1,
    "fechanacimiento": "1985-05-15T00:00:00.000Z",
    "cui": "1234567890101",
    "pasaporte": "GT12345",
    "tiporol": "Estudiante",
    "municipio": "Guatemala",
    "departamento": "Guatemala"
  },
  {
    "personaid": 2,
    "nombres": "María José",
    "apellidos": "García Hernández",
    "telefono": "23456789",
    "celular": "87654321",
    "correo": "maria.garcia@example.com",
    "direccion": "Zona 15, Ciudad de Guatemala",
    "municipioidnacimiento": 2,
    "fechanacimiento": "1990-10-20T00:00:00.000Z",
    "cui": "2345678901012",
    "pasaporte": "GT23456",
    "tiporol": "Profesor",
    "municipio": "Mixco",
    "departamento": "Guatemala"
  }
]
```

#### GET /:id

Recupera una persona específica por ID con la información de su municipio y departamento asociados.

**Ejemplo de Respuesta:**

```json
{
  "personaid": 1,
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "telefono": "22334455",
  "celular": "55667788",
  "correo": "juan.perez@example.com",
  "direccion": "Zona 10, Ciudad de Guatemala",
  "municipioidnacimiento": 1,
  "fechanacimiento": "1985-05-15T00:00:00.000Z",
  "cui": "1234567890101",
  "pasaporte": "GT12345",
  "tiporol": "Estudiante",
  "municipio": "Guatemala",
  "departamento": "Guatemala"
}
```

#### POST /

Crea una nueva persona.

**Cuerpo de la Solicitud:**

```json
{
  "nombres": "Pedro Antonio",
  "apellidos": "Ramírez Gómez",
  "telefono": "24681357",
  "celular": "13572468",
  "correo": "pedro.ramirez@example.com",
  "direccion": "Zona 7, Ciudad de Guatemala",
  "municipioidnacimiento": 1,
  "fechanacimiento": "1988-12-10",
  "cui": "3456789012123",
  "pasaporte": "GT34567",
  "tiporol": "Investigador"
}
```

**Ejemplo de Respuesta:**

```json
{
  "personaid": 3,
  "nombres": "Pedro Antonio",
  "apellidos": "Ramírez Gómez",
  "telefono": "24681357",
  "celular": "13572468",
  "correo": "pedro.ramirez@example.com",
  "direccion": "Zona 7, Ciudad de Guatemala",
  "municipioidnacimiento": 1,
  "fechanacimiento": "1988-12-10T00:00:00.000Z",
  "cui": "3456789012123",
  "pasaporte": "GT34567",
  "tiporol": "Investigador"
}
```

#### PUT /:id

Actualiza una persona existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombres": "Pedro Antonio",
  "apellidos": "Ramírez Gómez",
  "telefono": "24681357",
  "celular": "13572468",
  "correo": "pedro.ramirez.updated@example.com",
  "direccion": "Zona 8, Ciudad de Guatemala",
  "municipioidnacimiento": 1,
  "fechanacimiento": "1988-12-10",
  "cui": "3456789012123",
  "pasaporte": "GT34567",
  "tiporol": "Investigador"
}
```

**Ejemplo de Respuesta:**

```json
{
  "personaid": 3,
  "nombres": "Pedro Antonio",
  "apellidos": "Ramírez Gómez",
  "telefono": "24681357",
  "celular": "13572468",
  "correo": "pedro.ramirez.updated@example.com",
  "direccion": "Zona 8, Ciudad de Guatemala",
  "municipioidnacimiento": 1,
  "fechanacimiento": "1988-12-10T00:00:00.000Z",
  "cui": "3456789012123",
  "pasaporte": "GT34567",
  "tiporol": "Investigador"
}
```

#### DELETE /:id

Elimina una persona por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Persona eliminada exitosamente",
  "deletedPersona": {
    "personaid": 3,
    "nombres": "Pedro Antonio",
    "apellidos": "Ramírez Gómez",
    "telefono": "24681357",
    "celular": "13572468",
    "correo": "pedro.ramirez.updated@example.com",
    "direccion": "Zona 8, Ciudad de Guatemala",
    "municipioidnacimiento": 1,
    "fechanacimiento": "1988-12-10T00:00:00.000Z",
    "cui": "3456789012123",
    "pasaporte": "GT34567",
    "tiporol": "Investigador"
  }
}
```

---

## Servicio de Facultades

**Endpoint:** `/facultades`

### Métodos

#### GET /

Recupera todas las facultades con el recuento de personas asociadas.

**Ejemplo de Respuesta:**

```json
[
  {
    "facultadid": 1,
    "nombre": "Facultad de Ingeniería",
    "siglas": "FIUSAC",
    "telefono": "24189100",
    "correo": "ingenieria@usac.edu.gt",
    "total_personas": "45"
  },
  {
    "facultadid": 2,
    "nombre": "Facultad de Ciencias Médicas",
    "siglas": "FCCMM",
    "telefono": "24189200",
    "correo": "medicina@usac.edu.gt",
    "total_personas": "60"
  }
]
```

#### GET /:id

Recupera una facultad específica por ID con el recuento de personas asociadas.

**Ejemplo de Respuesta:**

```json
{
  "facultadid": 1,
  "nombre": "Facultad de Ingeniería",
  "siglas": "FIUSAC",
  "telefono": "24189100",
  "correo": "ingenieria@usac.edu.gt",
  "total_personas": "45"
}
```

#### POST /

Crea una nueva facultad.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Facultad de Arquitectura",
  "siglas": "FARUSAC",
  "telefono": "24189300",
  "correo": "arquitectura@usac.edu.gt"
}
```

**Ejemplo de Respuesta:**

```json
{
  "facultadid": 3,
  "nombre": "Facultad de Arquitectura",
  "siglas": "FARUSAC",
  "telefono": "24189300",
  "correo": "arquitectura@usac.edu.gt"
}
```

#### PUT /:id

Actualiza una facultad existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Facultad de Arquitectura y Diseño",
  "siglas": "FARUSAC",
  "telefono": "24189300",
  "correo": "arquitectura.diseno@usac.edu.gt"
}
```

**Ejemplo de Respuesta:**

```json
{
  "facultadid": 3,
  "nombre": "Facultad de Arquitectura y Diseño",
  "siglas": "FARUSAC",
  "telefono": "24189300",
  "correo": "arquitectura.diseno@usac.edu.gt"
}
```

#### DELETE /:id

Elimina una facultad por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Facultad eliminada exitosamente",
  "deletedFacultad": {
    "facultadid": 3,
    "nombre": "Facultad de Arquitectura y Diseño",
    "siglas": "FARUSAC",
    "telefono": "24189300",
    "correo": "arquitectura.diseno@usac.edu.gt"
  }
}
```

---

## Servicio de Investigaciones

**Endpoint:** `/investigaciones`

### Métodos

#### GET /

Recupera todas las investigaciones con la información de su facultad asociada.

**Ejemplo de Respuesta:**

```json
[
  {
    "investigacionid": 1,
    "facultadid": 1,
    "anio": 2023,
    "titulo": "Desarrollo de sistemas de energía renovable",
    "duracion": 12,
    "facultad": "Facultad de Ingeniería"
  },
  {
    "investigacionid": 2,
    "facultadid": 2,
    "anio": 2022,
    "titulo": "Avances en tratamientos para enfermedades tropicales",
    "duracion": 24,
    "facultad": "Facultad de Ciencias Médicas"
  }
]
```

#### GET /:id

Recupera una investigación específica por ID con la información de su facultad asociada.

**Ejemplo de Respuesta:**

```json
{
  "investigacionid": 1,
  "facultadid": 1,
  "anio": 2023,
  "titulo": "Desarrollo de sistemas de energía renovable",
  "duracion": 12,
  "facultad": "Facultad de Ingeniería"
}
```

#### POST /

Crea una nueva investigación.

**Cuerpo de la Solicitud:**

```json
{
  "facultadid": 1,
  "anio": 2024,
  "titulo": "Implementación de inteligencia artificial en sistemas de control",
  "duracion": 18
}
```

**Ejemplo de Respuesta:**

```json
{
  "investigacionid": 3,
  "facultadid": 1,
  "anio": 2024,
  "titulo": "Implementación de inteligencia artificial en sistemas de control",
  "duracion": 18
}
```

#### PUT /:id

Actualiza una investigación existente.

**Cuerpo de la Solicitud:**

```json
{
  "facultadid": 1,
  "anio": 2024,
  "titulo": "Implementación de inteligencia artificial en sistemas de control industrial",
  "duracion": 24
}
```

**Ejemplo de Respuesta:**

```json
{
  "investigacionid": 3,
  "facultadid": 1,
  "anio": 2024,
  "titulo": "Implementación de inteligencia artificial en sistemas de control industrial",
  "duracion": 24
}
```

#### DELETE /:id

Elimina una investigación por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Investigacion eliminada exitosamente",
  "deletedInvestigacion": {
    "investigacionid": 3,
    "facultadid": 1,
    "anio": 2024,
    "titulo": "Implementación de inteligencia artificial en sistemas de control industrial",
    "duracion": 24
  }
}
```

---

## Servicio de Area Científica

**Endpoint:** `/areacientifica`

### Métodos

#### GET /

Recupera todas las áreas científicas.

**Ejemplo de Respuesta:**

```json
[
  {
    "areacientificaid": 1,
    "nombre": "Ciencias de la Computación",
    "descripcion": "Estudio de algoritmos, estructuras de datos y sistemas computacionales"
  },
  {
    "areacientificaid": 2,
    "nombre": "Biotecnología",
    "descripcion": "Aplicación de la tecnología a sistemas biológicos y organismos vivos"
  }
]
```

#### GET /:id

Recupera un área científica específica por ID.

**Ejemplo de Respuesta:**

```json
{
  "areacientificaid": 1,
  "nombre": "Ciencias de la Computación",
  "descripcion": "Estudio de algoritmos, estructuras de datos y sistemas computacionales"
}
```

#### POST /

Crea una nueva área científica.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Nanotecnología",
  "descripcion": "Estudio y aplicación de materiales y sistemas a escala nanométrica"
}
```

**Ejemplo de Respuesta:**

```json
{
  "areacientificaid": 3,
  "nombre": "Nanotecnología",
  "descripcion": "Estudio y aplicación de materiales y sistemas a escala nanométrica"
}
```

#### PUT /:id

Actualiza un área científica existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Nanotecnología",
  "descripcion": "Estudio y aplicación de materiales, dispositivos y sistemas a escala nanométrica"
}
```

**Ejemplo de Respuesta:**

```json
{
  "areacientificaid": 3,
  "nombre": "Nanotecnología",
  "descripcion": "Estudio y aplicación de materiales, dispositivos y sistemas a escala nanométrica"
}
```

#### DELETE /:id

Elimina un área científica por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Area científica eliminada exitosamente",
  "deletedAreaCientifica": {
    "areacientificaid": 3,
    "nombre": "Nanotecnología",
    "descripcion": "Estudio y aplicación de materiales, dispositivos y sistemas a escala nanométrica"
  }
}
```

---

## Servicio de Carrera

**Endpoint:** `/carrera`

### Métodos

#### GET /

Recupera todas las carreras con la información de su facultad asociada.

**Ejemplo de Respuesta:**

```json
[
  {
    "carreraid": 1,
    "nombre": "Ingeniería en Sistemas",
    "facultadid": 1,
    "facultad": "Facultad de Ingeniería"
  },
  {
    "carreraid": 2,
    "nombre": "Medicina",
    "facultadid": 2,
    "facultad": "Facultad de Ciencias Médicas"
  }
]
```

#### GET /:id

Recupera una carrera específica por ID con la información de su facultad asociada.

**Ejemplo de Respuesta:**

```json
{
  "carreraid": 1,
  "nombre": "Ingeniería en Sistemas",
  "facultadid": 1,
  "facultad": "Facultad de Ingeniería"
}
```

#### POST /

Crea una nueva carrera.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Ingeniería Civil",
  "facultadid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "carreraid": 3,
  "nombre": "Ingeniería Civil",
  "facultadid": 1
}
```

#### PUT /:id

Actualiza una carrera existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Ingeniería Civil y Ambiental",
  "facultadid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "carreraid": 3,
  "nombre": "Ingeniería Civil y Ambiental",
  "facultadid": 1
}
```

#### DELETE /:id

Elimina una carrera por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Carrera eliminada exitosamente",
  "deletedCarrera": {
    "carreraid": 3,
    "nombre": "Ingeniería Civil y Ambiental",
    "facultadid": 1
  }
}
```

---

## Servicio de Departamento

**Endpoint:** `/departamento`

### Métodos

#### GET /

Recupera todos los departamentos.

**Ejemplo de Respuesta:**

```json
[
  {
    "departamentoid": 1,
    "nombre": "Guatemala"
  },
  {
    "departamentoid": 2,
    "nombre": "Quetzaltenango"
  }
]
```

#### GET /:id

Recupera un departamento específico por ID.

**Ejemplo de Respuesta:**

```json
{
  "departamentoid": 1,
  "nombre": "Guatemala"
}
```

#### POST /

Crea un nuevo departamento.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Petén"
}
```

**Ejemplo de Respuesta:**

```json
{
  "departamentoid": 3,
  "nombre": "Petén"
}
```

#### PUT /:id

Actualiza un departamento existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Petén Norte"
}
```

**Ejemplo de Respuesta:**

```json
{
  "departamentoid": 3,
  "nombre": "Petén Norte"
}
```

#### DELETE /:id

Elimina un departamento por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Departamento eliminado exitosamente",
  "deletedDepartamento": {
    "departamentoid": 3,
    "nombre": "Petén Norte"
  }
}
```

---

## Servicio de Investigación Persona

**Endpoint:** `/investigacionpersona`

### Métodos

#### GET /

Recupera todas las relaciones investigación-persona con información detallada.

**Ejemplo de Respuesta:**

```json
[
  {
    "investigacionpersonaid": 1,
    "investigacionid": 1,
    "personaid": 1,
    "rol": "Investigador Principal",
    "titulo_investigacion": "Desarrollo de sistemas de energía renovable",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López"
  },
  {
    "investigacionpersonaid": 2,
    "investigacionid": 2,
    "personaid": 2,
    "rol": "Colaborador",
    "titulo_investigacion": "Avances en tratamientos para enfermedades tropicales",
    "nombres": "María José",
    "apellidos": "García Hernández"
  }
]
```

#### GET /:id

Recupera una relación investigación-persona específica por ID con información detallada.

**Ejemplo de Respuesta:**

```json
{
  "investigacionpersonaid": 1,
  "investigacionid": 1,
  "personaid": 1,
  "rol": "Investigador Principal",
  "titulo_investigacion": "Desarrollo de sistemas de energía renovable",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López"
}
```

#### POST /

Crea una nueva relación investigación-persona.

**Cuerpo de la Solicitud:**

```json
{
  "investigacionid": 1,
  "personaid": 3,
  "rol": "Asistente de Investigación"
}
```

**Ejemplo de Respuesta:**

```json
{
  "investigacionpersonaid": 3,
  "investigacionid": 1,
  "personaid": 3,
  "rol": "Asistente de Investigación"
}
```

#### PUT /:id

Actualiza una relación investigación-persona existente.

**Cuerpo de la Solicitud:**

```json
{
  "investigacionid": 1,
  "personaid": 3,
  "rol": "Investigador Asociado"
}
```

**Ejemplo de Respuesta:**

```json
{
  "investigacionpersonaid": 3,
  "investigacionid": 1,
  "personaid": 3,
  "rol": "Investigador Asociado"
}
```

#### DELETE /:id

Elimina una relación investigación-persona por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Relación Investigación-Persona eliminada exitosamente",
  "deletedInvestigacionPersona": {
    "investigacionpersonaid": 3,
    "investigacionid": 1,
    "personaid": 3,
    "rol": "Investigador Asociado"
  }
}
```

---

## Servicio de Municipio

**Endpoint:** `/municipio`

### Métodos

#### GET /

Recupera todos los municipios con la información de su departamento asociado.

**Ejemplo de Respuesta:**

```json
[
  {
    "municipioid": 1,
    "nombre": "Guatemala",
    "departamentoid": 1,
    "departamento": "Guatemala"
  },
  {
    "municipioid": 2,
    "nombre": "Mixco",
    "departamentoid": 1,
    "departamento": "Guatemala"
  }
]
```

#### GET /:id

Recupera un municipio específico por ID con la información de su departamento asociado.

**Ejemplo de Respuesta:**

```json
{
  "municipioid": 1,
  "nombre": "Guatemala",
  "departamentoid": 1,
  "departamento": "Guatemala"
}
```

#### POST /

Crea un nuevo municipio.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Villa Nueva",
  "departamentoid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "municipioid": 3,
  "nombre": "Villa Nueva",
  "departamentoid": 1
}
```

#### PUT /:id

Actualiza un municipio existente.

**Cuerpo de la Solicitud:**

```json
{
  "nombre": "Villa Nueva Norte",
  "departamentoid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "municipioid": 3,
  "nombre": "Villa Nueva Norte",
  "departamentoid": 1
}
```

#### DELETE /:id

Elimina un municipio por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Municipio eliminado exitosamente",
  "deletedMunicipio": {
    "municipioid": 3,
    "nombre": "Villa Nueva Norte",
    "departamentoid": 1
  }
}
```

---

## Servicio de Persona Area Científica

**Endpoint:** `/personaareacientifica`

### Métodos

#### GET /

Recupera todas las relaciones persona-área científica con información detallada.

**Ejemplo de Respuesta:**

```json
[
  {
    "personaareacientificaid": 1,
    "personaid": 1,
    "areacientificaid": 1,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "area_cientifica": "Ciencias de la Computación"
  },
  {
    "personaareacientificaid": 2,
    "personaid": 2,
    "areacientificaid": 2,
    "nombres": "María José",
    "apellidos": "García Hernández",
    "area_cientifica": "Biotecnología"
  }
]
```

#### GET /:id

Recupera una relación persona-área científica específica por ID con información detallada.

**Ejemplo de Respuesta:**

```json
{
  "personaareacientificaid": 1,
  "personaid": 1,
  "areacientificaid": 1,
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "area_cientifica": "Ciencias de la Computación"
}
```

#### POST /

Crea una nueva relación persona-área científica.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "areacientificaid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "personaareacientificaid": 3,
  "personaid": 3,
  "areacientificaid": 1
}
```

#### PUT /:id

Actualiza una relación persona-área científica existente.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "areacientificaid": 2
}
```

**Ejemplo de Respuesta:**

```json
{
  "personaareacientificaid": 3,
  "personaid": 3,
  "areacientificaid": 2
}
```

#### DELETE /:id

Elimina una relación persona-área científica por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Relación Persona-Area Científica eliminada exitosamente",
  "deletedPersonaAreaCientifica": {
    "personaareacientificaid": 3,
    "personaid": 3,
    "areacientificaid": 2
  }
}
```

---

## Servicio de Persona Facultad

**Endpoint:** `/personafacultad`

### Métodos

#### GET /

Recupera todas las relaciones persona-facultad con información detallada.

**Ejemplo de Respuesta:**

```json
[
  {
    "personafacultadid": 1,
    "personaid": 1,
    "facultadid": 1,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "facultad": "Facultad de Ingeniería"
  },
  {
    "personafacultadid": 2,
    "personaid": 2,
    "facultadid": 2,
    "nombres": "María José",
    "apellidos": "García Hernández",
    "facultad": "Facultad de Ciencias Médicas"
  }
]
```

#### GET /:id

Recupera una relación persona-facultad específica por ID con información detallada.

**Ejemplo de Respuesta:**

```json
{
  "personafacultadid": 1,
  "personaid": 1,
  "facultadid": 1,
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "facultad": "Facultad de Ingeniería"
}
```

#### POST /

Crea una nueva relación persona-facultad.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "facultadid": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "personafacultadid": 3,
  "personaid": 3,
  "facultadid": 1
}
```

#### PUT /:id

Actualiza una relación persona-facultad existente.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "facultadid": 2
}
```

**Ejemplo de Respuesta:**

```json
{
  "personafacultadid": 3,
  "personaid": 3,
  "facultadid": 2
}
```

#### DELETE /:id

Elimina una relación persona-facultad por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Relación Persona-Facultad eliminada exitosamente",
  "deletedPersonaFacultad": {
    "personafacultadid": 3,
    "personaid": 3,
    "facultadid": 2
  }
}
```

---

## Servicio de Título

**Endpoint:** `/titulo`

### Métodos

#### GET /

Recupera todos los títulos con la información de su persona y carrera asociadas.

**Ejemplo de Respuesta:**

```json
[
  {
    "tituloid": 1,
    "personaid": 1,
    "carreraid": 1,
    "fechagraduacion": "2010-06-15T00:00:00.000Z",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "carrera": "Ingeniería en Sistemas"
  },
  {
    "tituloid": 2,
    "personaid": 2,
    "carreraid": 2,
    "fechagraduacion": "2015-12-10T00:00:00.000Z",
    "nombres": "María José",
    "apellidos": "García Hernández",
    "carrera": "Medicina"
  }
]
```

#### GET /:id

Recupera un título específico por ID con la información de su persona y carrera asociadas.

**Ejemplo de Respuesta:**

```json
{
  "tituloid": 1,
  "personaid": 1,
  "carreraid": 1,
  "fechagraduacion": "2010-06-15T00:00:00.000Z",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "carrera": "Ingeniería en Sistemas"
}
```

#### POST /

Crea un nuevo título.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "carreraid": 1,
  "fechagraduacion": "2018-06-20"
}
```

**Ejemplo de Respuesta:**

```json
{
  "tituloid": 3,
  "personaid": 3,
  "carreraid": 1,
  "fechagraduacion": "2018-06-20T00:00:00.000Z"
}
```

#### PUT /:id

Actualiza un título existente.

**Cuerpo de la Solicitud:**

```json
{
  "personaid": 3,
  "carreraid": 1,
  "fechagraduacion": "2018-07-15"
}
```

**Ejemplo de Respuesta:**

```json
{
  "tituloid": 3,
  "personaid": 3,
  "carreraid": 1,
  "fechagraduacion": "2018-07-15T00:00:00.000Z"
}
```

#### DELETE /:id

Elimina un título por ID.

**Ejemplo de Respuesta:**

```json
{
  "message": "Título eliminado exitosamente",
  "deletedTitulo": {
    "tituloid": 3,
    "personaid": 3,
    "carreraid": 1,
    "fechagraduacion": "2018-07-15T00:00:00.000Z"
  }
}
```
