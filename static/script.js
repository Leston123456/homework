// Student Management System - Frontend JavaScript
// ISYS3001 Configuration Management Project

class StudentManager {
    constructor() {
        this.students = [];
        this.currentFilter = 'all';
        this.editingStudentId = null;
        this.apiBaseUrl = '/api';
        
        this.initializeEventListeners();
        this.loadStudents();
        this.loadMajors();
        this.updateStatistics();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addStudentBtn = document.getElementById('addStudentBtn');
        const searchInput = document.getElementById('searchInput');
        const majorFilter = document.getElementById('majorFilter');
        const yearFilter = document.getElementById('yearFilter');
        const filterButtons = document.querySelectorAll('.filter-btn');

        addStudentBtn.addEventListener('click', () => this.addStudent());
        
        // Enter key support for input fields
        ['studentName', 'studentEmail', 'studentMajor'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                    this.addStudent();
            }
            });
        });

        searchInput.addEventListener('input', () => this.filterStudents());
        majorFilter.addEventListener('change', () => this.filterStudents());
        yearFilter.addEventListener('change', () => this.filterStudents());

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // API Methods
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    async loadStudents() {
        try {
            const result = await this.makeRequest(`${this.apiBaseUrl}/students`);
            this.students = result.data || [];
            this.renderStudents();
            this.updateStatistics();
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    }

    async loadMajors() {
        try {
            const result = await this.makeRequest(`${this.apiBaseUrl}/majors`);
            const majors = result.data || [];
            
            const majorFilter = document.getElementById('majorFilter');
            majorFilter.innerHTML = '<option value="">All Majors</option>';
            
            majors.forEach(major => {
                const option = document.createElement('option');
                option.value = major;
                option.textContent = major;
                majorFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load majors:', error);
        }
    }

    async addStudent() {
        const nameInput = document.getElementById('studentName');
        const emailInput = document.getElementById('studentEmail');
        const majorInput = document.getElementById('studentMajor');
        const yearSelect = document.getElementById('studentYear');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const major = majorInput.value.trim();
        const year = parseInt(yearSelect.value);

        if (!name || !email || !major) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        try {
            const result = await this.makeRequest(`${this.apiBaseUrl}/students`, {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    email: email,
                    major: major,
                    year: year
                })
            });

            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            majorInput.value = '';
            yearSelect.value = '1';

            this.showNotification('Student added successfully!', 'success');
            this.loadStudents();
            this.loadMajors();

        } catch (error) {
            console.error('Failed to add student:', error);
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            await this.makeRequest(`${this.apiBaseUrl}/students/${studentId}`, {
                method: 'DELETE'
            });

            this.showNotification('Student deleted successfully', 'success');
            this.loadStudents();
            this.loadMajors();
            this.updateStatistics();

        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    }

    // Edit student functions
    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        this.editingStudentId = studentId;

        // Populate edit form
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editMajor').value = student.major;
        document.getElementById('editYear').value = student.year;
        document.getElementById('editGPA').value = student.gpa || '';
        document.getElementById('editStatus').value = student.status;

        // Show modal
        document.getElementById('editModal').style.display = 'flex';
    }

    async saveStudent() {
        if (!this.editingStudentId) return;

        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const major = document.getElementById('editMajor').value.trim();
        const year = parseInt(document.getElementById('editYear').value);
        const gpa = parseFloat(document.getElementById('editGPA').value) || 0;
        const status = document.getElementById('editStatus').value;

        if (!name || !email || !major) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        try {
            await this.makeRequest(`${this.apiBaseUrl}/students/${this.editingStudentId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: name,
                    email: email,
                    major: major,
                    year: year,
                    gpa: gpa,
                    status: status
                })
            });

            this.closeEditModal();
            this.showNotification('Student updated successfully!', 'success');
            this.loadStudents();
            this.loadMajors();

        } catch (error) {
            console.error('Failed to update student:', error);
        }
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingStudentId = null;
    }

    // Filter and search functions
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.filterStudents();
    }

    filterStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const majorFilter = document.getElementById('majorFilter').value;
        const yearFilter = document.getElementById('yearFilter').value;

        let filteredStudents = this.students;

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => 
                student.status === this.currentFilter
            );
        }

        // Apply search filter
        if (searchTerm) {
            filteredStudents = filteredStudents.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.major.toLowerCase().includes(searchTerm)
            );
        }

        // Apply major filter
        if (majorFilter) {
            filteredStudents = filteredStudents.filter(student =>
                student.major === majorFilter
            );
        }

        // Apply year filter
        if (yearFilter) {
            filteredStudents = filteredStudents.filter(student =>
                student.year === parseInt(yearFilter)
            );
        }

        this.renderFilteredStudents(filteredStudents);
        this.updateStudentCount(filteredStudents.length);
    }

    renderStudents() {
        this.filterStudents(); // This will render the filtered students
    }

    renderFilteredStudents(students) {
        const studentList = document.getElementById('studentList');
        const emptyState = document.getElementById('emptyState');

        if (students.length === 0) {
            studentList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Sort students by name
        const sortedStudents = students.sort((a, b) => a.name.localeCompare(b.name));

        studentList.innerHTML = sortedStudents.map(student => this.createStudentHTML(student)).join('');
    }

    createStudentHTML(student) {
        const statusClass = `status-${student.status}`;
        const yearText = `Year ${student.year}`;
        const gpaText = student.gpa > 0 ? student.gpa.toFixed(1) : 'N/A';
        
        const enrollmentDate = new Date(student.enrollment_date).toLocaleDateString();
        
        return `
            <div class="student-item ${statusClass}">
                <div class="student-info">
                    <div class="student-header">
                        <h3 class="student-name">${this.escapeHtml(student.name)}</h3>
                        <span class="student-status ${statusClass}">${student.status}</span>
                    </div>
                    <div class="student-details">
                        <p><i class="fas fa-envelope"></i> ${this.escapeHtml(student.email)}</p>
                        <p><i class="fas fa-graduation-cap"></i> ${this.escapeHtml(student.major)}</p>
                        <p><i class="fas fa-calendar"></i> ${yearText} | GPA: ${gpaText}</p>
                        <p><i class="fas fa-clock"></i> Enrolled: ${enrollmentDate}</p>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="btn btn-small btn-secondary" onclick="studentManager.editStudent('${student.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="studentManager.deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    async updateStatistics() {
        try {
            const result = await this.makeRequest(`${this.apiBaseUrl}/statistics`);
            const stats = result.data;

            document.getElementById('totalStudents').textContent = stats.total_students;
            document.getElementById('activeStudents').textContent = stats.active_students;
            document.getElementById('averageGPA').textContent = stats.average_gpa.toFixed(1);
            
            // Count unique majors
            const uniqueMajors = new Set(this.students.map(s => s.major)).size;
            document.getElementById('totalMajors').textContent = uniqueMajors;

        } catch (error) {
            console.error('Failed to update statistics:', error);
        }
    }

    updateStudentCount(count) {
        const studentCountElement = document.getElementById('studentCount');
        
        switch (this.currentFilter) {
            case 'active':
                studentCountElement.textContent = `Active: ${count} students`;
                break;
            case 'inactive':
                studentCountElement.textContent = `Inactive: ${count} students`;
                break;
            default:
                studentCountElement.textContent = `Total: ${count} students`;
        }
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Show animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto hide
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check',
            error: 'exclamation-triangle',
            info: 'info',
            warning: 'exclamation'
        };
        return icons[type] || 'info';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        return colors[type] || '#17a2b8';
    }
}

// Global variables and functions
let studentManager;

// Global functions for modal
function closeEditModal() {
    studentManager.closeEditModal();
}

function saveStudent() {
    studentManager.saveStudent();
}

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', function() {
    studentManager = new StudentManager();
    
    console.log('Student Management System initialized');
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
            });
        });
