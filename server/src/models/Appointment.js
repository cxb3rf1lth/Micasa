const { getDB } = require('../config/database');

class Appointment {
  static create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO appointments (
        householdId, title, description, startTime, endTime, location,
        category, reminderEnabled, reminderMinutesBefore, isRecurring,
        recurrencePattern, createdBy, color, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.title,
      data.description || '',
      new Date(data.startTime).getTime(),
      new Date(data.endTime).getTime(),
      data.location || '',
      data.category || 'other',
      data.reminder?.enabled !== false ? 1 : 0,
      data.reminder?.minutesBefore || 30,
      data.isRecurring ? 1 : 0,
      data.recurrencePattern || null,
      data.createdBy,
      data.color || '#9D8DF1',
      now,
      now
    );
    
    const appointmentId = result.lastInsertRowid;
    
    // Add attendees
    if (data.attendees && data.attendees.length > 0) {
      const insertAttendee = db.prepare('INSERT INTO appointment_attendees (appointmentId, userId) VALUES (?, ?)');
      data.attendees.forEach(userId => {
        insertAttendee.run(appointmentId, userId);
      });
    }
    
    return this.findById(appointmentId);
  }

  static findById(id) {
    const db = getDB();
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    
    if (!appointment) return null;
    
    // Get attendees
    const attendees = db.prepare('SELECT userId FROM appointment_attendees WHERE appointmentId = ?').all(id);
    
    return this._formatAppointment(appointment, attendees.map(a => a.userId));
  }

  static find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    
    if (query.householdId) {
      sql += ' AND householdId = ?';
      params.push(query.householdId);
    }
    
    sql += ' ORDER BY startTime ASC';
    
    const appointments = db.prepare(sql).all(...params);
    
    return appointments.map(appointment => {
      const attendees = db.prepare('SELECT userId FROM appointment_attendees WHERE appointmentId = ?').all(appointment.id);
      return this._formatAppointment(appointment, attendees.map(a => a.userId));
    });
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id' && key !== 'attendees' && key !== 'reminder') {
        if (key === 'isRecurring') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'startTime' || key === 'endTime') {
          fields.push(`${key} = ?`);
          values.push(new Date(updates[key]).getTime());
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (updates.reminder) {
      if (updates.reminder.enabled !== undefined) {
        fields.push('reminderEnabled = ?');
        values.push(updates.reminder.enabled ? 1 : 0);
      }
      if (updates.reminder.minutesBefore !== undefined) {
        fields.push('reminderMinutesBefore = ?');
        values.push(updates.reminder.minutesBefore);
      }
    }
    
    fields.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    // Update attendees if provided
    if (updates.attendees) {
      db.prepare('DELETE FROM appointment_attendees WHERE appointmentId = ?').run(id);
      const insertAttendee = db.prepare('INSERT INTO appointment_attendees (appointmentId, userId) VALUES (?, ?)');
      updates.attendees.forEach(userId => {
        insertAttendee.run(id, userId);
      });
    }
    
    return this.findById(id);
  }

  static findByIdAndDelete(id) {
    const db = getDB();
    const appointment = this.findById(id);
    db.prepare('DELETE FROM appointment_attendees WHERE appointmentId = ?').run(id);
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    return appointment;
  }

  static _formatAppointment(appointment, attendees = []) {
    if (!appointment) return null;
    
    return {
      _id: appointment.id,
      id: appointment.id,
      householdId: appointment.householdId,
      title: appointment.title,
      description: appointment.description,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
      location: appointment.location,
      attendees: attendees,
      category: appointment.category,
      reminder: {
        enabled: appointment.reminderEnabled === 1,
        minutesBefore: appointment.reminderMinutesBefore
      },
      isRecurring: appointment.isRecurring === 1,
      recurrencePattern: appointment.recurrencePattern,
      createdBy: appointment.createdBy,
      color: appointment.color,
      createdAt: new Date(appointment.createdAt),
      updatedAt: new Date(appointment.updatedAt)
    };
  }
}

module.exports = Appointment;
