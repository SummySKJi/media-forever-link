
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

const AdSection = () => {
  useEffect(() => {
    // Load AdStera scripts for both banner and mobile ads
    const mobileScript = document.createElement('script');
    mobileScript.type = 'text/javascript';
    mobileScript.src = '//www.highperformanceformat.com/c0eba0d535e19bef8ba22e71cd3eb9e7/invoke.js';
    mobileScript.async = true;
    document.head.appendChild(mobileScript);

    const bannerScript = document.createElement('script');
    bannerScript.type = 'text/javascript';
    bannerScript.src = '//www.highperformanceformat.com/069c7ef05afec20a848f2f5da15c8a92/invoke.js';
    bannerScript.async = true;
    document.head.appendChild(bannerScript);

    return () => {
      // Cleanup scripts on unmount
      if (document.head.contains(mobileScript)) {
        document.head.removeChild(mobileScript);
      }
      if (document.head.contains(bannerScript)) {
        document.head.removeChild(bannerScript);
      }
    };
  }, []);

  return (
    <section aria-label="Advertisements" className="mt-16">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground">Advertisement</p>
      </div>
      
      <div className="grid gap-6">
        {/* Banner Ad - AdStera 728x90 */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div id="adstera-banner-728x90">
                <script type="text/javascript">
                  {`
                    atOptions = {
                      'key' : '069c7ef05afec20a848f2f5da15c8a92',
                      'format' : 'iframe',
                      'height' : 90,
                      'width' : 728,
                      'params' : {}
                    };
                  `}
                </script>
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
