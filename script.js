document.addEventListener('DOMContentLoaded', () => {
    // New navbar functionality
    const openButton = document.querySelector(".open-btn");
    const closeButton = document.querySelector(".close-btn");
    const navs = document.querySelectorAll(".nav");

    openButton.addEventListener("click", () =>
        navs.forEach((nav) => nav.classList.add("visible"))
    );

    closeButton.addEventListener("click", () =>
        navs.forEach((nav) => nav.classList.remove("visible"))
    );

    // Attendance Form
    const attendanceForm = document.getElementById('attendance-form');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const qrCodeImage = document.getElementById('qr-code');
    const attendanceMessage = document.getElementById('message');

    attendanceForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get input values
        const name = document.getElementById('name').value;
        const room = document.getElementById('room').value;
        const attendanceNumber = document.getElementById('attendance-number').value;

        // Validate input
        if (!name || !room || !attendanceNumber) {
            alert('Please fill all the fields.');
            return;
        }

        // Create URL for QR code generation using a web API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Name:%20${encodeURIComponent(name)}%20Room:%20${encodeURIComponent(room)}%20Attendance%20Number:%20${encodeURIComponent(attendanceNumber)}`;

        // Set QR code image source
        qrCodeImage.src = qrCodeUrl;

        // Show QR code container and message
        qrCodeContainer.classList.remove('hidden');
        attendanceMessage.classList.remove('hidden');
    });

    // Query Form
    const queryForm = document.getElementById('query-form');
    const queryTableContainer = document.getElementById('query-table-container');
    const queryTableBody = document.querySelector('#query-table tbody');

    queryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get input values
        const name = document.getElementById('query-name').value;
        const room = document.getElementById('query-room').value;
        const enrollment = document.getElementById('query-enrollment').value;
        const priority = document.getElementById('query-priority').value;
        const semester = document.getElementById('query-semester').value;
        const comments = document.getElementById('query-comments').value;
        const attachment = document.getElementById('query-attachment').files[0];

        // Validate input
        if (!name || !room || !enrollment || !priority || !semester || !comments) {
            alert('Please fill all required fields.');
            return;
        }

        let attachmentPath = '';
        if (attachment) {
            attachmentPath = URL.createObjectURL(attachment);
        }

        // Add data to table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="name-cell">${name}</td>
            <td>${room}</td>
            <td>${enrollment}</td>
            <td>${priority}</td>
            <td><a href="${attachmentPath}" target="_blank">${attachment ? 'View Attachment' : 'No Attachment'}</a></td>
            <td>${semester}</td>
            <td>${comments}</td>
            <td>
                <input type="radio" name="status-${Date.now()}" value="resolved"> Resolved
                <input type="radio" name="status-${Date.now()}" value="unresolved"> Unresolved
            </td>
            <td><button class="edit-button">Edit</button></td>
            <td><button class="delete-button">Delete</button></td>
        `;
        queryTableBody.appendChild(row);

        // Show the table container
        queryTableContainer.classList.remove('hidden');

        // Save data to localStorage
        saveToLocalStorage();

        // Clear form
        queryForm.reset();
    });

    // Handle row status update
    document.querySelector('#query-table').addEventListener('change', (event) => {
        if (event.target.type === 'radio') {
            const row = event.target.closest('tr');
            const nameCell = row.querySelector('.name-cell');
            const status = event.target.value;

            // Update row color based on status
            if (status === 'resolved') {
                nameCell.classList.add('status-resolved');
                nameCell.classList.remove('status-unresolved');
            } else {
                nameCell.classList.add('status-unresolved');
                nameCell.classList.remove('status-resolved');
            }

            // Save data to localStorage
            saveToLocalStorage();
        }
    });

    // Handle row edit button click
    document.querySelector('#query-table').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-button')) {
            const row = event.target.closest('tr');
            const statusRadio = row.querySelector('input[type="radio"]:checked');

            // Toggle status
            if (statusRadio) {
                const currentStatus = statusRadio.value;
                const newStatus = currentStatus === 'resolved' ? 'unresolved' : 'resolved';
                row.querySelector(`input[value="${newStatus}"]`).checked = true;
                row.querySelector('.name-cell').classList.toggle('status-resolved', newStatus === 'resolved');
                row.querySelector('.name-cell').classList.toggle('status-unresolved', newStatus === 'unresolved');
                saveToLocalStorage();
            }
        }
    });
    document.querySelector('#query-table').addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-button')) {
            const row = event.target.closest('tr');
            row.remove();
            saveToLocalStorage();
        }
    });

    // Save and Load data from localStorage
    function loadFromLocalStorage() {
        const queries = JSON.parse(localStorage.getItem('queries')) || [];
        queries.forEach(query => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="name-cell ${query.status === 'resolved' ? 'status-resolved' : 'status-unresolved'}">${query.name}</td>
                <td>${query.room}</td>
                <td>${query.enrollment}</td>
                <td>${query.priority}</td>
                <td><a href="${query.attachment}" target="_blank">${query.attachment ? 'View Attachment' : 'No Attachment'}</a></td>
                <td>${query.semester}</td>
                <td>${query.comments}</td>
                <td>
                    <input type="radio" name="status-${query.timestamp}" value="resolved" ${query.status === 'resolved' ? 'checked' : ''}> Resolved
                    <input type="radio" name="status-${query.timestamp}" value="unresolved" ${query.status === 'unresolved' ? 'checked' : ''}> Unresolved
                </td>
                <td><button class="edit-button">Edit</button></td>
                <td><button class="delete-button">Delete</button></td>
                
            `;
            queryTableBody.appendChild(row);
        });
        if (queries.length > 0) {
            queryTableContainer.classList.remove('hidden');
        }
    }

    function saveToLocalStorage() {
        const queries = [];
        document.querySelectorAll('#query-table tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            const radios = row.querySelectorAll('input[type="radio"]');
            let status = 'unresolved';
            radios.forEach(radio => {
                if (radio.checked) {
                    status = radio.value;
                }
            });
            queries.push({
                name: cells[0].textContent,
                room: cells[1].textContent,
                enrollment: cells[2].textContent,
                priority: cells[3].textContent,
                attachment: cells[4].querySelector('a').href,
                semester: cells[5].textContent,
                comments: cells[6].textContent,
                status: status,
                timestamp: radios[0].name
            });
        });
        localStorage.setItem('queries', JSON.stringify(queries));
    }

    // Load data on page load
    loadFromLocalStorage();

    // Handle sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.page-content').forEach(section => {
                section.classList.add('hidden');
            });
            const pageId = link.getAttribute('data-page');
            document.getElementById(pageId).classList.remove('hidden');
            // Close the mobile menu after selecting a page
            navs.forEach((nav) => nav.classList.remove("visible"));
        });
    });

    // Outpass Form and OTP Verification
    const outpassForm = document.getElementById('outpass-form');
    const verifyButton = document.getElementById('verify-button');
    const otpContainer = document.getElementById('otp-container');
    const otpInput = document.getElementById('otp-input');
    const otpMessage = document.createElement('p');
    otpMessage.id = 'otp-message';
    otpContainer.appendChild(otpMessage);
    
    let generatedOtp = '';
    let phoneNumber = '';

    verifyButton.addEventListener('click', () => {
        phoneNumber = document.getElementById('phone-input').value;
        if (!phoneNumber || phoneNumber.length !== 10) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        // Generate a random 6-digit OTP
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Mock sending OTP (Replace with real SMS API call)
        console.log(`Sending OTP ${generatedOtp} to ${phoneNumber}`);
        alert(`Your OTP is: ${generatedOtp}`); // In a real app, this would be sent via SMS

        // Show the OTP container for user input
        otpContainer.classList.remove('hidden');
        otpMessage.textContent = ''; // Clear previous messages
    });

    outpassForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const userOtp = otpInput.value;
        const inTime = new Date(document.getElementById('outpass-in-time').value);
        const outTime = new Date(document.getElementById('outpass-out-time').value);

        if (userOtp === generatedOtp) {
            if (outTime <= inTime) {
                alert('Out Time must be later than In Time.');
                return;
            }

            const timeDifference = (outTime - inTime) / 60000; // Difference in minutes
            if (timeDifference < 30) {
                alert('Out Time must be at least 30 minutes later than In Time.');
                return;
            }

            alert('OTP verified! Outpass submitted successfully.');
            // Extract and display form details in a table
            displayOutpassDetails();
            outpassForm.reset();
            otpContainer.classList.add('hidden'); // Hide OTP container after successful verification
            otpMessage.textContent = 'Outpass details have been submitted successfully.';
        } else {
            otpMessage.textContent = 'Invalid OTP. Please try again.';
        }
    });

    function displayOutpassDetails() {
        const detailsTable = document.getElementById('outpass-details-table');
        const detailsBody = detailsTable.querySelector('tbody');

        // Clear existing rows
        detailsBody.innerHTML = '';

        // Get input values
        const name = document.getElementById('outpass-name').value;
        const course = document.getElementById('outpass-course').value;
        const enrollment = document.getElementById('outpass-enrollment').value;
        const roll = document.getElementById('outpass-roll').value;
        const purpose = document.getElementById('outpass-purpose').value;
        const inTime = document.getElementById('outpass-in-time').value;
        const outTime = document.getElementById('outpass-out-time').value;
        const comments = document.getElementById('outpass-comments').value;

        // Add data to table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${course}</td>
            <td>${enrollment}</td>
            <td>${roll}</td>
            <td>${purpose}</td>
            <td>${inTime}</td>
            <td>${outTime}</td>
            <td>${comments}</td>
        `;
        detailsBody.appendChild(row);

        // Show the details table
        detailsTable.classList.remove('hidden');
    }
    document.getElementById('get-location').addEventListener('click', () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById('location-status').textContent = `Location: ${lat}, ${lon}`;
                // Here you would typically send this data to your server
            }, () => {
                document.getElementById('location-status').textContent = "Unable to retrieve your location";
            });
        } else {
            document.getElementById('location-status').textContent = "Geolocation is not supported by your browser";
        }
    });
    
    // Attendance history functionality
    function addAttendanceRecord(type, time) {
        const list = document.getElementById('attendance-list');
        const item = document.createElement('li');
        item.textContent = `${type} at ${time}`;
        list.prepend(item);
        
        // Limit list to last 5 entries
        if (list.children.length > 5) {
            list.removeChild(list.lastChild);
        }
    }

    
    // Attendance statistics functionality
    let checkIns = 0;
    let checkOuts = 0;
    let streak = 0;
    
    function updateStats(type) {
        if (type === 'in') checkIns++;
        if (type === 'out') checkOuts++;
        streak++; // This is a simplified version. In reality, you'd need to check if it's a new day.
        
        document.getElementById('total-checkins').textContent = checkIns;
        document.getElementById('total-checkouts').textContent = checkOuts;
        document.getElementById('attendance-streak').textContent = streak;
    }
    
    // Modify your existing form submission handler
    document.getElementById('attendance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // ... existing code ...
        
        const type = document.getElementById('attendance-type').value;
        const time = new Date().toLocaleTimeString();
        
        addAttendanceRecord(type, time);
        updateStats(type);
    });
});

document.getElementById('add-event').addEventListener('click', function() {
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;

    if (eventName && eventDate) {
        const tableBody = document.getElementById('events-body');
        const newRow = tableBody.insertRow();

        newRow.innerHTML = `
            <td>${eventName}</td>
            <td>${eventDate}</td>
            <td>MIT Campus</td>
            <td>Description goes here.</td>
            <td><button class="delete-event">Delete</button></td>
        `;

        // Clear input fields
        document.getElementById('event-name').value = '';
        document.getElementById('event-date').value = '';

        // Add delete functionality
        newRow.querySelector('.delete-event').addEventListener('click', function() {
            tableBody.deleteRow(newRow.rowIndex - 1);
        });
    } else {
        alert("Please fill in both fields.");
    }
});

// Add event listeners to existing delete buttons
document.querySelectorAll('.delete-event').forEach(button => {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        row.parentNode.removeChild(row);
    });
});
window.addEventListener('load', function() {
    const navbar = document.querySelector('.navbar'); // Adjust the selector based on your navbar class
    const main = document.querySelector('main');
    
    if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        main.style.paddingTop = `${navbarHeight}px`;
    }
});