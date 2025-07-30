-- Admin Settings Table for centralized control
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value) VALUES 
(
  'provider_config', 
  '[
    {"id": "xfinity", "name": "Xfinity", "enabled": true, "displayOrder": 1},
    {"id": "spectrum", "name": "Spectrum", "enabled": true, "displayOrder": 2},
    {"id": "frontier-fiber", "name": "Frontier Fiber", "enabled": true, "displayOrder": 3},
    {"id": "frontier-copper", "name": "Frontier Copper", "enabled": true, "displayOrder": 4},
    {"id": "brightspeed-fiber", "name": "BrightSpeed Fiber", "enabled": true, "displayOrder": 5},
    {"id": "brightspeed-copper", "name": "BrightSpeed Copper", "enabled": true, "displayOrder": 6},
    {"id": "altafiber", "name": "Altafiber", "enabled": true, "displayOrder": 7},
    {"id": "metronet", "name": "Metronet", "enabled": true, "displayOrder": 8},
    {"id": "optimum", "name": "Optimum", "enabled": true, "displayOrder": 9},
    {"id": "kinetic", "name": "Kinetic", "enabled": true, "displayOrder": 10},
    {"id": "earthlink", "name": "EarthLink", "enabled": true, "displayOrder": 11},
    {"id": "directv", "name": "DirecTV", "enabled": true, "displayOrder": 12}
  ]'::jsonb
),
(
  'notification_config',
  '{
    "admin_email": "gamblerspassion@gmail.com",
    "push_notifications_enabled": false,
    "email_notifications_enabled": true
  }'::jsonb
),
(
  'form_config',
  '{
    "form_enabled": true,
    "maintenance_mode": false,
    "custom_message": ""
  }'::jsonb
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
