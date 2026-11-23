-- ==============================================================================
-- PROYECTO: SISTEMA DE GESTION DE RESIDENCIA ESTUDIANTIL A&J
-- SCRIPT: DATOS DE DEMOSTRACION PARA REPORTES SQL Y PROCEDIMIENTOS ALMACENADOS
-- MOTOR: ORACLE DATABASE (ESQUEMA RESIDENCIA_AJ)
-- ==============================================================================

-- 1. TIPOS DE CONTRATO (si no existen)
MERGE INTO TIP_CONTRATO t
USING (
    SELECT 1 AS id, 'Mensual' AS nombre, '1' AS estado FROM DUAL UNION ALL
    SELECT 2 AS id, 'Semestral' AS nombre, '1' AS estado FROM DUAL UNION ALL
    SELECT 3 AS id, 'Anual' AS nombre, '1' AS estado FROM DUAL
) src ON (t.id_tipoContrato = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_tipoContrato, nombre, estado) VALUES (src.id, src.nombre, src.estado);

-- 2. HABITACIONES (Pisos 1, 2 y 3 con diferentes estados)
MERGE INTO HABITACIONES h
USING (
    SELECT 1 AS id, 'A-101' AS num, 1 AS piso, 'Habitación individual con baño' AS descr, 350.00 AS prec, 'D' AS est FROM DUAL UNION ALL
    SELECT 2 AS id, 'A-102' AS num, 1 AS piso, 'Habitación doble exterior' AS descr, 320.00 AS prec, 'O' AS est FROM DUAL UNION ALL
    SELECT 3 AS id, 'B-201' AS num, 2 AS piso, 'Habitación con balcón y baño' AS descr, 400.00 AS prec, 'D' AS est FROM DUAL UNION ALL
    SELECT 4 AS id, 'B-202' AS num, 2 AS piso, 'Habitación compartida' AS descr, 280.00 AS prec, 'O' AS est FROM DUAL UNION ALL
    SELECT 5 AS id, 'C-301' AS num, 3 AS piso, 'Habitación individual suite' AS descr, 450.00 AS prec, 'M' AS est FROM DUAL
) src ON (h.id_habitacion = src.id)
WHEN MATCHED THEN
    UPDATE SET h.numero = src.num, h.piso = src.piso, h.descripcion = src.descr, h.precio = src.prec, h.estado = src.est
WHEN NOT MATCHED THEN
    INSERT (id_habitacion, numero, piso, descripcion, precio, estado)
    VALUES (src.id, src.num, src.piso, src.descr, src.prec, src.est);

-- 3. PERSONAS
MERGE INTO PERSONA p
USING (
    SELECT 1 AS id, 'Admin' AS nom, 'Principal' AS pat, 'Sistema' AS mat, '00000001' AS doc, '999999999' AS tel, 'admin@residencia.pe' AS mail FROM DUAL UNION ALL
    SELECT 2 AS id, 'Carlos' AS nom, 'Mendoza' AS pat, 'Rojas' AS mat, '74859612' AS doc, '987112233' AS tel, 'carlos.mendoza@upeu.edu.pe' AS mail FROM DUAL UNION ALL
    SELECT 3 AS id, 'María' AS nom, 'Fernández' AS pat, 'Quispe' AS mat, '71234567' AS doc, '945667788' AS tel, 'maria.fernandez@upeu.edu.pe' AS mail FROM DUAL
) src ON (p.id_persona = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_persona, nombres, ap_paterno, ap_materno, nro_documento, telefono, email)
    VALUES (src.id, src.nom, src.pat, src.mat, src.doc, src.tel, src.mail);

-- 4. CLIENTES
MERGE INTO CLIENTES c
USING (
    SELECT 1 AS id, 2 AS id_per FROM DUAL UNION ALL
    SELECT 2 AS id, 3 AS id_per FROM DUAL
) src ON (c.id_cliente = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_cliente, id_persona) VALUES (src.id, src.id_per);

-- 5. USUARIOS
MERGE INTO USUARIOS u
USING (
    SELECT 1 AS id, 1 AS id_per, 1 AS id_rol, 'admin' AS usr, 'Administrador General' AS descr, '1' AS est, 'admin123' AS pass FROM DUAL
) src ON (u.id_usuario = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_usuario, id_persona, id_rol, nombre, descripcion, estado, contrasena)
    VALUES (src.id, src.id_per, src.id_rol, src.usr, src.descr, src.est, src.pass);

-- 6. CONTRATOS
MERGE INTO CONTRATO c
USING (
    SELECT 1 AS id, 1 AS id_tipo, 1 AS id_cli, 1 AS id_usr, 2 AS id_hab, DATE '2026-09-01' AS f_ini, DATE '2026-12-31' AS f_fin, 320.00 AS mto, 'Efectivo' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 2 AS id, 2 AS id_tipo, 2 AS id_cli, 1 AS id_usr, 4 AS id_hab, DATE '2026-08-15' AS f_ini, DATE '2026-12-15' AS f_fin, 280.00 AS mto, 'Yape' AS met, '1' AS est FROM DUAL
) src ON (c.id_contrato = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_contrato, id_tipoContrato, id_cliente, id_usuario, id_habitacion, fecha_inicio, fecha_fin, monto, metodo_pago, estado)
    VALUES (src.id, src.id_tipo, src.id_cli, src.id_usr, src.id_hab, src.f_ini, src.f_fin, src.mto, src.met, src.est);

-- 7. PAGOS (con diferentes fechas y métodos para que los reportes muestren variedad)
MERGE INTO PAGOS p
USING (
    SELECT 1 AS id, 1 AS id_cto, 1 AS id_usr, 320.00 AS mto, DATE '2026-09-05' AS fec, 'Efectivo' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 2 AS id, 1 AS id_cto, 1 AS id_usr, 320.00 AS mto, DATE '2026-10-05' AS fec, 'Yape' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 3 AS id, 1 AS id_cto, 1 AS id_usr, 320.00 AS mto, DATE '2026-11-05' AS fec, 'Plin' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 4 AS id, 2 AS id_cto, 1 AS id_usr, 280.00 AS mto, DATE '2026-08-20' AS fec, 'Transferencia' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 5 AS id, 2 AS id_cto, 1 AS id_usr, 280.00 AS mto, DATE '2026-09-20' AS fec, 'Yape' AS met, '1' AS est FROM DUAL UNION ALL
    SELECT 6 AS id, 2 AS id_cto, 1 AS id_usr, 280.00 AS mto, DATE '2026-10-20' AS fec, 'Transferencia' AS met, '1' AS est FROM DUAL
) src ON (p.id_pago = src.id)
WHEN NOT MATCHED THEN
    INSERT (id_pago, id_contrato, id_usuario, monto, fecha, metodo_pago, estado)
    VALUES (src.id, src.id_cto, src.id_usr, src.mto, src.fec, src.met, src.est);

COMMIT;

