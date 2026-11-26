import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  // Lưu object để gọi lại cùng nội dung vẫn đếm lại 3 giây
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((text) => setNotice({ text }), []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {notice && (
        <div role="status" className="notice">
          {notice.text}
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const showNotice = useContext(NoticeContext);
  if (!showNotice) throw new Error('useNotice phải dùng bên trong NoticeProvider');
  return showNotice;
};
