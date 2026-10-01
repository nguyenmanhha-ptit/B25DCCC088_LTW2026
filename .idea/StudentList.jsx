import StudentItem from "./StudentItem";

const StudentList = ({ students }) => {
    return (
        <div>
            <h2>Danh sách sinh viên</h2>

            {students.map((student) => (
                <StudentItem
                    key={student.id}
                    student={student}
                />
            ))}
        </div>
    );
};

export default StudentList;