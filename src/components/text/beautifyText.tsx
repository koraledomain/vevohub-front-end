import Typography from '@mui/material/Typography';
import { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Props = {
  description: string;
  sx?: SxProps<Theme>;
};

export default function BeautifiedText({ description, sx }: Props) {
  const beautifyText = (text: string): string => text
      // Add line breaks after sentences
      .replace(/([.!?])\s+/g, '$1<br /><br />')
      // Add line breaks before bullet points or lists
      .replace(/(\s*[-•]|\s*\d+\.)/g, '<br />$1')
      // Convert URLs to clickable links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
      // Convert emails to mailto links
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>')
      // Bold text that looks like a title followed by a colon
      .replace(/([A-Z][a-z]*\s*[A-Z][a-z]*:)/g, '<br /><strong>$1</strong>')
      // Trim extra spaces and line breaks
      .replace(/\s\s+/g, ' ')
      .trim();

  return (
    <Typography
      variant="body2"
      dangerouslySetInnerHTML={{ __html: beautifyText(description) }}
      sx={sx}
    />
  );
}
