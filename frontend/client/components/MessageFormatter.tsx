import React from 'react';

interface MessageFormatterProps {
  text: string;
  isBot: boolean;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({ text, isBot }) => {
  if (!isBot) {
    return <span>{text}</span>;
  }

  // Split text into sections based on common patterns
  const formatBotMessage = (message: string) => {
    // Split by numbered lists first
    const sections = message.split(/(\d+\.\s*\*\*[^*]+\*\*)|(\d+\.\s*[^:]+:)/).filter(Boolean);
    
    let formattedContent: React.ReactNode[] = [];
    let currentIndex = 0;

    // Process the message to identify different components
    const lines = message.split('\n').filter(line => line.trim());
    
    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          
          // Handle main headings (text before colon followed by items)
          if (trimmedLine.includes(':') && !trimmedLine.match(/^\d+\./)) {
            return (
              <div key={index} className="mb-2">
                <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--primary-700)' }}>
                  {trimmedLine}
                </h4>
              </div>
            );
          }
          
          // Handle numbered list items with bold titles
          if (trimmedLine.match(/^\d+\.\s*\*\*[^*]+\*\*/)) {
            const match = trimmedLine.match(/^(\d+\.\s*)(\*\*[^*]+\*\*)(.*)/);
            if (match) {
              return (
                <div key={index} className="mb-3">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-xs mt-0.5" style={{ color: 'var(--primary-600)' }}>
                      {match[1].trim()}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-900)' }}>
                        {match[2].replace(/\*\*/g, '')}
                      </div>
                      {match[3] && (
                        <div className="text-sm leading-relaxed" style={{ color: 'var(--text-600)' }}>
                          {formatInlineText(match[3].trim())}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          }
          
          // Handle sub-items with dashes
          if (trimmedLine.match(/^\s*-\s*\*\*[^*]+\*\*/)) {
            const match = trimmedLine.match(/^(\s*-\s*)(\*\*[^*]+\*\*)(.*)/);
            if (match) {
              return (
                <div key={index} className="ml-6 mb-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-xs mt-1" style={{ color: 'var(--primary-600)' }}>•</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-900)' }}>
                        {match[2].replace(/\*\*/g, '')}: 
                      </span>
                      <span className="text-sm ml-1" style={{ color: 'var(--text-600)' }}>
                        {formatInlineText(match[3].trim())}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          }
          
          // Handle budget totals and summaries
          if (trimmedLine.includes('Total Estimated Budget') || trimmedLine.includes('###')) {
            return (
              <div key={index} className="mt-4 p-3 rounded-lg" style={{ background: 'var(--primary-100)' }}>
                <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--primary-700)' }}>
                  {trimmedLine.replace(/###\s*/, '')}
                </h4>
              </div>
            );
          }
          
          // Handle cost calculations
          if (trimmedLine.match(/LKR\s*[\d,]+/) && (trimmedLine.includes('=') || trimmedLine.includes('option'))) {
            return (
              <div key={index} className="ml-4 p-2 rounded border-l-2" style={{ 
                borderLeftColor: 'var(--primary-600)',
                background: 'var(--surface-alt)'
              }}>
                <div className="text-sm font-medium" style={{ color: 'var(--text-900)' }}>
                  {formatInlineText(trimmedLine)}
                </div>
              </div>
            );
          }
          
          // Handle regular paragraphs
          if (trimmedLine && !trimmedLine.match(/^\d+\./) && !trimmedLine.match(/^\s*-/)) {
            return (
              <p key={index} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-600)' }}>
                {formatInlineText(trimmedLine)}
              </p>
            );
          }
          
          return null;
        }).filter(Boolean)}
      </div>
    );
  };

  // Format inline text with bold, currency, etc.
  const formatInlineText = (text: string) => {
    // Handle bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold" style={{ color: 'var(--text-900)' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      // Highlight currency amounts
      if (part.match(/LKR\s*[\d,]+/)) {
        return (
          <span key={index} className="font-medium" style={{ color: 'var(--primary-600)' }}>
            {part}
          </span>
        );
      }
      
      return part;
    });
  };

  return <div>{formatBotMessage(text)}</div>;
};

export default MessageFormatter;
