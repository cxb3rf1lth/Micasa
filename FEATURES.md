# Micasa Features Guide

This document provides a detailed overview of all features in Micasa and how to use them effectively.

## 🛒 Shopping Lists

Manage your shopping needs together with your partner.

### Features
- **Add Items**: Create shopping items with details like quantity, category, priority, and notes
- **Categories**: Organize items into Groceries, Household, Personal, or Other
- **Priority Levels**: Mark items as Low, Medium, or High priority
- **Mark as Purchased**: Check off items when bought
- **Real-time Sync**: Changes appear instantly for your partner
- **Track Who Added/Bought**: See who created each item and who purchased it

### How to Use
1. Navigate to "Shopping" from the sidebar
2. Click "Add Item" button
3. Fill in item details:
   - **Item Name**: e.g., "Milk", "Bread"
   - **Quantity**: e.g., "2 liters", "1 loaf"
   - **Category**: Select appropriate category
   - **Priority**: Choose urgency level
   - **Notes**: Optional additional information
4. Click "Add Item" to save
5. When shopping, click "Mark Purchased" to check off items
6. Delete items by clicking the trash icon

### Tips
- Use the priority system to focus on important items
- Add notes for specific brands or instructions
- Review purchased items before deleting to track spending

---

## 📋 Household Chores

Fairly distribute and track household responsibilities.

### Features
- **Task Assignment**: Assign chores to yourself or your partner
- **Due Dates**: Set deadlines for each chore
- **Frequency Options**: Daily, Weekly, Bi-weekly, Monthly, or One-time tasks
- **Categories**: Cleaning, Cooking, Maintenance, Shopping, Other
- **Time Estimates**: Track how long tasks typically take
- **Completion Tracking**: Mark chores as complete with timestamp
- **Priority Levels**: Organize by urgency

### How to Use
1. Go to "Chores" section
2. Click "Add Chore"
3. Fill in chore details:
   - **Title**: e.g., "Clean kitchen"
   - **Description**: Optional detailed instructions
   - **Assign To**: Choose who should do it
   - **Due Date**: Select deadline
   - **Frequency**: How often it repeats
   - **Category**: Type of chore
   - **Priority**: Urgency level
   - **Estimated Time**: Minutes to complete
4. Click "Add Chore"
5. Mark as complete when done
6. Edit or delete as needed

### Best Practices
- Set realistic due dates
- Use recurring chores for regular tasks
- Balance chore assignments between partners
- Update estimated times to improve planning

---

## 📅 Appointments

Keep track of shared appointments and events.

### Features
- **Shared Calendar**: Both partners see all appointments
- **Event Details**: Title, description, start/end times, location
- **Categories**: Medical, Work, Social, Family, Other
- **Attendee Tracking**: Mark who needs to attend
- **Color Coding**: Custom colors for easy identification
- **Reminders**: Set notification times before events
- **Recurring Events**: Daily, Weekly, Monthly, or Yearly patterns

### How to Use
1. Navigate to "Appointments"
2. View all scheduled appointments
3. Add new appointments with full details
4. Delete past or cancelled appointments

### Organization Tips
- Use categories to filter appointment types
- Add detailed descriptions for important events
- Set reminders for critical appointments
- Mark both partners as attendees when needed

---

## ✅ To-Do Lists

Create and manage multiple to-do lists for different purposes.

### Features
- **Multiple Lists**: Create separate lists for different projects
- **Shared or Personal**: Choose if lists are shared with partner
- **Checklist Items**: Add multiple tasks to each list
- **Check-off Items**: Mark tasks as complete
- **Categories**: Personal, Household, Work, Shopping, Other
- **Priority Levels**: Organize by importance
- **Due Dates**: Optional deadlines for lists
- **Color Coding**: Visual organization

### How to Use
1. Go to "To-Do Lists"
2. Click "New List"
3. Set list details:
   - **Title**: e.g., "Weekend Projects"
   - **Description**: Optional overview
   - **Category**: Type of list
   - **Priority**: Importance level
   - **Shared**: Toggle sharing with partner
4. Click "Create List"
5. Add tasks using "Add Task" button
6. Check off tasks as you complete them
7. Delete completed tasks or entire lists

### Use Cases
- Weekend project lists
- Shopping preparation
- Moving checklists
- Home improvement tasks
- Party planning

---

## 🔔 Reminders

Never forget important tasks or deadlines.

### Features
- **Custom Reminders**: Set reminders for any task
- **Categories**: Shopping, Bills, Maintenance, Personal, Other
- **Due Dates**: When reminder should trigger
- **Priority Levels**: Importance indicators
- **Recurring Reminders**: Daily, Weekly, Monthly, or Yearly
- **Notify Both**: Option to notify both partners
- **Completion Tracking**: Mark reminders as done

### How to Use
1. Navigate to "Reminders"
2. View active reminders
3. Add reminders with:
   - Title and description
   - Category and priority
   - Due date
   - Recurrence pattern (if needed)
   - Whether to notify partner
4. Mark as complete when done
5. Delete outdated reminders

### Common Uses
- Bill payment due dates
- Car maintenance schedules
- Subscription renewals
- Medical appointments
- Important deadlines

---

## 🔄 Real-time Synchronization

All features sync in real-time between partners.

### How It Works
- Changes appear instantly on both devices
- No manual refresh needed
- Works across all features
- Reliable WebSocket connection

### What Gets Synced
- ✅ Shopping list additions/updates/deletions
- ✅ Chore assignments and completions
- ✅ Appointment scheduling
- ✅ To-do list updates
- ✅ Reminder changes

---

## 👥 Partner Linking

Connect your accounts to share household data.

### How to Link
1. Both partners create individual accounts
2. One partner clicks "Link Partner" in the header
3. Enter partner's username
4. Both accounts are now connected

### Benefits
- Shared view of all household data
- See who created/completed tasks
- Better collaboration and communication
- Fair responsibility distribution

### Privacy
- Each partner has their own login
- Both can see and edit shared data
- Personal to-do lists remain private (if not shared)

---

## 🎨 User Interface

Beautiful, intuitive design for pleasant daily use.

### Design Elements
- **Dark Theme**: Easy on the eyes, modern aesthetic
- **Purple Accents**: Deep purple pastels for highlights
- **Smooth Animations**: Polished, professional feel
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy to find what you need

### Accessibility
- Clear visual hierarchy
- High contrast for readability
- Large touch targets for mobile
- Keyboard navigation support

---

## 💡 Tips for Success

### Getting Started
1. Create your accounts and link partners
2. Add a few items to each section
3. Set up recurring chores for regular tasks
4. Schedule upcoming appointments

### Daily Use
- Check shopping list before grocery trips
- Review chores for the day/week
- Mark tasks complete as you go
- Update reminders regularly

### Communication
- Use notes fields to leave messages
- Assign chores fairly
- Review completed tasks together
- Plan appointments collaboratively

### Organization
- Use categories consistently
- Set realistic priorities
- Keep lists current (delete old items)
- Review and clean up weekly

---

## 🔐 Security Features

Your data is protected:
- JWT authentication for secure login
- Bcrypt password hashing
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure WebSocket connections

---

## 🚀 Performance

Optimized for speed:
- Fast page loads
- Instant updates via WebSocket
- Efficient database queries
- Responsive UI interactions
- Minimal server load

---

Enjoy managing your household with Micasa! 🏠
