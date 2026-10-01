
import { useState } from "react";
import StudentList from "./StudentList";
import "./App.css";

const App = () => {
    const [students, setStudents] = useState([
        {
            id: 1,
            name: "Nguyễn Văn An",
            score: 8.5,
            class: "D25CQCN01-B",
        },
        {
            id: 2,
            name: "Trần Minh Bình",
            score: 6.5,
            class: "D25CQCN02-B",
        },
        {
            id: 3,
            name: "Lê Hoàng Nam",
            score: 4,
            class: "D25CQCN03-B",
        },
    ]);

    const [name, setName] = useState("");
    const [score, setScore] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState("");

    const addStudent = (e) => {
        e.preventDefault();

        const scoreNumber = Number(score);

        if (
            name.trim() === "" ||
            score === "" ||
            studentClass.trim() === ""
        ) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (scoreNumber < 0 || scoreNumber > 10) {
            setError("Điểm phải nằm trong khoảng từ 0 đến 10.");
            return;
        }

        const newStudent = {
            id: Date.now(),
            name: name,
            score: scoreNumber,
            class: studentClass,
        };

        setStudents([...students, newStudent]);

        setName("");
        setScore("");
        setStudentClass("");
        setError("");
    };

    const deleteStudent = (id) => {
        const newStudents = students.filter((student) => student.id !== id);

        setStudents(newStudents);
    };

    const filteredStudents = students.filter((student) => {
        if (filter === "good") {
            return student.score >= 8;
        }

        if (filter === "fail") {
            return student.score < 5;
        }

        return true;
    });

    const totalStudents = students.length;

    const totalScore = students.reduce(
        (total, student) => total + student.score,
        0
    );

    const averageScore =
        totalStudents === 0 ? 0 : totalScore / totalStudents;

    return (
        <div className="container">
            <h1>Quản lý điểm sinh viên</h1>

            <form onSubmit={addStudent} className="student-form">
                <input
                    type="text"
                    placeholder="Họ tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="number"
                    step="0.1"
                    placeholder="Điểm"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Lớp"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                />

                <button type="submit">Thêm sinh viên</button>
            </form>

            {error && <p className="error">{error}</p>}

            <div className="filter">
                <button onClick={() => setFilter("all")}>
                    Tất cả
                </button>

                <button onClick={() => setFilter("good")}>
                    Sinh viên Giỏi
                </button>

                <button onClick={() => setFilter("fail")}>
                    Sinh viên Trượt
                </button>
            </div>

            <StudentList
                students={filteredStudents}
                onDelete={deleteStudent}
            />

            <div className="statistics">
                <h3>Thống kê</h3>

                <p>{`Tổng số sinh viên: ${totalStudents}`}</p>

                <p>
                    {`Điểm trung bình: ${averageScore.toFixed(2)}`}
                </p>
            </div>
        </div>
    );
};

export default App;