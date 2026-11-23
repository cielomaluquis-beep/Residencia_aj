-- ==============================================================================
-- PROYECTO: SISTEMA DE GESTION DE RESIDENCIA ESTUDIANTIL A&J
-- SCRIPT 02: PROCEDIMIENTOS ALMACENADOS (PL/SQL) PARA ORACLE DATABASE
-- ESQUEMA: RESIDENCIA_AJ
-- ==============================================================================

SET DEFINE OFF;
SET SERVEROUTPUT ON;

-- ==============================================================================
-- PARTE A: PROCEDIMIENTOS DE CLASE (DICCIONARIO DE DATOS Y STORAGE)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROCEDIMIENTO: P333
-- Descripción: Genera el script DDL (CREATE TABLE) de todas las tablas de un usuario
--              leyendo ALL_TABLES y ALL_TAB_COLS mediante cursores anidados.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE P333 (PUS IN VARCHAR2) IS
    CURSOR CTABLAS IS
        SELECT TABLE_NAME
        FROM ALL_TABLES
        WHERE OWNER = UPPER(TRIM(PUS))
        ORDER BY TABLE_NAME;

    CURSOR CCOLS (PNTABLE VARCHAR2) IS
        SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE
        FROM ALL_TAB_COLS
        WHERE OWNER = UPPER(TRIM(PUS)) AND TABLE_NAME = PNTABLE
        ORDER BY COLUMN_ID;

    VTIPO VARCHAR2(60);
    VCOMA VARCHAR2(1);
    VCONT NUMBER := 0;
BEGIN
    FOR T IN CTABLAS LOOP
        VCONT := VCONT + 1;
        DBMS_OUTPUT.PUT_LINE('CREATE TABLE ' || T.TABLE_NAME || ' (');
        VCOMA := ' ';
        FOR C IN CCOLS(T.TABLE_NAME) LOOP
            VTIPO := C.DATA_TYPE ||
                     CASE
                         WHEN C.DATA_TYPE IN ('VARCHAR2','CHAR') THEN '(' || C.DATA_LENGTH || ')'
                         WHEN C.DATA_TYPE = 'NUMBER' AND C.DATA_PRECISION IS NOT NULL
                              THEN '(' || C.DATA_PRECISION || ',' || NVL(C.DATA_SCALE,0) || ')'
                         ELSE ''
                     END;
            DBMS_OUTPUT.PUT_LINE('    ' || VCOMA || C.COLUMN_NAME || ' ' || VTIPO);
            VCOMA := ',';
        END LOOP;
        DBMS_OUTPUT.PUT_LINE(');');
    END LOOP;

    IF VCONT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No se encontraron tablas visibles para el usuario: ' || UPPER(TRIM(PUS)));
    END IF;
END P333;
/

-- ------------------------------------------------------------------------------
-- 2. PROCEDIMIENTO: P334
-- Descripción: Recibe el usuario dueño de las tablas y muestra en pantalla los
--              usuarios que recibieron privilegios de tabla y la cantidad.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE P334 (PUS IN VARCHAR2) IS
    CURSOR C1 IS
        SELECT GRANTEE, COUNT(*) CANT_PRIVS
        FROM ALL_TAB_PRIVS
        WHERE GRANTOR = UPPER(TRIM(PUS))
          AND TYPE = 'TABLE'
        GROUP BY GRANTEE
        ORDER BY CANT_PRIVS DESC;
    VCONT NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE(RPAD('USUARIO RECEPTOR', 25) || 'CANTIDAD DE PRIVILEGIOS');
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
    FOR R IN C1 LOOP
        VCONT := VCONT + 1;
        DBMS_OUTPUT.PUT_LINE(RPAD(R.GRANTEE, 25) || R.CANT_PRIVS);
    END LOOP;

    IF VCONT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('El usuario ' || UPPER(TRIM(PUS)) || ' no ha otorgado privilegios de tabla a otros usuarios.');
    END IF;
END P334;
/

-- ------------------------------------------------------------------------------
-- 3. PROCEDIMIENTO: P336
-- Descripción: Muestra el espacio utilizado en KB por cada tabla del usuario actual
--              y el valor % que representa ese espacio sobre el total de tablas.
--              (Utiliza USER_SEGMENTS para ejecutarse sin necesidad de privilegios SYSDBA).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE P336 (PUS IN VARCHAR2) IS
    VUS    VARCHAR2(30) := UPPER(TRIM(PUS));
    VTOTAL NUMBER := 0;
