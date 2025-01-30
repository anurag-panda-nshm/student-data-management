// const scriptURL = 'https://script.google.com/macros/s/AKfycbzhLNXBY9djMVorzy0wGPVz7fpKulOl8AN_txHNS0RbwoicRaULR4871TzJ-9sy3m4w/exec';

// function fetchStudents() {
//   google.script.run.withSuccessHandler(displayStudents).getStudents();
// }

// function displayStudents(students) {
//   const studentList = document.getElementById('studentsList');
//   studentList.innerHTML = ''; // Clear existing students

//   students.forEach(function(student) {
//     createStudentElement(student[0], student[1], student[2], student[3], student[4], student[5]);
//   });
// }

// function createStudentElement(id, name, email, department, year, image) {
//   const studentList = document.getElementById('studentsList');
  
//   const studentRow = document.createElement('tr');
  
//   const studentId = document.createElement('td');
//   studentId.textContent = id;
  
//   const studentName = document.createElement('td');
//   studentName.textContent = name;
  
//   const studentEmail = document.createElement('td');
//   studentEmail.textContent = email;
  
//   const studentDepartment = document.createElement('td');
//   studentDepartment.textContent = department;
  
//   const studentYear = document.createElement('td');
//   studentYear.textContent = year;
  
//   const studentImage = document.createElement('td');
//   const imgElement = document.createElement('img');
//   imgElement.src = image;
//   imgElement.alt = `${name}'s image`;
//   imgElement.style.width = '50px';
//   imgElement.style.height = '50px';
//   studentImage.appendChild(imgElement);
  
//   studentRow.appendChild(studentId);
//   studentRow.appendChild(studentName);
//   studentRow.appendChild(studentEmail);
//   studentRow.appendChild(studentDepartment);
//   studentRow.appendChild(studentYear);
//   studentRow.appendChild(studentImage);
  
//   studentList.appendChild(studentRow);
// }
// function handleStudentSubmit(event) {
  
// } 
 


 
 // Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
});

// function loadStudents() {
//     // Fetch students from backend API
//     fetch('/api/students')
//         .then(response => response.json())
//         .then(data => {
//             updateStudentsTable(data);
//         })
//         .catch(error => console.error('Error loading students:', error));
// }

function updateStudentsTable(students) {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const tbody = document.getElementById('studentsList');
    tbody.innerHTML = '';
        })
    
        students.forEach(student => {
            const row = `
                <tr>
                    <td>${id}</td>
                    <td><img src="${image}" alt="Student photo" class="student-thumbnail"></td>
                    <td>${Name}</td>
                    <td>${department}</td>
                    <td>${year}</td>
                    <td>${email}</td>
                    <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
                    <td>
                        <button class="icon-btn" onclick="editStudent(${student.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" onclick="deleteStudent(${student.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
}

// Modal handling functions
function openAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentModal').style.display = 'block';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
}

function submitStudentForm(event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('studentForm'));

    fetch('/api/student', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'success') {
            alert('Student added successfully!');
            closeStudentModal();
            // Optionally, refresh the student list
        } else {
            alert('Error adding student');
        }
    })
    .catch(error => console.error('Error:', error));
}
  
//   fetch('https://script.google.com/macros/s/AKfycbwNjytyiAuEzFwb8JJMmLhq0rDu69wQzpgSpgzFzLMxc5CGFgbuIZSvjNj5n4Mu8TvH/exec', {
//     method: 'POST',
//     body: JSON.stringify({ id, name, email, department, year, image }),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//   .then(response => response.json())
//   .then(data => {
//     if (data.status === 'success') {
//         closeStudentModal();
//         fetchStudents();
//         updateStudentsTable([student]);
//     } else {
//         console.log('Error adding student:', data);
//     }
//   })
//   .catch(error => console.error('Error adding student:', error));

// Search and filter functionality
document.getElementById('studentSearch').addEventListener('input', function(e) {
    // Implement search functionality
    const searchValue = e.target.value.toLowerCase();
    const students = document.querySelectorAll('.student-item');

    students.forEach(function(student) {
        const studentName = student.querySelector('.student-name').textContent.toLowerCase();
        if (studentName.includes(searchValue)) {
            student.style.display = '';
        } else {
            student.style.display = 'none';
        }
    });
});

document.getElementById('departmentFilter').addEventListener('change', function(e) {
    // Implement department filter
    const searchValue = e.target.value.toLowerCase();
    const students = document.querySelectorAll('.student-item');

    students.forEach(function(student) {
        const studentDepartment = student.querySelector('.student-department').textContent.toLowerCase();

        if (departmentValue.includes(searchValue) === 'all' || studentDepartment.includes(searchValue) === departmentValue) {
            student.style.display = '';
        } else {
            student.style.display = 'none';
        }
    });
});

document.getElementById('yearFilter').addEventListener('change', function(e) {
    // Implement year filter
    const searchValue = e.target.value.toLowerCase();
    const students = document.querySelectorAll('.student-item');

    students.forEach(function(student) {
        const studentYear = student.querySelector('.student-year').textContent.toLowerCase();

        if (yearValue.includes(searchValue) === 'all' || studentYear.includes(searchValue) === yearValue) {
            student.style.display = '';
        } else {
            student.style.display = 'none';
        }
    });
});