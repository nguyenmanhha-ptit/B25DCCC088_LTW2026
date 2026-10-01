const StudentItem = ({ student, onDelete }) => {
    const { id, name, score, class: studentClass } = student;

    const getResult = () => {
        if (score >= 8) {
            return "Giỏi";
        }

        if (score < 5) {
            return "Trượt";
        }

        return "Đạt";
    };

    return (
        <tr>
            <td>{id}</td>

            <td>{name}</td>

            <td>{score}</td>

            <td>{studentClass}</td>

            <td>{getResult()}</td>

            <td>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(id)}
                >
                    Xóa
                </button>
            </td>
        </tr>
    );
};

export default StudentItem;