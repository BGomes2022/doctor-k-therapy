const fs = require('fs/promises');
const path = require('path');
const { decryptMedicalData } = require('./encryption');

const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv');
const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv');

class CSVHelpers {
  // Initialize CSV files with extended structure
  async ensureExtendedCSVStructure() {
    try {
      // Check if booking-tokens.csv needs to be extended
      const tokensContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8');
      const tokensHeader = tokensContent.split('\n')[0];
      
      if (!tokensHeader.includes('sessionsTotal')) {
        console.log('🔄 Extending booking-tokens.csv structure for multi-session tracking...');
        
        // Backup existing file
        await fs.copyFile(BOOKING_TOKENS_FILE, `${BOOKING_TOKENS_FILE}.backup`);
        
        // Create new extended header
        const newHeader = 'bookingToken,userId,medicalFormData,sessionPackage,sessionsTotal,sessionsUsed,patientEmail,patientName,expiresAt,createdAt\n';
        
        // Parse existing data and extend it
        const lines = tokensContent.split('\n');
        const extendedLines = [newHeader];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim()) {
            // Parse existing line: bookingToken,userId,medicalFormData,sessionPackage,createdAt
            const parts = line.split(',');
            if (parts.length >= 5) {
              const sessionPackageStr = parts[3].replace(/"/g, '').replace(/""/g, '"');
              try {
                let sessionPackage;
                try {
                  sessionPackage = JSON.parse(sessionPackageStr);
                } catch (jsonError) {
                  console.warn('Invalid JSON in session package, using default:', sessionPackageStr);
                  sessionPackage = { name: "4 Sessions Package", price: 350 };
                }
                const sessionsTotal = this.getSessionCountFromPackage(sessionPackage);
                const sessionsUsed = 0; // New tokens haven't been used yet
                
                // Use test email for development
                let patientEmail = 'ben.gomes28@gmail.com';
                let patientName = 'Ben Gomes (Test Patient)';
                
                try {
                  // In real implementation, you'd decrypt and parse medical data
                  // For now, we'll use placeholders
                } catch (e) {
                  // Keep defaults
                }
                
                const expiresAt = new Date();
                expiresAt.setMonth(expiresAt.getMonth() + 3);
                
                // Reconstruct line with new fields
                const extendedLine = `${parts[0]},${parts[1]},${parts[2]},${parts[3]},${sessionsTotal},${sessionsUsed},"${patientEmail}","${patientName}",${expiresAt.toISOString()},${parts[4]}\n`;
                extendedLines.push(extendedLine);
              } catch (e) {
                console.error('Error parsing session package:', e);
                // Keep original line as fallback
                extendedLines.push(line + '\n');
              }
            }
          }
        }
        
        // Write extended file
        await fs.writeFile(BOOKING_TOKENS_FILE, extendedLines.join(''));
        console.log('✅ Extended booking-tokens.csv structure successfully');
      }
      
      // Check if bookings.csv needs to be extended
      let bookingsContent;
      try {
        bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, create it with new structure
          const newHeader = 'bookingId,bookingToken,date,time,sessionPackage,createdAt,meetLink,calendarEventId,sessionNumber,status\n';
          await fs.writeFile(BOOKINGS_FILE, newHeader);
          console.log('✅ Created new bookings.csv with extended structure');
          return;
        }
        throw error;
      }
      
      const bookingsHeader = bookingsContent.split('\n')[0];
      