BEGIN
    SELECT NVL(SUM(BYTES), 0) INTO VTOTAL
    FROM USER_SEGMENTS
    WHERE SEGMENT_TYPE = 'TABLE';

    IF VTOTAL = 0 THEN
        DBMS_OUTPUT.PUT_LINE('El usuario ' || VUS || ' no tiene tablas con segmento asignado.');
        RETURN;
    END IF;

    DBMS_OUTPUT.PUT_LINE('ESQUEMA AUDITADO: ' || VUS);
    DBMS_OUTPUT.PUT_LINE(RPAD('TABLA', 24) || LPAD('KB', 8) || LPAD('% DEL USUARIO', 16));
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------');

    FOR R IN (
        SELECT SEGMENT_NAME, BYTES
        FROM USER_SEGMENTS
        WHERE SEGMENT_TYPE = 'TABLE'
        ORDER BY BYTES DESC, SEGMENT_NAME
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(R.SEGMENT_NAME, 24)
            || LPAD(TO_CHAR(ROUND(R.BYTES / 1024)), 8)
            || LPAD(TO_CHAR(ROUND(R.BYTES * 100 / VTOTAL, 2), 'FM990.00') || '%', 16)
        );
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE(RPAD('TOTAL TABLAS', 24) || LPAD(TO_CHAR(ROUND(VTOTAL / 1024)), 8) || LPAD('100.00%', 16));
END P336;
/

-- ==============================================================================
-- PARTE B: PROCEDIMIENTOS OPERACIONALES DEL SISTEMA DE RESIDENCIA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 4. PROCEDIMIENTO: SP_CAMBIAR_ESTADO_HABITACION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_ESTADO_HABITACION (
    p_id_habitacion IN NUMBER,
    p_nuevo_estado  IN VARCHAR2,
    p_codigo        OUT NUMBER,
    p_mensaje       OUT VARCHAR2
) AS
    v_existe NUMBER := 0;
    v_estado_valido VARCHAR2(1);
BEGIN
    v_estado_valido := UPPER(TRIM(p_nuevo_estado));

    IF v_estado_valido NOT IN ('D', 'O', 'M') THEN
        p_codigo := 1;
        p_mensaje := 'Error: El estado proporcionado (' || p_nuevo_estado || ') no es válido. Use D (Disponible), O (Ocupada) o M (Mantenimiento).';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO v_existe FROM HABITACIONES WHERE id_habitacion = p_id_habitacion;
    IF v_existe = 0 THEN
        p_codigo := 1;
        p_mensaje := 'Error: No existe ninguna habitación con el ID ' || p_id_habitacion;
        RETURN;
    END IF;

    UPDATE HABITACIONES 
    SET estado = v_estado_valido 
    WHERE id_habitacion = p_id_habitacion;

    COMMIT;

    p_codigo := 0;
    p_mensaje := 'Éxito: La habitación ID ' || p_id_habitacion || ' fue actualizada al estado ' || v_estado_valido;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_codigo := -1;
        p_mensaje := 'Error inesperado en Oracle: ' || SQLERRM;
END SP_CAMBIAR_ESTADO_HABITACION;
/

-- ------------------------------------------------------------------------------
-- 5. PROCEDIMIENTO: SP_REGISTRAR_PAGO
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_PAGO (
    p_id_contrato      IN NUMBER,
    p_id_usuario       IN NUMBER,
    p_monto            IN NUMBER,
    p_metodo_pago      IN VARCHAR2,
    p_id_pago_generado OUT NUMBER,
    p_codigo           OUT NUMBER,
    p_mensaje          OUT VARCHAR2
) AS
    v_existe_contrato NUMBER := 0;
    v_existe_usuario  NUMBER := 0;
BEGIN
    IF p_monto IS NULL OR p_monto <= 0 THEN
        p_codigo := 1;
        p_id_pago_generado := NULL;
        p_mensaje := 'Error: El monto del pago debe ser mayor a cero.';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO v_existe_contrato FROM CONTRATO WHERE id_contrato = p_id_contrato;
    IF v_existe_contrato = 0 THEN
        p_codigo := 1;
        p_id_pago_generado := NULL;
        p_mensaje := 'Error: El contrato ID ' || p_id_contrato || ' no existe.';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO v_existe_usuario FROM USUARIOS WHERE id_usuario = p_id_usuario;
    IF v_existe_usuario = 0 THEN
        p_codigo := 1;
        p_id_pago_generado := NULL;
        p_mensaje := 'Error: El usuario ID ' || p_id_usuario || ' no existe.';
        RETURN;
    END IF;

    INSERT INTO PAGOS (id_contrato, id_usuario, monto, fecha, metodo_pago, estado)
    VALUES (p_id_contrato, p_id_usuario, p_monto, SYSDATE, p_metodo_pago, '1')
    RETURNING id_pago INTO p_id_pago_generado;

    COMMIT;

    p_codigo := 0;
    p_mensaje := 'Éxito: Pago registrado correctamente con ID ' || p_id_pago_generado;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_codigo := -1;
        p_id_pago_generado := NULL;
        p_mensaje := 'Error inesperado al registrar el pago: ' || SQLERRM;
END SP_REGISTRAR_PAGO;
/
