/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/form/route.ts
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }
};

export async function GET(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'fields';
    const collegeId = searchParams.get('collegeId');
    const templateIdParam = searchParams.get('templateId');

    console.log('📥 [API /form] GET request:', {
      type,
      collegeId,
      templateIdParam,
      fullUrl: request.url,
    });

    if (!collegeId) {
      console.log('❌ [API /form] College ID missing');
      return NextResponse.json({ success: false, message: 'College ID required' }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    // ✅ Agar templateId nahi aayi, to college se uthao
    let templateId = templateIdParam;
    if (!templateId) {
      console.log('⚠️ [API /form] templateId missing — fetching from colleges table');
      const [collegeRows] = await connection.execute<any[]>(
        `SELECT template_id FROM colleges WHERE id = ?`,
        [collegeId]
      );
      if (collegeRows.length > 0 && collegeRows[0].template_id) {
        templateId = String(collegeRows[0].template_id);
        console.log(`✅ [API /form] Auto-detected template_id: ${templateId}`);
      } else {
        templateId = '29';
        console.log(`⚠️ [API /form] College not found, using default: ${templateId}`);
      }
    }

    console.log('🔍 [API /form] Final query params:', { collegeId, templateId, type });

    if (type === 'applications') {
      const [applications] = await connection.execute<any[]>(
        `SELECT * FROM applications WHERE college_id = ? ORDER BY applied_at DESC`,
        [collegeId]
      );
      console.log(`✅ [API /form] Found ${applications.length} applications`);
      return NextResponse.json({ success: true, data: applications });
    }

    // ===== FIELDS =====
    const [fields] = await connection.execute<any[]>(
      `SELECT * FROM form_fields WHERE college_id = ? AND template_id = ? ORDER BY sort_order ASC`,
      [collegeId, templateId]
    );

    console.log(`✅ [API /form] Found ${fields.length} fields for college=${collegeId}, template=${templateId}`);
    if (fields.length > 0) {
      console.log('📋 [API /form] First field sample:', {
        id: fields[0].id,
        field_key: fields[0].field_key,
        field_label: fields[0].field_label,
        section: fields[0].section,
      });
    }

    return NextResponse.json({ success: true, data: fields });

  } catch (error: any) {
    console.error('❌ [API /form] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { action, collegeId, templateId } = body;

    console.log('📥 [API /form] POST request:', {
      action,
      collegeId,
      templateId,
    });

    if (!collegeId) {
      console.log('❌ [API /form] College ID missing');
      return NextResponse.json({ success: false, message: 'College ID required' }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    // ✅ Agar templateId missing, to college se uthao
    let tid = templateId;
    if (!tid) {
      const [collegeRows] = await connection.execute<any[]>(
        `SELECT template_id FROM colleges WHERE id = ?`,
        [collegeId]
      );
      if (collegeRows.length > 0 && collegeRows[0].template_id) {
        tid = collegeRows[0].template_id;
        console.log(`✅ [API /form] Auto-detected template_id: ${tid}`);
      } else {
        tid = 29;
      }
    }

    // ===== ADD FIELD =====
    if (action === 'add_field') {
      const { fieldKey, fieldLabel, fieldType, fieldPlaceholder, fieldOptions, isRequired, isActive, sortOrder, section } = body;

      if (!fieldKey || !fieldLabel || !fieldType) {
        return NextResponse.json({ success: false, message: 'Key, Label and Type required' }, { status: 400 });
      }

      await connection.execute(
        `INSERT INTO form_fields 
         (college_id, template_id, field_key, field_label, field_type, field_placeholder, field_options, is_required, is_active, sort_order, section)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [collegeId, tid, fieldKey.toLowerCase().replace(/\s+/g, '_'), fieldLabel, fieldType, fieldPlaceholder || '', JSON.stringify(fieldOptions || []), isRequired ? 1 : 0, isActive !== false ? 1 : 0, sortOrder || 0, section || 'personal_info']
      );

      console.log('✅ [API /form] Field added');
      return NextResponse.json({ success: true, message: 'Field added successfully' });
    }

    // ===== UPDATE FIELD =====
    if (action === 'update_field') {
      const { fieldId, fieldLabel, fieldPlaceholder, fieldOptions, isRequired, isActive, sortOrder } = body;

      if (!fieldId) {
        return NextResponse.json({ success: false, message: 'Field ID required' }, { status: 400 });
      }

      await connection.execute(
        `UPDATE form_fields SET 
          field_label = ?, field_placeholder = ?, field_options = ?, 
          is_required = ?, is_active = ?, sort_order = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND college_id = ?`,
        [fieldLabel, fieldPlaceholder || '', JSON.stringify(fieldOptions || []), isRequired ? 1 : 0, isActive ? 1 : 0, sortOrder || 0, fieldId, collegeId]
      );

      console.log('✅ [API /form] Field updated');
      return NextResponse.json({ success: true, message: 'Field updated successfully' });
    }

    // ===== TOGGLE FIELD =====
    if (action === 'toggle_field') {
      const { fieldId, isActive } = body;

      if (!fieldId) {
        return NextResponse.json({ success: false, message: 'Field ID required' }, { status: 400 });
      }

      await connection.execute(
        `UPDATE form_fields SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND college_id = ?`,
        [isActive ? 1 : 0, fieldId, collegeId]
      );

      console.log(`✅ [API /form] Field ${isActive ? 'activated' : 'deactivated'}`);
      return NextResponse.json({ success: true, message: `Field ${isActive ? 'activated' : 'deactivated'}` });
    }

    // ===== DELETE FIELD =====
    if (action === 'delete_field') {
      const { fieldId } = body;

      if (!fieldId) {
        return NextResponse.json({ success: false, message: 'Field ID required' }, { status: 400 });
      }

      await connection.execute(
        `DELETE FROM form_fields WHERE id = ? AND college_id = ?`,
        [fieldId, collegeId]
      );

      console.log('✅ [API /form] Field deleted');
      return NextResponse.json({ success: true, message: 'Field deleted successfully' });
    }

    // ===== SUBMIT APPLICATION =====
    if (action === 'submit_application') {
      const { formData, studentName, studentEmail, studentPhone } = body;

      if (!formData || !studentName || !studentEmail) {
        return NextResponse.json({ success: false, message: 'Name, Email and Form data required' }, { status: 400 });
      }

      const appId = `APP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      await connection.execute(
        `INSERT INTO applications (college_id, template_id, application_id, student_name, student_email, student_phone, form_data, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [collegeId, tid, appId, studentName, studentEmail, studentPhone || '', JSON.stringify(formData)]
      );

      console.log('✅ [API /form] Application submitted:', appId);
      return NextResponse.json({ success: true, message: 'Application submitted successfully', applicationId: appId });
    }

    // ===== UPDATE APPLICATION STATUS =====
    if (action === 'update_application_status') {
      const { applicationId, status } = body;

      if (!applicationId || !status) {
        return NextResponse.json({ success: false, message: 'Application ID and status required' }, { status: 400 });
      }

      const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'fee_pending'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
      }

      await connection.execute(
        `UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ? AND college_id = ?`,
        [status, applicationId, collegeId]
      );

      console.log('✅ [API /form] Application status updated:', { applicationId, status });
      return NextResponse.json({ success: true, message: 'Application status updated' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ [API /form] POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}