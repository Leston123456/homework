#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Student Information Management System - Flask Backend API
ISYS3001 Configuration Management Project
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configuration
app.config['SECRET_KEY'] = 'student-system-secret-key-2024'
app.config['JSON_AS_ASCII'] = False

# Data storage file
DATA_FILE = 'students_data.json'

class StudentManager:
    """Student Manager Class"""
    
    def __init__(self):
        self.data_file = DATA_FILE
        self.load_data()
    
    def load_data(self):
        """Load student data from file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.students = json.load(f)
            else:
                self.students = []
                self.save_data()
        except Exception as e:
            print(f"Error loading data: {e}")
            self.students = []
    
    def save_data(self):
        """Save student data to file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.students, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def get_all_students(self):
        """Get all students"""
        return self.students
    
    def get_student_by_id(self, student_id):
        """Get student by ID"""
        for student in self.students:
            if student['id'] == student_id:
                return student
        return None
    
    def create_student(self, name, email, major, year=1):
        """Create new student"""
        student = {
            'id': str(uuid.uuid4()),
            'name': name,
            'email': email,
            'major': major,
            'year': year,
            'gpa': 0.0,
            'status': 'active',
            'enrollment_date': datetime.now().isoformat(),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.students.append(student)
        self.save_data()
        return student
    
    def update_student(self, student_id, **kwargs):
        """Update student information"""
        student = self.get_student_by_id(student_id)
        if not student:
            return None
        
        # Update student fields
        allowed_fields = ['name', 'email', 'major', 'year', 'gpa', 'status']
        for key, value in kwargs.items():
            if key in allowed_fields:
                student[key] = value
        
        # Update timestamp
        student['updated_at'] = datetime.now().isoformat()
        
        self.save_data()
        return student
    
    def delete_student(self, student_id):
        """Delete student"""
        for i, student in enumerate(self.students):
            if student['id'] == student_id:
                deleted_student = self.students.pop(i)
                self.save_data()
                return deleted_student
        return None
    
    def get_students_by_major(self, major):
        """Get students by major"""
        return [student for student in self.students if student.get('major', '').lower() == major.lower()]
    
    def get_students_by_year(self, year):
        """Get students by academic year"""
        return [student for student in self.students if student.get('year') == year]
    
    def get_statistics(self):
        """Get student statistics"""
        total = len(self.students)
        active = len([s for s in self.students if s.get('status') == 'active'])
        inactive = total - active
        
        # Calculate average GPA
        gpas = [s.get('gpa', 0.0) for s in self.students if s.get('gpa', 0.0) > 0]
        avg_gpa = sum(gpas) / len(gpas) if gpas else 0.0
        
        # Count by year
        year_counts = {}
        for student in self.students:
            year = student.get('year', 1)
            year_counts[f'year_{year}'] = year_counts.get(f'year_{year}', 0) + 1
        
        return {
            'total_students': total,
            'active_students': active,
            'inactive_students': inactive,
            'average_gpa': round(avg_gpa, 2),
            'year_distribution': year_counts
        }

# Create student manager instance
student_manager = StudentManager()

# Route definitions
@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get students list"""
    try:
        major = request.args.get('major', None)
        year = request.args.get('year', None)
        
        if major:
            students = student_manager.get_students_by_major(major)
        elif year:
            try:
                year = int(year)
                students = student_manager.get_students_by_year(year)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid year parameter'
                }), 400
        else:
            students = student_manager.get_all_students()
        
        return jsonify({
            'success': True,
            'data': students,
            'count': len(students)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/students', methods=['POST'])
def create_student():
    """Create new student"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request data is required'
            }), 400
        
        # Validate required fields
        required_fields = ['name', 'email', 'major']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'{field.capitalize()} is required'
                }), 400
        
        name = data['name'].strip()
        email = data['email'].strip()
        major = data['major'].strip()
        year = data.get('year', 1)
        
        # Validate year
        try:
            year = int(year)
            if year < 1 or year > 4:
                return jsonify({
                    'success': False,
                    'error': 'Year must be between 1 and 4'
                }), 400
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Year must be a valid number'
            }), 400
        
        # Check if email already exists
        for student in student_manager.students:
            if student['email'].lower() == email.lower():
                return jsonify({
                    'success': False,
                    'error': 'Email already exists'
                }), 400
        
        student = student_manager.create_student(name, email, major, year)
        
        return jsonify({
            'success': True,
            'data': student,
            'message': 'Student created successfully'
        }), 201
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get single student"""
    try:
        student = student_manager.get_student_by_id(student_id)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': student
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Update data is required'
            }), 400
        
        # Validate data
        allowed_fields = ['name', 'email', 'major', 'year', 'gpa', 'status']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        # Validate specific fields
        if 'year' in update_data:
            try:
                year = int(update_data['year'])
                if year < 1 or year > 4:
                    return jsonify({
                        'success': False,
                        'error': 'Year must be between 1 and 4'
                    }), 400
                update_data['year'] = year
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Year must be a valid number'
                }), 400
        
        if 'gpa' in update_data:
            try:
                gpa = float(update_data['gpa'])
                if gpa < 0.0 or gpa > 4.0:
                    return jsonify({
                        'success': False,
                        'error': 'GPA must be between 0.0 and 4.0'
                    }), 400
                update_data['gpa'] = gpa
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'GPA must be a valid number'
                }), 400
        
        if 'status' in update_data and update_data['status'] not in ['active', 'inactive', 'graduated']:
            return jsonify({
                'success': False,
                'error': 'Status must be active, inactive, or graduated'
            }), 400
        
        # Check email uniqueness if email is being updated
        if 'email' in update_data:
            email = update_data['email'].strip().lower()
            for student in student_manager.students:
                if student['id'] != student_id and student['email'].lower() == email:
                    return jsonify({
                        'success': False,
                        'error': 'Email already exists'
                    }), 400
            update_data['email'] = update_data['email'].strip()
        
        # Strip string fields
        for field in ['name', 'major']:
            if field in update_data:
                update_data[field] = update_data[field].strip()
        
        student = student_manager.update_student(student_id, **update_data)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': student,
            'message': 'Student updated successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete student"""
    try:
        student = student_manager.delete_student(student_id)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': student,
            'message': 'Student deleted successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get statistics"""
    try:
        stats = student_manager.get_statistics()
        
        return jsonify({
            'success': True,
            'data': stats
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/majors', methods=['GET'])
def get_majors():
    """Get unique majors list"""
    try:
        majors = list(set([s.get('major', '') for s in student_manager.students if s.get('major')]))
        majors.sort()
        
        return jsonify({
            'success': True,
            'data': majors,
            'count': len(majors)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Student Management System API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """404 error handler"""
    return jsonify({
        'success': False,
        'error': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 error handler"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Create sample data on first run
    if not os.path.exists(DATA_FILE):
        print("Creating sample student data...")
        student_manager.create_student('John Smith', 'john.smith@example.com', 'Computer Science', 2)
        student_manager.create_student('Emily Johnson', 'emily.johnson@example.com', 'Business Administration', 3)
        student_manager.create_student('Michael Brown', 'michael.brown@example.com', 'Engineering', 1)
        student_manager.create_student('Sarah Davis', 'sarah.davis@example.com', 'Psychology', 4)
        
        # Update some GPAs
        students = student_manager.get_all_students()
        if len(students) >= 4:
            student_manager.update_student(students[0]['id'], gpa=3.5)
            student_manager.update_student(students[1]['id'], gpa=3.8)
            student_manager.update_student(students[2]['id'], gpa=3.2)
            student_manager.update_student(students[3]['id'], gpa=3.9)
        
        print("Sample data created successfully")
    
    print("Student Management System API starting...")
    print("Access URL: http://localhost:5000")
    print("API Health Check: http://localhost:5000/api/health")
    
    app.run(debug=True, host='0.0.0.0', port=5000)