      if (!bookingsHeader.includes('meetLink')) {
        console.log('🔄 Extending bookings.csv structure...');
        
        // Backup existing file
        await fs.copyFile(BOOKINGS_FILE, `${BOOKINGS_FILE}.backup`);
        
        // Create new extended header
        const newHeader = 'bookingId,bookingToken,date,time,sessionPackage,createdAt,meetLink,calendarEventId,sessionNumber,status\n';
        
        // Parse existing data and extend it
        const lines = bookingsContent.split('\n');
        const extendedLines = [newHeader];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim()) {
            // Add default values for new fields
            const extendedLine = line.replace('\n', '') + ',,1,upcoming\n';
            extendedLines.push(extendedLine);
          }
        }
        
        // Write extended file
        await fs.writeFile(BOOKINGS_FILE, extendedLines.join(''));
        console.log('✅ Extended bookings.csv structure successfully');
      }
      
    } catch (error) {
      console.error('❌ Error extending CSV structure:', error);
    }
  }

  // Get session count from package
  getSessionCountFromPackage(sessionPackage) {
    if (!sessionPackage || !sessionPackage.name) return 1;
    
    const packageName = sessionPackage.name.toLowerCase();
    
    if (packageName.includes('4 sessions') || packageName.includes('four sessions')) {
      return 4;
    } else if (packageName.includes('6 sessions') || packageName.includes('six sessions')) {
      return 6;
    } else if (packageName.includes('consultation')) {
      return 1;
    } else if (packageName.includes('single') || packageName.includes('1 session')) {
      return 1;
    } else if (packageName.includes('couple')) {
      return 1;
    }
    
    return 1; // Default fallback
  }

  // Get remaining sessions for a booking token
  async getRemainingSessionsFromToken(bookingToken) {
    try {
      const fileContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8');
      const lines = fileContent.split('\n');
      
      for (const line of lines.slice(1)) {
        if (line.trim() && line.startsWith(bookingToken)) {
          const parts = line.split(',');
          if (parts.length >= 10) {
            // Extended format: bookingToken,userId,medicalFormData,sessionPackage,sessionsTotal,sessionsUsed,patientEmail,patientName,expiresAt,createdAt
            const sessionsTotal = parseInt(parts[4]) || 1;
            const sessionsUsed = parseInt(parts[5]) || 0;
            const patientEmail = parts[6] ? parts[6].replace(/"/g, '') : null;
            const patientName = parts[7] ? parts[7].replace(/"/g, '') : null;
            const expiresAt = parts[8];
            
            return {
              sessionsTotal,
              sessionsUsed,
              sessionsRemaining: sessionsTotal - sessionsUsed,
              patientEmail,
              patientName,
              expiresAt: new Date(expiresAt),
              isExpired: new Date(expiresAt) < new Date(),
              isValid: sessionsUsed < sessionsTotal && new Date(expiresAt) >= new Date()
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting remaining sessions:', error);
      return null;
    }
  }

  // Update session usage when a booking is made
  async updateSessionUsage(bookingToken) {
    try {
      const fileContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8');
      const lines = fileContent.split('\n');
      const updatedLines = [];
      let updated = false;
      
      for (const line of lines) {
        if (line.trim() && line.startsWith(bookingToken) && !updated) {
          const parts = line.split(',');
          if (parts.length >= 10) {
            // Increment sessionsUsed
            const sessionsUsed = parseInt(parts[5]) || 0;
            parts[5] = (sessionsUsed + 1).toString();
            
            updatedLines.push(parts.join(','));
            updated = true;
          } else {
            updatedLines.push(line);
          }
        } else {
          updatedLines.push(line);
        }
      }
      
      if (updated) {
        await fs.writeFile(BOOKING_TOKENS_FILE, updatedLines.join('\n'));
        console.log(`✅ Updated session usage for token: ${bookingToken}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating session usage:', error);
      return false;
    }
  }

  // Get all bookings for a token (session history)
  async getBookingHistoryForToken(bookingToken) {
    try {
      const fileContent = await fs.readFile(BOOKINGS_FILE, 'utf-8');
      const lines = fileContent.split('\n').slice(1); // Skip header
      const bookings = [];
      
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(',');
          if (parts.length >= 6 && parts[1] === bookingToken) {
            // Parse booking: bookingId,bookingToken,date,time,sessionPackage,createdAt,meetLink,calendarEventId,sessionNumber,status
            bookings.push({
              bookingId: parts[0],
              date: parts[2],
              time: parts[3],
              sessionPackage: parts[4] ? JSON.parse(parts[4].replace(/"/g, '').replace(/""/g, '"')) : null,
              createdAt: parts[5],
              meetLink: parts[6] || null,
              calendarEventId: parts[7] || null,
              sessionNumber: parseInt(parts[8]) || bookings.length + 1,
              status: parts[9] || 'upcoming'
            });
          }
        }
      }
      
      // Sort by date
      bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return bookings;
    } catch (error) {
      console.error('Error getting booking history:', error);
      return [];
    }
  }

  // Create extended booking entry
  async createExtendedBooking(bookingData) {
    try {
      const { bookingId, bookingToken, date, time, sessionPackage, meetLink, calendarEventId } = bookingData;
      
      // Get current session number
      const existingBookings = await this.getBookingHistoryForToken(bookingToken);
      const sessionNumber = existingBookings.length + 1;
      
      // Determine status
      const bookingDate = new Date(date);
      const now = new Date();
      const status = bookingDate > now ? 'upcoming' : bookingDate.toDateString() === now.toDateString() ? 'today' : 'past';
      
      // Create extended booking line
      const bookingLine = `${bookingId},${bookingToken},${date},${time},"${JSON.stringify(sessionPackage).replace(/"/g, '""')}",${new Date().toISOString()},${meetLink || ''},${calendarEventId || ''},${sessionNumber},${status}\n`;
      
      await fs.appendFile(BOOKINGS_FILE, bookingLine);
      
      // Update session usage
      await this.updateSessionUsage(bookingToken);
      
      console.log(`✅ Created extended booking: ${bookingId} (Session ${sessionNumber})`);
      return true;
    } catch (error) {
      console.error('Error creating extended booking:', error);
      return false;
    }
  }

  // Validate if booking token can make new booking
  async canMakeNewBooking(bookingToken) {
    const sessionInfo = await this.getRemainingSessionsFromToken(bookingToken);
    
    if (!sessionInfo) {
      return { canBook: false, reason: 'Invalid booking token' };
    }
    
    if (sessionInfo.isExpired) {
      return { canBook: false, reason: 'Booking token has expired' };
    }
    
    if (sessionInfo.sessionsRemaining <= 0) {
      return { canBook: false, reason: 'All sessions have been used' };
    }
    
    return { 
      canBook: true, 
      sessionsRemaining: sessionInfo.sessionsRemaining,
      patientEmail: sessionInfo.patientEmail,
      patientName: sessionInfo.patientName
    };
  }
}

module.exports = new CSVHelpers();