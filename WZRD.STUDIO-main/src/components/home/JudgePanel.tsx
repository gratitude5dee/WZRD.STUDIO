
import { Trophy, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JudgeProps {
  name: string;
  company: string;
  role: string;
  imageUrl: string;
  color: string;
}

const JudgeCard = ({ name, company, role, imageUrl, color }: JudgeProps) => {
  const ringColor = `ring-${color}-500`;
  const textColor = `text-${color}-400`;

  return (
    <div className="bg-[#191F2E] rounded-xl p-6 flex flex-col items-center text-center transition-all hover:transform hover:scale-105 hover:shadow-lg">
      <div className={`relative mb-4 p-1 rounded-full ring-2 ${ringColor} bg-[#191F2E]`}>
        <Avatar className="h-24 w-24">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>
      <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
      <p className={`text-lg font-medium mb-1 ${textColor}`}>{company}</p>
      <p className="text-sm text-zinc-400">{role}</p>
    </div>
  );
};

export const JudgePanel = () => {
  const semifinalists = [
    {
      name: "Matheus Mendes",
      company: "Midjourney",
      role: "Software Engineer",
      imageUrl: "https://placehold.co/200x200",
      color: "blue"
    },
    {
      name: "Emil Fagerholm",
      company: "Lovable",
      role: "Software Engineer", 
      imageUrl: "https://placehold.co/200x200",
      color: "pink"
    }
  ];

  const finalJudges = [
    {
      name: "Anton Osika",
      company: "Lovable",
      role: "CEO and Co-Founder",
      imageUrl: "https://placehold.co/200x200", 
      color: "pink"
    },
    {
      name: "Christian Ryan",
      company: "Anthropic",
      role: "Applied AI",
      imageUrl: "https://placehold.co/200x200",
      color: "purple"
    },
    {
      name: "Wen Bo Xie",
      company: "Supabase",
      role: "Technical PM",
      imageUrl: "https://placehold.co/200x200",
      color: "green"
    },
    {
      name: "Thorsten Schaeff",
      company: "ElevenLabs",
      role: "Developer Experience",
      imageUrl: "https://placehold.co/200x200",
      color: "blue"
    },
    {
      name: "Cody De Arkland",
      company: "Sentry",
      role: "Developer Experience",
      imageUrl: "https://placehold.co/200x200",
      color: "orange"
    },
    {
      name: "Sandra Malmberg",
      company: "EQT Ventures",
      role: "Partner",
      imageUrl: "https://placehold.co/200x200",
      color: "teal"
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#0F1424]">
      <div className="container mx-auto">
        {/* Semi-Finalist Section */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="text-yellow-500 h-6 w-6" />
            <h2 className="text-2xl font-semibold text-white">Semi-Finalist Jury Members</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {semifinalists.map((judge, index) => (
              <JudgeCard key={index} {...judge} />
            ))}
          </div>
        </div>
        
        {/* Final Judges Section */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Award className="text-yellow-500 h-6 w-6" />
            <h2 className="text-2xl font-semibold text-white">Final Round Judges</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalJudges.map((judge, index) => (
              <JudgeCard key={index} {...judge} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
