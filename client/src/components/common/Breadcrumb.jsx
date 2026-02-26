import React from 'react';
import { Link } from 'react-router-dom';
import { HiChevronRight, HiHome } from 'react-icons/hi';

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`bg-gray-50 border-b border-gray-100 ${className}`} aria-label="Breadcrumb">
      <div className="container-luxe py-3">
        <ol className="flex items-center flex-wrap gap-1 text-sm font-body">
          <li>
            <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-secondary transition-colors">
              <HiHome className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1">
                <HiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                {isLast || !item.path ? (
                  <span className="text-primary font-medium truncate max-w-[200px]">{item.label}</span>
                ) : (
                  <Link to={item.path} className="text-gray-500 hover:text-secondary transition-colors truncate max-w-[200px]">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;