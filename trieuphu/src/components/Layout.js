import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const Layout = ({ loading, error, buildTag }) => {
  const renderContent = () => {
    if (loading) return <p>Đang tải câu hỏi...</p>;
    if (error) return <p className="error">{error}</p>;
    return <Outlet />;
  };

  return (
    <div className="app">
      <NavBar />
      <main className="content">{renderContent()}</main>
      <footer className="footer">Build {buildTag}</footer>
    </div>
  );
};

export default Layout;
