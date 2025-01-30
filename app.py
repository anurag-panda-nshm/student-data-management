# app.py
from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app =Flask(__name__, static_folder='frontend/static', template_folder='frontend/templates')


def init_db():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    
    # Create students table
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER UNIQUE NOT NULL,
            Name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            year INTEGER NOT NULL,
            photo BLOB
        ) 
    ''')
    
    # Create courses table
    c.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            course_code TEXT UNIQUE NOT NULL,
            instructor TEXT NOT NULL
        )
    ''')
    
    # Create enrollments table (many-to-many relationship)
    c.execute('''
        CREATE TABLE IF NOT EXISTS enrollments (
            student_id INTEGER,
            course_id INTEGER,
            enrollment_date DATE DEFAULT CURRENT_DATE,
            grade FLOAT,
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (course_id) REFERENCES courses (id),
            PRIMARY KEY (student_id, course_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    
@app.route('/')
def home():
    return render_template('dashboard.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('SELECT * FROM students')
    students = c.fetchall()
    conn.close()
    
    return jsonify([{
        'id': s[0],
        'name': s[1],
        'email': s[2],
        'department': s[3],
        'year': s[4],
        'photo': s[5]
    } for s in students])

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO students (id ,Name, email, department, year, photo)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['studentId'],
            data['studentName'],
            data['studentEmail'],
            data['studentDepartment'],
            data['studentYear'],
            data['studentPhoto'].read()
        ))
        conn.commit()
        return jsonify({'success': True, 'message': 'Student added successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already exists'}), 400
    finally:
        conn.close()

@app.route('/api/attendance/attendance-report', methods=['GET'])
def attendance_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Connect to the database
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    
    # Query to fetch attendance report between the given dates
    c.execute('''
        SELECT * FROM attendance
        WHERE date BETWEEN ? AND ?
    ''', (start_date, end_date))
    
    attendance_records = c.fetchall()
    conn.close()
    
    return jsonify(attendance_records)


if __name__ == '__main__':
    init_db()
    app.run(debug=True)