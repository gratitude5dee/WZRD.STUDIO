
import { ProjectProvider } from './ProjectContext';
import ProjectSetupHeader from './ProjectSetupHeader';
import TabNavigation from './TabNavigation';
import TabContent from './TabContent';
import NavigationFooter from './NavigationFooter';

const ProjectSetupWizard = () => {
  return (
    <ProjectProvider>
      <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Top-left warm glow */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
          {/* Bottom-right accent glow */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[100px]" />
        </div>
        
        {/* Header */}
        <ProjectSetupHeader />
        
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Tab Content */}
        <TabContent />

        {/* Footer with navigation buttons */}
        <NavigationFooter />
      </div>
    </ProjectProvider>
  );
};

export default ProjectSetupWizard;
