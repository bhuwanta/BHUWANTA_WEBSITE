'use server'

import { createServiceClient } from '@/lib/supabase/server'

// Fetch all documents
export async function getDocumentsAction() {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_project_documents')
      .select(`
        *,
        s_projects ( id, name )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return { success: false, data: [] }
  }
}

// Upload document (handles FormData)
export async function uploadDocumentAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const docType = formData.get('documentType') as string
    
    if (!file || !projectId || !docType) {
      return { success: false, error: 'Missing required fields' }
    }

    const supabaseAdmin = createServiceClient()
    
    // Determine bucket based on type
    let bucketName = ''
    if (docType === 'brochure') bucketName = 's_brouchers'
    else if (docType === 'layout') bucketName = 's_layouts'
    else if (docType === 'linkdocument') bucketName = 's_linkdocuments'
    else return { success: false, error: 'Invalid document type' }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}-${Date.now()}.${fileExt}`
    
    // Convert File to ArrayBuffer for uploading in Node.js environment
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError)
      return { success: false, error: 'Failed to upload file to storage. Did you create the bucket?' }
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const fileUrl = publicUrlData.publicUrl

    // Insert into s_project_documents
    const { data, error } = await supabaseAdmin
      .from('s_project_documents')
      .insert({
        project_id: projectId,
        document_type: docType,
        file_url: fileUrl,
        file_name: file.name
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data, message: 'Document uploaded successfully.' }
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return { success: false, error: error.message || 'Failed to upload document.' }
  }
}

export async function deleteDocumentAction(id: string, fileUrl: string, docType: string) {
  try {
    const supabaseAdmin = createServiceClient()
    
    // Determine bucket based on type
    let bucketName = ''
    if (docType === 'brochure') bucketName = 's_brouchers'
    else if (docType === 'layout') bucketName = 's_layouts'
    else if (docType === 'linkdocument') bucketName = 's_linkdocuments'
    
    // Try to delete from storage if we have the bucket name
    if (bucketName) {
      // Extract filename from URL (everything after the last slash)
      const fileName = fileUrl.split('/').pop()
      if (fileName) {
        await supabaseAdmin.storage.from(bucketName).remove([fileName])
      }
    }

    // Delete DB record
    const { error } = await supabaseAdmin
      .from('s_project_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    return { success: true, message: 'Document deleted successfully.' }
  } catch (error: any) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'Failed to delete document.' }
  }
}
