document.addEventListener('DOMContentLoaded', () => {
    // Attendance Form
    const form = document.getElementById('attendance-form');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const qrCodeImage = document.getElementById('qr-code');
    const message = document.getElementById('message');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get input values
        const name = document.getElementById('name').value;
        const room = document.getElementById('room').value;
        const attendanceNumber = document.getElementById('attendance-number').value;

        // Create URL for QR code generation using a web API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Name:%20${encodeURIComponent(name)}%20Room:%20${encodeURIComponent(room)}%20Attendance%20Number:%20${encodeURIComponent(attendanceNumber)}`;

        // Set QR code image source
        qrCodeImage.src = qrCodeUrl;

        // Show QR code container and message
        qrCodeContainer.classList.remove('hidden');
        message.classList.remove('hidden');
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

    // Handle hamburger menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    // Handle sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.page-content').forEach(section => {
                section.classList.add('hidden');
            });
            const pageId = link.getAttribute('data-page');
            document.getElementById(pageId).classList.remove('hidden');
        });
    });

    // Outpass Form and OTP Verification
    const outpassForm = document.getElementById('outpass-form');
    const verifyButton = document.getElementById('verify-button');
    const otpContainer = document.getElementById('otp-container');
    const otpInput = document.getElementById('otp-input');

    let generatedOtp = '';

    verifyButton.addEventListener('click', () => {
        // Generate a random 6-digit OTP
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`Your OTP is: ${generatedOtp}`); // In a real app, this would be sent via SMS/email

        // Show the OTP container for user input
        otpContainer.classList.remove('hidden');
    });

    outpassForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const userOtp = otpInput.value;

        if (userOtp === generatedOtp) {
            alert('OTP verified! Outpass submitted successfully.');
            // Handle form submission logic here, such as saving data to localStorage or sending it to a server
            outpassForm.reset();
            otpContainer.classList.add('hidden'); // Hide OTP container after successful verification
        } else {
            alert('Invalid OTP. Please try again.');
        }
    });
});
