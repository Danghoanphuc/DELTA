// Tạm thời tạo component Sidebar đơn giản
import React from 'react';

export const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  return (
    <aside className="w-64 bg-gray-50 p-4">
      {children || <div>Sidebar content</div>}
    </aside>
  );
};
