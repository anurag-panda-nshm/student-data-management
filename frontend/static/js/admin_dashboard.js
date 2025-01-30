// DOM Elements
const searchInput = document.getElementById('searchStudent');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const generateReportButton = document.getElementById('generateReport');
const attendanceTable = document.getElementById('attendanceTable');
const attendanceData = document.getElementById('attendanceData');

// State Management
let currentAttendanceData = [];
let sortConfig = {
    column: null,
    direction: 'asc'
};

// Initialize Dashboard
function initializeDashboard() {
    // Set default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    startDateInput.value = formatDate(lastWeek);
    endDateInput.value = formatDate(today);
    
    // Load initial data
    loadAttendanceData();
    
    // Add event listeners
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        filterAttendanceData();
    }, 300));

    // Date range selection
    startDateInput.addEventListener('change', validateDateRange);
    endDateInput.addEventListener('change', validateDateRange);

    // Generate report button
    generateReportButton.addEventListener('click', loadAttendanceData);

    // Table header sorting
    document.querySelectorAll('#attendanceTable th').forEach(header => {
        header.addEventListener('click', () => {
            handleSort(header.dataset.column);
        });
    });
}

// Load Attendance Data from API
async function loadAttendanceData() {
    try {
        const url = new URL('http://localhost:5000/api/attendance/attendance-report');
        
        // Add query parameters
        const params = {
            start_date: startDateInput.value,
            end_date: endDateInput.value
        };
        
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attendance data');
        }

        const data = await response.json();
        currentAttendanceData = data.attendance_report;
        displayAttendanceData(currentAttendanceData);
        updateDashboardStats(currentAttendanceData);

    } catch (error) {
        console.error('Error loading attendance data:', error);
        showNotification('Error loading attendance data', 'error');
    }
}

// Display Attendance Data
function displayAttendanceData(data) {
    attendanceData.innerHTML = '';
    
    if (data.length === 0) {
        attendanceData.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No attendance records found</td>
            </tr>
        `;
        return;
    }

    data.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(record.student_id)}</td>
            <td>${escapeHtml(record.student_name)}</td>
            <td>${formatDate(new Date(record.date))}</td>
            <td>${formatTime(record.time_in)}</td>
            <td>${record.time_out ? formatTime(record.time_out) : '-'}</td>
            <td>
                <span class="status-badge ${record.status.toLowerCase()}">
                    ${escapeHtml(record.status)}
                </span>
            </td>
        `;
        attendanceData.appendChild(row);
    });
}

// Filter Attendance Data
function filterAttendanceData() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredData = currentAttendanceData.filter(record => {
        return (
            record.student_id.toLowerCase().includes(searchTerm) ||
            record.student_name.toLowerCase().includes(searchTerm)
        );
    });

    displayAttendanceData(filteredData);
}

// Handle Sorting
function handleSort(column) {
    if (sortConfig.column === column) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }

    const sortedData = [...currentAttendanceData].sort((a, b) => {
        let compareA = a[column];
        let compareB = b[column];

        // Handle date comparison
        if (column === 'date' || column === 'time_in' || column === 'time_out') {
            compareA = new Date(compareA);
            compareB = new Date(compareB);
        }

        if (compareA < compareB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    displayAttendanceData(sortedData);
    updateSortIndicators(column);
}

// Update Dashboard Statistics
function updateDashboardStats(data) {
    const stats = {
        totalStudents: new Set(data.map(record => record.student_id)).size,
        presentToday: data.filter(record => 
            record.date === formatDate(new Date()) && record.status === 'present'
        ).length,
        averageAttendance: calculateAverageAttendance(data)
    };

    document.getElementById('statsContainer').innerHTML = `
        <div class="stat-card">
            <h3>Total Students</h3>
            <p>${stats.totalStudents}</p>
        </div>
        <div class="stat-card">
            <h3>Present Today</h3>
            <p>${stats.presentToday}</p>
        </div>
        <div class="stat-card">
            <h3>Average Attendance</h3>
            <p>${stats.averageAttendance}%</p>
        </div>
    `;
}

// Export Attendance Report
function exportAttendanceReport() {
    const csvContent = convertToCSV(currentAttendanceData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const fileName = `attendance_report_${formatDate(new Date())}.csv`;
    
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, fileName);
    } else {
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateAverageAttendance(data) {
    if (data.length === 0) return 0;
    
    const presentCount = data.filter(record => 
        record.status === 'present'
    ).length;
    
    return ((presentCount / data.length) * 100).toFixed(1);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function convertToCSV(data) {
    const headers = ['Student ID', 'Name', 'Date', 'Time In', 'Time Out', 'Status'];
    const rows = data.map(record => [
        record.student_id,
        record.student_name,
        record.date,
        record.time_in,
        record.time_out || '',
        record.status
    ]);
    
    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
}

function validateDateRange() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    if (endDate < startDate) {
        endDateInput.value = startDateInput.value;
        showNotification('End date cannot be before start date', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);