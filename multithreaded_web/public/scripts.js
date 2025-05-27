const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const studentSection = document.getElementById("studentSection");
const studentInfo = document.getElementById("studentInfo");
const logoutBtn = document.getElementById("logoutBtn");
const studentContent = document.getElementById("studentContent");

const navProfile = document.getElementById("navProfile");
const navCourses = document.getElementById("navCourses");
const navHelp = document.getElementById("navHelp");
const navAttendance = document.getElementById("navAttendance");
const navEvents = document.getElementById("navEvents");
const navLogout = document.getElementById("navLogout");

let currentStudent = null;

// Initially hide logout button
logoutBtn.style.display = "none";

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMessage.textContent = "";

  const formData = new FormData(loginForm);
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    const result = await response.json();

    if (result.status === "success") {
      currentStudent = result.student;
      displayStudentInfo(currentStudent);
      loginForm.parentElement.classList.add("hidden");
      studentSection.classList.remove("hidden");
      logoutBtn.style.display = "inline-block";
      clearContent();
      studentInfo.style.display = "block";
      studentContent.querySelector("h2").textContent = "Student Details";
    } else {
      loginMessage.textContent = result.message || "Login failed";
    }
  } catch (error) {
    loginMessage.textContent = "Error connecting to server";
  }
});

function displayStudentInfo(student) {
  if (!student || Object.keys(student).length === 0) {
    studentInfo.innerHTML = "<p>No student data found.</p>";
    return;
  }

  // Fix: Use template literals (backticks) and put HTML inside them as string
  studentInfo.innerHTML = `
    <p><strong>Name:</strong> ${student.name || ""}</p>
    <p><strong>Email:</strong> ${student.email || ""}</p>
    <p><strong>Father's Name:</strong> ${student.father || ""}</p>
    <p><strong>Mother's Name:</strong> ${student.mother || ""}</p>
    <p><strong>10th Percentage:</strong> ${student.tenth || ""}</p>
    <p><strong>12th Percentage:</strong> ${student.twelfth || ""}</p>
    <p><strong>1st Semester Result:</strong> ${student.sem1 || ""}</p>
    <p><strong>2nd Semester Result:</strong> ${student.sem2 || ""}</p>
  `;
}

function clearContent() {
  const sections = [
    "coursesList",
    "helpSection",
    "attendanceSection",
    "eventsSection",
  ];
  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });
}

function createSectionContainer(id) {
  const section = document.createElement("div");
  section.id = id;
  section.style.width = "100%";
  section.style.maxWidth = "700px";
  section.style.margin = "0 auto";
  section.style.padding = "20px";
  return section;
}

navProfile.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentStudent) return;

  clearContent();
  displayStudentInfo(currentStudent);
  studentInfo.style.display = "block";
  logoutBtn.style.display = "inline-block";
  studentContent.querySelector("h2").textContent = "Student Details";
});

navCourses.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentStudent) return;

  studentInfo.style.display = "none";
  clearContent();

  const coursesList = createSectionContainer("coursesList");

  // Fix: Use backticks and string concatenation for HTML string
  let html = `<h3>Courses</h3><ul>`;

  if (
    Array.isArray(currentStudent.courses) &&
    currentStudent.courses.length > 0
  ) {
    currentStudent.courses.forEach((course) => {
      const courseName =
        typeof course === "string" ? course : course.name || "Unnamed";
      html += `<li>${courseName}</li>`;
    });
  } else {
    html += "<li>No courses found.</li>";
  }

  html += `</ul>`;
  coursesList.innerHTML = html;
  studentContent.appendChild(coursesList);

  logoutBtn.style.display = "none";
  studentContent.querySelector("h2").textContent = "Courses";
});

navHelp.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentStudent) return;

  studentInfo.style.display = "none";
  clearContent();

  const helpSection = createSectionContainer("helpSection");

  // Fix: wrap form HTML in backticks as a string
  helpSection.innerHTML = `
    <form id="helpForm">
      <label for="query">Your Query:</label><br/>
      <textarea id="query" name="query" rows="5" cols="50" required></textarea><br/>
      <button type="submit">Send Query</button>
    </form>
    <p id="helpMessage" role="alert"></p>
  `;

  studentContent.appendChild(helpSection);

  logoutBtn.style.display = "none";
  studentContent.querySelector("h2").textContent = "Help & Support";

  const helpForm = document.getElementById("helpForm");
  const helpMessage = document.getElementById("helpMessage");

  helpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    helpMessage.textContent = "";

    const query = helpForm.query.value.trim();
    if (!query) {
      helpMessage.textContent = "Please enter your query.";
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      helpMessage.textContent =
        "Your query has been sent. We will get back to you soon!";
      helpForm.reset();
    } catch (error) {
      helpMessage.textContent = "Error sending query. Please try again later.";
    }
  });
});

navAttendance.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentStudent) return;

  studentInfo.style.display = "none";
  clearContent();

  const attendanceSection = createSectionContainer("attendanceSection");

  // Fix: Use backticks and string concatenation for HTML string
  let html = `
    <h3>Attendance</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Course</th>
          <th>Attendance (%)</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (
    Array.isArray(currentStudent.courses) &&
    currentStudent.courses.length > 0
  ) {
    currentStudent.courses.forEach((course) => {
      const courseName =
        typeof course === "string" ? course : course.name || "Unnamed";
      const attendance = course.attendance || "N/A";
      html += `
        <tr>
          <td>${courseName}</td>
          <td>${attendance}</td>
        </tr>
      `;
    });
  } else {
    html += `
      <tr>
        <td colspan="2">No courses available.</td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  attendanceSection.innerHTML = html;
  studentContent.appendChild(attendanceSection);
  studentContent.querySelector("h2").textContent = "Attendance";

  logoutBtn.style.display = "none";
});

navEvents.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentStudent) return;

  studentInfo.style.display = "none";
  clearContent();

  const eventsSection = createSectionContainer("eventsSection");

  // Fix: wrap HTML in backticks
  eventsSection.innerHTML = `
    <h3>Upcoming Events</h3>
    <ul>
      <li>Student Orientation: 20th June</li>
      <li>Science Symposium: 15th July</li>
      <li>Art Exhibition: 10th August</li>
    </ul>
  `;

  studentContent.appendChild(eventsSection);
  studentContent.querySelector("h2").textContent = "Events";

  logoutBtn.style.display = "none";
});

navLogout.addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.clear();
  window.location.reload();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.reload();
});
