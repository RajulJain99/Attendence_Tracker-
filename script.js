let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("attendanceDate").value = getToday();
  renderAttendanceTable();
  updateStats();
});

function getToday() {
  const today = new Date().toISOString().split("T")[0];
  return today;
}

function addStudent() {
  const name = document.getElementById("studentName").value.trim();
  if (name && !students.includes(name)) {
    students.push(name);
    localStorage.setItem("students", JSON.stringify(students));
    renderAttendanceTable();
    updateStats();
  }
  document.getElementById("studentName").value = "";
}

function renderAttendanceTable() {
  const date = document.getElementById("attendanceDate").value;
  const tbody = document.querySelector("#attendanceTable tbody");
  tbody.innerHTML = "";

  const isSunday = new Date(date).getDay() === 0;

  students.forEach(student => {
    const status = attendance[date]?.[student]?.status || (isSunday ? "Absent" : "Present");
    const late = attendance[date]?.[student]?.late || false;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student}</td>
      <td>
        <select class="status-select" data-student="${student}">
          <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
          <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
        </select>
      </td>
      <td>
        <input type="checkbox" data-late="${student}" ${late ? "checked" : ""}>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function saveAttendance() {
  const date = document.getElementById("attendanceDate").value;
  if (!attendance[date]) attendance[date] = {};

  students.forEach(student => {
    const status = document.querySelector(`select[data-student="${student}"]`).value;
    const late = document.querySelector(`input[data-late="${student}"]`).checked;
    attendance[date][student] = { status, late };
  });

  localStorage.setItem("attendance", JSON.stringify(attendance));
  alert("✅ Attendance Saved!");
  updateStats();
}

function updateStats() {
  const statsDiv = document.getElementById("statsContainer");
  statsDiv.innerHTML = "";

  students.forEach(student => {
    let total = 0, present = 0;
    for (let date in attendance) {
      if (attendance[date][student]) {
        total++;
        if (attendance[date][student].status === "Present") present++;
      }
    }

    const percent = total ? ((present / total) * 100).toFixed(1) : "N/A";

    const p = document.createElement("p");
    p.textContent = `${student}: ${percent}% Present (${present}/${total})`;
    statsDiv.appendChild(p);
  });
}

function resetIndividual() {
  const name = prompt("Enter student name to reset:");
  if (name && students.includes(name)) {
    for (let date in attendance) {
      delete attendance[date][name];
    }
    localStorage.setItem("attendance", JSON.stringify(attendance));
    updateStats();
    alert(`${name}'s attendance reset.`);
  }
}

function resetAll() {
  if (confirm("Are you sure you want to reset all attendance data?")) {
    attendance = {};
    localStorage.removeItem("attendance");
    updateStats();
    alert("All attendance data reset.");
  }
}
