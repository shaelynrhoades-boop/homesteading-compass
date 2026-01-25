import { useMemo, useState } from 'react';
import { Image, ImageResizeMode, ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import { ASSETS } from '../constants/assets';

type SafeImageProps = {
  source?: ImageSourcePropType;
  fallbackSource?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  onError?: () => void;
};

export default function SafeImage({
  source,
  fallbackSource = ASSETS.misc.lantern,
  style,
  resizeMode = 'contain',
  onError,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSource = useMemo(() => {
    if (failed) {
      return fallbackSource;
    }
    return source ?? fallbackSource;
  }, [failed, fallbackSource, source]);

  return (
    <Image
      source={resolvedSource}
      style={style}
      resizeMode={resizeMode}
      accessibilityIgnoresInvertColors
      onError={() => {
        setFailed(true);
        onError?.();
      }}
    />
  );
}
