-- ==============================================================================
-- PROYECTO: SISTEMA DE GESTION DE RESIDENCIA ESTUDIANTIL A&J
-- SCRIPT 03: CONSULTAS SQL PARA REPORTES DESDE EL LP (ESTRUCTURA DE CLASE)
-- MOTOR: ORACLE DATABASE
-- ESQUEMA: RESIDENCIA_AJ
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- R1. Contratos vigentes con cliente, habitación y tipo de contrato
-- ------------------------------------------------------------------------------
SELECT C.id_contrato,
       P.nombres || ' ' || P.ap_paterno || ' ' || NVL(P.ap_materno, '') AS cliente,
       H.numero AS habitacion,
       T.nombre AS tipo_contrato,
       TO_CHAR(C.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
       TO_CHAR(C.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
       C.monto
FROM CONTRATO C
JOIN CLIENTES CL     ON CL.id_cliente = C.id_cliente
JOIN PERSONA P       ON P.id_persona = CL.id_persona
JOIN HABITACIONES H  ON H.id_habitacion = C.id_habitacion
JOIN TIP_CONTRATO T  ON T.id_tipoContrato = C.id_tipoContrato
WHERE UPPER(C.estado) IN ('1', 'A')
  AND TRUNC(SYSDATE) BETWEEN TRUNC(C.fecha_inicio) AND TRUNC(C.fecha_fin)
ORDER BY C.id_contrato DESC
FETCH FIRST 15 ROWS ONLY;

-- ------------------------------------------------------------------------------
-- R2. Los 10 clientes que más han pagado
-- ------------------------------------------------------------------------------
SELECT CL.id_cliente,
       P.nombres || ' ' || P.ap_paterno || ' ' || NVL(P.ap_materno, '') AS cliente,
       P.nro_documento,
       COUNT(PG.id_pago) AS nro_pagos,
       NVL(SUM(PG.monto), 0) AS total_pagado
FROM PAGOS PG
JOIN CONTRATO C  ON C.id_contrato = PG.id_contrato
JOIN CLIENTES CL ON CL.id_cliente = C.id_cliente
JOIN PERSONA P   ON P.id_persona = CL.id_persona
GROUP BY CL.id_cliente, P.nombres, P.ap_paterno, P.ap_materno, P.nro_documento
ORDER BY total_pagado DESC
FETCH FIRST 10 ROWS ONLY;

-- ------------------------------------------------------------------------------
-- R3. Ingresos por método de pago (con promedio y porcentaje)
-- ------------------------------------------------------------------------------
SELECT NVL(UPPER(metodo_pago), 'NO ESPECIFICADO') AS metodo_pago,
       COUNT(id_pago) AS nro_pagos,
       NVL(SUM(monto), 0) AS total,
       NVL(ROUND(AVG(monto), 2), 0) AS promedio,
       ROUND(COUNT(id_pago) * 100.0 / NULLIF((SELECT COUNT(*) FROM PAGOS), 0), 2) AS porcentaje_uso
FROM PAGOS
GROUP BY UPPER(metodo_pago)
ORDER BY total DESC;

-- ------------------------------------------------------------------------------
-- R4. Ocupación de habitaciones por piso (hoy, según contratos vigentes)
-- ------------------------------------------------------------------------------
SELECT H.piso,
       COUNT(DISTINCT H.id_habitacion) AS total_habitaciones,
       COUNT(DISTINCT C.id_habitacion) AS ocupadas,
       (COUNT(DISTINCT H.id_habitacion) - COUNT(DISTINCT C.id_habitacion)) AS disponibles
FROM HABITACIONES H
LEFT JOIN CONTRATO C ON C.id_habitacion = H.id_habitacion
                    AND UPPER(C.estado) IN ('1', 'A')
                    AND TRUNC(SYSDATE) BETWEEN TRUNC(C.fecha_inicio) AND TRUNC(C.fecha_fin)
GROUP BY H.piso
ORDER BY H.piso;

-- ------------------------------------------------------------------------------
-- R5. Notificaciones sin leer por rol
-- ------------------------------------------------------------------------------
SELECT R.nombre AS rol,
       COUNT(N.id_notificacion) AS sin_leer
FROM NOTIFICACIONES N
JOIN USUARIOS U ON U.id_usuario = N.id_usuario
JOIN ROLES R    ON R.id_rol = U.id_rol
WHERE N.leido = 0
GROUP BY R.nombre
ORDER BY sin_leer DESC
FETCH FIRST 10 ROWS ONLY;

-- ------------------------------------------------------------------------------
-- R6 (Adicional). Resumen de Ingresos Mensuales
-- ------------------------------------------------------------------------------
SELECT TO_CHAR(p.fecha, 'YYYY-MM') AS periodo,
       COUNT(p.id_pago) AS total_pagos,
       NVL(SUM(p.monto), 0) AS total_monto,
       NVL(ROUND(AVG(p.monto), 2), 0) AS promedio_pago
FROM PAGOS p
GROUP BY TO_CHAR(p.fecha, 'YYYY-MM')
ORDER BY periodo DESC;
