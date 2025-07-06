import React from 'react';
import { Box, useTheme, Typography } from '@mui/material';

// 将Markdown文本安全地转换为React元素数组
const renderMarkdownToReact = (markdown, theme) => {
  if (typeof markdown !== 'string' || !markdown) return null;

  const lines = markdown.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <Box key={`list-${elements.length}`} component="ul" sx={{ pl: 3, my: 1 }}>
          {listItems}
        </Box>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      return;
    }

    if (trimmedLine.startsWith('#')) {
      flushList();
      const level = trimmedLine.match(/^#+/)[0].length;
      const text = trimmedLine.replace(/^#+\s*/, '');
      const variant = `h${Math.min(level + 2, 6)}`;
      elements.push(
        <Typography key={index} variant={variant} sx={{ mt: 2.5, mb: 1, fontWeight: 'bold' }}>
          {text}
        </Typography>
      );
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.replace(/^[-*]\s*/, '');
      listItems.push(
        <Typography component="li" key={`item-${index}`} sx={{ lineHeight: 1.7 }}>
          {text}
        </Typography>
      );
    } else {
      flushList();
      elements.push(
        <Typography key={index} variant="body1" sx={{ mb: 1.5, lineHeight: 1.7 }}>
          {trimmedLine}
        </Typography>
      );
    }
  });

  flushList();
  return elements;
};

const MarkdownRenderer = ({ content, sx = {}, component = 'div' }) => {
  const theme = useTheme();


  if (!content) return null;

  return (
    <Box component={component} sx={{ wordBreak: 'break-word', ...sx }}>
      {renderMarkdownToReact(content, theme)}
    </Box>
  );
};

export default MarkdownRenderer;
