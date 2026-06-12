/**
 * Migración para soporte de app móvil:
 * 1. Modifica push_subscriptions: reemplaza endpoint/keys_json por expo_push_token/platform
 * 2. Crea tabla member_notifications
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Modificar push_subscriptions
    console.log('→ Modificando push_subscriptions...');

    // Agregar nuevas columnas si no existen
    await client.query(`
      ALTER TABLE push_subscriptions
        ADD COLUMN IF NOT EXISTS expo_push_token varchar(255),
        ADD COLUMN IF NOT EXISTS platform varchar(20);
    `);

    // Eliminar columnas viejas si existen
    await client.query(`
      ALTER TABLE push_subscriptions
        DROP COLUMN IF EXISTS endpoint,
        DROP COLUMN IF EXISTS keys_json;
    `);

    // Hacer expo_push_token NOT NULL después de que la columna existe
    // (primero se agrega nullable para no romper filas existentes)
    await client.query(`
      UPDATE push_subscriptions SET expo_push_token = '' WHERE expo_push_token IS NULL;
    `);
    await client.query(`
      ALTER TABLE push_subscriptions ALTER COLUMN expo_push_token SET NOT NULL;
    `);

    console.log('✓ push_subscriptions actualizada');

    // 2. Crear member_notifications
    console.log('→ Creando member_notifications...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS member_notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        member_id uuid NOT NULL REFERENCES members(id),
        title varchar(255) NOT NULL,
        body text NOT NULL,
        type varchar(50) NOT NULL,
        read boolean DEFAULT false NOT NULL,
        sent_at timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✓ member_notifications creada');

    await client.query('COMMIT');
    console.log('\n✅ Migración completada exitosamente');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
