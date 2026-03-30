import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';

type IconName =
  | 'account-group-outline'
  | 'account-outline'
  | 'apple'
  | 'arrow-left'
  | 'arrow-top-right'
  | 'bed-empty'
  | 'bed-outline'
  | 'bed-queen-outline'
  | 'bell-outline'
  | 'calendar-range'
  | 'calendar-remove-outline'
  | 'chevron-down'
  | 'chevron-right'
  | 'clock-end'
  | 'clock-start'
  | 'close'
  | 'email-outline'
  | 'eye-off-outline'
  | 'eye-outline'
  | 'facebook'
  | 'flag-variant-outline'
  | 'google'
  | 'heart'
  | 'heart-outline'
  | 'home-outline'
  | 'lock-outline'
  | 'magnify'
  | 'map-marker'
  | 'map-marker-outline'
  | 'phone-outline'
  | 'ruler-square'
  | 'shower'
  | 'shield-check-outline'
  | 'star'
  | 'tune-variant'
  | 'weather-night';

type Props = {
  color?: string;
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

const VIEW_BOX = 24;

export function AppIcon({
  color = '#111827',
  name,
  size = 24,
  strokeWidth = 1.8,
}: Props) {
  const commonStroke = {
    fill: 'none' as const,
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  const renderIcon = () => {
    switch (name) {
      case 'magnify':
        return (
          <>
            <Circle cx="11" cy="11" r="5.5" {...commonStroke} />
            <Line x1="15.5" y1="15.5" x2="20" y2="20" {...commonStroke} />
          </>
        );
      case 'map-marker':
      case 'map-marker-outline':
        return (
          <>
            <Path
              d="M12 20c3.2-4 5-7 5-10a5 5 0 1 0-10 0c0 3 1.8 6 5 10Z"
              {...commonStroke}
              fill={name === 'map-marker' ? color : 'none'}
            />
            {name === 'map-marker-outline' ? (
              <Circle cx="12" cy="10" r="1.8" {...commonStroke} />
            ) : (
              <Circle cx="12" cy="10" r="1.8" fill="#FFFFFF" />
            )}
          </>
        );
      case 'chevron-right':
        return <Polyline points="9 6 15 12 9 18" {...commonStroke} />;
      case 'chevron-down':
        return <Polyline points="6 9 12 15 18 9" {...commonStroke} />;
      case 'bell-outline':
        return (
          <>
            <Path d="M8 17h8l-1-2v-3a3 3 0 1 0-6 0v3l-1 2Z" {...commonStroke} />
            <Path d="M10.3 18.2a1.9 1.9 0 0 0 3.4 0" {...commonStroke} />
          </>
        );
      case 'arrow-left':
        return (
          <>
            <Line x1="19" y1="12" x2="5" y2="12" {...commonStroke} />
            <Polyline points="11 6 5 12 11 18" {...commonStroke} />
          </>
        );
      case 'arrow-top-right':
        return (
          <>
            <Line x1="7" y1="17" x2="17" y2="7" {...commonStroke} />
            <Polyline points="10 7 17 7 17 14" {...commonStroke} />
          </>
        );
      case 'tune-variant':
        return (
          <>
            <Line x1="5" y1="7" x2="19" y2="7" {...commonStroke} />
            <Circle cx="9" cy="7" r="1.7" fill={color} />
            <Line x1="5" y1="12" x2="19" y2="12" {...commonStroke} />
            <Circle cx="15" cy="12" r="1.7" fill={color} />
            <Line x1="5" y1="17" x2="19" y2="17" {...commonStroke} />
            <Circle cx="11" cy="17" r="1.7" fill={color} />
          </>
        );
      case 'phone-outline':
        return <Path d="M8 5h8v14H8zM10 7h4M11 17h2" {...commonStroke} />;
      case 'calendar-range':
        return (
          <>
            <Rect x="4" y="6" width="16" height="14" rx="2.5" {...commonStroke} />
            <Line x1="8" y1="4.5" x2="8" y2="8" {...commonStroke} />
            <Line x1="16" y1="4.5" x2="16" y2="8" {...commonStroke} />
            <Line x1="4" y1="10" x2="20" y2="10" {...commonStroke} />
            <Rect x="7" y="13" width="3" height="3" rx="0.6" fill={color} />
            <Rect x="14" y="13" width="3" height="3" rx="0.6" fill={color} />
          </>
        );
      case 'account-group-outline':
        return (
          <>
            <Circle cx="9" cy="9" r="2.5" {...commonStroke} />
            <Circle cx="16" cy="10" r="2.1" {...commonStroke} />
            <Path d="M4.5 18a4.8 4.8 0 0 1 9 0" {...commonStroke} />
            <Path d="M13.5 18a3.8 3.8 0 0 1 6 0" {...commonStroke} />
          </>
        );
      case 'bed-outline':
      case 'bed-queen-outline':
      case 'bed-empty':
        return (
          <>
            <Rect x="5" y="11" width="14" height="5" rx="1.3" {...commonStroke} />
            <Rect x="6" y="8" width="5" height="3" rx="1" {...commonStroke} />
            <Rect x="11.5" y="8" width="6.5" height="3" rx="1" {...commonStroke} />
            <Line x1="5" y1="16" x2="5" y2="19" {...commonStroke} />
            <Line x1="19" y1="16" x2="19" y2="19" {...commonStroke} />
            {name === 'bed-empty' ? <Line x1="7" y1="6" x2="17" y2="6" {...commonStroke} /> : null}
            {name === 'bed-queen-outline' ? <Circle cx="12" cy="9.5" r="0.9" fill={color} /> : null}
          </>
        );
      case 'shower':
        return (
          <>
            <Path d="M8 9a4 4 0 1 1 8 0v2H8V9Z" {...commonStroke} />
            <Line x1="16" y1="11" x2="19" y2="11" {...commonStroke} />
            <Line x1="9" y1="14" x2="9" y2="15.5" {...commonStroke} />
            <Line x1="12" y1="14" x2="12" y2="16.5" {...commonStroke} />
            <Line x1="15" y1="14" x2="15" y2="15.5" {...commonStroke} />
          </>
        );
      case 'ruler-square':
        return (
          <>
            <Rect x="5" y="5" width="14" height="14" rx="2" {...commonStroke} />
            <Line x1="9" y1="5" x2="9" y2="8" {...commonStroke} />
            <Line x1="13" y1="5" x2="13" y2="7" {...commonStroke} />
            <Line x1="17" y1="5" x2="17" y2="8" {...commonStroke} />
            <Line x1="5" y1="9" x2="8" y2="9" {...commonStroke} />
            <Line x1="5" y1="13" x2="7" y2="13" {...commonStroke} />
            <Line x1="5" y1="17" x2="8" y2="17" {...commonStroke} />
          </>
        );
      case 'star':
        return <Path d="m12 4 2.3 4.8 5.2.7-3.8 3.7.9 5.3L12 16l-4.6 2.5.9-5.3-3.8-3.7 5.2-.7L12 4Z" fill={color} />;
      case 'clock-start':
      case 'clock-end':
        return (
          <>
            <Circle cx="12" cy="12" r="7" {...commonStroke} />
            <Line x1="12" y1="12" x2={name === 'clock-start' ? '15.5' : '9'} y2="9.5" {...commonStroke} />
            <Line x1="12" y1="12" x2="12" y2="7.5" {...commonStroke} />
          </>
        );
      case 'weather-night':
        return (
          <>
            <Path d="M15.5 4.8a6.8 6.8 0 1 0 3.7 12.4 7.5 7.5 0 1 1-3.7-12.4Z" {...commonStroke} />
            <Circle cx="18.5" cy="7.5" r="1" fill={color} />
          </>
        );
      case 'calendar-remove-outline':
        return (
          <>
            <Rect x="4" y="6" width="16" height="14" rx="2.5" {...commonStroke} />
            <Line x1="8" y1="4.5" x2="8" y2="8" {...commonStroke} />
            <Line x1="16" y1="4.5" x2="16" y2="8" {...commonStroke} />
            <Line x1="4" y1="10" x2="20" y2="10" {...commonStroke} />
            <Line x1="9" y1="15" x2="15" y2="15" {...commonStroke} />
          </>
        );
      case 'heart':
        return <Path d="M12 20s-6.8-4.5-8.5-8.4C2 8 4.5 5 8 5c1.9 0 3 1 4 2.3C13 6 14.1 5 16 5c3.5 0 6 3 4.5 6.6C18.8 15.5 12 20 12 20Z" fill={color} />;
      case 'heart-outline':
        return <Path d="M12 20s-6.8-4.5-8.5-8.4C2 8 4.5 5 8 5c1.9 0 3 1 4 2.3C13 6 14.1 5 16 5c3.5 0 6 3 4.5 6.6C18.8 15.5 12 20 12 20Z" {...commonStroke} />;
      case 'home-outline':
        return (
          <>
            <Path d="M5 11.5 12 6l7 5.5V19a1 1 0 0 1-1 1h-4.5v-5h-3v5H6a1 1 0 0 1-1-1v-7.5Z" {...commonStroke} />
          </>
        );
      case 'account-outline':
        return (
          <>
            <Circle cx="12" cy="8.5" r="3" {...commonStroke} />
            <Path d="M6 19a6 6 0 0 1 12 0" {...commonStroke} />
          </>
        );
      case 'shield-check-outline':
        return (
          <>
            <Path d="M12 4 18 6.5v4.8c0 3.8-2.5 6.2-6 8.2-3.5-2-6-4.4-6-8.2V6.5L12 4Z" {...commonStroke} />
            <Polyline points="9.2 12.3 11.2 14.2 15.2 10.3" {...commonStroke} />
          </>
        );
      case 'email-outline':
        return (
          <>
            <Rect x="4" y="6.5" width="16" height="11" rx="2" {...commonStroke} />
            <Polyline points="5.5 8 12 13 18.5 8" {...commonStroke} />
          </>
        );
      case 'lock-outline':
        return (
          <>
            <Rect x="6" y="11" width="12" height="9" rx="2" {...commonStroke} />
            <Path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" {...commonStroke} />
          </>
        );
      case 'eye-outline':
        return (
          <>
            <Path d="M3.5 12S6.5 7.5 12 7.5 20.5 12 20.5 12 17.5 16.5 12 16.5 3.5 12 3.5 12Z" {...commonStroke} />
            <Circle cx="12" cy="12" r="2.2" {...commonStroke} />
          </>
        );
      case 'eye-off-outline':
        return (
          <>
            <Path d="M3.5 12S6.5 7.5 12 7.5 20.5 12 20.5 12 17.5 16.5 12 16.5 3.5 12 3.5 12Z" {...commonStroke} />
            <Line x1="5" y1="19" x2="19" y2="5" {...commonStroke} />
          </>
        );
      case 'close':
        return (
          <>
            <Line x1="6" y1="6" x2="18" y2="18" {...commonStroke} />
            <Line x1="18" y1="6" x2="6" y2="18" {...commonStroke} />
          </>
        );
      case 'flag-variant-outline':
        return (
          <>
            <Line x1="7" y1="4" x2="7" y2="20" {...commonStroke} />
            <Path d="M7 5h9l-1.5 3L16 11H7V5Z" {...commonStroke} />
          </>
        );
      case 'facebook':
        return (
          <>
            <Circle cx="12" cy="12" r="9" fill={color} />
            <Path d="M13.2 18v-5.1h1.8l.3-2h-2.1V9.6c0-.6.2-1 1.1-1h1.1V6.8c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.1H9v2h1.6V18h2.6Z" fill="#FFFFFF" />
          </>
        );
      case 'apple':
        return (
          <>
            <Path d="M14.8 7.2c.8-.9 1.2-2 1.1-3.2-1.1.1-2.2.7-2.9 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.2-.5 2.9-1.5Z" fill={color} />
            <Path d="M17.7 12.9c0-2.4 2-3.6 2.1-3.7-1.1-1.6-2.9-1.8-3.5-1.8-1.5-.2-2.9.9-3.6.9s-1.8-.9-3-.9c-2.3 0-4.7 2-4.7 5.7 0 1.2.2 2.5.8 3.8.8 1.8 1.9 3.8 3.4 3.7 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.5 0 2.5-1.7 3.2-3.4.4-.9.6-1.8.7-1.9-.1 0-1.7-.7-1.7-2.4Z" fill={color} />
          </>
        );
      case 'google':
        return (
          <>
            <Path d="M20 12.2c0-.6-.1-1.1-.2-1.6H12v3h4.5a3.8 3.8 0 0 1-1.7 2.5v2h2.7c1.6-1.5 2.5-3.6 2.5-5.9Z" fill="#4285F4" />
            <Path d="M12 20c2.3 0 4.2-.8 5.5-2l-2.7-2c-.7.5-1.6.8-2.8.8-2.1 0-3.9-1.4-4.6-3.4H4.6v2.1A8.3 8.3 0 0 0 12 20Z" fill="#34A853" />
            <Path d="M7.4 13.4A4.8 4.8 0 0 1 7.1 12c0-.5.1-1 .3-1.4V8.5H4.6A8.3 8.3 0 0 0 3.7 12c0 1.2.3 2.3.9 3.4l2.8-2Z" fill="#FBBC05" />
            <Path d="M12 7.2c1.3 0 2.5.5 3.4 1.3l2.5-2.5A8 8 0 0 0 12 4a8.3 8.3 0 0 0-7.4 4.5l2.8 2.1c.7-2 2.5-3.4 4.6-3.4Z" fill="#EA4335" />
          </>
        );
      default:
        return <Circle cx="12" cy="12" r="8" fill={color} />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}>
      {renderIcon()}
    </Svg>
  );
}

export default AppIcon;
