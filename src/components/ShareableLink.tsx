
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check, ExternalLink, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableLinkProps {
  url: string;
}

const ShareableLink = ({ url }: ShareableLinkProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please copy it manually.",
        variant: "destructive"
      });
    }
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared File - Share4Ever',
          text: 'Check out this file I shared with you',
          url: url
        });
      } catch (err) {
        // Fallback to copy if share fails
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Link2 className="w-4 h-4 text-green-600" />
          </div>
          <span>Your Permanent Shareable Link</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input 
            value={url} 
            readOnly 
            className="font-mono text-sm bg-gray-50"
          />
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={copyToClipboard}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </Button>

          <Button 
            onClick={openInNewTab}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview</span>
          </Button>

          <Button 
            onClick={shareViaWebAPI}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Permanent Link Created</h4>
              <p className="text-green-700 text-sm mt-1">
                This link will work forever and can be shared with anyone. No account required to access.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableLink;
