import { NextResponse } from 'next/server'
import { deleteAllTestData as deleteCSVData } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST() {
  try {
    console.log('🧹 Starting test data cleanup...')
    
    // Delete calendar events
    const calendarResult = await googleWorkspaceService.deleteAllTestData()
    
    // Delete CSV files
    const csvResult = await deleteCSVData()
    
    const totalDeleted = (calendarResult.deleted || 0) + (csvResult.deleted || 0)
    const totalFiles = (calendarResult.total || 0) + (csvResult.deleted || 0)
    
    if (calendarResult.success && csvResult.success) {
      return NextResponse.json({
        success: true,
        message: `Cleanup complete: ${totalDeleted} items deleted (${calendarResult.deleted || 0} calendar events, ${csvResult.deleted || 0} CSV files)`,
        deleted: totalDeleted,
        total: totalFiles
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Calendar cleanup: ${calendarResult.error || 'OK'}, CSV cleanup: ${csvResult.error || 'OK'}`
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Cleanup API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup test data',
      details: error.message
    }, { status: 500 })
  }
}