CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL -- 'SUPER_ADMIN', 'ESPECIALISTA'
);
INSERT INTO roles (nombre) VALUES ('SUPER_ADMIN'), ('ESPECIALISTA');
CREATE TABLE especialistas (
    id SERIAL PRIMARY KEY,
    rol_id INTEGER REFERENCES roles(id) DEFAULT 2,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    especialidad_principal VARCHAR(100),
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    biografia TEXT,
    foto_url VARCHAR(255),
    estado_activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tutores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    parentesco VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(100)
);

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    peso_kg DECIMAL(5,2),
    altura_cm DECIMAL(5,2),
    imc DECIMAL(4,2),
    alergias TEXT,
    tutor_id INTEGER REFERENCES tutores(id),
    especialista_asignado_id INTEGER REFERENCES especialistas(id), -- Para filtro de vista Especialista
    monto_mensual NUMERIC(10,2)
);

CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id),
    especialista_id INTEGER REFERENCES especialistas(id),
    fecha_cita TIMESTAMP NOT NULL,
    observacion_clinica TEXT,
    estado_cita VARCHAR(50), -- 'Programada', 'Confirmada', 'Cancelada', 'Completada'
    progreso_terapia_pct INTEGER DEFAULT 0,
    CHECK (estado_cita IN ('Programada', 'Confirmada', 'Cancelada', 'Completada'))
);

CREATE TABLE pagos (
    id SERIAL,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(50),
    estado_pago VARCHAR(50), -- 'Pagado', 'Pendiente', 'Vencido'
    PRIMARY KEY (id, fecha_pago)
) PARTITION BY RANGE (fecha_pago);

CREATE TABLE pagos_2025 PARTITION OF pagos FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE pagos_2026 PARTITION OF pagos FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE metricas_ia (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id),
    cita_id INTEGER REFERENCES citas(id),
    frustracion INTEGER CHECK (frustracion BETWEEN 1 AND 10),
    latencia_ms INTEGER,
    presion_toque DECIMAL(5,2),
    tiempo_reaccion_ms INTEGER,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluaciones_tdo (
    id SERIAL,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    score_total INTEGER NOT NULL,
    nivel_tdo VARCHAR(20) NOT NULL,
    fecha_evaluacion DATE NOT NULL,
    observaciones TEXT,
    PRIMARY KEY (id, fecha_evaluacion)
) PARTITION BY RANGE (fecha_evaluacion);

CREATE TABLE evaluaciones_tdo_2025 PARTITION OF evaluaciones_tdo FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE evaluaciones_tdo_2026 PARTITION OF evaluaciones_tdo FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES especialistas(id),
    tipo VARCHAR(50), 
    nivel VARCHAR(20),
    mensaje TEXT,
    leido BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW vista_admin_global AS
SELECT 
    e.nombre AS especialista,
    COUNT(p.id) AS total_pacientes,
    SUM(pa.monto) AS ingresos_totales,
    AVG(c.progreso_terapia_pct) AS desempeño_clinico_avg
FROM especialistas e
LEFT JOIN pacientes p ON e.id = p.especialista_asignado_id
LEFT JOIN pagos pa ON p.id = pa.paciente_id
LEFT JOIN citas c ON e.id = c.especialista_id
GROUP BY e.id, e.nombre;

CREATE VIEW vista_dashboard_especialista AS
SELECT 
    p.id AS paciente_id,
    p.nombre AS paciente,
    c.fecha_cita AS proxima_cita,
    c.progreso_terapia_pct,
    (SELECT estado_pago FROM pagos WHERE paciente_id = p.id ORDER BY fecha_pago DESC LIMIT 1) AS ultimo_pago_status
FROM pacientes p
JOIN citas c ON p.id = c.paciente_id
WHERE c.estado_cita = 'Programada';

CREATE TABLE log_reportes (
    id SERIAL PRIMARY KEY,
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION funcion_trigger_reporte()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_reportes(descripcion)
    VALUES ('Pago ' || NEW.estado_pago || ' - Paciente ID: ' || NEW.paciente_id || ' - Monto: ' || NEW.monto);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_reporte
AFTER INSERT ON pagos
FOR EACH ROW EXECUTE FUNCTION funcion_trigger_reporte();

INSERT INTO especialistas (nombre, email, password, rol_id, especialidad_principal) 
VALUES ('Jerry Admin', 'jerry@tico.com', '$2a$10$o6tI0V.Vp6.b8.t58hXV6.B1j1rO9t.L7t.6554u/Zg3Z2uX/TqRi', 1, 'Dirección General');

INSERT INTO especialistas (nombre, email, password, rol_id, especialidad_principal) 
VALUES ('Dr. Fernando', 'fer@tico.com', '$2a$10$o6tI0V.Vp6.b8.t58hXV6.B1j1rO9t.L7t.6554u/Zg3Z2uX/TqRi', 2, 'Psicología Infantil');


INSERT INTO tutores (nombre, parentesco, email) VALUES ('Luna', 'Madre', 'luna@mail.com');

INSERT INTO pacientes (nombre, fecha_nacimiento, tutor_id, especialista_asignado_id, monto_mensual) 
VALUES ('Tico Niño', '2018-05-20', 1, 2, 1500.00);