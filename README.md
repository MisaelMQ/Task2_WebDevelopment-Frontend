# BCP Tablero NPS - Frontend

Aplicación web desarrollada con React para administrar canales de atención
y encuestas NPS.

El Frontend consume una API REST desarrollada con FastAPI. Ambos proyectos
son independientes y se comunican mediante peticiones HTTP autenticadas
con JSON Web Tokens.

## Funcionalidades

- Inicio de sesión.
- Autenticación mediante JWT.
- Protección de rutas privadas.
- Autorización basada en roles.
- Dashboard dinámico.
- CRUD completo de canales.
- CRUD completo de encuestas.
- Filtros y paginación.
- Clasificación automática NPS.
- Diseño responsivo.
- Interfaz basada en el sistema visual BCP.
- Confirmación antes de eliminar registros.
- Manejo centralizado de errores HTTP.

## Tecnologías utilizadas

- React
- JavaScript
- HTML5
- CSS3
- Vite
- React Router
- Bootstrap
- Bootstrap Icons
- Fetch API

## Requisitos

Antes de ejecutar el proyecto se necesita:

- Node.js 20.19 o superior.
- npm.
- Backend de BCP Tablero NPS ejecutándose.
- Git, si se clonará el repositorio.

Versiones utilizadas durante el desarrollo:

- Node.js 24.19.0
- npm 11.17.0
- Vite 8.2.2

## Estructura principal

```text
Frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── channelsApi.js
│   │   ├── http.js
│   │   └── surveysApi.js
│   ├── assets/
│   │   ├── css/
│   │   └── img/
│   ├── auth/
│   ├── components/
│   │   ├── channels/
│   │   ├── common/
│   │   └── surveys/
│   ├── config/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js