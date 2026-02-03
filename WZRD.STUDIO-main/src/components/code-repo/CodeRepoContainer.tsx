
import React from 'react';
import FileTree, { FileSystemItem } from './FileTree';

// Sample file system structure
const sampleFileSystem: FileSystemItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'DIRECTORY',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'DIRECTORY',
        children: [
          { id: '3', name: 'Button.tsx', type: 'FILE' },
          { id: '4', name: 'Header.tsx', type: 'FILE' },
          { id: '5', name: 'Sidebar.tsx', type: 'FILE' },
        ]
      },
      {
        id: '6',
        name: 'pages',
        type: 'DIRECTORY',
        children: [
          { id: '7', name: 'Home.tsx', type: 'FILE' },
          { id: '8', name: 'About.tsx', type: 'FILE' },
        ]
      },
      { id: '9', name: 'App.tsx', type: 'FILE' },
      { id: '10', name: 'index.tsx', type: 'FILE' },
    ]
  },
  {
    id: '11',
    name: 'public',
    type: 'DIRECTORY',
    children: [
      { id: '12', name: 'index.html', type: 'FILE' },
      { id: '13', name: 'favicon.ico', type: 'FILE' },
    ]
  },
  { id: '14', name: 'package.json', type: 'FILE' },
  { id: '15', name: 'README.md', type: 'FILE' },
];

const CodeRepoContainer: React.FC = () => {
  return (
    <div className="h-full bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-zinc-700 bg-zinc-800/80">
        <h3 className="text-sm font-medium text-white">Project Files</h3>
      </div>
      <div className="p-2 max-h-[calc(100%-3rem)] overflow-y-auto">
        <FileTree fileSystemItems={sampleFileSystem} />
      </div>
    </div>
  );
};

export default CodeRepoContainer;
