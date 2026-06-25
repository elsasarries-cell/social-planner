# Social Planner — Guía de instalación

## Paso 1 — Abrir el proyecto en VSCode

1. Copiá la carpeta `social-planner` a tu computadora
2. Abrí VSCode → File → Open Folder → seleccioná la carpeta
3. Abrí la terminal integrada: View → Terminal (o Ctrl+`)

## Paso 2 — Instalar dependencias

En la terminal escribí:
```
npm install
```
Esperá que termine (puede tardar 1-2 minutos).

## Paso 3 — Crear la base de datos en Supabase

1. Entrá a https://supabase.com y creá una cuenta gratuita
2. Creá un nuevo proyecto (elegí cualquier nombre y contraseña)
3. Esperá que el proyecto se inicie (~1 minuto)
4. Andá a **SQL Editor** (menú izquierdo)
5. Copiá todo el contenido del archivo `supabase-setup.sql` y pegalo ahí
6. Hacé clic en **Run**

## Paso 4 — Obtener las claves de Supabase

1. En Supabase andá a **Settings → API**
2. Copiá:
   - **Project URL** → la vas a necesitar como `VITE_SUPABASE_URL`
   - **anon public key** → la vas a necesitar como `VITE_SUPABASE_ANON_KEY`

## Paso 5 — Obtener la API key de Anthropic

1. Entrá a https://console.anthropic.com
2. Andá a **API Keys → Create Key**
3. Copiá la clave

## Paso 6 — Configurar las variables de entorno

1. En VSCode, copiá el archivo `.env.example` y renombralo `.env.local`
2. Completalo con tus claves:
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Paso 7 — Correr la app localmente

En la terminal:
```
npm run dev
```
Abrí http://localhost:5173 en el navegador. ¡La app está corriendo!

## Paso 8 — Publicar en internet con Vercel

1. Creá una cuenta en https://github.com y subí la carpeta como repositorio
   (GitHub Desktop lo hace sin código: https://desktop.github.com)
2. Creá una cuenta en https://vercel.com
3. En Vercel: **Add New Project → Import** tu repositorio de GitHub
4. En **Environment Variables** agregá las mismas 3 variables del `.env.local`
5. Hacé clic en **Deploy**

En 2 minutos tenés una URL pública tipo: `https://social-planner-tuagencia.vercel.app`

---

## Links del cliente

Cada cliente tiene su link único:
```
https://tu-url.vercel.app?view=client&cid=ID_DEL_CLIENTE
```
El ID del cliente lo encontrás en Supabase → Table Editor → clients.

---

## Soporte

Si algo no funciona, el error más común es una clave mal copiada en `.env.local`.
Revisá que no tenga espacios al principio ni al final.
