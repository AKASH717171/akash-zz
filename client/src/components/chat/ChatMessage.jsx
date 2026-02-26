import React, { memo } from 'react';

const ChatMessage = memo(({ message, isLast }) => {
  const { sender, senderName, text, timestamp } = message;

  const isVisitor = sender === 'visitor';
  const isSystem  = sender === 'system';
  const isAdmin   = sender === 'admin';

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now  = new Date();
    const isToday =
      date.getDate()     === now.getDate()     &&
      date.getMonth()    === now.getMonth()    &&
      date.getFullYear() === now.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) return time;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`;
  };

  const parseContent = (rawText) => {
    if (!rawText) return [];
    const LINK_REGEX = /\[link:([^\]|]+)\|([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = LINK_REGEX.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: rawText.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'link', label: match[1].trim(), url: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < rawText.length) {
      parts.push({ type: 'text', value: rawText.slice(lastIndex) });
    }
    return parts;
  };

  const formatTextChunk = (chunk, keyPrefix) => {
    const bold = chunk.split(/(\*\*[^*]+\*\*)/g);
    return bold.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return React.createElement('span', { key: `${keyPrefix}-b${i}`, className: 'font-bold text-secondary' }, part.slice(2, -2));
      }
      return React.createElement('span', { key: `${keyPrefix}-t${i}` }, part);
    });
  };

  const renderContent = (rawText) => {
    const parts = parseContent(rawText);
    return parts.map((part, i) => {
      if (part.type === 'link') {
        return React.createElement(
          'a',
          {
            key: `link-${i}`,
            href: part.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            onClick: (e) => e.stopPropagation(),
            className: 'inline-flex items-center gap-1.5 mt-1.5 mr-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all duration-200 bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200',
          },
          '🔗 ' + part.label + ' ↗'
        );
      }
      return React.createElement(
        'span',
        { key: `text-${i}`, className: 'whitespace-pre-wrap break-words' },
        formatTextChunk(part.value, `tc-${i}`)
      );
    });
  };

  if (isVisitor) {
    return (
      <div className={`flex justify-end mb-3 ${isLast ? 'animate-fade-in' : ''}`}>
        <div className="max-w-[80%] flex flex-col items-end">
          <div className="bg-secondary text-white px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-sm font-body leading-relaxed">
              {renderContent(text)}
            </p>
          </div>
          <span className="text-[10px] text-gray-400 font-body mt-1 mr-1">{formatTime(timestamp)}</span>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className={`flex items-start gap-2 mb-3 ${isLast ? 'animate-fade-in' : ''}`}>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-secondary text-[10px] font-bold font-heading">LF</span>
        </div>
        <div className="max-w-[80%] flex flex-col">
          <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-md shadow-sm border border-gray-100">
            <p className="text-sm font-body text-dark leading-relaxed">
              {renderContent(text)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-1 ml-1">
            <span className="text-[10px] text-gray-400 font-body">{senderName || 'LUXE FASHION'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] text-gray-400 font-body">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className={`flex items-start gap-2 mb-3 ${isLast ? 'animate-fade-in' : ''}`}>
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-white text-[10px] font-bold">
            {senderName ? senderName.charAt(0).toUpperCase() : 'A'}
          </span>
        </div>
        <div className="max-w-[80%] flex flex-col">
          <div className="bg-blue-50 px-4 py-2.5 rounded-2xl rounded-tl-md shadow-sm border border-blue-100">
            <p className="text-sm font-body text-dark leading-relaxed">
              {renderContent(text)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-1 ml-1">
            <span className="text-[10px] text-blue-500 font-body font-medium">{senderName || 'Support Agent'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] text-gray-400 font-body">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

ChatMessage.displayName = 'ChatMessage';
export default ChatMessage;