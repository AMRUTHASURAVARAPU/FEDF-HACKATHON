import React, { useState } from "react";
import "./App.css";

export default function App() {
  // -------------------- USERS DATABASE --------------------
  const [users, setUsers] = useState([
    { id: "a1", name: "Admin", email: "admin@erp.com", password: "admin123", role: "admin" },

    // sample teacher (optional)
    { id: "t1", name: "Mr. Rao", email: "rao@teacher.com", password: "123", role: "teacher", subject: "Maths" }
  ]);

  const [performances, setPerformances] = useState({});
  const [auth, setAuth] = useState(null);
  const [page, setPage] = useState("landing");

  // LOGIN
  const [roleLogin, setRoleLogin] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // SIGNUP
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regSubject, setRegSubject] = useState("");

  // Teacher add student
  const [stuName, setStuName] = useState("");
  const [stuEmail, setStuEmail] = useState("");
  const [stuPass, setStuPass] = useState("");

  // Marks
  const [selectedStu, setSelectedStu] = useState("");
  const [marks, setMarks] = useState("");

  // FEEDBACK
  const autoFeedback = (sub, m) => {
    if (m < 40) return "Very weak, needs improvement.";
    if (m < 60) return "Average performance.";
    if (m < 80) return "Good effort.";
    return "Excellent!";
  };

  // ---------------- LOGIN ----------------
  const handleLogin = (e) => {
    e.preventDefault();

    const email = loginEmail.toLowerCase().trim();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email &&
        u.password === loginPass &&
        u.role === roleLogin
    );

    if (!user) return alert("Invalid login for " + roleLogin);

    setAuth(user);
    setLoginEmail("");
    setLoginPass("");
    setPage("dashboard");
  };

  const logout = () => {
    setAuth(null);
    setPage("landing");
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = (e) => {
    e.preventDefault();

    const email = regEmail.toLowerCase().trim();
    if (!regName || !email || !regPass) return alert("Fill all fields");
    if (users.some((u) => u.email === email)) return alert("Email exists");

    const nextTeacherId =
      "t" + (users.filter((u) => u.role === "teacher").length + 1);
    const nextStudentId =
      "s" + (users.filter((u) => u.role === "student").length + 1);

    const newUser = {
      id: regRole === "teacher" ? nextTeacherId : nextStudentId,
      name: regName,
      email,
      password: regPass,
      role: regRole,
      subject: regRole === "teacher" ? regSubject : null,
    };

    setUsers([...users, newUser]);
    alert("Signup Successful!");
    setPage("landing");

    setRegName("");
    setRegEmail("");
    setRegPass("");
    setRegRole("student");
    setRegSubject("");
  };

  // ---------------- ADMIN DELETE USER ----------------
  const deleteUser = (id) => {
    if (!window.confirm("Are you sure?")) return;

    const newUsers = users.filter((u) => u.id !== id);
    const newPerf = { ...performances };

    delete newPerf[id];

    for (let s in newPerf) {
      newPerf[s] = newPerf[s].filter((p) => p.teacherId !== id);
    }

    setUsers(newUsers);
    setPerformances(newPerf);
  };

  // ---------------- TEACHER ADD STUDENT ----------------
  const handleAddStudent = (e) => {
    e.preventDefault();

    if (!stuName || !stuEmail || !stuPass)
      return alert("Fill details properly");

    const email = stuEmail.toLowerCase();
    if (users.some((u) => u.email === email)) return alert("Email exists");

    const nextStudentId =
      "s" + (users.filter((u) => u.role === "student").length + 1);

    const newStu = {
      id: nextStudentId,
      name: stuName,
      email,
      password: stuPass,
      role: "student",
    };

    setUsers([...users, newStu]);
    alert("Student Added!");

    setStuName("");
    setStuEmail("");
    setStuPass("");
  };

  // ---------------- TEACHER UPDATE MARKS ----------------
  const handleMarks = () => {
    if (!selectedStu) return alert("Select a student");

    const m = Number(marks);
    if (isNaN(m) || m < 0 || m > 100) return alert("Enter valid marks");

    const subject = auth.subject;
    const fb = autoFeedback(subject, m);

    const prev = performances[selectedStu]
      ? [...performances[selectedStu]]
      : [];

    const idx = prev.findIndex((p) => p.subject === subject);
    if (idx >= 0) {
      prev[idx] = {
        ...prev[idx],
        marks: m,
        feedback: fb,
        teacherId: auth.id,
      };
    } else {
      prev.push({ subject, marks: m, feedback: fb, teacherId: auth.id });
    }

    setPerformances({ ...performances, [selectedStu]: prev });
    setMarks("");
    alert("Marks Updated!");
  };

  // ---------------- STUDENT TABLE ----------------
  const StuTable = ({ sid }) => {
    const data = performances[sid] || [];
    if (data.length === 0) return <p>No performance added yet.</p>;

    return (
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Feedback</th>
            <th>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => {
            const t = users.find((u) => u.id === p.teacherId);
            return (
              <tr key={i}>
                <td>{p.subject}</td>
                <td>{p.marks ?? "---"}</td>
                <td>{p.feedback}</td>
                <td>{t ? t.name : "---"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // STUDENT DASHBOARD
  const renderStudent = () => (
    <div>
      <h2>Student Dashboard</h2>
      <h4>Name: {auth.name}</h4>
      <h5>Email: {auth.email}</h5>

      <h3 className="mt-3">Your Performance</h3>
      <StuTable sid={auth.id} />

      <button className="btn btn-danger mt-4" onClick={logout}>
        Logout
      </button>
    </div>
  );

  // TEACHER DASHBOARD
  const renderTeacher = () => {
    const students = users.filter((u) => u.role === "student");

    return (
      <div>
        <h2>Teacher Dashboard</h2>
        <p>Subject: <b>{auth.subject}</b></p>

        <div className="card p-3 mt-3">
          <h4>Add Student</h4>
          <form onSubmit={handleAddStudent}>
            <input className="form-control mb-2" placeholder="Name"
              value={stuName} onChange={(e) => setStuName(e.target.value)} />
            <input className="form-control mb-2" placeholder="Email"
              value={stuEmail} onChange={(e) => setStuEmail(e.target.value)} />
            <input className="form-control mb-2" placeholder="Password"
              value={stuPass} onChange={(e) => setStuPass(e.target.value)} />
            <button className="btn btn-primary">Add Student</button>
          </form>
        </div>

        <div className="mt-4">
          <label><b>Select Student</b></label>
          <select className="form-control"
            value={selectedStu}
            onChange={(e) => setSelectedStu(e.target.value)}>
            <option value="">-- choose student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        {selectedStu && (
          <>
            <div className="card p-3 mt-3">
              <h4>Enter Marks ({auth.subject})</h4>
              <input className="form-control mb-2"
                placeholder="Marks" value={marks}
                onChange={(e) => setMarks(e.target.value)} />
              <button className="btn btn-success" onClick={handleMarks}>
                Save Marks
              </button>
            </div>

            <h3 className="mt-3">Student Performance</h3>
            <StuTable sid={selectedStu} />
          </>
        )}

        <button className="btn btn-danger mt-4" onClick={logout}>
          Logout
        </button>
      </div>
    );
  };

  // ADMIN DASHBOARD
  const renderAdmin = () => {
    const teachers = users.filter((u) => u.role === "teacher");
    const students = users.filter((u) => u.role === "student");

    return (
      <div>
        <h2>Admin Dashboard</h2>

        <h3 className="mt-3">Teachers</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Subject</th><th>Action</th></tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.subject}</td>
                <td>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-3">Students</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Action</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn btn-danger mt-4" onClick={logout}>
          Logout
        </button>
      </div>
    );
  };

  // ---------------- LANDING + LOGIN + SIGNUP UI ----------------
  return (
    <div className="container">

      {/* LANDING PAGE */}
      {page === "landing" && (
        <div id="landing-text">
          <h2>Student ERP System</h2>
          <p>Select your role</p>

          <button className="btn btn-primary mt-3 w-100"
            onClick={() => { setRoleLogin("teacher"); setPage("login"); }}>
            Teacher Login
          </button>

          <button className="btn btn-success mt-3 w-100"
            onClick={() => { setRoleLogin("student"); setPage("login"); }}>
            Student Login
          </button>

          <button className="btn btn-danger mt-3 w-100"
            onClick={() => { setRoleLogin("admin"); setPage("login"); }}>
            Admin Login
          </button>

          <p className="mt-4"><b>New User? Sign Up Below</b></p>

          <button className="btn btn-outline-primary mt-2 w-100"
            onClick={() => { setRegRole("student"); setPage("signup"); }}>
            Student Signup
          </button>

          <button className="btn btn-outline-success mt-2 w-100"
            onClick={() => { setRegRole("teacher"); setPage("signup"); }}>
            Teacher Signup
          </button>
        </div>
      )}

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="card p-4">
          <h3>{roleLogin.toUpperCase()} Login</h3>

          <form onSubmit={handleLogin}>
            <input className="form-control mb-2"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)} />

            <input className="form-control mb-2"
              placeholder="Password" type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)} />

            <button className="btn btn-primary w-100">Login</button>
          </form>

          <button className="btn btn-link mt-2" onClick={() => setPage("landing")}>
            Back
          </button>
        </div>
      )}

      {/* SIGNUP PAGE */}
      {page === "signup" && (
        <div className="card p-4">
          <h3>{regRole.toUpperCase()} Signup</h3>

          <form onSubmit={handleSignup}>
            <input className="form-control mb-2" placeholder="Full Name"
              value={regName} onChange={(e) => setRegName(e.target.value)} />

            <input className="form-control mb-2" placeholder="Email"
              value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />

            <input className="form-control mb-2" placeholder="Password"
              value={regPass} onChange={(e) => setRegPass(e.target.value)} />

            <select className="form-control mb-2"
              value={regRole} onChange={(e) => setRegRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            {regRole === "teacher" && (
              <select className="form-control mb-2"
                value={regSubject}
                onChange={(e) => setRegSubject(e.target.value)}>
                <option value="">Select Subject</option>
                <option value="Maths">Maths</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            )}

            <button className="btn btn-primary w-100">Signup</button>
          </form>

          <button className="btn btn-link mt-2" onClick={() => setPage("landing")}>
            Back
          </button>
        </div>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && auth && (
        auth.role === "student"
          ? renderStudent()
          : auth.role === "teacher"
            ? renderTeacher()
            : renderAdmin()
      )}

    </div>
  );
}