const form = document.getElementById("studentForm");
const studentCards = document.getElementById("studentCards");
const statistics = document.getElementById("statistics");

const students = JSON.parse(localStorage.getItem("students")) || [];

let editId = null;

// Form Submit

form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;

    const gender = document.querySelector(
        'input[name="gender"]:checked'
    ).value;

    const course = document.getElementById("course").value;

    const skills = [...document.querySelectorAll(
        'input[name="skills"]:checked'
    )].map(skill => skill.value);

    const about = document.getElementById("aboutStudent").value.trim();

    const photoInput = document.getElementById("profilePhoto");
    const photoFile = photoInput.files[0];

    if (editId !== null) {

        const student = students.find(student => student.id === editId);

        student.name = name;
        student.email = email;
        student.phone = phone;
        student.dob = dob;
        student.gender = gender;
        student.course = course;
        student.skills = skills;
        student.about = about;

        if (photoFile) {
            student.photo = URL.createObjectURL(photoFile);
        }

    } else {

        const student = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            dob: dob,
            gender: gender,
            course: course,
            skills: skills,
            about: about,
            photo: photoFile
                ? URL.createObjectURL(photoFile)
                : ""
        };

        students.push(student);
    }

    saveStudents();
    renderStudents();
    updateStatistics();
    resetForm();
});

//  Validation the form 
function validateForm() {

    clearErrors();
    let valid = true;

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.querySelector(
        'input[name="gender"]:checked'
    );
    const course = document.getElementById("course").value;

    const skills = document.querySelectorAll(
        'input[name="skills"]:checked'
    );

    const about = document.getElementById("aboutStudent").value.trim();
    const photo = document.getElementById("profilePhoto").files[0];

    /* Name */

    const nameRegex = /^[A-Za-z ]{3,40}$/;

    if (!name) {
        showError("studentName", "Name is required");
        valid = false;
    } else if (!nameRegex.test(name)) {
        showError(
            "studentName",
            "Name must be 3-40 letters and spaces only"
        );
        valid = false;
    }

    /* Email */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        showError("email", "Email is required");
        valid = false;
    } else if (!emailRegex.test(email)) {
        showError("email", "Enter a valid email");
        valid = false;
    }

    /* Phone */

    const phoneRegex = /^\d{10}$/;

    if (!phone) {
        showError("phone", "Phone number is required");
        valid = false;
    } else if (!phoneRegex.test(phone)) {
        showError("phone", "Phone must contain exactly 10 digits");
        valid = false;
    }

    /* DOB */
    if (!dob) {

        showError("dob", "Date of birth is required");
        valid = false;

    } else {

        const birthDate = new Date(dob);
        const today = new Date();

        if (birthDate > today) {

            showError("dob", "Future date is not allowed");
            valid = false;

        } else {

            let age =
                today.getFullYear() -
                birthDate.getFullYear();

            const month =
                today.getMonth() -
                birthDate.getMonth();

            if (
                month < 0 ||
                (
                    month === 0 &&
                    today.getDate() < birthDate.getDate()
                )
            ) {
                age--;
            }

            if (age < 15) {
                showError(
                    "dob",
                    "Student must be at least 15 years old"
                );
                valid = false;
            }
        }
    }

    /* Gender */
    if (!gender) {
        showError("gender", "Select gender");
        valid = false;
    }

    /* Course */
    if (!course) {
        showError("course", "Select a course");
        valid = false;
    }

    /* Skills */

    if (skills.length === 0) {
        showError("skills", "Select at least one skill");
        valid = false;
    }

    /* About */

    if (!about) {

        showError("aboutStudent", "About student is required");
        valid = false;

    } else if (about.length < 20) {

        showError(
            "aboutStudent",
            "Minimum 20 characters required"
        );
        valid = false;

    } else if (about.length > 200) {

        showError(
            "aboutStudent",
            "Maximum 200 characters allowed"
        );
        valid = false;
    }

    /* Photo */

    if (!editId && !photo) {

        showError(
            "profilePhoto",
            "Profile photo is required"
        );

        valid = false;
    }

    if (photo) {

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(photo.type)) {

            showError(
                "profilePhoto",
                "Only JPG, JPEG and PNG files are allowed"
            );

            valid = false;
        }
    }

    return valid;
}

// Error Message

function showError(inputId, message) {

    const input = document.getElementById(inputId);
    let error = input.parentElement.querySelector(".error");

    if (!error) {
        error = document.createElement("small");
        error.classList.add("error");
        input.parentElement.appendChild(error);
    }

    error.textContent = message;
}

function clearErrors() {

    document.querySelectorAll(".error").forEach(error => {
        error.remove();
    });
}

