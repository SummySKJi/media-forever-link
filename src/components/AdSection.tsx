
import { Card, CardContent } from '@/components/ui/card';

const AdSection = () => {
  return (
    <section aria-label="Advertisements" className="mt-16">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground">Advertisement</p>
      </div>
      
      <div className="grid gap-6">
        {/* Banner Ad */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg h-24 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500 font-medium">728 x 90 Banner Ad</p>
                <p className="text-sm text-gray-400">Your ad could be here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side by side ads for larger screens */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg h-32 flex items-center justify-center border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <p className="text-blue-600 font-medium">300 x 250 Medium Rectangle</p>
                  <p className="text-sm text-blue-400">Advertisement Space</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg h-32 flex items-center justify-center border-2 border-dashed border-green-200">
                <div className="text-center">
                  <p className="text-green-600 font-medium">300 x 250 Medium Rectangle</p>
                  <p className="text-sm text-green-400">Advertisement Space</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile optimized ad */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg md:hidden">
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg h-20 flex items-center justify-center border-2 border-dashed border-orange-200">
              <div className="text-center">
                <p className="text-orange-600 font-medium">320 x 50 Mobile Banner</p>
                <p className="text-sm text-orange-400">Mobile Ad Space</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdSection;
