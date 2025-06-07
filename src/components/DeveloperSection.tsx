
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, User, Code } from 'lucide-react';

const DeveloperSection = () => {
  const handleContactClick = () => {
    window.open('tel:+917742789827', '_self');
  };

  return (
    <section aria-label="Developer information" className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Meet the Developer
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Crafted with passion and dedication to provide you the best file sharing experience.
        </p>
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/3726eb0f-9a82-46b3-8131-9b42bfa59585.png" 
              alt="Sunil Kumar - Developer"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Sunil Kumar
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Code className="w-4 h-4" />
            <span>Full Stack Developer</span>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Passionate about creating user-friendly applications that solve real-world problems.
          </p>
          <Button 
            onClick={handleContactClick}
            className="flex items-center gap-2 mx-auto"
            variant="outline"
          >
            <Phone className="w-4 h-4" />
            Contact: +91 7742789827
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default DeveloperSection;
