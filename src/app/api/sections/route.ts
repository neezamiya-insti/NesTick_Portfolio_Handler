// app/api/sections/route.ts (COMPLETELY FIXED - v2)

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

/* eslint-disable */

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// CORS Response Helper
function jsonResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Handle OPTIONS (CORS Preflight)
export function OPTIONS() {
  return jsonResponse({ message: "CORS preflight OK" }, 200);
}

export async function POST(request: NextRequest) {
  try {
    const { template_id, section_name, content, college_id } = await request.json();

    console.log('📝 [API] POST /api/sections - Request:', {
      template_id,
      section_name,
      college_id,
      content: !!content
    });

    if (!template_id || !section_name || !content) {
      console.log('❌ [API] Missing required fields');
      return jsonResponse({ error: "Missing required fields: template_id, section_name, content" }, 400);
    }

    if (!college_id) {
      console.log('❌ [API] Missing college_id');
      return jsonResponse({ error: "college_id is required" }, 400);
    }

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.execute<RowDataPacket[]>(
        `SELECT id, content, section_name, college_id 
         FROM college_template_sections 
         WHERE template_id = ? 
           AND LOWER(section_name) = LOWER(?)
           AND college_id = ?`,
        [template_id, section_name, college_id]
      );

      console.log(`[API] Existing sections found: ${existing.length}`);
      console.log(`[API] Search params: template_id=${template_id}, section_name=${section_name}, college_id=${college_id}`);

      if (existing.length > 0) {
        const sectionId = existing[0].id;
        const existingSectionName = existing[0].section_name;
        const existingCollegeId = existing[0].college_id;

        await connection.execute(
          `UPDATE college_template_sections 
           SET content = ?, updated_at = NOW() 
           WHERE id = ?`,
          [JSON.stringify(content), sectionId]
        );

        if (content.name) {
          await connection.execute(
            `UPDATE colleges 
             SET name = ?, updated_at = NOW() 
             WHERE id = ?`,
            [content.name, college_id]
          );
          console.log(`✅ [API] College name updated to: ${content.name}`);
        }

        console.log(`✅ [API] Section updated - ID: ${sectionId}, College: ${existingCollegeId}, Template: ${template_id}, Section: ${section_name}`);

        return jsonResponse({
          success: true,
          message: "Section content updated successfully",
          id: sectionId,
          action: "updated",
          template_id,
          section_name: existingSectionName,
          college_id: existingCollegeId,
          college_name_updated: true
        });
      } else {
        console.log(`🆕 [API] Section not found, creating new section for college ${college_id}`);

        const [result] = await connection.execute(
          `INSERT INTO college_template_sections 
           (college_id, template_id, section_name, content, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [college_id, template_id, section_name, JSON.stringify(content), 1]
        );

        const insertId = (result as any).insertId;

        if (content.name) {
          await connection.execute(
            `UPDATE colleges 
             SET name = ?, updated_at = NOW() 
             WHERE id = ?`,
            [content.name, college_id]
          );
          console.log(`✅ [API] College name set to: ${content.name} for new college`);
        }

        console.log(`✅ [API] Section created - ID: ${insertId}, College: ${college_id}, Template: ${template_id}, Section: ${section_name}`);

        return jsonResponse({
          success: true,
          message: "Section created successfully",
          id: insertId,
          action: "created",
          template_id,
          section_name,
          college_id,
          college_name_updated: true
        }, 201);
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ [API] DB error in POST:', error);
    return jsonResponse({
      success: false,
      error: "Failed to save section",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const template_id = searchParams.get("template_id");
    const section_name = searchParams.get("section_name");
    const college_id = searchParams.get("college_id");

    console.log('📥 [API] GET /api/sections - Query Params:', { template_id, section_name, college_id });

    const connection = await pool.getConnection();

    try {
      // ✅✅✅ FIX: Two-step query to avoid sorting large `content` column
      //
      // STEP 1: Fetch ONLY ids (tiny data — fits in sort buffer easily)
      // STEP 2: Fetch full rows for those ids (content included, but no sort needed)
      //
      // This prevents MySQL from loading 2-5MB base64 content into the sort
      // buffer, which was causing the ER_OUT_OF_SORTMEMORY (errno 1038) error.

      // ---------- STEP 1: Fetch only IDs ----------
      let idQuery = `
        SELECT cts.id
        FROM college_template_sections cts
        WHERE 1=1
      `;
      const idParams: any[] = [];

      if (template_id) {
        idQuery += " AND cts.template_id = ?";
        idParams.push(parseInt(template_id));
        console.log(`🔍 [API] Filtering by template_id: ${template_id}`);
      }

      if (section_name) {
        idQuery += " AND LOWER(cts.section_name) = LOWER(?)";
        idParams.push(section_name);
        console.log(`🔍 [API] Filtering by section_name (case-insensitive): ${section_name}`);
      }

      if (college_id) {
        idQuery += " AND cts.college_id = ?";
        idParams.push(parseInt(college_id));
        console.log(`🔍 [API] Filtering by college_id: ${college_id}`);
      }

      idQuery += " ORDER BY cts.created_at DESC";

      console.log(`📊 [API] Step 1: Fetching IDs only (no content sort)`);
      console.log(`📊 [API] ID query params:`, idParams);

      const [idRows] = await connection.execute<RowDataPacket[]>(idQuery, idParams);

      console.log(`✅ [API] Step 1 done — found ${idRows.length} matching section(s)`);

      // If no IDs, return early
      if (idRows.length === 0) {
        console.log(`⚠️ [API] No sections found for criteria: template_id=${template_id}, section_name=${section_name}, college_id=${college_id}`);
        return jsonResponse({ sections: [], success: true });
      }

      // ---------- STEP 2: Fetch full rows by IDs ----------
      const ids = idRows.map((r) => r.id);
      const placeholders = ids.map(() => '?').join(',');

      const fullQuery = `
        SELECT 
          cts.id,
          cts.college_id,
          cts.template_id,
          cts.section_name,
          cts.content,
          cts.is_active,
          cts.created_at,
          cts.updated_at,
          t.name as template_name
        FROM college_template_sections cts
        LEFT JOIN templates t ON cts.template_id = t.id
        WHERE cts.id IN (${placeholders})
        ORDER BY cts.created_at DESC
      `;

      console.log(`📊 [API] Step 2: Fetching full rows for ${ids.length} ID(s)`);
      console.log(`📊 [API] IDs:`, ids);

      const [rows] = await connection.execute<RowDataPacket[]>(fullQuery, ids);

      console.log(`✅ [API] Step 2 done — fetched ${rows.length} full row(s)`);

      const sections = rows.map((row) => {
        let parsedContent = row.content;
        if (typeof row.content === "string") {
          try {
            parsedContent = JSON.parse(row.content);
          } catch (e) {
            console.warn(`⚠️ [API] Failed to parse content for section ${row.id}:`, e);
            parsedContent = row.content;
          }
        }

        const contentSize =
          typeof row.content === 'string'
            ? row.content.length
            : JSON.stringify(row.content).length;

        console.log(`📄 [API] Section ${row.id}: ${row.section_name} - College: ${row.college_id} - Active: ${row.is_active} - Content size: ${contentSize} bytes`);

        return {
          id: row.id,
          college_id: row.college_id,
          template_id: row.template_id,
          section_name: row.section_name,
          content: parsedContent,
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at,
          template_name: row.template_name
        };
      });

      return jsonResponse({ sections, success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ [API] DB error in GET:', error);
    return jsonResponse({
      success: false,
      error: "Failed to fetch sections",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}