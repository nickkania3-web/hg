interface TeamLogoProps {
  logoUrl: string;
  name: string;
  size?: number;
}

export default function TeamLogo({ logoUrl, name, size = 28 }: TeamLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data: URI, not eligible for next/image optimization
    <img
      src={logoUrl}
      alt={name}
      title={name}
      width={size}
      height={size}
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}
