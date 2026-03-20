# ⛪ MazoIglesias

**Explorador interactivo de las parroquias de la Archidiócesis de Madrid.**

Aplicación web con mapa interactivo para buscar, filtrar y explorar todas las parroquias de Madrid por nombre, barrio, código postal y vicaría.

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Mapa:** React-Leaflet + OpenStreetMap
- **Datos:** JSON local (`public/parroquias.json`)

## 🚀 Instalación y uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

## 📂 Estructura del proyecto

```
MazoIglesias/
├── public/
│   └── parroquias.json               # Datos de parroquias
└── src/
    ├── types/
    │   └── parroquia.ts              # Interfaz TypeScript
    ├── app/
    │   ├── globals.css               # Estilos globales
    │   ├── layout.tsx                # Layout base
    │   ├── page.tsx                  # Página principal (mapa + listado)
    │   └── parroquia/[id]/
    │       └── page.tsx              # Página de detalle
    └── components/
        ├── Filtros.tsx               # Buscador + filtro por vicaría
        ├── ListadoParroquias.tsx     # Lista lateral de parroquias
        ├── ParroquiaCard.tsx         # Tarjeta de parroquia
        └── MapaParroquias.tsx        # Mapa interactivo
```

## ✨ Funcionalidades

- 🔍 Búsqueda por nombre, advocación, población o código postal
- 🏷️ Filtro por vicaría (1–8)
- 🗺️ Mapa interactivo con marcadores y popups
- 📋 Listado lateral sincronizado con el mapa
- 📄 Página de detalle con dirección, contacto y enlace a Google Maps
- 📱 Diseño responsive (escritorio: sidebar + mapa / móvil: stack vertical)

## 📊 Datos

El fichero `public/parroquias.json` contiene 25 parroquias de ejemplo con datos reales. Se puede ampliar siguiendo la interfaz definida en `src/types/parroquia.ts`.

---

*Forjado en la [Forja Nova](https://forjanova.fit)* 🔥  
**FOC I FERRO, CARN I CODI**
