
import React, { useState } from 'react';

export type FileType = 'FILE' | 'DIRECTORY';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  children?: FileSystemItem[];
}

interface FileTreeProps {
  fileSystemItems: FileSystemItem[];
  depth?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ fileSystemItems, depth = 0 }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ul className="text-sm text-white">
      {fileSystemItems.map((item) => (
        <li key={item.id} className={`py-1 px-2 hover:bg-zinc-700 rounded`}>
          <div
            className="flex items-center cursor-pointer"
            style={{ paddingLeft: `${depth * 12}px` }}
          >
            {item.type === 'DIRECTORY' ? (
              <>
                <span 
                  className="mr-2 inline-block w-4 text-center"
                  onClick={() => toggleExpand(item.id)}
                >
                  {expandedItems[item.id] ? '-' : '+'}
                </span>
                <span className="block" onClick={() => toggleExpand(item.id)}>
                  {item.name}
                </span>
              </>
            ) : (
              <span className="block ml-6">{item.name}</span>
            )}
          </div>
          
          {item.type === 'DIRECTORY' && expandedItems[item.id] && item.children && (
            <FileTree fileSystemItems={item.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
};

export default FileTree;
