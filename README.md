# Project-Sistemas-Horizon-Haven-
Proyecto de Sistemas


# Comenzamos la sintaxis para crear la base de datos:

[Tren.txt](https://github.com/user-attachments/files/28917084/Tren.txt)


# Instalación de programas:
`npm create vite@latest mi-app-react`
Utilizamos vite para facilitar la instalación de react

# Horizon Haven 🏠

**Find Your Place. Own Your Future.**
*Buy · Sell · Rent*

Sistema de gestión inmobiliaria con autenticación de usuarios, dashboard administrativo y CRUD completo para viviendas, citas y usuarios.

## Tecnologías utilizadas

- **Frontend:** React + Vite, React Router DOM, Axios
- **Backend:** Node.js, Express
- **Base de datos:** MySQL (XAMPP)
- **Autenticación:** JWT (JSON Web Tokens) + bcrypt para encriptar contraseñas

## Estructura del proyecto

```
mi-proyecto/
├── mi-app-react/           # Frontend (React + Vite)
└── horizon-haven-backend/  # Backend (Express + MySQL)
```

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [XAMPP](https://www.apachefriends.org/) (para MySQL)
- Un editor de código (recomendado: VS Code)

---

## 1. Configuración de la base de datos (MySQL / XAMPP)

1. Abre el **Panel de Control de XAMPP** e inicia el módulo **MySQL**.
2. Abre **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Crea una nueva base de datos llamada `horizon_haven`, o simplemente ejecuta el siguiente script SQL en la pestaña **SQL**:

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS horizon_haven;
USE horizon_haven;

-- =========================
-- TABLA USUARIOS
-- =========================
CREATE TABLE usuarios (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL
);

-- =========================
-- TABLA VIVIENDAS
-- =========================
CREATE TABLE viviendas (
    id_vivienda INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vivienda ENUM(
        'Apartamento',
        'Casa',
        'Loft',
        'Penthouse',
        'Duplex',
        'Finca',
        'Estudio'
    ) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    tamano DECIMAL(10,2) NOT NULL,
    estado ENUM(
        'Excelente',
        'Buena',
        'Media',
        'Mala',
        'Deteriorada'
    ) NOT NULL
);

-- =========================
-- TABLA CITAS
-- =========================
CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_vivienda INT NOT NULL,
    id_user INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    CONSTRAINT fk_citas_vivienda
        FOREIGN KEY (id_vivienda)
        REFERENCES viviendas(id_vivienda)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_citas_usuario
        FOREIGN KEY (id_user)
        REFERENCES usuarios(id_user)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

> 💡 **Nota:** La configuración por defecto asume usuario `root` sin contraseña (configuración estándar de XAMPP). Si tu instalación de MySQL tiene una contraseña distinta, deberás actualizar el archivo `conexion.js` del backend (ver paso 2).

---

## 2. Configuración del backend (`horizon-haven-backend`)

### 2.1 Instalar dependencias

```bash
cd horizon-haven-backend
npm install
```

### 2.2 Verificar la conexión a la base de datos

Revisa el archivo `conexion.js` y ajusta los datos si es necesario:

```javascript
const pool = mysql.createPool({
    host: "localhost",
    database: "horizon_haven",
    user: "root",
    password: ""   // Cambia esto si tu MySQL tiene contraseña configurada
});
```

### 2.3 Variables de entorno

El archivo `.env` ya incluye una configuración por defecto:

```
JWT_SECRET=horizon_haven_secreto_super_seguro_cambiar_en_produccion
PORT=4000
```

> Si vas a subir este proyecto a producción, **cambia el valor de `JWT_SECRET`** por una cadena aleatoria y segura.

### 2.4 Iniciar el servidor

```bash
npm start
```

Si todo está correcto, verás en la consola:

```
✅ Conexión exitosa a la base de datos horizon_haven
🚀 Servidor corriendo en http://localhost:4000
```

### 2.5 Endpoints disponibles

| Método | Endpoint | Descripción | Requiere token |
|--------|----------|-------------|----------------|
| POST | `/api/auth/registro` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/viviendas` | Listar viviendas | Sí |
| GET | `/api/viviendas/:id` | Obtener una vivienda | Sí |
| POST | `/api/viviendas` | Crear vivienda | Sí |
| PUT | `/api/viviendas/:id` | Actualizar vivienda | Sí |
| DELETE | `/api/viviendas/:id` | Eliminar vivienda | Sí |
| GET | `/api/citas` | Listar citas (con datos de vivienda y usuario) | Sí |
| POST | `/api/citas` | Crear cita | Sí |
| PUT | `/api/citas/:id` | Actualizar cita | Sí |
| DELETE | `/api/citas/:id` | Eliminar cita | Sí |
| GET | `/api/usuarios` | Listar usuarios | Sí |
| POST | `/api/usuarios` | Crear usuario | Sí |
| PUT | `/api/usuarios/:id` | Actualizar usuario | Sí |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | Sí |

> Las rutas protegidas requieren un header `Authorization: Bearer <token>`, el cual se obtiene al hacer login.

---

## 3. Configuración del frontend (`mi-app-react`)

### 3.1 Instalar dependencias

```bash
cd mi-app-react
npm install
```

Si las dependencias `react-router-dom` y `axios` no están instaladas, ejecuta:

```bash
npm install react-router-dom axios
```

### 3.2 Verificar la URL de la API

El archivo `src/services/api.js` apunta por defecto a:

```javascript
const api = axios.create({
    baseURL: "http://localhost:4000/api"
});
```

Si cambiaste el puerto del backend en el `.env`, actualiza esta URL acorde.

### 3.3 Iniciar el frontend

```bash
npm run dev
```

Esto abrirá el servidor de desarrollo de Vite, normalmente en:

```
http://localhost:5173/
```

---

## 4. Primer uso de la aplicación

1. Abre `http://localhost:5173/` en tu navegador.
2. Verás la pantalla de **Login**.
3. Haz clic en **"Regístrate aquí"** para crear tu primera cuenta.
4. Inicia sesión con el correo y contraseña registrados.
5. Serás redirigido al **Dashboard**, donde podrás:
   - Ver el resumen general (totales de viviendas, citas y usuarios).
   - Gestionar **Viviendas** (crear, editar, eliminar).
   - Gestionar **Citas** (agendar visitas relacionando vivienda y usuario).
   - Gestionar **Usuarios** (crear, editar, eliminar cuentas).

---

## 5. Resolución de problemas comunes

### "Error al conectar a la base de datos"
- Verifica que el módulo **MySQL** de XAMPP esté iniciado.
- Confirma que la base de datos `horizon_haven` exista y tenga las tablas creadas.
- Revisa usuario/contraseña en `conexion.js`.

### "Network Error" o no carga la información en el frontend
- Asegúrate de que el backend esté corriendo en `http://localhost:4000`.
- Verifica que no haya otro proceso usando el puerto 4000.
- Revisa la consola del navegador (F12) para más detalles del error.

### "Token inválido o expirado" / redirige al login constantemente
- El token JWT expira después de 8 horas. Vuelve a iniciar sesión.
- Verifica que `JWT_SECRET` no haya cambiado mientras un token seguía activo.

### Error al crear una cita
- Debe existir al menos **una vivienda** y **un usuario** registrados antes de poder agendar una cita.

---

## 6. Scripts disponibles

### Backend (`horizon-haven-backend`)

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo normal |
| `npm run dev` | Inicia el servidor con recarga automática (`--watch`) |

### Frontend (`mi-app-react`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo de Vite |
| `npm run build` | Genera la versión de producción |
| `npm run preview` | Previsualiza la versión de producción |

---

## 7. Paleta de colores (basada en el logo)

| Color | Código | Uso |
|-------|--------|-----|
| Azul marino | `#0B1F3A` | Color primario, encabezados, sidebar |
| Dorado | `#C9A227` | Acentos, botones destacados |
| Blanco hueso | `#FAF9F6` | Fondo general |
| Gris claro | `#E8E6E1` | Paneles, bordes |
| Verde éxito | `#2E7D32` | Mensajes de éxito |
| Rojo error | `#C62828` | Mensajes de error |

---

## Licencia

Proyecto académico — Horizon Haven © 2026
