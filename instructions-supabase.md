# 🚀 Supabase Setup for GripCo (Online Store)

Sigue estos pasos para configurar la base de datos, autenticación y políticas si acabas de clonar el repositorio y quieres levantar la tienda online desde cero.

## 1. Crear el Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com/) y crea un nuevo proyecto (ej. `gripco-store`).
2. Una vez creado, ve a **Project Settings > API**.
3. Copia tu **Project URL** y tu **anon public key**.

## 2. Configurar Variables de Entorno en Angular

En tu repositorio local, crea (o edita si ya existen) los archivos de entorno para conectar tu app con tu nuevo proyecto de Supabase.

Crea `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'TU_PROJECT_URL_AQUI',
  supabaseKey: 'TU_ANON_PUBLIC_KEY_AQUI',
  // stripePublicKey: '...' (si usas Stripe)
};
```

Crea `src/environments/environment.ts` para producción:

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'TU_PROJECT_URL_AQUI',
  supabaseKey: 'TU_ANON_PUBLIC_KEY_AQUI',
};
```

## 3. Configurar Autenticación

1. En el panel de Supabase, ve a **Authentication > Providers**.
2. Asegúrate de que **Email** esté habilitado.
3. Ve a **Authentication > URL Configuration**.
4. Establece **Site URL** en `http://localhost:4200` para desarrollo local (luego añadirás tu dominio de producción).

## 4. Ejecutar el Script SQL Inicial (Tablas y Seguridad)

Ve al **SQL Editor** en el panel de Supabase, crea un nuevo query, pega el siguiente código y presiona **Run**. Esto creará la estructura de la tienda y la seguridad (RLS).

```sql
-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  address TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending_to_gripco' CHECK (status IN ('pending_to_gripco', 'sent_to_gripco', 'received_at_gripco', 'resoling', 'pending_to_client', 'sent_to_client', 'received_by_client', 'cancelled')),
  total_price DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  notes TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Order Items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  rubber_type TEXT NOT NULL,
  has_toe_patch BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/update their own profile, Admins see all.
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: Users view/cancel their own, Admins manage all.
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update/cancel own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Order Items: Follow order access rules.
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ==========================================
-- TRIGGERS
-- ==========================================
-- Trigger to insert a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 5. Hacer a tu usuario "Administrador"

Para acceder al panel de la tienda (`/admin`) y ver todos los pedidos:

1. Abre tu aplicación (`npm run dev`) y **regístrate** usando el formulario normales (`/auth`).
2. Vuelve a Supabase, entra al **Table Editor** y selecciona la tabla `profiles`.
3. Busca la fila de tu usuario recién creado.
4. Cambia el valor de la columna `is_admin` a `TRUE` (marca la casilla y guarda).
5. Refresca tu aplicación; ¡ahora deberías ver las opciones de administrador y el panel general de pedidos!
