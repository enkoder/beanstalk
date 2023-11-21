interface BrandImageProps {
  src: string;
}

export function BrandImage({ src }: BrandImageProps) {
  return <img src={src} alt="logo" />;
}
