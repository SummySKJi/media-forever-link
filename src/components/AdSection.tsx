
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

const AdSection = () => {
  useEffect(() => {
    // Load AdStera script for mobile banner
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/c0eba0d535e19bef8ba22e71cd3eb9e7/invoke.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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

        {/* Mobile optimized ad - AdStera */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg md:hidden">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div id="adstera-mobile-banner">
                <script type="text/javascript">
                  {`
                    atOptions = {
                      'key' : 'c0eba0d535e19bef8ba22e71cd3eb9e7',
                      'format' : 'iframe',
                      'height' : 50,
                      'width' : 320,
                      'params' : {}
                    };
                  `}
                </script>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdSection;
