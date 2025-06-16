
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

const AdSection = () => {
  useEffect(() => {
    // Load AdStera script for all ads
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = '//www.highperformanceformat.com/5872b691c5dd6ec53ad81fad19436cf6/invoke.js';
    adScript.async = true;
    document.head.appendChild(adScript);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(adScript)) {
        document.head.removeChild(adScript);
      }
    };
  }, []);

  return (
    <section aria-label="Advertisements" className="mt-16">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground">Advertisement</p>
      </div>
      
      <div className="grid gap-6">
        {/* Banner Ad - Now using 300x250 format */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div id="adstera-banner-300x250">
                <script type="text/javascript">
                  {`
                    atOptions = {
                      'key' : '5872b691c5dd6ec53ad81fad19436cf6',
                      'format' : 'iframe',
                      'height' : 250,
                      'width' : 300,
                      'params' : {}
                    };
                  `}
                </script>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side by side ads for larger screens - AdStera 300x250 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <div id="adstera-rectangle-300x250-1">
                  <script type="text/javascript">
                    {`
                      atOptions = {
                        'key' : '5872b691c5dd6ec53ad81fad19436cf6',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                      };
                    `}
                  </script>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <div id="adstera-rectangle-300x250-2">
                  <script type="text/javascript">
                    {`
                      atOptions = {
                        'key' : '5872b691c5dd6ec53ad81fad19436cf6',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                      };
                    `}
                  </script>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile optimized ad - Now using 300x250 format */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg md:hidden">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div id="adstera-mobile-300x250">
                <script type="text/javascript">
                  {`
                    atOptions = {
                      'key' : '5872b691c5dd6ec53ad81fad19436cf6',
                      'format' : 'iframe',
                      'height' : 250,
                      'width' : 300,
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