//  counting the Characters
const aboutStudent = document.getElementById("aboutStudent");
aboutStudent.addEventListener("input", function () {
    let counter = aboutStudent.parentElement.querySelector(
        ".character-counter"
    );

    if (!counter) {
        counter = document.createElement("small");
        counter.classList.add("character-counter");
        aboutStudent.parentElement.appendChild(counter);
    }

    counter.textContent =
        `${aboutStudent.value.length} / 200`;
});
//  Render Students
function renderStudents() {

    studentCards.innerHTML = "";
    const searchText =
        document.getElementById("searchStudent")
            .value
            .toLowerCase();
    const selectedCourse =
        document.getElementById("filterCourse").value;

    const filteredStudents = students.filter(student => {

        const nameMatch =
            student.name
                .toLowerCase()
                .includes(searchText);

        const courseMatch =
            selectedCourse === "" ||
            student.course === selectedCourse;

        return nameMatch && courseMatch;
    });

    if (filteredStudents.length === 0) {

        const message = document.createElement("p");
        message.textContent = "No students found";

        studentCards.appendChild(message);
        return;
    }

    filteredStudents.forEach(student => {

        const card = document.createElement("div");
        card.classList.add("student-card");

        card.setAttribute("data-id", student.id);

        /* Photo */

        const img = document.createElement("img");

        img.src = student.photo;
        img.alt = student.name;

        /* Name */

        const heading = document.createElement("h3");
        heading.textContent = student.name;

        /* Information */

        const email = document.createElement("p");
        email.textContent = `Email: ${student.email}`;

        const phone = document.createElement("p");
        phone.textContent = `Phone: ${student.phone}`;

        const dob = document.createElement("p");
        dob.textContent = `DOB: ${student.dob}`;

        const gender = document.createElement("p");
        gender.textContent = `Gender: ${student.gender}`;

        const course = document.createElement("p");
        course.textContent = `Course: ${student.course}`;

        /* Skills */

        const skillsTitle = document.createElement("p");
        skillsTitle.textContent = "Skills:";

        const skillsBox = document.createElement("div");
        skillsBox.classList.add("skills");

        student.skills.forEach(skill => {

            const skillSpan = document.createElement("span");

            skillSpan.classList.add("skill");
            skillSpan.textContent = skill;

            skillsBox.appendChild(skillSpan);
        });

        /* About */

        const about = document.createElement("p");
        about.textContent = `About: ${student.about}`;

        const editButton = document.createElement("button");

        editButton.classList.add("edit-btn");
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");

        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "Delete";

        card.append(
            img,
            heading,
            email,
            phone,
            dob,
            gender,
            course,
            skillsTitle,
            skillsBox,
            about,
            editButton,
            deleteButton
        );

        studentCards.appendChild(card);
    });
}

//  Event Delegation
studentCards.addEventListener("click", function (event) {

    const card = event.target.closest(".student-card");

    if (!card) return;

    const id = Number(card.dataset.id);

    /* Delete */

    if (event.target.classList.contains("delete-btn")) {

        if (!confirm("Are you sure you want to delete this student?")) {
            return;
        }

        const index = students.findIndex(
            student => student.id === id
        );

        if (index !== -1) {
            students.splice(index, 1);
        }

        saveStudents();
        renderStudents();
        updateStatistics();
    }

    /* Edit */

    if (event.target.classList.contains("edit-btn")) {

        const student = students.find(
            student => student.id === id
        );

        if (!student) return;

        document.getElementById("studentName").value =
            student.name;

        document.getElementById("email").value =
            student.email;

        document.getElementById("phone").value =
            student.phone;

        document.getElementById("dob").value =
            student.dob;

        document.getElementById("course").value =
            student.course;

        document.getElementById("aboutStudent").value =
            student.about;

        document.querySelectorAll(
            'input[name="gender"]'
        ).forEach(input => {
            input.checked =
                input.value === student.gender;
        });

        document.querySelectorAll(
            'input[name="skills"]'
        ).forEach(input => {
            input.checked =
                student.skills.includes(input.value);
        });

        editId = id;
        document.getElementById("registerBtn").textContent =
            "Update Student";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

//  Search
document.getElementById("searchStudent")
    .addEventListener("input", renderStudents);

document.getElementById("filterCourse")
    .addEventListener("change", renderStudents);


function updateStatistics() {

    statistics.innerHTML = "";

    const total = document.createElement("div");

    total.classList.add("stat-card");

    total.innerHTML = `
        <h3>Total Students</h3>
        <p>${students.length}</p>
    `;

    statistics.appendChild(total);

    const courses = [
        "Web Development",
        "UI/UX",
        "Python",
        "Data Analytics",
        "MERN Stack",
        "Cloud Computing"
    ];

    courses.forEach(course => {

        const count = students.filter(
            student => student.course === course
        ).length;

        const box = document.createElement("div");

        box.classList.add("stat-card");

        box.innerHTML = `
            <h3>${course}</h3>
            <p>${count}</p>
        `;

        statistics.appendChild(box);
    });
}
// saving the data
function saveStudents() {
    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


document.getElementById("resetBtn")
    .addEventListener("click", function () {

        setTimeout(() => {

            clearErrors();

            aboutStudent.value = "";

            const counter =
                aboutStudent.parentElement
                    .querySelector(".character-counter");

            if (counter) {
                counter.textContent = "0 / 200";
            }

            editId = null;

            document.getElementById("registerBtn")
                .textContent = "Register Student";

        }, 0);
    });

    // removing the error
document.querySelectorAll(
    "#studentForm input, #studentForm select, #studentForm textarea"
).forEach(input => {

    input.addEventListener("input", function () {

        const error =
            input.parentElement.querySelector(".error");

        if (error) {
            error.remove();
        }
    });

    input.addEventListener("change", function () {

        const error =
            input.parentElement.querySelector(".error");

        if (error) {
            error.remove();
        }
    });
});

// load students
renderStudents();
updateStatistics();