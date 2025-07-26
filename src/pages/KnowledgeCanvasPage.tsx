import React from 'react';
import { KnowledgeCanvas } from '@/components/knowledge/KnowledgeCanvas';

const KnowledgeCanvasPage: React.FC = () => {
  return (
    <div className="h-screen w-screen">
      <KnowledgeCanvas />
    </div>
  );
};

export default KnowledgeCanvasPage;